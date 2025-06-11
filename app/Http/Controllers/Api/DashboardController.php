<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $subscription = $user->subscription;
        $properties = $user->properties()->with(['images'])->latest()->take(4)->get();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
            ],
            'stats' => [
                'active_listings' => $user->properties()->count(),
                'total_inquiries' => $user->inquiries()->count() + $user->receivedInquiries()->count(),
                'total_reservations' => $user->reservations()->count() + $user->receivedReservations()->count(),
            ],
            'subscription' => $subscription ? [
                'id' => $subscription->id,
                'plan_name' => $subscription->package->name,
                'status' => $subscription->status,
                'start_date' => $subscription->started_at,
                'expires_at' => $subscription->expires_at,
                'features' => $subscription->package->features,
                'days_remaining' => now()->diffInDays($subscription->expires_at, false),
            ] : null,
            'recent_properties' => $properties->map(function ($property) {
                return [
                    'id' => $property->id,
                    'title' => $property->title,
                    'price' => $property->price,
                    'status' => $property->status,
                    'images' => $property->images->map(fn($image) => [
                        'url' => asset(
                            'storage' . $image->url
                        ),
                        'thumbnail' => $image->thumbnail_url,
                    ]),
                    'edit_url' => url("/api/user/properties/{$property->id}/edit"),
                    'view_url' => url("/api/properties/{$property->id}"),
                ];
            }),
        ]);
    }
}
