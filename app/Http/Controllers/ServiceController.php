<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function index()
    {
        return Inertia::render('user/ServicePurchasePage', [
            'services' => Service::get()->map(function ($service) {
                return [
                    'id' => $service->id,
                    'name' => $service->name,
                    'description' => $service->description,
                    'price' => $service->price,
                    'category' => $service->category,
                    'features' => $service->features,
                    'duration' => $service->duration,
                    'isActive' => $service->is_active,
                ];
            }),
        ]);
    }

    public function purchase(Request $request)
    {
        $request->validate([
            'service_id' => 'required|exists:services,id',
        ]);

        $service = Service::findOrFail($request->service_id);
        $user = $request->user();

        // Process payment and assign service to user
        $user->services()->attach($service->id, [
            'expires_at' => $service->duration ? now()->addDays($service->duration) : null,
        ]);

        return back()->with('success', 'Service purchased successfully');
    }
}
