<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PublicServiceController extends Controller
{
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
            ->paginate(12)
            ->withQueryString();

        $categories = ServiceCategory::orderBy('name')->get();

        // Get all unique tags from active services
        $allTags = Service::where('is_active', true)
            ->pluck('tags')
            ->flatten()
            ->unique()
            ->filter()
            ->values();

        return Inertia::render('Services/Index', [
            'services' => $services,
            'categories' => $categories,
            'allTags' => $allTags,
            'filters' => $request->only(['search', 'category', 'tags']),
        ]);
    }

    public function show(Service $service)
    {
        if (!$service->is_active) {
            abort(404);
        }

        $service->load(['category', 'fields']);

        return Inertia::render('Services/Show', [
            'service' => $service,
            'relatedServices' => Service::where('is_active', true)
                ->where('category_id', $service->category_id)
                ->where('id', '!=', $service->id)
                ->inRandomOrder()
                ->limit(4)
                ->get(),
        ]);
    }
    public function apply(Request $request, Service $service)
    {
        DB::beginTransaction();
        try {
            // Get authenticated user (adjust based on your auth system)
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

            // Process field values
            $fields = $request->input('fields', []);


            // dd($fields);
            foreach ($fields as $fieldId => $value) {
                $fieldId = (int)$fieldId;
                $field = $service->fields()->findOrFail($fieldId);

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
                $field = $service->fields()->findOrFail($fieldId);

                $path = $file->store("user_services/{$userService->id}/attachments", 'public');

                $userService->fieldValues()->create([
                    'service_field_id' => $fieldId,
                    'value' =>  $path
                ]);
            }


            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Application submitted successfully',
                'redirect' => route('user-services.show', $userService->id)
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
