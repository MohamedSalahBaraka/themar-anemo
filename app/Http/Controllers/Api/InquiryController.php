<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\Reply;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InquiryController extends Controller
{
    public function index(Request $request)
    {
        $user = User::find(Auth::id());

        return response()->json([
            'received_inquiries' => $user->receivedInquiries()
                ->with(['property.images', 'sender.profile', 'replies.sender'])
                ->latest()
                ->get()
                ->map(fn($inquiry) => $this->formatInquiry($inquiry, false)),

            'sent_inquiries' => $user->inquiries()
                ->with(['property.images', 'receiver', 'replies.sender'])
                ->latest()
                ->get()
                ->map(fn($inquiry) => $this->formatInquiry($inquiry, true))
        ]);
    }

    public function show(Inquiry $inquiry)
    {
        // $this->authorize('view', $inquiry);

        $inquiry->load(['property.images', 'sender.profile', 'receiver', 'replies.sender']);

        return response()->json([
            'inquiry' => $this->formatInquiry($inquiry, $inquiry->sender_id === Auth::id()),
            'replies' => $inquiry->replies->map(fn($reply) => $this->formatReply($reply))
        ]);
    }

    public function markAsRead(Inquiry $inquiry)
    {
        // $this->authorize('update', $inquiry);

        $inquiry->update(['status' => 'read']);

        // Mark all replies as read
        $inquiry->replies()
            ->where('sender_id', '!=', Auth::id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Inquiry marked as read']);
    }

    public function reply(Request $request, Inquiry $inquiry)
    {
        // $this->authorize('reply', $inquiry);

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

        return response()->json([
            'message' => 'Reply sent successfully',
            'reply' => $this->formatReply($reply)
        ], 201);
    }

    public function markReplyAsRead(Reply $reply)
    {
        // $this->authorize('update', $reply);

        $reply->update(['is_read' => true]);

        return response()->json(['message' => 'Reply marked as read']);
    }

    // Helper methods
    private function formatInquiry($inquiry, $isSentByMe)
    {
        $property = $inquiry->property;
        $counterparty = $isSentByMe ? $inquiry->receiver : $inquiry->sender;

        return [
            'id' => $inquiry->id,
            'property' => [
                'id' => $property->id,
                'title' => $property->title,
                'image' => asset(
                    'storage' . $property->images->first()?->image_url
                ),
            ],
            'counterparty' => [
                'id' => $counterparty->id,
                'name' => $counterparty->name,
                'email' => $counterparty->email,
                'phone' => $counterparty->phone,
                'avatar' => asset(
                    'storage' . $counterparty->profile?->profile_image ?? $counterparty->avatar
                ),
            ],
            'message' => $inquiry->message,
            'status' => $inquiry->status,
            'created_at' => $inquiry->created_at->toISOString(),
            'is_sent_by_me' => $isSentByMe,
            'replies_count' => $inquiry->replies->count(),
            'unread_replies_count' => $inquiry->replies->where('is_read', false)->count(),
        ];
    }

    private function formatReply($reply)
    {
        return [
            'id' => $reply->id,
            'message' => $reply->message,
            'sender' => [
                'id' => $reply->sender_id,
                'name' => $reply->sender->name,
                'avatar' => asset(
                    'storage' . $reply->sender->profile?->profile_image ?? $reply->sender->avatar
                ),
            ],
            'created_at' => $reply->created_at->toISOString(),
            'is_read' => $reply->is_read,
            'is_sent_by_me' => $reply->sender_id === Auth::id(),
        ];
    }
}
