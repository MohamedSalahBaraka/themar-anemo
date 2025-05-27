<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::query()
            ->with('profile')
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
            ->paginate($request->limit ?? 10);

        return response()->json([
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'last_page' => $users->lastPage(),
            ],
            'filters' => $request->only(['search', 'role', 'status']),
        ]);
    }

    public function updateStatus(User $user, Request $request)
    {
        $request->validate([
            'status' => 'required|in:active,inactive,pending',
        ]);

        $user->update(['status' => $request->status]);

        return response()->json([
            'message' => 'User status updated successfully',
            'data' => $user
        ]);
    }

    public function update(User $user, Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'role' => 'required|in:buyer,owner,agent,company,admin',
            'status' => 'required|in:active,inactive,pending',
            'profile.company_name' => 'nullable|string|max:255',
            'profile.bio' => 'nullable|string|max:1000',
        ]);

        $user->update($request->only(['name', 'email', 'phone', 'role', 'status']));

        if ($request->profile) {
            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                $request->profile
            );
        }

        return response()->json([
            'message' => 'User updated successfully',
            'data' => $user->load('profile')
        ]);
    }

    public function destroy(User $user)
    {
        if ($user->role === 'admin') {
            return response()->json([
                'message' => 'Cannot delete admin users'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
}
