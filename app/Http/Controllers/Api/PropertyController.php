<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\configs;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PropertyController extends Controller
{
    public function cities()
    {
        return response()->json([
            'cities' => City::select('id', 'title')->get()
        ]);
    }

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
            'properties' => $properties->map(function ($property) {
                return $this->formatProperty($property);
            }),
            'filters' => $request->only(['status', 'search'])
        ]);
    }

    public function show($id)
    {
        $property = Property::with(['user', 'city', 'images'])->findOrFail($id);

        return response()->json([
            'property' => $this->formatProperty($property, true),
            'similar_properties' => $property->similarProperties()->map(function ($property) {
                return $this->formatProperty($property);
            })
        ]);
    }

    public function store(Request $request)
    {
        $user = User::find(Auth::id());
        $subscription = $user->subscription;

        if (!$subscription || $subscription->status !== 'active') {
            return response()->json([
                'message' => 'You need an active subscription to create a property listing'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'type' => 'required|string|in:office,apartment,villa,land',
            'purpose' => 'required|string|in:sale,rent',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'area' => 'nullable|numeric|min:0',
            'floor' => 'nullable|integer|min:0',
            'address' => 'required|string|max:255',
            'features' => 'nullable|array',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:5000',
            'city_id' => 'required|exists:cities,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $maxPhotos = configs::getPropertyMaxPhotos();
        $imageCount = is_array($request->images) ? count($request->images) : 0;

        if ($imageCount > $maxPhotos) {
            return response()->json([
                'message' => "You can only upload a maximum of {$maxPhotos} photos."
            ], 422);
        }

        if ($user->properties()->count() >= $subscription->package->max_listings) {
            return response()->json([
                'message' => 'You have reached your maximum listing limit for your current subscription.'
            ], 403);
        }

        $property = Property::create([
            'user_id' => $user->id,
            'title' => $request->title,
            'description' => $request->description,
            'price' => $request->price,
            'type' => $request->type,
            'purpose' => $request->purpose,
            'bedrooms' => $request->bedrooms,
            'bathrooms' => $request->bathrooms,
            'area' => $request->area,
            'floor' => $request->floor,
            'city_id' => $request->city_id,
            'address' => $request->address,
            'features' => $request->features,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'status' => configs::propertyRequiresApproval() ? 'pending' : 'available'
        ]);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('properties', 'public');
                $property->images()->create(['image_url' => $path]);
            }
        }

        return response()->json([
            'message' => 'Property created successfully',
            'property' => $this->formatProperty($property)
        ], 201);
    }

    public function update(Request $request, Property $property)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'type' => 'required|string|in:office,apartment,villa,land',
            'purpose' => 'required|string|in:sale,rent',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'area' => 'nullable|numeric|min:0',
            'floor' => 'nullable|integer|min:0',
            'address' => 'required|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'deleted_images' => 'nullable|array',
            'deleted_images.*' => 'integer|exists:property_images,id',
            'features' => 'nullable|array',
            'city_id' => 'required|exists:cities,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $maxPhotos = configs::getPropertyMaxPhotos();
        $existingCount = $property->images()->count();
        $deletedCount = is_array($request->deleted_images) ? count($request->deleted_images) : 0;
        $newUploads = is_array($request->images) ? count($request->images) : 0;
        $finalCount = $existingCount - $deletedCount + $newUploads;

        if ($finalCount > $maxPhotos) {
            return response()->json([
                'message' => "You can only upload a maximum of {$maxPhotos} photos."
            ], 422);
        }

        $property->update([
            'title' => $request->title,
            'description' => $request->description,
            'price' => $request->price,
            'type' => $request->type,
            'purpose' => $request->purpose,
            'bedrooms' => $request->bedrooms,
            'bathrooms' => $request->bathrooms,
            'area' => $request->area,
            'floor' => $request->floor,
            'features' => $request->features,
            'city_id' => $request->city_id,
            'address' => $request->address,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ]);

        if ($request->has('deleted_images')) {
            $imagesToDelete = $property->images()->whereIn('id', $request->deleted_images)->get();
            foreach ($imagesToDelete as $image) {
                Storage::disk('public')->delete($image->image_url);
                $image->delete();
            }
        }

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('properties', 'public');
                $property->images()->create(['image_url' => $path]);
            }
        }

        return response()->json([
            'message' => 'Property updated successfully',
            'property' => $this->formatProperty($property->fresh())
        ]);
    }

    public function updateStatus(Request $request, Property $property)
    {
        $request->validate([
            'status' => 'required|in:available,sold,rented,reserved',
        ]);

        $property->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Property status updated successfully',
            'property' => $this->formatProperty($property->fresh())
        ]);
    }

    public function updateFeatured(Property $property)
    {
        $user = User::find(Auth::id());

        if (!$user->subscription || !$user->subscription->package) {
            return response()->json([
                'message' => 'No active subscription found'
            ], 403);
        }

        $package = $user->subscription->package;
        $featuredCount = $user->featuredProperties()->count();

        if (!$property->is_featured && $featuredCount >= $package->max_adds) {
            return response()->json([
                'message' => 'You have reached your maximum featured listings limit'
            ], 403);
        }

        $property->update(['is_featured' => !$property->is_featured]);

        return response()->json([
            'message' => $property->is_featured
                ? 'Property marked as featured'
                : 'Property removed from featured',
            'property' => $this->formatProperty($property->fresh())
        ]);
    }

    public function destroy(Property $property)
    {
        $property->delete();

        return response()->json([
            'message' => 'Property deleted successfully'
        ]);
    }

    public function storeInquiry(Request $request, Property $property)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $inquiry = $property->inquiries()->create([
            'message' => $request->message,
            'user_id' => Auth::id()
        ]);

        return response()->json([
            'message' => 'Inquiry submitted successfully',
            'inquiry' => [
                'id' => $inquiry->id,
                'message' => $inquiry->message,
                'created_at' => $inquiry->created_at->toISOString()
            ]
        ], 201);
    }

    public function storeReservation(Request $request, Property $property)
    {
        $request->validate([
            'price' => 'nullable|numeric',
            'special_requests' => 'nullable|string',
            'dates' => $property->purpose === 'rent' ? 'required|array|size:2' : 'nullable',
            'dates.0' => $property->purpose === 'rent' ? 'required|date' : 'nullable',
            'dates.1' => $property->purpose === 'rent' ? 'required|date|after:dates.0' : 'nullable',
        ]);

        $reservationData = [
            'user_id' => Auth::id(),
            'special_requests' => $request->special_requests,
            'price' => $request->price,
        ];

        if ($property->purpose === 'rent') {
            $reservationData['start_date'] = $request->dates[0];
            $reservationData['end_date'] = $request->dates[1];
        }

        $reservation = $property->reservations()->create($reservationData);

        return response()->json([
            'message' => 'Reservation request submitted successfully',
            'reservation' => [
                'id' => $reservation->id,
                'status' => $reservation->status,
                'dates' => $property->purpose === 'rent' ? [
                    'start' => $reservation->start_date,
                    'end' => $reservation->end_date
                ] : null
            ]
        ], 201);
    }

    // Admin endpoints
    public function propertyManagement(Request $request)
    {
        $query = Property::query()
            ->with(['user', 'images'])
            ->when($request->status, function ($query, $status) {
                if ($status === 'pending') {
                    $query->pending();
                } elseif ($status === 'approved') {
                    $query->approved();
                } elseif ($status === 'rejected') {
                    $query->rejected();
                }
            }, function ($query) {
                $query->pending();
            })
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($request->type, function ($query, $type) {
                $query->where('type', $type);
            })
            ->when($request->purpose, function ($query, $purpose) {
                $query->where('purpose', $purpose);
            })
            ->when($request->min_price, function ($query, $minPrice) {
                $query->where('price', '>=', $minPrice);
            })
            ->when($request->max_price, function ($query, $maxPrice) {
                $query->where('price', '<=', $maxPrice);
            })
            ->when($request->date_from, function ($query, $dateFrom) {
                $query->whereDate('created_at', '>=', $dateFrom);
            })
            ->when($request->date_to, function ($query, $dateTo) {
                $query->whereDate('created_at', '<=', $dateTo);
            });

        $properties = $query->paginate($request->limit ?? 10);

        return response()->json([
            'properties' => $properties->map(function ($property) {
                return $this->formatProperty($property);
            }),
            'pagination' => [
                'current_page' => $properties->currentPage(),
                'per_page' => $properties->perPage(),
                'total' => $properties->total(),
                'last_page' => $properties->lastPage()
            ],
            'filters' => $request->only([
                'type',
                'purpose',
                'min_price',
                'max_price',
                'search',
                'status',
                'date_from',
                'date_to'
            ])
        ]);
    }

    public function approve(Property $property)
    {
        $property->update([
            'approved' => request('approved'),
            'rejection_reason' => request('approved') ? null : request('reason'),
            'status' => request('approved') ? "available" : "rejected",
        ]);

        return response()->json([
            'message' => request('approved')
                ? 'Property approved successfully'
                : 'Property rejected successfully',
            'property' => $this->formatProperty($property->fresh())
        ]);
    }

    // Helper method to format property data
    private function formatProperty($property, $detailed = false)
    {
        $data = [
            'id' => $property->id,
            'title' => $property->title,
            'description' => $property->description,
            'price' => $property->price,
            'type' => $property->type,
            'purpose' => $property->purpose,
            'status' => $property->status,
            'address' => $property->address,
            'city_id' => $property->city_id,
            'is_featured' => $property->is_featured,
            'created_at' => $property->created_at->toISOString(),
            'images' => $property->images->map(function ($image) {
                return [
                    'id' => $image->id,
                    'url' => asset(Storage::url($image->image_url)),
                    'thumbnail' => asset(Storage::url($image->thumbnail_url ?? $image->image_url))
                ];
            })
        ];

        if ($detailed) {
            $data = array_merge($data, [
                'bedrooms' => $property->bedrooms,
                'bathrooms' => $property->bathrooms,
                'area' => $property->area,
                'floor' => $property->floor,
                'features' => $property->features,
                'latitude' => $property->latitude,
                'longitude' => $property->longitude,
                'user' => $property->user ? [
                    'id' => $property->user->id,
                    'name' => $property->user->name,
                    'avatar' => $property->user->avatar_url
                ] : null,
                'city' => $property->city ? [
                    'id' => $property->city->id,
                    'name' => $property->city->title
                ] : null
            ]);
        }

        return $data;
    }
}
