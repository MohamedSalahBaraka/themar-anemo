<?php

namespace App\Http\Controllers\Api;

use App\Filters\PropertyFilter;
use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        // Get filters from request
        $filters = $request->only([
            'type',
            'purpose',
            'location',
            'min_price',
            'max_price',
            'bedrooms',
            'status',
            'per_page'
        ]);

        // Query properties with filters
        $properties = Property::query()
            ->with(['images'])
            ->filter(new PropertyFilter($filters))
            ->orderBy('created_at', 'desc')
            ->paginate($filters['per_page'] ?? 12);

        return response()->json([
            'data' => $properties->map(function ($property) {
                return [
                    'id' => $property->id,
                    'title' => $property->title,
                    'description' => $property->description,
                    'price' => $property->price,
                    'bedrooms' => $property->bedrooms,
                    'bathrooms' => $property->bathrooms,
                    'address' => $property->address,
                    'city' => $property->city,
                    'state' => $property->state,
                    'images' => $property->images->map(fn($image) => [
                        'url' => $image->url,
                        'thumbnail' => $image->thumbnail_url ?? $image->url
                    ]),
                    'status' => $property->status,
                    'is_featured' => $property->is_featured,
                    'type' => $property->type,
                    'purpose' => $property->purpose,
                    'created_at' => $property->created_at->toIso8601String(),
                    'url' => url("/api/properties/{$property->id}"),
                ];
            }),
            'meta' => [
                'current_page' => $properties->currentPage(),
                'per_page' => $properties->perPage(),
                'total' => $properties->total(),
                'last_page' => $properties->lastPage(),
            ],
            'links' => [
                'first' => $properties->url(1),
                'last' => $properties->url($properties->lastPage()),
                'prev' => $properties->previousPageUrl(),
                'next' => $properties->nextPageUrl(),
            ],
            'filters' => $filters
        ], Response::HTTP_OK);
    }
}
