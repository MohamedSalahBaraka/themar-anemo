<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        // Featured properties
        $featuredProperties = Property::query()
            ->with(['images'])
            ->where('is_featured', true)
            ->where('status', 'available')
            ->orderBy('created_at', 'desc')
            ->limit(12)
            ->get()
            ->map(function ($property) {
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
                    'url' => url("/api/properties/{$property->id}"),
                ];
            });

        // Recently viewed properties
        $recentlyViewed = [];
        if ($request->user()) {
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
                        'url' => url("/api/properties/{$property->id}"),
                    ];
                });
        }

        // Property counts by type
        $propertyCounts = Property::selectRaw('type, count(*) as count')
            ->where('status', 'available')
            ->groupBy('type')
            ->pluck('count', 'type');

        // Filter options
        $filterOptions = [
            'types' => Property::distinct()->pluck('type'),
            'purposes' => ['sale', 'rent'],
        ];

        return response()->json([
            'data' => [
                'featured_properties' => $featuredProperties,
                'recently_viewed' => $recentlyViewed,
                'property_counts' => $propertyCounts,
                'filter_options' => $filterOptions,
            ],
            'meta' => [
                'filters' => $request->only([
                    'location',
                    'type',
                    'purpose',
                    'min_price',
                    'max_price',
                    'bedrooms',
                    'bathrooms',
                ]),
            ]
        ], Response::HTTP_OK);
    }
}
