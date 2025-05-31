<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\Reply;
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
                ->with(['property', 'sender', 'replies' => function ($query) {
                    $query->latest();
                }])
                ->latest()
                ->get()
                ->map(function ($inquiry) {
                    return [
                        'id' => $inquiry->id,
                        'property_id' => $inquiry->property_id,
                        'property_title' => $inquiry->property->title,
                        'property_image' => $inquiry->property->images->first()?->image_url,
                        'sender_id' => $inquiry->sender_id,
                        'sender_name' => $inquiry->sender->name,
                        'sender_email' => $inquiry->sender->email,
                        'sender_phone' => $inquiry->sender->phone,
                        'sender_avatar' => $inquiry->sender->profile?->profile_image,
                        'message' => $inquiry->message,
                        'status' => $inquiry->status,
                        'created_at' => $inquiry->created_at,
                        'is_sent_by_me' => false,
                        'replies' => $inquiry->replies->map(function ($reply) {
                            return [
                                'id' => $reply->id,
                                'message' => $reply->message,
                                'sender_id' => $reply->sender_id,
                                'sender_name' => $reply->sender->name,
                                'sender_avatar' => $reply->sender->profile?->profile_image,
                                'created_at' => $reply->created_at,
                                'is_read' => $reply->is_read,
                            ];
                        }),
                    ];
                }),

            'sentInquiries' => $user->inquiries()
                ->with(['property', 'receiver', 'replies' => function ($query) {
                    $query->latest();
                }])
                ->latest()
                ->get()
                ->map(function ($inquiry) {
                    return [
                        'id' => $inquiry->id,
                        'property_id' => $inquiry->property_id,
                        'property_title' => $inquiry->property->title,
                        'property_image' => $inquiry->property->images->first()?->getUrl(),
                        'receiver_id' => $inquiry->receiver_id,
                        'receiver_name' => $inquiry->receiver->name,
                        'receiver_email' => $inquiry->receiver->email,
                        'receiver_phone' => $inquiry->receiver->phone,
                        'receiver_avatar' => $inquiry->receiver->avatar,
                        'message' => $inquiry->message,
                        'status' => $inquiry->status,
                        'created_at' => $inquiry->created_at,
                        'is_sent_by_me' => true,
                        'replies' => $inquiry->replies->map(function ($reply) {
                            return [
                                'id' => $reply->id,
                                'message' => $reply->message,
                                'sender_id' => $reply->sender_id,
                                'sender_name' => $reply->sender->name,
                                'sender_avatar' => $reply->sender->avatar,
                                'created_at' => $reply->created_at,
                                'is_read' => $reply->is_read,
                            ];
                        }),
                    ];
                }),
        ]);
    }

    public function markAsRead(Request $request, Inquiry $inquiry)
    {
        // $this->authorize('update', $inquiry);

        $inquiry->update(['status' => 'read']);

        // Mark all replies as read when marking inquiry as read
        $inquiry->replies()
            ->where('sender_id', '!=', Auth::id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return back();
    }

    public function getReplies(Inquiry $inquiry)
    {
        // $this->authorize('view', $inquiry);

        $replies = $inquiry->replies()
            ->with('sender')
            ->get()
            ->map(function ($reply) {
                return [
                    'id' => $reply->id,
                    'message' => $reply->message,
                    'sender_id' => $reply->sender_id,
                    'sender_name' => $reply->sender->name,
                    'sender_avatar' => $reply->sender->profile?->profile_image,
                    'created_at' => $reply->created_at,
                    'is_read' => $reply->is_read,
                ];
            });

        return Inertia::render('user/InquiryRepliesPage', [
            'inquiry_id' => $inquiry->id,
            'replies' => $replies,
        ]);
    }

    public function reply(Request $request, Inquiry $inquiry)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $reply = $inquiry->replies()->create([
            'sender_id' => Auth::id(),
            'message' => $request->message,
        ]);

        if ($inquiry->receiver_id === Auth::id()) {
            $inquiry->update(['status' => 'replied']);
        }

        return back();
    }

    public function markReplyAsRead(Reply $reply)
    {
        // $this->authorize('update', $reply);

        $reply->update(['status' => 'read']);

        return response()->json(['success' => true]);
    }
}
