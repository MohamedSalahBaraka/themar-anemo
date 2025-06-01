<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PropertyController extends Controller
{
    public function propertyManagement()
    {
        $query = Property::query()
            ->with(['user', 'images'])
            ->when(request('status'), function ($query, $status) {
                if ($status === 'pending') {
                    $query->pending();
                } elseif ($status === 'approved') {
                    $query->approved();
                } elseif ($status === 'rejected') {
                    $query->rejected();
                }
            }, function ($query) {
                // Default to pending if no status filter
                $query->pending();
            });

        // Apply filters
        $query->when(request('search'), function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        })
            ->when(request('type'), function ($query, $type) {
                $query->where('type', $type);
            })
            ->when(request('purpose'), function ($query, $purpose) {
                $query->where('purpose', $purpose);
            })
            ->when(request('min_price'), function ($query, $minPrice) {
                $query->where('price', '>=', $minPrice);
            })
            ->when(request('max_price'), function ($query, $maxPrice) {
                $query->where('price', '<=', $maxPrice);
            })
            ->when(request('date_from'), function ($query, $dateFrom) {
                $query->whereDate('created_at', '>=', $dateFrom);
            })
            ->when(request('date_to'), function ($query, $dateTo) {
                $query->whereDate('created_at', '<=', $dateTo);
            });

        $properties = $query->paginate(request('limit', 10));

        return Inertia::render('admin/PropertyManagement', [
            'properties' => $properties->items(),
            'pagination' => [
                'current' => $properties->currentPage(),
                'pageSize' => $properties->perPage(),
                'total' => $properties->total(),
            ],
            'filters' => [
                'type' => request('type'),
                'purpose' => request('purpose'),
                'min_price' => request('min_price'),
                'max_price' => request('max_price'),
                'search' => request('search'),
                'status' => request('status'),
                'date_from' => request('date_from'),
                'date_to' => request('date_to'),
            ],
        ]);
    }

    public function approve(Property $property)
    {
        $property->update([
            'approved' => request('approved'),
            'rejection_reason' => request('approved') ? null : request('reason'),
            'status' => request('approved') ? "available" : "rejected",
        ]);

        return redirect()->back();
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
            })->with(['images'])
            ->latest()
            ->get();

        return Inertia::render('user/MyListingsPage', [
            'properties' => $properties->map(function ($property) {
                return [
                    'id' => $property->id,
                    'title' => $property->title,
                    'description' => $property->description,
                    'price' => $property->price,
                    'bedrooms' => $property->bedrooms,
                    'bathrooms' => $property->bathrooms,
                    'area' => $property->area,
                    'floor' => $property->floor,
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
                    'edit_url' => route('user.properties.edit', $property),
                    'show_url' => route('properties.show', $property),
                    // Add other fields as needed
                ];
            }),
            'filters' => $request->only(['status', 'search']),
        ]);
    }
    /**
     * Show the form for creating a new property.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        return Inertia::render('user/CreatePropertyPage', [
            'propertyTypes' => [
                'office' => 'Office',
                'apartment' => 'Apartment',
                'vila' => 'Vila',
                'land' => 'Land',
            ],
            'purposeTypes' => [
                'sale' => 'For Sale',
                'rent' => 'For Rent',
            ],
        ]);
    }

    /**
     * Show the form for editing the specified property.
     *
     * @param  \App\Models\Property  $property
     * @return \Inertia\Response
     */
    public function edit(Property $property)
    {
        // Authorization check - ensure user owns the property
        // $this->authorize('update', $property);

        // Load property with images relationship
        $property->load('images');

        return Inertia::render('user/UpdatePropertyPage', [
            'property' => [
                'id' => $property->id,
                'title' => $property->title,
                'description' => $property->description,
                'price' => $property->price,
                'type' => $property->type,
                'purpose' => $property->purpose,
                'bedrooms' => $property->bedrooms,
                'bathrooms' => $property->bathrooms,
                'area' => $property->area,
                'floor' => $property->floor,
                'address' => $property->address,
                'latitude' => $property->latitude,
                'longitude' => $property->longitude,
                'status' => $property->status,
                'images' => $property->images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'image_url' => $image->image_url,
                    ];
                }),
            ],
            'propertyTypes' => [
                'office' => 'Office',
                'apartment' => 'Apartment',
                'vila' => 'Vila',
                'land' => 'Land',
            ],
            'purposeTypes' => [
                'sale' => 'For Sale',
                'rent' => 'For Rent',
            ],
        ]);
    }

    public function update(Request $request, Property $property)
    {
        // $this->authorize('update', $property);

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
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'deleted_images' => 'nullable|array', // Add this for deleted image IDs
            'deleted_images.*' => 'integer|exists:property_images,id', // Validate the image IDs exist
        ]);

        // Update basic fields
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
            'address' => $request->address,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ]);

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

        return redirect()->back()->with('success', 'Property updated successfully.');
    }
    public function store(Request $request)
    {
        $user = User::findOrFail(Auth::id());
        $subscription = $user->subscription();

        if (!$subscription || !$subscription->is_active) {
            return redirect()->back()->with('error', 'You need an active subscription to create a property listing.');
        }
        // dd($request->images);
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
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($user->properties()->count() >= $subscription->package->max_listings) {
            return redirect()->back()->with('error', 'You have reached your maximum listing limit for your current subscription.');
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
            'address' => $request->address,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ]);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('properties', 'public');
                $property->images()->create(['image_url' => $path]);
            }
        }

        return redirect()->back()->with('success', 'Property created successfully.');
    }
    public function updateStatus(Request $request,  $id)
    {
        // $this->authorize('updateStatus', $property);

        $request->validate([
            'status' => 'required|in:available,sold,rented,reserved',
        ]);

        $property = Property::findOrFail($id);
        $property->update(['status' => $request->status]);

        return redirect()->back()->with('success', 'Property status updated successfully.');
    }
    public function destroy(Property $property)
    {
        // $this->authorize('delete', $property);

        $property->delete();

        return redirect()->back()->with('success', 'Property status deleted successfully.');
    }
    public function show($id)
    {
        $property = Property::with('user')->findOrFail($id);
        return Inertia::render('PropertyDetails', [
            'property' => [
                'id' => $property->id,
                'title' => $property->title,
                'description' => $property->description,
                'price' => $property->price,
                'bedrooms' => $property->bedrooms,
                'bathrooms' => $property->bathrooms,
                'area' => $property->area,
                'floor' => $property->floor,
                'user_id' => $property->user_id,
                'address' => $property->address,
                'images' => $property->images,
                'status' => $property->status,
                'type' => $property->type,
                'purpose' => $property->purpose,
                'user' => $property->user,
                'is_featured' => $property->is_featured,
                'features' => $property->features,
                'latitude' => $property->latitude,
                'longitude' => $property->longitude,
                'published_at' => $property->created_at,
            ],
            'similarProperties' => $property->similarProperties(),
            'isLoggedIn' => Auth::check(),
        ]);
    }

    public function storeInquiry(Request $request, Property $property)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $property->inquiries()->create([
            'message' => $request->message,
            'user_id' => Auth::id()
        ]);

        return back()->with('success', 'Inquiry submitted successfully');
    }

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

        $property->reservations()->create($reservationData);

        return back()->with('success', 'Reservation request submitted successfully');
    }
}
