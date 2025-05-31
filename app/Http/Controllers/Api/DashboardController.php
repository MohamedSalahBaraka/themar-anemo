<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $subscription = $user->subscription();
        $properties = $user->properties()->with(['images'])->latest()->take(4)->get();

        return response()->json([
            'user' => $user->only(['id', 'name', 'email', 'phone', 'avatar']),
            'stats' => [
                'active_listings' => $user->properties()->count(),
                'total_inquiries' => $user->inquiries()->count() + $user->receivedInquiries()->count(),
                'total_reservations' => $user->reservations()->count() + $user->receivedReservations()->count(),
            ],
            'subscription' => $subscription ? [
                'id' => $subscription->id,
                'plan_name' => $subscription->package->name,
                'status' => $subscription->is_active ? 'active' : 'inactive',
                'start_date' => $subscription->started_at,
                'expires_at' => $subscription->expires_at,
                'features' => $subscription->package->features,
            ] : null,
            'properties' => $properties->map(function ($property) {
                return array_merge($property->toArray(), [
                    'edit_url' => url("/api/user/properties/{$property->id}/edit"),
                    'view_url' => url("/api/properties/{$property->id}"),
                ]);
            }),
        ], Response::HTTP_OK);
    }
}
