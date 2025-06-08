<?php
// app/Http/Controllers/ServiceCategoryController.php
namespace App\Http\Controllers;

use App\Models\ServiceCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ServiceCategoryController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/ServiceCategories/Index', [
            'categories' => ServiceCategory::all()->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'icon_url' => $category->icon_url,
                ];
            }),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'icon' => 'nullable|image',
        ]);

        $iconPath = null;
        if ($request->hasFile('icon')) {
            $iconPath = $request->file('icon')->store('service-categories/icons', 'public');
        }

        ServiceCategory::create([
            'name' => $request->name,
            'icon' => $iconPath,
        ]);

        return redirect()->back()->with('success', 'Category created successfully.');
    }

    public function update(Request $request, ServiceCategory $serviceCategory)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'icon' => 'nullable|image|max:2048',
        ]);

        $iconPath = $serviceCategory->icon;
        if ($request->hasFile('icon')) {
            // Delete old icon if exists
            if ($iconPath) {
                Storage::disk('public')->delete($iconPath);
            }
            $iconPath = $request->file('icon')->store('service-categories/icons', 'public');
        }

        $serviceCategory->update([
            'name' => $request->name,
            'icon' => $iconPath,
        ]);

        return redirect()->back()->with('success', 'Category updated successfully.');
    }

    public function destroy(ServiceCategory $serviceCategory)
    {
        if ($serviceCategory->icon) {
            Storage::disk('public')->delete($serviceCategory->icon);
        }
        $serviceCategory->delete();
        return redirect()->back()->with('success', 'Category deleted successfully.');
    }
}
