<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\UserService;
use App\Models\ServiceRating;
use App\Models\User;
use App\Models\UserServiceStep;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserUserServiceController extends Controller
{
    public function index(Request $request)
    {
        $user = User::findOrFail(Auth::id());

        // Start with a base query that includes all necessary relationships
        $query = $user->userServices()
            ->with([
                'user:id,name,email',
                'service:id,name',
                'currentStep:id,title',
                'review:user_service_id,rating,review' // Include the review relationship
            ])
            ->latest();

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('service_id')) {
            $query->where('service_id', $request->service_id);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Get paginated results
        $services = $query->paginate(15);

        // Transform the data to match the frontend expectations
        $transformedServices = $services->getCollection()->map(function ($userService) {
            return [
                'id' => $userService->id,
                'user' => $userService->user,
                'service' => $userService->service,
                'status' => $userService->status,
                'current_step' => $userService->currentStep,
                'created_at' => $userService->created_at,
                'rating' => $userService->review?->rating, // Get rating from review relationship
                'review' => $userService->review?->review, // Get review text from review relationship
                'can_rate' => $userService->status === 'completed' && !$userService->review, // Can rate if completed and no review exists
            ];
        });

        // Replace the collection with our transformed data
        $services->setCollection($transformedServices);

        return Inertia::render('user/UserServices/Index', [
            'services' => $services,
            'filters' => $request->only(['status', 'service_id', 'user_id', 'date_from', 'date_to']),
            'allServices' => Service::all(['id', 'name']),
            'allStatuses' => ['pending', 'in_progress', 'completed', 'rejected', 'cancelled'],
            'allUsers' => User::all(['id', 'name', 'email']),
        ]);
    }

    public function show(UserService $user_service)
    {
        $user_service->load([
            'user',
            'service.category',
            'service.fields',
            'fieldValues',
            'currentStep',
            'steps' => function ($query) {
                $query->with(['serviceStep.fields.value',]);
            },
            'attachments' => function ($query) {
                $query->with(['uploadedBy', 'step']);
            },
            'activityLogs' => function ($query) {
                $query->with('user')->latest();
            }
        ]);
        $service_steps = $user_service->service->steps()->orderBy('order')->get();

        return Inertia::render('user/UserServices/Show', [
            'userService' => $user_service,
            'serviceSteps' => $service_steps,
        ]);
    }

    public function submitRating(Request $request, UserService $user_service)
    {
        // Validate ownership
        if ($user_service->user_id !== Auth::id()) {
            abort(403);
        }

        // Can only rate completed services
        if ($user_service->status !== 'completed') {
            abort(400, 'You can only rate completed services');
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:500',
        ]);

        $user_service->review()->updateOrCreate(
            ['user_service_id' => $user_service->id],
            [
                'rating' => $request->rating,
                'review' => $request->review,
            ]
        );

        return redirect()->back()->with('success', 'Thank you for your rating!');
    }
}
