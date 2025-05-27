<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ServiceController extends Controller
{
    public function index()
    {
        $services = Service::active()->get()->map(function ($service) {
            return [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'price' => $service->price,
                'category' => $service->category,
                'features' => $service->features,
                'duration' => $service->duration,
                'is_active' => $service->is_active,
                'links' => [
                    'purchase' => url("/api/services/{$service->id}/purchase"),
                ]
            ];
        });

        return response()->json([
            'data' => $services,
            'meta' => [
                'count' => $services->count(),
                'categories' => Service::distinct()->pluck('category'),
            ]
        ], Response::HTTP_OK);
    }

    public function purchase(Request $request, Service $service)
    {
        $user = $request->user();

        // Check if user already has this service
        if ($user->services()->where('service_id', $service->id)->exists()) {
            return response()->json([
                'message' => 'You already have this service'
            ], Response::HTTP_CONFLICT);
        }

        // Process payment (would integrate with payment gateway in real app)
        // $payment = processPayment($user, $service->price);

        // Assign service to user
        $user->services()->attach($service->id, [
            'expires_at' => $service->duration ? now()->addDays($service->duration) : null,
        ]);

        return response()->json([
            'message' => 'Service purchased successfully',
            'data' => [
                'service' => $service,
                'expires_at' => $service->duration ? now()->addDays($service->duration)->toIso8601String() : null,
            ],
            'links' => [
                'my_services' => url('/api/user/services'),
            ]
        ], Response::HTTP_CREATED);
    }

    public function userServices(Request $request)
    {
        $services = $request->user()->services()
            ->withPivot('expires_at')
            ->get()
            ->map(function ($service) {
                return [
                    'id' => $service->id,
                    'name' => $service->name,
                    'description' => $service->description,
                    'expires_at' => $service->pivot->expires_at?->toIso8601String(),
                    'is_active' => !$service->pivot->expires_at || $service->pivot->expires_at > now(),
                    'links' => [
                        'details' => url("/api/services/{$service->id}"),
                    ]
                ];
            });

        return response()->json([
            'data' => $services,
            'meta' => [
                'active_count' => $services->where('is_active', true)->count(),
                'expired_count' => $services->where('is_active', false)->count(),
            ]
        ], Response::HTTP_OK);
    }
}
