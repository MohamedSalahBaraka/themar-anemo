<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $subscription = $user->activeSubscription();
        $properties = $user->properties()->with(['images'])->latest()->take(4)->get();

        return Inertia::render('user/DashboardPage', [
            'user' => $user->only(['id', 'name', 'email', 'phone', 'avatar']),
            'stats' => [
                'active_listings' => $user->properties()->count(),
                'total_inquiries' => $user->inquiries()->count() + $user->receivedInquiries()->count(),
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
                return $property->toArray() + [
                    'edit_url' => route('user.properties.edit', $property),
                    'view_url' => route('properties.show', $property),
                ];
            }),
        ]);
    }
}
