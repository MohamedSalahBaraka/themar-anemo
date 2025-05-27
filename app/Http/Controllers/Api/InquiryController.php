<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class InquiryController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $receivedInquiries = $user->receivedInquiries()
            ->with(['property.images', 'sender'])
            ->latest()
            ->get()
            ->map(function ($inquiry) {
                return [
                    'id' => $inquiry->id,
                    'property' => [
                        'id' => $inquiry->property_id,
                        'title' => $inquiry->property->title,
                        'image' => $inquiry->property->images->first()?->image_url,
                        'url' => url("/api/properties/{$inquiry->property_id}"),
                    ],
                    'sender' => [
                        'id' => $inquiry->sender_id,
                        'name' => $inquiry->sender->name,
                        'email' => $inquiry->sender->email,
                        'phone' => $inquiry->sender->phone,
                        'avatar' => $inquiry->sender->avatar,
                        'url' => url("/api/users/{$inquiry->sender_id}"),
                    ],
                    'message' => $inquiry->message,
                    'status' => $inquiry->status,
                    'created_at' => $inquiry->created_at->toIso8601String(),
                    'is_sent_by_me' => false,
                    'actions' => [
                        'mark_as_read' => url("/api/inquiries/{$inquiry->id}/mark-as-read"),
                    ]
                ];
            });

        $sentInquiries = $user->inquiries()
            ->with(['property.images', 'receiver'])
            ->latest()
            ->get()
            ->map(function ($inquiry) {
                return [
                    'id' => $inquiry->id,
                    'property' => [
                        'id' => $inquiry->property_id,
                        'title' => $inquiry->property->title,
                        'image' => $inquiry->property->images->first()?->image_url,
                        'url' => url("/api/properties/{$inquiry->property_id}"),
                    ],
                    'receiver' => [
                        'id' => $inquiry->receiver_id,
                        'name' => $inquiry->receiver->name,
                        'email' => $inquiry->receiver->email,
                        'phone' => $inquiry->receiver->phone,
                        'avatar' => $inquiry->receiver->avatar,
                        'url' => url("/api/users/{$inquiry->receiver_id}"),
                    ],
                    'message' => $inquiry->message,
                    'status' => $inquiry->status,
                    'created_at' => $inquiry->created_at->toIso8601String(),
                    'is_sent_by_me' => true,
                ];
            });

        return response()->json([
            'received_inquiries' => $receivedInquiries,
            'sent_inquiries' => $sentInquiries,
            'meta' => [
                'total_received' => count($receivedInquiries),
                'total_sent' => count($sentInquiries),
                'unread_count' => $user->receivedInquiries()->where('status', 'unread')->count(),
            ]
        ], Response::HTTP_OK);
    }

    public function markAsRead(Request $request, Inquiry $inquiry)
    {
        // Add authorization if needed
        // $this->authorize('update', $inquiry);

        $inquiry->update(['status' => 'read']);

        return response()->json([
            'message' => 'Inquiry marked as read',
            'inquiry' => [
                'id' => $inquiry->id,
                'status' => $inquiry->status
            ]
        ], Response::HTTP_OK);
    }
}
