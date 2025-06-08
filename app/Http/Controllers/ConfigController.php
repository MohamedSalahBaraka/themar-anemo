<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AboutValue;
use App\Models\configs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ConfigController extends Controller
{
    /**
     * Display all configs grouped by type.
     */
    public function index()
    {
        $configs = configs::all()->map(function ($config) {
            return [
                'key' => $config->key,
                'value' => $config->value,
                'type' => $config->type,
                'options' => $config->options ? json_decode($config->options) : [],
                'description' => $config->description,
                'group' => $config->group,
            ];
        });

        $aboutValues = AboutValue::all();

        return Inertia::render('admin/Config', [
            'configs' => $configs,
            'aboutValues' => $aboutValues,
        ]);
    }
    public function updateAboutValues(Request $request)
    {
        $values = $request->input('about_values');

        try {
            DB::transaction(function () use ($values) {
                AboutValue::query()->delete(); // ✅


                foreach ($values as $value) {
                    AboutValue::create([
                        'icon' => $value['icon'],
                        'title' => $value['title'],
                        'details' => $value['details'],
                    ]);
                }
            });

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            // \Log::error("Update AboutValues failed: " . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
    public function upload(Request $request)
    {
        if ($request->hasFile('icon')) {
            $path = $request->file('icon')->store('about-icons', 'public');

            return response()->json([
                'url' => asset('storage/' . $path),
            ]);
        }

        return response()->json(['error' => 'No file uploaded'], 400);
    }

    /**
     * Update multiple config values.
     */
    public function update(Request $request)
    {
        $input = $request->all();

        foreach ($input as $key => $value) {
            $config = configs::where('key', $key)->first();
            if (!$config) {
                continue;
            }

            // Convert boolean values to "true"/"false" strings
            if ($config->type === 'boolean') {
                $value = $value ? 'true' : 'false';
            }

            $config->value = $value;
            $config->save();
        }

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }

    /**
     * Handle logo upload and return the file URL.
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'file' => ['required', 'image', 'max:2048'],
            'type' => ['required', 'in:light,dark'],
        ]);

        $path = $request->file('file')->store('logos', 'public');
        $url = Storage::url($path);

        $key = $request->type === 'dark' ? 'app.logo_dark_url' : 'app.logo_url';

        configs::updateOrCreate(
            ['key' => $key],
            [
                'type' => 'link',
                'group' => 'app',
                'value' => $url,
                'description' => ucfirst($request->type) . ' mode logo URL',
                'is_public' => true,
            ]
        );

        return response()->json(['url' => $url]);
    }
}
