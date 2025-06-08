<?php
// app/Http/Controllers/UserServiceAttachmentController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserServiceAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class UserServiceAttachmentController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'user_service_id' => 'required|exists:user_services,id',
            'step_id' => 'nullable|exists:service_steps,id',
            'files.*' => 'required|file|max:10240', // 10MB max
            'type' => 'nullable|in:image,document,other',
            'note' => 'nullable|string|max:255'
        ]);

        $uploadedFiles = [];

        foreach ($request->file('files') as $file) {
            $path = $file->store('attachments', 'public');

            $attachment = UserServiceAttachment::create([
                'user_service_id' => $request->user_service_id,
                'step_id' => $request->step_id,
                'uploaded_by' => Auth::id(),
                'file_path' => $path,
                'type' => $request->type,
                'note' => $request->note
            ]);

            $uploadedFiles[] = $attachment;
        }

        return response()->json([
            'success' => true,
            'attachments' => $uploadedFiles
        ]);
    }

    public function destroy(UserServiceAttachment $attachment)
    {
        Storage::disk('public')->delete($attachment->file_path);
        $attachment->delete();

        return response()->json(['success' => true]);
    }

    public function index($userServiceId)
    {
        $attachments = UserServiceAttachment::where('user_service_id', $userServiceId)
            ->with(['uploader', 'step'])
            ->get();

        return response()->json($attachments);
    }
}
