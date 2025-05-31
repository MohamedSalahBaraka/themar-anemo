<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class RegisterController extends Controller
{
    public function packages(Request $request)
    {
        $request->validate([
            'role' => 'sometimes|in:owner,agent,company'
        ]);

        $query = Package::orderBy('price')->where('isActive', true);

        // Filter packages by user type if role is provided
        if ($request->has('role')) {
            $userType = match ($request->role) {
                'owner' => 'owner',
                'agent' => 'agent',
                'company' => 'company',
                default => null
            };

            if ($userType) {
                $query->where('user_type', $userType);
            }
        }

        $packages = $query->get()->map(function ($package) {
            return [
                'id' => $package->id,
                'name' => $package->name,
                'description' => $package->description,
                'max_listings' => $package->max_listings,
                'user_type' => $package->user_type,
                'monthly_price' => $package->billing_frequency === 'monthly'
                    ? $package->price
                    : $package->monthly_price,
                'yearly_price' => $package->billing_frequency === 'yearly'
                    ? $package->price
                    : ($package->yearly_price ?? $package->price * 12 * 0.9), // 10% discount if yearly price not set
                'features' => $package->features,
            ];
        });

        return response()->json([
            'packages' => $packages
        ], Response::HTTP_OK);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'role' => 'required|in:buyer,owner,agent,company',
            'package_id' => 'nullable|exists:packages,id',
            'billing_frequency' => 'nullable|in:monthly,yearly',
            'terms' => 'required|accepted',
        ]);

        // Create user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => $request->role,
        ]);

        // Handle subscription if package is selected and user is not a buyer
        if ($request->package_id && $request->role !== 'buyer') {
            $package = Package::findOrFail($request->package_id);

            // Calculate duration based on billing frequency
            $duration = $request->billing_frequency === 'yearly' ? 365 : 30;

            // Calculate price based on billing frequency
            $price = $request->billing_frequency === 'yearly'
                ? ($package->yearly_price ?? $package->price * 12 * 0.9)
                : ($package->monthly_price ?? $package->price);

            $user->subscriptions()->create([
                'package_id' => $package->id,
                'expires_at' => now()->addDays($duration),
                'billing_frequency' => $request->billing_frequency ?? 'monthly',
                'price' => $price,
                'cancel_at' => null,
            ]);
        }

        // Create authentication token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Determine redirect path based on role
        $redirectTo = match ($user->role) {
            'owner' => '/owner/dashboard',
            'agent' => '/agent/dashboard',
            'company' => '/company/dashboard',
            default => '/dashboard',
        };

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user->only(['id', 'name', 'email', 'role']),
            'access_token' => $token,
            'token_type' => 'Bearer',
            'redirect_to' => $redirectTo,
            'has_subscription' => $user->subscriptions()->exists(),
        ], Response::HTTP_CREATED);
    }
}
