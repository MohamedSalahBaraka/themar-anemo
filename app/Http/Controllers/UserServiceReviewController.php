<?php

namespace App\Http\Controllers;

use App\Models\UserService;
use App\Models\UserServiceReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UserServiceReviewController extends Controller
{
    /**
     * Store a newly created review
     */
    public function store(Request $request, UserService $userService)
    {
        // Validate the request
        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'review' => ['nullable', 'string', 'max:1000'],
            'is_public' => ['boolean']
        ]);

        // Check if the user can review this service
        // $this->authorize('createReview', $userService);

        // Create the review
        $review = $userService->review()->create([
            'rating' => $validated['rating'],
            'review' => $validated['review'],
            'is_public' => $validated['is_public'] ?? true,
        ]);
        return back()->with([
            'message' => 'Review submitted successfully',
            'review' => $review
        ]);
    }

    /**
     * Update an existing review
     */
    public function update(Request $request, UserService $userService)
    {
        // Validate the request
        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'review' => ['nullable', 'string', 'max:1000'],
            'is_public' => ['boolean']
        ]);

        // Ensure the service has a review
        if (!$userService->review) {
            return response()->json([
                'message' => 'No review exists for this service'
            ], 404);
        }

        // Check if the user can update this review
        // $this->authorize('updateReview', $userService);

        // Update the review
        $userService->review->update([
            'rating' => $validated['rating'],
            'review' => $validated['review'],
            'is_public' => $validated['is_public'] ?? $userService->review->is_public,
        ]);

        return back()->with([
            'message' => 'Review updated successfully',
            'review' => $userService->fresh()->review
        ]);
    }

    /**
     * Delete a review
     */
    public function destroy(UserService $userService)
    {
        // Ensure the service has a review
        if (!$userService->review) {
            return response()->json([
                'message' => 'No review exists for this service'
            ], 404);
        }

        // Check if the user can delete this review
        // $this->authorize('deleteReview', $userService);

        // Delete the review
        $userService->review->delete();

        return back()->with('success', 'Review deleted successfully');
    }
}
