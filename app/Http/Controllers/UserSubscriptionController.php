<?php
// app/Http/Controllers/Admin/UserSubscriptionController.php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Subscription;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class UserSubscriptionController extends Controller
{
    public function store(User $user, Request $request)
    {
        $validated = $request->validate([
            'package_id' => 'required|exists:packages,id',
            'billing_frequency' => 'required|in:monthly,yearly',
        ]);

        $package = Package::findOrFail($validated['package_id']);

        $subscription = new Subscription();
        $subscription->user_id = $user->id;
        $subscription->package_id = $package->id;
        $subscription->billing_frequency = $validated['billing_frequency'];
        $subscription->price = $validated['billing_frequency'] === 'monthly'
            ? $package->price
            : $package->yearly_price;
        $subscription->status = 'active';
        $subscription->started_at = now();
        $subscription->expires_at = $validated['billing_frequency'] === 'monthly'
            ? now()->addMonth()
            : now()->addYear();
        $subscription->save();

        return redirect()->back()->with('success', 'Subscription created successfully');
    }

    public function update(User $user, Subscription $subscription, Request $request)
    {
        $validated = $request->validate([
            'package_id' => 'sometimes|exists:packages,id',
            'billing_frequency' => 'sometimes|in:monthly,yearly',
            'status' => 'sometimes|in:active,expired,canceled,pending',
        ]);

        if (isset($validated['package_id'])) {
            $package = Package::findOrFail($validated['package_id']);
            $subscription->package_id = $package->id;
            $subscription->package_name = $package->name;
        }

        if (isset($validated['billing_frequency'])) {
            $subscription->billing_frequency = $validated['billing_frequency'];
            $package = $subscription->package;
            $subscription->price = $validated['billing_frequency'] === 'monthly'
                ? $package->price
                : $package->yearly_price;
        }

        if (isset($validated['status'])) {
            $subscription->status = $validated['status'];
        }

        $subscription->save();

        return redirect()->back()->with('success', 'Subscription updated successfully');
    }

    public function destroy(User $user, Subscription $subscription)
    {
        $subscription->status = 'canceled';
        $subscription->cancel_at = now();
        $subscription->save();

        return redirect()->back()->with('success', 'Subscription canceled successfully');
    }
    public function approve(User $user, Subscription $subscription)
    {
        $subscription->status = 'active';
        $subscription->save();

        return redirect()->back()->with('success', 'Subscription activeted successfully');
    }
}
