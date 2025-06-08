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
    public function upsert(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'yearly_price' => 'required|numeric|min:0',
            'user_type' => 'required|in:owner,agent,company',
            'max_listings' => 'required|integer|min:1',
            'max_adds' => 'required|integer|min:0',
            'features' => 'nullable|array',
            'features.*' => 'string|max:255',
            'isActive' => 'boolean',
        ]);

        $package = Package::updateOrCreate(
            ['user_type' => $validated['user_type']], // 👈 unique constraint
            $validated
        );

        return redirect()->back()->with('success', 'Package saved successfully');
    }



    public function destroy(Package $package)
    {
        $package->delete();
        return redirect()->back()->with('success', 'Package deleted successfully');
    }
}
