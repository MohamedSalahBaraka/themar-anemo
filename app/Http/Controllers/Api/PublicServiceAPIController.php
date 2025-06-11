<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PublicServiceAPIController extends Controller
{
    /**
     * Get list of active services with filtering options
     */
    public function index(Request $request)
    {
        $services = Service::query()
            ->with(['category'])
            ->where('is_active', true)
            ->when($request->category, function ($query, $category) {
                $query->whereHas('category', function ($q) use ($category) {
                    $q->where('id', $category);
                });
            })
            ->when($request->tags, function ($query, $tags) {
                $query->whereJsonContains('tags', $tags);
            })
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate($request->per_page ?? 12);

        $categories = ServiceCategory::orderBy('name')->get();

        // Get all unique tags from active services
        $allTags = Service::where('is_active', true)
            ->pluck('tags')
            ->flatten()
            ->unique()
            ->filter()
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'services' => $services,
                'categories' => $categories,
                'allTags' => $allTags,
            ],
            'filters' => $request->only(['search', 'category', 'tags']),
        ]);
    }

    /**
     * Get service details including only fields with show_on_creation = true
     */
    public function show(Service $service)
    {
        if (!$service->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Service not found'
            ], 404);
        }

        $service->load(['category', 'fields' => function ($query) {
            $query->where('show_on_creation', true)->orderBy('order');
        }]);

        $relatedServices = Service::where('is_active', true)
            ->where('category_id', $service->category_id)
            ->where('id', '!=', $service->id)
            ->inRandomOrder()
            ->limit(4)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'service' => $service,
                'related_services' => $relatedServices,
            ]
        ]);
    }

    /**
     * Apply for a service
     */
    public function apply(Request $request, Service $service)
    {
        $request->validate([
            'fields' => 'required|array',
            'fields.*' => 'required_if:required,true',
        ]);

        DB::beginTransaction();
        try {
            $user = User::findOrFail(Auth::id());

            // Create user service record
            $userService = $user->userServices()->create([
                'service_id' => $service->id,
                'status' => 'pending',
                'current_step_id' => $service->steps()->orderBy('order')->first()?->id
            ]);

            // Create initial step records
            foreach ($service->steps as $step) {
                $userService->steps()->create([
                    'service_step_id' => $step->id,
                    'status' => $step->order === 1 ? 'in_progress' : 'pending'
                ]);
            }

            // Process field values (only fields with show_on_creation = true)
            $fields = $request->input('fields', []);

            foreach ($fields as $fieldId => $value) {
                $fieldId = (int)$fieldId;
                $field = $service->fields()->where('show_on_creation', true)->findOrFail($fieldId);

                // Handle JSON encoded values (for checkboxes/multiselect)
                $decodedValue = json_decode($value, true);
                $storedValue = json_last_error() === JSON_ERROR_NONE ? $decodedValue : $value;

                $userService->fieldValues()->create([
                    'service_field_id' => $fieldId,
                    'value' => is_array($storedValue) ? json_encode($storedValue) : $storedValue
                ]);
            }

            // Process file uploads
            foreach ($request->allFiles() as $fieldId => $file) {
                $field = $service->fields()->where('show_on_creation', true)->findOrFail($fieldId);
                $path = $file->store("user_services/{$userService->id}/attachments", 'public');

                $userService->fieldValues()->create([
                    'service_field_id' => $fieldId,
                    'value' => $path
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Application submitted successfully',
                'data' => [
                    'user_service_id' => $userService->id
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit application: ' . $e->getMessage(),
            ], 500);
        }
    }
}
