<?php

namespace App\Http\Controllers;

use App\Filters\PropertyFilter;
use App\Models\Property;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SearchController extends Controller
{

    public function index(Request $request)
    {
        // Get filters from request
        $filters = $request->only([
            'type',
            'purpose',
            'location',
            'minPrice',
            'maxPrice',
            'bedrooms',
            'status',
            'page',
            'per_page'
        ]);

        // Query properties with filters
        $properties = Property::query()
            ->filter(new PropertyFilter($filters))
            ->orderBy('created_at', 'desc')
            ->paginate($filters['per_page'] ?? 12)
            ->withQueryString(); // Preserve filters in pagination linkss
        return Inertia::render('SearchResultsPage', [
            'properties' => $properties->map(function ($property) {
                return [
                    'id' => $property->id,
                    'title' => $property->title,
                    'description' => $property->description,
                    'price' => $property->price,
                    'bedrooms' => $property->bedrooms,
                    'address' => $property->address,
                    'imageUrl' => $property->images?->first()?->url,
                    'status' => $property->status,
                    'is_featured' => $property->is_featured,
                ];
            }),
            'filters' => $filters,
            'meta' => [
                'total' => $properties->total(),
                'per_page' => $filters['per_page'] ?? 12,
                'current_page' => $filters['page'] ?? 12,
            ],
        ]);
    }
}
