<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        // Get featured properties with eager loading
        $featuredProperties = Property::query()
            ->with(['images'])
            ->where('is_featured', true)
            ->where('status', 'available')
            ->orderBy('created_at', 'desc')
            ->limit(12)
            ->get()
            ->map(function ($property) {
                return $this->formatProperty($property);
            });

        // Get recently viewed properties for authenticated users
        $recentlyViewed = [];
        if (Auth::check()) {
            $recentlyViewed = $request->user()
                ->recentlyViewedProperties()
                ->with(['images'])
                ->limit(4)
                ->get()
                ->map(function ($property) {
                    return [
                        'id' => $property->id,
                        'title' => $property->title,
                        'price' => $property->price,
                        'primaryImage' => $property->images->first()?->image_url,
                        'address' => $property->address,
                        'type' => $property->type,
                    ];
                });
        }

        // Get property counts by type for filters
        $propertyCounts = Property::selectRaw('type, count(*) as count')
            ->where('status', 'available')
            ->groupBy('type')
            ->pluck('count', 'type');

        // Sectioned properties - For Sale
        $forSaleProperties = Property::query()
            ->with(['images'])
            ->where('status', 'available')
            ->where('purpose', 'sale')
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get()
            ->map(function ($property) {
                return $this->formatProperty($property);
            });

        // Sectioned properties - For Rent
        $forRentProperties = Property::query()
            ->with(['images'])
            ->where('status', 'available')
            ->where('purpose', 'rent')
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get()
            ->map(function ($property) {
                return $this->formatProperty($property);
            });

        // Sectioned properties - Popular types (e.g., apartments, villas)
        $popularTypes = ['apartment', 'villa', 'townhouse'];
        $popularProperties = Property::query()
            ->with(['images'])
            ->where('status', 'available')
            ->whereIn('type', $popularTypes)
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get()
            ->map(function ($property) {
                return $this->formatProperty($property);
            });

        return Inertia::render('HomePage', [
            'featuredProperties' => $featuredProperties,
            'recentlyViewed' => $recentlyViewed,
            'propertyCounts' => $propertyCounts,
            'sectionedProperties' => [
                'forSale' => $forSaleProperties,
                'forRent' => $forRentProperties,
                'popularTypes' => $popularProperties,
            ],
            'filters' => $request->only([
                'location',
                'type',
                'purpose',
                'minPrice',
                'maxPrice',
                'bedrooms',
                'bathrooms',
            ]),
            'filterOptions' => [
                'types' => Property::distinct()->pluck('type'),
                'purposes' => ['sale', 'rent'],
            ],
        ]);
    }

    /**
     * Format property data consistently
     */
    private function formatProperty($property)
    {
        return [
            'id' => $property->id,
            'title' => $property->title,
            'description' => $property->description,
            'price' => $property->price,
            'bedrooms' => $property->bedrooms,
            'bathrooms' => $property->bathrooms,
            'area' => $property->area,
            'address' => $property->address,
            'city' => $property->city,
            'state' => $property->state,
            'zip_code' => $property->zip_code,
            'latitude' => $property->latitude,
            'longitude' => $property->longitude,
            'imageUrls' => $property->images->pluck('image_url')->take(3),
            'primaryImage' => $property->images->first()?->image_url,
            'status' => $property->status,
            'is_featured' => $property->is_featured,
            'type' => $property->type,
            'purpose' => $property->purpose,
            'created_at' => $property->created_at->format('M d, Y'),
            'updated_at' => $property->updated_at->format('M d, Y'),
        ];
    }
}
