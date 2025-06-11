<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\User;
use App\Models\UserService;
use App\Models\ServiceRating;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserServiceAPIController extends Controller
{
    /**
     * Get user's services with filters
     */
    public function index(Request $request)
    {
        $user = User::findOrFail(Auth::id());

        $query = $user->userServices()
            ->with([
                'user:id,name,email',
                'service:id,name',
                'currentStep:id,title',
                'review:user_service_id,rating,review'
            ])
            ->latest();

        // Apply filters
        $query->when($request->status, function ($q, $status) {
            $q->where('status', $status);
        })
            ->when($request->service_id, function ($q, $serviceId) {
                $q->where('service_id', $serviceId);
            })
            ->when($request->user_id, function ($q, $userId) {
                $q->where('user_id', $userId);
            })
            ->when($request->date_from, function ($q, $dateFrom) {
                $q->whereDate('created_at', '>=', $dateFrom);
            })
            ->when($request->date_to, function ($q, $dateTo) {
                $q->whereDate('created_at', '<=', $dateTo);
            });

        $services = $query->paginate($request->per_page ?? 15);

        $transformedServices = $services->map(function ($userService) {
            return [
                'id' => $userService->id,
                'user' => $userService->user,
                'service' => $userService->service,
                'status' => $userService->status,
                'current_step' => $userService->currentStep,
                'created_at' => $userService->created_at->format('Y-m-d H:i:s'),
                'rating' => $userService->review?->rating,
                'review' => $userService->review?->review,
                'can_rate' => $userService->status === 'completed' && !$userService->review,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'services' => $transformedServices,
                'meta' => [
                    'total' => $services->total(),
                    'per_page' => $services->perPage(),
                    'current_page' => $services->currentPage(),
                    'last_page' => $services->lastPage(),
                ],
                'filters' => $request->only(['status', 'service_id', 'user_id', 'date_from', 'date_to']),
                'all_services' => Service::all(['id', 'name']),
                'all_statuses' => ['pending', 'in_progress', 'completed', 'rejected', 'cancelled'],
                'all_users' => User::all(['id', 'name', 'email']),
            ]
        ]);
    }

    /**
     * Get service details
     */
    public function show(UserService $user_service)
    {
        // Authorization check
        if ($user_service->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $user_service->load([
            'user',
            'service.category',
            'service.fields',
            'fieldValues',
            'currentStep',
            'steps' => function ($query) {
                $query->with(['serviceStep.fields.value']);
            },
            'attachments' => function ($query) {
                $query->with(['uploadedBy', 'step']);
            },
            'activityLogs' => function ($query) {
                $query->with('user')->latest();
            }
        ]);

        $service_steps = $user_service->service->steps()->orderBy('order')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'user_service' => $user_service,
                'service_steps' => $service_steps
            ]
        ]);
    }

    /**
     * Submit rating for a service
     */
    public function submitRating(Request $request, UserService $user_service)
    {
        // Validate ownership
        if ($user_service->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Can only rate completed services
        if ($user_service->status !== 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'You can only rate completed services'
            ], 400);
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:500',
        ]);

        $rating = $user_service->review()->updateOrCreate(
            ['user_service_id' => $user_service->id],
            [
                'rating' => $request->rating,
                'review' => $request->review,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Thank you for your rating!',
            'data' => $rating
        ]);
    }
}
