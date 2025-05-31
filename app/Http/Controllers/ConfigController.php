<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Configs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ConfigController extends Controller
{
    /**
     * Display all configs grouped by type.
     */
    public function index()
    {
        $configs = Configs::all()
            ->map(function ($config) {
                return [
                    'key' => $config->key,
                    'value' => $config->value,
                    'type' => $config->type,
                    'options' => $config->options ? json_decode($config->options) : [],
                    'description' => $config->description,
                    'group' => $config->group,
                ];
            });

        return Inertia::render('admin/Config', [
            'configs' => $configs,
        ]);
    }

    /**
     * Update multiple config values.
     */
    public function update(Request $request)
    {
        $input = $request->all();

        foreach ($input as $key => $value) {
            $config = Configs::where('key', $key)->first();
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

        Configs::updateOrCreate(
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
