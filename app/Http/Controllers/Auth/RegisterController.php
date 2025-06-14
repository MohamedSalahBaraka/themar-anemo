<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class RegisterController extends Controller
{
    public function create(Request $request)
    {
        $query = \App\Models\Package::where('isActive', true);

        // Check for preselected package in query params
        $preselectedPackageId = $request->query('package');

        // Validate if the preselected package exists and is active
        if ($preselectedPackageId) {
            $packageExists = $query->clone()->where('id', $preselectedPackageId)->exists();
            if (!$packageExists) {
                $preselectedPackageId = null;
            }
        }

        return Inertia::render('Auth/Register', [
            'packages' => $query->get()
                ->map(fn($package) => [
                    'id' => $package->id,
                    'name' => $package->name,
                    // 'price' => $package->price,
                    'description' => $package->description,
                    'max_listings' => $package->max_listings,
                    'user_type' => $package->user_type,
                    'price' => $package->price,
                    'yearly_price' => $package->yearly_price,
                    'features' => $package->features,
                ]),
            'preselectedPackageId' => $preselectedPackageId,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            // 'role' => 'required|in:buyer,owner,agent,company',
            'package_id' => 'nullable|exists:packages,id',
            'billing_frequency' => 'nullable|in:monthly,yearly',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            // 'role' => $request->role,
        ]);

        if ($request->package_id) {
            $package = Package::findOrFail($request->package_id);
            $user->update(['role', $package->user_type]);
            // Calculate duration based on billing frequency
            $duration = $request->billing_frequency === 'yearly' ? 365 : 30;

            // Calculate price based on billing frequency
            $price = $request->billing_frequency === 'yearly'
                ? ($package->yearly_price ?? $package->price * 12)
                : $package->price;

            $user->subscriptions()->create([
                'package_id' => $package->id,
                'expires_at' => now()->addDays($duration),
                'billing_frequency' => $request->billing_frequency ?? 'monthly',
                'cancel_at' => null,
                'price' => $price,
            ]);
        }

        Auth::login($user);

        return redirect()->route('user.dashboard');
    }
}
