<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'user' => User::with(['profile'])->find(Auth::id())
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }
    public function upload(string $type, Request $request)
    {
        $user = User::find(Auth::id());
        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $path = $request->file('file')->store("profiles/{$user->id}", 'public');

        // Delete old profile image if it exists
        if ($user->profile && $user->profile[$type]) {
            Storage::disk('public')->delete($user->profile[$type]);
        }

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
    public function updateProfile(Request $request)
    {
        $user = User::find(Auth::id());
        $validate = $request->validate([
            'company_name' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'address' => 'nullable|string|max:500',
            'national_id' => 'nullable|string|max:50',
            'tax_id' => 'nullable|string|max:50',
        ]);

        $profileData = $validate;
        // dd($profileData);
        // Handle profile image upload


        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            $profileData
        );


        return redirect()->back()->with('success', 'User updated successfully');
    }
    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
