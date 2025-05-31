<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PackageController extends Controller
{
    public function index()
    {
        $packages = Package::all()->map(function ($package) {
            return [
                'id' => $package->id,
                'name' => $package->name,
                'description' => $package->description,
                'price' => $package->price,
                'user_type' => $package->user_type,
                'max_listings' => $package->max_listings,
                'features' => $package->features,
                'isActive' => $package->isActive,
                'created_at' => $package->created_at->toIso8601String(),
                'updated_at' => $package->updated_at->toIso8601String(),
                'links' => [
                    'self' => url("/api/packages/{$package->id}"),
                    'update' => url("/api/packages/{$package->id}"),
                    'delete' => url("/api/packages/{$package->id}"),
                ]
            ];
        });

        return response()->json([
            'data' => $packages,
            'meta' => [
                'count' => count($packages),
                'active_count' => Package::where('isActive', true)->count(),
            ]
        ], Response::HTTP_OK);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'user_type' => 'required|in:owner,agent,company',
            'max_listings' => 'required|integer|min:1',
            'features' => 'nullable|json',
            'isActive' => 'boolean',
        ]);

        if (isset($validated['features']) && is_string($validated['features'])) {
            $validated['features'] = json_decode($validated['features'], true);
        }

        $package = Package::create($validated);

        return response()->json([
            'message' => 'Package created successfully',
            'data' => $package,
            'links' => [
                'self' => url("/api/packages/{$package->id}"),
            ]
        ], Response::HTTP_CREATED);
    }

    public function update(Request $request, Package $package)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'user_type' => 'required|in:owner,agent,company',
            'max_listings' => 'required|integer|min:1',
            'features' => 'nullable|json',
            'isActive' => 'boolean',
        ]);

        if (isset($validated['features'])) {
            $validated['features'] = is_string($validated['features'])
                ? json_decode($validated['features'], true)
                : $validated['features'];
        }

        $package->update($validated);

        return response()->json([
            'message' => 'Package updated successfully',
            'data' => $package,
            'links' => [
                'self' => url("/api/packages/{$package->id}"),
            ]
        ], Response::HTTP_OK);
    }

    public function destroy(Package $package)
    {
        $package->delete();

        return response()->json([
            'message' => 'Package deleted successfully',
            'meta' => [
                'remaining_active' => Package::where('isActive', true)->count(),
            ]
        ], Response::HTTP_OK);
    }
}
