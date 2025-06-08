<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Service::with(['category', 'creator'])
            ->when($request->category, function ($q) use ($request) {
                $q->where('category_id', $request->category);
            })
            ->when($request->status, function ($q) use ($request) {
                $q->where('is_active', $request->status === 'active');
            })
            ->when($request->creator, function ($q) use ($request) {
                $q->where('created_by', $request->creator);
            })
            ->when($request->search, function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            });

        $services = $query->paginate(10)->withQueryString();
        $categories = ServiceCategory::get();
        $creators = User::whereHas('createdServices')->get();

        return Inertia::render('admin/Services/Index', [
            'services' => $services,
            'categories' => $categories,
            'creators' => $creators,
            'filters' => $request->only(['category', 'status', 'creator', 'search']),
        ]);
    }

    public function create()
    {
        $categories = ServiceCategory::all();
        return Inertia::render('admin/Services/Form', [
            'categories' => $categories,
        ]);
    }

    public function edit(Service $service)
    {
        $categories = ServiceCategory::all();
        $service->load(['steps', 'fields']);

        return Inertia::render('admin/Services/Form', [
            'service' => $service,
            'categories' => $categories,
        ]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'nullable|exists:service_categories,id',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'tags' => 'nullable|array',
            'steps' => 'nullable|array',
            'steps.*.title' => 'required|string|max:255',
            'steps.*.description' => 'nullable|string',
            'steps.*.order' => 'required|integer|min:0',
            'fields' => 'nullable|array',
            'fields.*.label' => 'required|string|max:255',
            'fields.*.field_type' => 'required|in:text,textarea,email,number,select,checkbox,multiselect,radio,date,file',
            'fields.*.required' => 'required|boolean',
            'fields.*.options' => 'nullable|string',
            'fields.*.step_order' => 'nullable|integer|min:1',
            'fields.*.show_on_creation' => 'required|boolean',
        ]);

        // Process tags
        // $tags = $request->tags ? json_encode(explode(',', $request->tags)) : null;
        $path = "";
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('service-photos', 'public');
            $validated['photo'] = $path;
        } else
            $validated['photo'] = null;
        // Create service
        $service = Service::create([
            'name' => $validated['name'],
            'category_id' => $validated['category_id'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'tags' => $validated['tags'],
            'photo' => $validated['photo'],
            'created_by' => Auth::id(),
            'is_active' => true,
        ]);

        // Save steps first to get their real IDs
        $savedSteps = [];
        if (!empty($validated['steps'])) {
            foreach ($validated['steps'] as $stepData) {
                $step = $service->steps()->create($stepData);
                $savedSteps[$stepData['order']] = $step->id; // Map order to ID
            }
        }

        // Now save fields with correct step_id
        if (!empty($validated['fields'])) {
            foreach ($validated['fields'] as $fieldData) {
                $fieldData['step_id'] = isset($fieldData['step_order'])
                    ? $savedSteps[$fieldData['step_order']]
                    : null;

                unset($fieldData['step_order']); // Remove the temporary field
                $service->fields()->create($fieldData);
            }
        }

        return redirect()->route('admin.services.index')->with('success', 'Service created successfully.');
    }

    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'nullable|exists:service_categories,id',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'tags' => 'nullable|array',
            'is_active' => 'boolean',
            'steps' => 'nullable|array',
            'steps.*.id' => 'nullable|exists:service_steps,id,service_id,' . $service->id,
            'steps.*.title' => 'required|string|max:255',
            'steps.*.description' => 'nullable|string',
            'steps.*.order' => 'required|integer|min:0',
            'fields' => 'nullable|array',
            'fields.*.id' => 'nullable|exists:service_fields,id,service_id,' . $service->id,
            'fields.*.label' => 'required|string|max:255',
            'fields.*.field_type' => 'required|in:text,textarea,email,number,select,checkbox,multiselect,radio,date,file',
            'fields.*.required' => 'required|boolean',
            'fields.*.show_on_creation' => 'required|boolean',
            'fields.*.options' => 'nullable|array',
            'fields.*.step_order' => 'nullable|integer|min:1',
        ]);

        // Process tags
        // $tags = $request->tags ? json_encode(explode(',', $request->tags)) : null;
        $path = "";
        // dd($request->photo, $request->hasFile('photo'));
        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($service->photo) {
                Storage::disk('public')->delete($service->photo);
            }

            $path = $request->file('photo')->store('service-photos', 'public');
            $validated['photo'] = $path;
        } else
            $validated['photo'] = $service->photo;

        // Update service
        $service->update([
            'name' => $validated['name'],
            'category_id' => $validated['category_id'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'tags' => $validated['tags'],
            'photo' => $validated['photo'],
            'is_active' => $validated['is_active'] ?? $service->is_active,
        ]);

        // First handle steps to get proper IDs
        $savedSteps = [];
        if (!empty($validated['steps'])) {
            foreach ($validated['steps'] as $stepData) {
                if (isset($stepData['id'])) {
                    $step = $service->steps()->find($stepData['id']);
                    $step->update($stepData);
                    $savedSteps[$stepData['order']] = $step->id;
                } else {
                    $step = $service->steps()->create($stepData);
                    $savedSteps[$stepData['order']] = $step->id;
                }
            }
        }
        // dd($savedSteps, $validated['fields'], $request->fields);
        // Then handle fields with correct step_id mapping
        if (!empty($validated['fields'])) {
            foreach ($validated['fields'] as $fieldData) {
                $fieldData['step_id'] = isset($fieldData['step_order'])
                    ? $savedSteps[$fieldData['step_order']]
                    : null;

                unset($fieldData['step_order']); // Remove the temporary field

                if (isset($fieldData['id'])) {
                    $field = $service->fields()->find($fieldData['id']);
                    $field->update($fieldData);
                } else {
                    $service->fields()->create($fieldData);
                }
            }
        }

        // Clean up any steps that were removed
        $service->steps()->whereNotIn('id', array_values($savedSteps))->delete();

        return redirect()->route('admin.services.index')->with('success', 'Service updated successfully.');
    }

    protected function saveSteps(Service $service, array $steps)
    {
        $existingStepIds = $service->steps()->pluck('id')->toArray();
        $submittedStepIds = [];

        foreach ($steps as $stepData) {
            if (isset($stepData['id'])) {
                $step = $service->steps()->find($stepData['id']);
                if ($step) {
                    $step->update($stepData);
                    $submittedStepIds[] = $step->id;
                }
            } else {
                $newStep = $service->steps()->create($stepData);
                $submittedStepIds[] = $newStep->id;
            }
        }

        // Delete steps that weren't submitted
        $stepsToDelete = array_diff($existingStepIds, $submittedStepIds);
        if (!empty($stepsToDelete)) {
            $service->steps()->whereIn('id', $stepsToDelete)->delete();
        }
    }

    protected function saveFields(Service $service, array $fields)
    {
        $existingFieldIds = $service->fields()->pluck('id')->toArray();
        $submittedFieldIds = [];

        foreach ($fields as $fieldData) {
            if (isset($fieldData['id'])) {
                $field = $service->fields()->find($fieldData['id']);
                if ($field) {
                    $field->update($fieldData);
                    $submittedFieldIds[] = $field->id;
                }
            } else {
                $newField = $service->fields()->create($fieldData);
                $submittedFieldIds[] = $newField->id;
            }
        }

        // Delete fields that weren't submitted
        $fieldsToDelete = array_diff($existingFieldIds, $submittedFieldIds);
        if (!empty($fieldsToDelete)) {
            $service->fields()->whereIn('id', $fieldsToDelete)->delete();
        }
    }

    public function toggleStatus(Service $service)
    {
        $service->update(['is_active' => !$service->is_active]);
        return back()->with('success', 'Service status updated successfully.');
    }

    public function destroy(Service $service)
    {
        $service->delete();
        return redirect()->route('admin.services.index')->with('success', 'Service deleted successfully.');
    }
}
