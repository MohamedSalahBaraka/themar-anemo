<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Filters\PropertyFilter;
use App\Models\Property;
use Illuminate\Http\Request;

class SearchAPIController extends Controller
{
    /**
     * Search properties with filters
     */
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
            'success' => true,
            'data' => [
                'properties' => $properties->items(),
                'meta' => [
                    'total' => $properties->total(),
                    'per_page' => $properties->perPage(),
                    'current_page' => $properties->currentPage(),
                    'last_page' => $properties->lastPage(),
                ],
                'filters' => $filters
            ]
        ]);
    }
}
