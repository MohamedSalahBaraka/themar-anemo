<?php
// app/Http/Controllers/Admin/ReviewController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserServiceReview;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function index()
    {
        $reviews = UserServiceReview::with(['userService.user', 'userService.service'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Admin/Reviews/Index', [
            'reviews' => $reviews
        ]);
    }

    public function edit(UserServiceReview $review)
    {
        $review->load(['userService.user', 'userService.service']);

        return Inertia::render('Admin/Reviews/Edit', [
            'review' => $review
        ]);
    }

    public function update(Request $request, UserServiceReview $review)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string',
            'is_public' => 'required|boolean'
        ]);

        $review->update($validated);

        return redirect()->route('admin.reviews.index')->with('success', 'Review updated successfully.');
    }

    public function destroy(UserServiceReview $review)
    {
        $review->delete();

        return redirect()->route('admin.reviews.index')->with('success', 'Review deleted successfully.');
    }

    public function toggleVisibility(UserServiceReview $review)
    {
        $review->update(['is_public' => !$review->is_public]);

        return back()->with('success', 'Review visibility updated.');
    }
}
