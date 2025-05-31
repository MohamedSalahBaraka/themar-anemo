<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PackageController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/PackageManagementPage', [
            'packages' => Package::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'yearly_price' => 'required|numeric|min:0',
            'user_type' => 'required|in:owner,agent,company',
            'max_listings' => 'required|integer|min:1',
            'features' => 'nullable|json',
            'isActive' => 'boolean',
        ]);

        // Convert features to array if it's a JSON string
        if (isset($validated['features']) && is_string($validated['features'])) {
            $validated['features'] = json_decode($validated['features'], true);
        }

        Package::create($validated);

        return redirect()->back()->with('success', 'Package created successfully');
    }

    public function update(Request $request, Package $package)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'yearly_price' => 'required|numeric|min:0',
            'user_type' => 'required|in:owner,agent,company',
            'max_listings' => 'required|integer|min:1',
            'features' => 'nullable|json',
            'isActive' => 'boolean',
        ]);

        // Convert features to array if it's a JSON string
        if (isset($validated['features']) && is_string($validated['features'])) {
            $validated['features'] = json_decode($validated['features'], true);
        }
        $package->update($validated);

        return redirect()->back()->with('success', 'Package updated successfully');
    }

    public function destroy(Package $package)
    {
        $package->delete();
        return redirect()->back()->with('success', 'Package deleted successfully');
    }
}
