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
    public function create()
    {
        return Inertia::render('Auth/Register', [

            'packages' => \App\Models\Package::orderBy('price')->where('isActive', true)
                ->get()
                ->map(fn($package) => [
                    'id' => $package->id,
                    'name' => $package->name,
                    'price' => $package->price,
                    'duration' => $package->duration,
                    'description' => $package->description,
                    'max_listings' => $package->max_listings,
                ]),
        ]);
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
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => $request->role,
        ]);

        if ($request->package_id && $request->role !== 'buyer') {
            $user->subscriptions()->create([
                'package_id' => $request->package_id,
                'expires_at' => now()->addDays(Package::find($request->package_id)->duration),
            ]);
        }

        Auth::login($user);

        return redirect()->route('user.dashboard');
    }
}
