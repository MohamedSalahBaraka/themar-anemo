<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class PropertyController extends Controller
{
    // Admin endpoints
    public function pendingProperties()
    {
        $properties = Property::pending()
            ->with(['user', 'images'])
            ->paginate(request('limit', 10));

        return response()->json([
            'data' => $properties->items(),
            'meta' => [
                'current_page' => $properties->currentPage(),
                'per_page' => $properties->perPage(),
                'total' => $properties->total(),
            ]
        ], Response::HTTP_OK);
    }

    public function approveProperty(Property $property)
    {
        $property->update([
            'approved' => request('approved'),
            'rejection_reason' => request('approved') ? null : request('reason'),
            'status' => request('approved') ? "available" : "rejected",
        ]);

        return response()->json([
            'message' => 'Property approval status updated',
            'data' => $property
        ], Response::HTTP_OK);
    }

    // User property management
    public function index(Request $request)
    {
        $properties = Property::where('user_id', $request->user()->id)
            ->when($request->status && $request->status !== 'all', function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->when($request->search, function ($query) use ($request) {
                $query->where(function ($q) use ($request) {
                    $q->where('title', 'like', "%{$request->search}%")
                        ->orWhere('description', 'like', "%{$request->search}%")
                        ->orWhere('address', 'like', "%{$request->search}%");
                });
            })
            ->with(['images'])
            ->latest()
            ->get();

        return response()->json([
            'data' => $properties->map(function ($property) {
                return [
                    'id' => $property->id,
                    'title' => $property->title,
                    'description' => $property->description,
                    'price' => $property->price,
                    'bedrooms' => $property->bedrooms,
                    'bathrooms' => $property->bathrooms,
                    'area' => $property->area,
                    'address' => $property->address,
                    'images' => $property->images,
                    'status' => $property->status,
                    'type' => $property->type,
                    'purpose' => $property->purpose,
                    'is_featured' => $property->is_featured,
                    'features' => $property->features,
                    'latitude' => $property->latitude,
                    'longitude' => $property->longitude,
                    'published_at' => $property->created_at,
                    'links' => [
                        'edit' => url("/api/user/properties/{$property->id}/edit"),
                        'show' => url("/api/properties/{$property->id}"),
                    ]
                ];
            }),
            'meta' => [
                'filters' => $request->only(['status', 'search']),
                'count' => $properties->count(),
            ]
        ], Response::HTTP_OK);
    }

    public function show($id)
    {
        $property = Property::with(['user', 'images'])->findOrFail($id);

        return response()->json([
            'data' => [
                'id' => $property->id,
                'title' => $property->title,
                'description' => $property->description,
                'price' => $property->price,
                'bedrooms' => $property->bedrooms,
                'bathrooms' => $property->bathrooms,
                'area' => $property->area,
                'address' => $property->address,
                'images' => $property->images,
                'status' => $property->status,
                'type' => $property->type,
                'purpose' => $property->purpose,
                'is_featured' => $property->is_featured,
                'features' => $property->features,
                'latitude' => $property->latitude,
                'longitude' => $property->longitude,
                'published_at' => $property->created_at,
                'user' => $property->user,
            ],
            'meta' => [
                'is_logged_in' => Auth::check(),
            ]
        ], Response::HTTP_OK);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $subscription = $user->activeSubscription();

        if (!$subscription || !$subscription->is_active) {
            return response()->json([
                'message' => 'You need an active subscription to create a property listing'
            ], Response::HTTP_FORBIDDEN);
        }

        if ($user->properties()->count() >= $subscription->package->max_listings) {
            return response()->json([
                'message' => 'You have reached your maximum listing limit for your current subscription'
            ], Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'type' => 'required|string|in:office,apartment,vila,land',
            'purpose' => 'required|string|in:sale,rent',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'area' => 'nullable|numeric|min:0',
            'address' => 'required|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $property = $user->properties()->create($validated);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('properties', 'public');
                $property->images()->create(['image_url' => $path]);
            }
        }

        return response()->json([
            'message' => 'Property created successfully',
            'data' => $property,
            'links' => [
                'view' => url("/api/properties/{$property->id}"),
                'edit' => url("/api/user/properties/{$property->id}/edit"),
            ]
        ], Response::HTTP_CREATED);
    }

    public function update(Request $request, Property $property)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'type' => 'required|string|in:office,apartment,vila,land',
            'purpose' => 'required|string|in:sale,rent',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'area' => 'nullable|numeric|min:0',
            'address' => 'required|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'deleted_images' => 'nullable|array',
            'deleted_images.*' => 'integer|exists:property_images,id',
        ]);

        $property->update($validated);

        // Handle deleted images
        if ($request->has('deleted_images')) {
            $imagesToDelete = $property->images()->whereIn('id', $request->deleted_images)->get();
            foreach ($imagesToDelete as $image) {
                Storage::disk('public')->delete($image->image_url);
                $image->delete();
            }
        }

        // Handle new images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('properties', 'public');
                $property->images()->create(['image_url' => $path]);
            }
        }

        return response()->json([
            'message' => 'Property updated successfully',
            'data' => $property
        ], Response::HTTP_OK);
    }

    public function updateStatus(Request $request, Property $property)
    {
        $request->validate([
            'status' => 'required|in:available,sold,rented,reserved',
        ]);

        $property->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Property status updated',
            'data' => $property
        ], Response::HTTP_OK);
    }

    public function destroy(Property $property)
    {
        $property->delete();

        return response()->json([
            'message' => 'Property deleted successfully'
        ], Response::HTTP_OK);
    }

    public function storeInquiry(Request $request, Property $property)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'message' => 'required|string',
        ]);

        $inquiry = $property->inquiries()->create($validated);

        return response()->json([
            'message' => 'Inquiry submitted successfully',
            'data' => $inquiry
        ], Response::HTTP_CREATED);
    }

    public function storeReservation(Request $request, Property $property)
    {
        $validated = $request->validate([
            'special_requests' => 'nullable|string',
            'dates' => 'sometimes|required|array|size:2',
            'dates.0' => 'sometimes|required|date',
            'dates.1' => 'sometimes|required|date|after:dates.0',
        ]);

        $reservationData = [
            'user_id' => $request->user()->id,
            'special_requests' => $validated['special_requests'] ?? null,
        ];

        if ($property->purpose === 'rent') {
            $reservationData['start_date'] = $validated['dates'][0];
            $reservationData['end_date'] = $validated['dates'][1];
        }

        $reservation = $property->reservations()->create($reservationData);

        return response()->json([
            'message' => 'Reservation request submitted successfully',
            'data' => $reservation
        ], Response::HTTP_CREATED);
    }

    // Helper methods
    public function propertyTypes()
    {
        return response()->json([
            'data' => [
                'office' => 'Office',
                'apartment' => 'Apartment',
                'vila' => 'Vila',
                'land' => 'Land',
            ]
        ], Response::HTTP_OK);
    }

    public function purposeTypes()
    {
        return response()->json([
            'data' => [
                'sale' => 'For Sale',
                'rent' => 'For Rent',
            ]
        ], Response::HTTP_OK);
    }
}
