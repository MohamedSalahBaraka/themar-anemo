<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProfileUpdateRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Contracts\Auth\MustVerifyEmail;

class ProfileAPIController extends Controller
{
    /**
     * Get user profile data
     */
    public function show(Request $request)
    {
        $user = User::with(['profile'])->findOrFail(Auth::id());

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'must_verify_email' => $user instanceof MustVerifyEmail
            ]
        ]);
    }

    /**
     * Update basic profile information (name, email)
     */
    public function update(ProfileUpdateRequest $request)
    {
        $user = $request->user();
        $user->fill($request->validated());

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $user->fresh()
        ]);
    }

    /**
     * Upload profile image
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'type' => 'required|in:avatar,cover,business_logo',
            'file' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = User::findOrFail(Auth::id());
        $type = $request->type;
        $path = $request->file('file')->store("profiles/{$user->id}", 'public');

        // Delete old image if it exists
        if ($user->profile && $user->profile->$type) {
            Storage::disk('public')->delete($user->profile->$type);
        }

        // Update the profile with the new image path
        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            [$type => $path]
        );

        return response()->json([
            'success' => true,
            'message' => 'Image uploaded successfully',
            'data' => [
                'path' => $path,
                'full_url' => asset('storage' . $path)
            ]
        ]);
    }

    /**
     * Update profile details
     */
    public function updateProfileDetails(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'address' => 'nullable|string|max:500',
            'national_id' => 'nullable|string|max:50',
            'tax_id' => 'nullable|string|max:50',
        ]);

        $user = User::findOrFail(Auth::id());
        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            $validated
        );

        return response()->json([
            'success' => true,
            'message' => 'Profile details updated successfully',
            'data' => $user->fresh(['profile'])
        ]);
    }

    /**
     * Delete user account
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'Account deleted successfully'
        ]);
    }
}
