<?php

namespace App\Http\Controllers\Auth\API;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class RegisterController extends Controller
{
    public function getPackages(Request $request)
    {
        $query = Package::where('isActive', true);
        $preselectedPackageId = $request->query('package');

        if ($preselectedPackageId) {
            $packageExists = $query->clone()->where('id', $preselectedPackageId)->exists();
            if (!$packageExists) {
                $preselectedPackageId = null;
            }
        }

        return response()->json([
            'packages' => $query->get()
                ->map(fn($package) => [
                    'id' => $package->id,
                    'name' => $package->name,
                    'description' => $package->description,
                    'max_listings' => $package->max_listings,
                    'user_type' => $package->user_type,
                    'price' => $package->price,
                    'yearly_price' => $package->yearly_price,
                    'features' => $package->features,
                ]),
            'preselected_package_id' => $preselectedPackageId,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'package_id' => 'nullable|exists:packages,id',
            'billing_frequency' => 'nullable|in:monthly,yearly',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
        ]);

        if ($request->package_id) {
            $package = Package::findOrFail($request->package_id);
            $user->update(['role' => $package->user_type]);

            $duration = $request->billing_frequency === 'yearly' ? 365 : 30;
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

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
            ],
            'redirect_to' => $user->role === 'admin' ? '/admin/dashboard' : '/user/dashboard'
        ], 201);
    }
}
