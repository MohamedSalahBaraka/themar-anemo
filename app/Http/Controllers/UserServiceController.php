<?php
// app/Http/Controllers/UserServiceController.php
namespace App\Http\Controllers;

use App\Models\UserService;
use App\Models\Service;
use App\Models\ServiceActivityLog;
use App\Models\ServiceStep;
use App\Models\User;
use App\Models\UserServiceAttachment;
use App\Models\UserServiceFieldValue;
use App\Models\UserServiceStep;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserServiceController extends Controller
{
    public function index(Request $request)
    {
        $query = UserService::with([
            'user:id,name,email',
            'service:id,name',
            'currentStep:id,title',
            'review:id,user_service_id,rating,review,is_public'
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

        // Transform the data to include can_rate flag
        $transformedServices = $services->getCollection()->map(function ($userService) {
            return [
                'id' => $userService->id,
                'user' => $userService->user,
                'service' => $userService->service,
                'status' => $userService->status,
                'current_step' => $userService->currentStep,
                'created_at' => $userService->created_at,
                'review' => $userService->review,
                'can_rate' => $userService->status === 'completed' && !$userService->review,
            ];
        });

        $services->setCollection($transformedServices);

        return Inertia::render('admin/UserServices/Index', [
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

        return Inertia::render('admin/UserServices/Show', [
            'userService' => $user_service,
            'serviceSteps' => $service_steps,
        ]);
    }
    public function updateFields(UserService $user_service, Request $request)
    {
        $validated = $request->validate([
            'step_id' => 'nullable|exists:service_steps,id',
            'fields' => 'required|array',
            'fields.*.field_id' => 'required|exists:service_fields,id',
            'fields.*.value' => 'nullable',
        ]);

        foreach ($validated['fields'] as $fieldData) {
            $user_service->fieldValues()->updateOrCreate(
                ['service_field_id' => $fieldData['field_id']],
                ['value' => $fieldData['value']]
            );
        }

        return back()->with('success', 'Fields updated successfully');
    }

    public function upload(UserService $user_service, Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|file',
            'field_id' => 'nullable|exists:service_fields,id',
            'user_service_id' => 'nullable|exists:user_services,id',
        ]);

        $path = $request->file('file')->store('user-service-files', 'public');
        UserServiceFieldValue::updateOrCreate(
            [
                'user_service_id' => $validated['user_service_id'],
                'service_field_id' => $validated['field_id'],
            ],
            ['value' => $path]
        );
        // Create attachment record
        $user_service->attachments()->create([
            'step_id' => $request->step_id,
            'uploaded_by' => Auth::id(),
            'file_path' => $path,
        ]);

        return back()->with('success', 'File uploaded successfully');
    }
    public function showForm(UserService $userService)
    {
        $service = Service::with(['steps' => function ($query) {
            $query->orderBy('order');
        }, 'steps.fields' => function ($query) {
            $query->orderBy('order');
        }])->findOrFail($userService->service->id);

        // Load existing values
        $fieldValues = $userService->fieldValues->pluck('value', 'service_field_id');
        $completedSteps = $userService->steps->pluck('status', 'service_step_id');

        return Inertia::render('admin/UserServices/Form', [
            'service' => $service,
            'userService' => $userService,
            'fieldValues' => $fieldValues,
            'completedSteps' => $completedSteps,
            'currentStepId' => $userService->current_step_id,
        ]);
    }

    // Save step data
    public function saveStep(Request $request, $userServiceId)
    {
        $request->validate([
            'step_id' => 'required|exists:service_steps,id',
            'fields' => 'array',
            'files' => 'array',
            'files.*' => 'file|max:10240', // 10MB max
            'note' => 'nullable|string',
            'is_complete' => 'boolean'
        ]);

        $userService = UserService::findOrFail($userServiceId);
        $step = ServiceStep::findOrFail($request->step_id);
        // dd($request->fields);
        // Save field values
        foreach ($request->fields ?? [] as $fieldId => $value) {
            UserServiceFieldValue::updateOrCreate(
                [
                    'user_service_id' => $userService->id,
                    'service_field_id' => $fieldId
                ],
                ['value' => $value]
            );
        }

        // Save files
        // foreach ($request->allFiles() as $fieldId => $file) {
        //     $path = $file->store("user_services/{$userService->id}/attachments");

        //     $userService->fieldValues()->create([
        //         'service_field_id' => $fieldId,
        //         'value' =>  $path
        //     ]);
        // }

        // Update step status
        $userServiceStep = UserServiceStep::updateOrCreate(
            [
                'user_service_id' => $userService->id,
                'service_step_id' => $step->id
            ],
            [
                'status' => $request->is_complete ? 'completed' : 'in_progress',
                'admin_note' => $request->note,
                'completed_at' => $request->is_complete ? now() : null
            ]
        );

        // Move to next step if completed
        if ($request->is_complete) {
            $nextStep = ServiceStep::where('service_id', $userService->service_id)
                ->where('order', '>', $step->order)
                ->orderBy('order')
                ->first();

            $userService->update([
                'current_step_id' => $nextStep?->id,
                'status' => $nextStep ? 'in_progress' : 'completed'
            ]);
        }

        return redirect()->back()->with('success', 'Step saved successfully');
    }

    // Get step data for AJAX requests
    public function getStepData($userServiceId, $stepId)
    {
        $userService = UserService::where('user_id', Auth::id())
            ->findOrFail($userServiceId);

        $step = ServiceStep::with(['fields' => function ($query) {
            $query->orderBy('order');
        }])->findOrFail($stepId);

        $userServiceStep = UserServiceStep::where('user_service_id', $userService->id)
            ->where('service_step_id', $step->id)
            ->first(); // ✅ Use first() instead of get()

        $fieldValues = UserServiceFieldValue::where('user_service_id', $userService->id)
            ->whereIn('service_field_id', $step->fields->pluck('id'))
            ->pluck('value', 'service_field_id');

        if ($userServiceStep) {
            $fieldValues['note'] = $userServiceStep->admin_note;
            $fieldValues['is_complete'] = !is_null($userServiceStep->completed_at);
        }

        $attachments = UserServiceAttachment::where('user_service_id', $userService->id)
            ->where('step_id', $step->id)
            ->get();

        return response()->json([
            'step' => $step,
            'fieldValues' => $fieldValues,
            'attachments' => $attachments,
        ]);
    }
}
