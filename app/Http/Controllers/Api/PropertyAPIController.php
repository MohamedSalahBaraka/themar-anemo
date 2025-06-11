<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\configs;
use App\Models\Property;
use App\Models\PropertyView;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PropertyAPIController extends Controller
{
    /**
     * Get list of cities
     */
    public function cities()
    {
        $cities = City::select('id', 'title')->get();

        return response()->json([
            'success' => true,
            'data' => $cities
        ]);
    }

    /**
     * Get properties for admin management
     */
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
            });

        // Apply filters
        $query->when($request->search, function ($query, $search) {
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

        $properties = $query->paginate($request->limit ?? 10)->map(fn($property) => $this->formatProperty($property));

        return response()->json([
            'success' => true,
            'data' => $properties,
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

    /**
     * Approve/reject property
     */
    public function approve(Property $property, Request $request)
    {
        $request->validate([
            'approved' => 'required|boolean',
            'reason' => 'required_if:approved,false|string|nullable'
        ]);

        $property->update([
            'approved' => $request->approved,
            'rejection_reason' => $request->approved ? null : $request->reason,
            'status' => $request->approved ? "available" : "rejected",
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Property status updated successfully'
        ]);
    }

    /**
     * Get user's properties
     */
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
            ->get()->map(fn($property) => $this->formatProperty($property));

        return response()->json([
            'success' => true,
            'data' => $properties,
            'filters' => $request->only(['status', 'search'])
        ]);
    }

    /**
     * Get property types and purposes for form
     */
    public function create()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'property_types' => [
                    'office' => 'Office',
                    'apartment' => 'Apartment',
                    'vila' => 'Vila',
                    'land' => 'Land',
                ],
                'purpose_types' => [
                    'sale' => 'For Sale',
                    'rent' => 'For Rent',
                ]
            ]
        ]);
    }

    /**
     * Get property details for editing
     */
    public function edit(Property $property)
    {
        $property->load('images');

        return response()->json([
            'success' => true,
            'data' => [
                'property' => $property,
                'property_types' => [
                    'office' => 'Office',
                    'apartment' => 'Apartment',
                    'vila' => 'Vila',
                    'land' => 'Land',
                ],
                'purpose_types' => [
                    'sale' => 'For Sale',
                    'rent' => 'For Rent',
                ]
            ]
        ]);
    }

    /**
     * Update property
     */
    public function update(Request $request, Property $property)
    {
        $maxPhotosConfig = configs::where('key', 'property.max_photos')->first();
        $maxPhotos = $maxPhotosConfig ? (int) $maxPhotosConfig->value : 10;

        $existingCount = $property->images()->count();
        $deletedCount = is_array($request->deleted_images) ? count($request->deleted_images) : 0;
        $newUploads = is_array($request->images) ? count($request->images) : 0;

        $finalCount = $existingCount - $deletedCount + $newUploads;

        if ($finalCount > $maxPhotos) {
            return response()->json([
                'success' => false,
                'message' => "You can only upload a maximum of {$maxPhotos} photos."
            ], 422);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'type' => 'required|string|in:office,apartment,vila,land',
            'purpose' => 'required|string|in:sale,rent',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'area' => 'nullable|numeric|min:0',
            'floor' => 'nullable|integer|min:0',
            'address' => 'required|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'images.*' => 'sometimes|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'deleted_images' => 'nullable|array',
            'deleted_images.*' => 'integer|exists:property_images,id',
            'features' => 'nullable|array',
        ]);

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
            'success' => true,
            'message' => 'Property updated successfully',
            'data' => $property->fresh(['images'])
        ]);
    }

    /**
     * Create new property
     */
    public function store(Request $request)
    {
        $user = User::findOrFail(Auth::id());
        $subscription = $user->subscription;

        if (!$subscription || $subscription->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'You need an active subscription to create a property listing.'
            ], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'type' => 'required|string|in:office,apartment,vila,land',
            'purpose' => 'required|string|in:sale,rent',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'area' => 'nullable|numeric|min:0',
            'floor' => 'nullable|integer|min:0',
            'address' => 'required|string|max:255',
            'features' => 'nullable|array',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'images.*' => 'sometimes|image|mimes:jpeg,png,jpg,gif,svg|max:5000',
        ]);

        $maxPhotosConfig = configs::where('key', 'property.max_photos')->first();
        $maxPhotos = $maxPhotosConfig ? (int) $maxPhotosConfig->value : 10;
        $imageCount = is_array($request->images) ? count($request->images) : 0;

        if ($imageCount > $maxPhotos) {
            return response()->json([
                'success' => false,
                'message' => "You can only upload a maximum of {$maxPhotos} photos."
            ], 422);
        }

        if ($user->properties()->count() >= $subscription->package->max_listings) {
            return response()->json([
                'success' => false,
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
        ]);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('properties', 'public');
                $property->images()->create(['image_url' => $path]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Property created successfully',
            'data' => $property->fresh(['images'])
        ], 201);
    }

    /**
     * Update property status
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:available,sold,rented,reserved',
        ]);

        $property = Property::findOrFail($id);
        $property->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Property status updated successfully'
        ]);
    }

    /**
     * Delete property
     */
    public function destroy(Property $property)
    {
        $property->delete();

        return response()->json([
            'success' => true,
            'message' => 'Property deleted successfully'
        ]);
    }

    /**
     * Show property details
     */
    public function show($id)
    {
        $property = Property::with(['user', 'city', 'images'])->findOrFail($id);
        $property->views_count = $property->views()->count();
        if (Auth::check()) {
            PropertyView::firstOrCreate(['property_id' => $property->id, 'user_id' => Auth::id()]);
        }
        return response()->json([
            'success' => true,
            'data' => [
                'property' => $property,
                'similar_properties' => $property->similarProperties(),
                'is_logged_in' => Auth::check()
            ]
        ]);
    }

    /**
     * Submit inquiry
     */
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
            'success' => true,
            'message' => 'Inquiry submitted successfully',
            'data' => $inquiry
        ]);
    }

    /**
     * Submit reservation
     */
    public function storeReservation(Request $request, Property $property)
    {
        $request->validate([
            'price' => 'nullable|numeric',
            'special_requests' => 'nullable|string',
            'dates' => 'sometimes|required|array|size:2',
            'dates.0' => 'sometimes|required|date',
            'dates.1' => 'sometimes|required|date|after:dates.0',
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
            'success' => true,
            'message' => 'Reservation request submitted successfully',
            'data' => $reservation
        ]);
    }
    private function formatProperty($property)
    {
        return [
            'id' => $property->id,
            'title' => $property->title,
            'price' => $property->price,
            'bedrooms' => $property->bedrooms,
            'bathrooms' => $property->bathrooms,
            'area' => $property->area,
            'address' => $property->address,
            'city' => $property->city,
            'type' => $property->type,
            'purpose' => $property->purpose,
            'status' => $property->status,
            'is_featured' => $property->is_featured,
            'images' => $property->images->map(fn($image) => [
                'url' => asset('storage' . $image->image_url),
                'thumbnail' => asset(
                    'storage' . $image->thumbnail_url ?? $image->image_url
                )
            ]),
            'primary_image' => asset(
                'storage' . $property->images->first()?->image_url
            ),
            'created_at' => $property->created_at->format('Y-m-d H:i:s'),
            'coordinates' => [
                'latitude' => $property->latitude,
                'longitude' => $property->longitude
            ]
        ];
    }
    public function updateFeatured(Property $property)
    {
        $user = User::find(Auth::id());

        if (!$user->subscription || !$user->subscription->package) {
            return response()->json([
                'success' => false,
                'message' => __('no_package'),
            ], 404);
        }

        $package = $user->subscription->package;
        $featuredCount = $user->FeaturedProperties();

        if (!$property->is_featured && $featuredCount >= $package->max_adds) {
            return response()->json([
                'success' => false,
                'message' => __('max_featured_reached'),
            ], 422);
        }

        $property->update(['is_featured' => !$property->is_featured]);

        return response()->json([
            'success' => true,
            'message' => $property->is_featured
                ? __('property_featured')
                : __('property_unfeatured'),
            'data' => $property,
        ]);
    }
}
