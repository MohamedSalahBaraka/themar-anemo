<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class InquiryController extends Controller
{
    public function index(Request $request)
    {
        $user_id = Auth::id();
        $user = User::findOrFail($user_id);
        return Inertia::render('user/InquiriesPage', [
            'receivedInquiries' => $user->receivedInquiries()
                ->with(['property', 'sender'])
                ->latest()
                ->get()
                ->map(function ($inquiry) {
                    return [
                        'id' => $inquiry->id,
                        'property_id' => $inquiry->property_id,
                        'property_title' => $inquiry->property->title,
                        'property_image' => $inquiry->property->images->first(),
                        'sender_id' => $inquiry->sender_id,
                        'sender_name' => $inquiry->sender->name,
                        'sender_email' => $inquiry->sender->email,
                        'sender_phone' => $inquiry->sender->phone,
                        'sender_avatar' => $inquiry->sender->avatar,
                        'message' => $inquiry->message,
                        'status' => $inquiry->status,
                        'created_at' => $inquiry->created_at,
                        'is_sent_by_me' => false,
                    ];
                }),

            'sentInquiries' => $user->inquiries()
                ->with(['property', 'receiver'])
                ->latest()
                ->get()
                ->map(function ($inquiry) {
                    return [
                        'id' => $inquiry->id,
                        'property_id' => $inquiry->property_id,
                        'property_title' => $inquiry->property->title,
                        'property_image' => $inquiry->property->images->first(),
                        'receiver_id' => $inquiry->receiver_id,
                        'receiver_name' => $inquiry->receiver->name,
                        'receiver_email' => $inquiry->receiver->email,
                        'receiver_phone' => $inquiry->receiver->phone,
                        'receiver_avatar' => $inquiry->receiver->avatar,
                        'message' => $inquiry->message,
                        'status' => $inquiry->status,
                        'created_at' => $inquiry->created_at,
                        'is_sent_by_me' => true,
                    ];
                }),
        ]);
    }

    public function markAsRead(Request $request, Inquiry $inquiry)
    {
        // $this->authorize('update', $inquiry);

        $inquiry->update(['status' => 'read']);

        return back();
    }
}
