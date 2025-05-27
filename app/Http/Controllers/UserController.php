<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

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

        return Inertia::render('admin/UsersManagement', [
            'users' => $users->items(),
            'pagination' => [
                'current' => $users->currentPage(),
                'pageSize' => $users->perPage(),
                'total' => $users->total(),
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

        return redirect()->back();
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

        return redirect()->back();
    }

    public function destroy(User $user)
    {
        if ($user->role === 'admin') {
            abort(403, 'Cannot delete admin users');
        }

        $user->delete();

        return redirect()->back();
    }
}
