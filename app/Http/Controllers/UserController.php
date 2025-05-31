<?php

namespace App\Http\Controllers;

use App\Models\Package;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['subscription', 'profile'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->when($request->role, function ($query, $role) {
                $query->where('role', $role);
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->subscription_status, function ($query, $status) {
                // dd($status);
                if ($status === 'none') {
                    $query->doesntHave('subscription');
                } else {
                    $query->whereHas('subscription', function ($q) use ($status) {
                        $q->where('status', $status);
                    });
                }
            });

        $users = $query->paginate($request->limit ?? 15);

        return Inertia::render('admin/UsersManagement', [
            'users' => $users->map(
                function ($user) {
                    return [
                        "id" => $user->id,
                        "name" => $user->name,
                        "email" => $user->email,
                        "phone" => $user->phone,
                        "role" => $user->role,
                        "status" => $user->status,
                        "profile" => $user->profile,
                        "subscription" => $user->subscription,
                        "created_at" => $user->created_at,
                    ];
                }
            ),
            'packages' => Package::all(),
            'pagination' => [
                'current' => $users->currentPage(),
                'pageSize' => $users->perPage(),
                'total' => $users->total(),
            ],
            'filters' => $request->only(['search', 'role', 'status', 'subscription_status']),
        ]);
    }
    public function upload(User $user, string $type, Request $request)
    {
        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $path = $request->file('file')->store("profiles/{$user->id}", 'public');

        // Update the profile with the new image path
        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            [$type => $path]
        );

        return response()->json([
            'success' => true,
            'path' => $path
        ]);
    }
    public function updateStatus(User $user, Request $request)
    {
        $request->validate([
            'status' => 'required|in:active,inactive,pending',
        ]);

        $user->update(['status' => $request->status]);

        return redirect()->back();
    }

    public function update(User $user, Request $request)
    {
        $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'role' => 'nullable|in:buyer,owner,agent,company,admin',
            'status' => 'nullable|in:active,inactive,pending',
            'profile.company_name' => 'nullable|string|max:255',
            'profile.bio' => 'nullable|string|max:1000',
            'profile.address' => 'nullable|string|max:500',
            'profile.national_id' => 'nullable|string|max:50',
            'profile.tax_id' => 'nullable|string|max:50',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);
        if ($request->has('email') || $request->has('name') || $request->has('phone') || $request->has('role') || $request->has('status')) {

            $userData = $request->only(['name', 'email', 'phone', 'role', 'status']);
            $user->update($userData);
        }

        if ($request->has('profile')) {
            $profileData = $request->profile;

            // Handle profile image upload
            if ($request->hasFile('profile_image')) {
                $path = $request->file('profile_image')->store('profile_images', 'public');
                $profileData['profile_image'] = $path;

                // Delete old profile image if it exists
                if ($user->profile && $user->profile->profile_image) {
                    Storage::disk('public')->delete($user->profile->profile_image);
                }
            }

            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                $profileData
            );
        }

        return redirect()->back()->with('success', 'User updated successfully');
    }

    public function destroy(User $user)
    {
        if ($user->role === 'admin') {
            abort(403, 'Cannot delete admin users');
        }

        $user->delete();

        return redirect()->back();
    }
    public function approve(User $user)
    {
        $user->status = 'active';
        $user->save();
        $subscription = $user->subscription;
        $subscription->status = 'active';
        $subscription->save();

        return redirect()->back()->with('success', 'user activeted successfully');
    }
}
