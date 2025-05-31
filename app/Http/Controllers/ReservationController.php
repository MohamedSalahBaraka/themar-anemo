<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Reply;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $user_id = Auth::id();
        $user = User::findOrFail($user_id);

        // Get current date for filtering
        $now = Carbon::now();

        return Inertia::render('user/ReservationsPage', [
            'receivedReservations' => [
                'pendingReservations' => $user->receivedReservations()
                    ->where('reservations.status', 'pending')
                    ->with(['property', 'property.images', 'replies' => function ($query) {
                        $query->latest();
                    }])
                    ->latest()
                    ->get()
                    ->map(function ($reservation) {
                        return $this->formatReservationData($reservation);
                    }),

                'upcomingReservations' => $user->receivedReservations()
                    ->where('reservations.status', 'confirmed')
                    ->with(['property', 'property.images', 'replies' => function ($query) {
                        $query->latest();
                    }])
                    ->latest()
                    ->get()
                    ->map(function ($reservation) {
                        return $this->formatReservationData($reservation);
                    }),

                'pastReservations' => $user->receivedReservations()
                    ->where(function ($query) use ($now) {
                        $query->where('reservations.status', 'completed')
                            ->orWhere('reservations.status', 'cancelled')
                            ->orWhere('reservations.end_date', '<', $now);
                    })
                    ->with(['property', 'property.images', 'replies' => function ($query) {
                        $query->latest();
                    }])
                    ->latest()
                    ->get()
                    ->map(function ($reservation) {
                        return $this->formatReservationData($reservation);
                    }),
            ],
            'reservations' => [
                'pendingReservations' => $user->reservations()
                    ->where('reservations.status', 'pending')
                    ->with(['property', 'property.images', 'replies' => function ($query) {
                        $query->latest();
                    }])
                    ->latest()
                    ->get()
                    ->map(function ($reservation) {
                        return $this->formatReservationData($reservation);
                    }),

                'upcomingReservations' => $user->reservations()
                    ->where('reservations.status', 'confirmed')
                    ->with(['property', 'property.images', 'replies' => function ($query) {
                        $query->latest();
                    }])
                    ->latest()
                    ->get()
                    ->map(function ($reservation) {
                        return $this->formatReservationData($reservation);
                    }),

                'pastReservations' => $user->reservations()
                    ->where(function ($query) use ($now) {
                        $query->where('reservations.status', 'completed')
                            ->orWhere('reservations.status', 'cancelled')
                            ->orWhere('reservations.end_date', '<', $now);
                    })
                    ->with(['property', 'property.images', 'replies' => function ($query) {
                        $query->latest();
                    }])
                    ->latest()
                    ->get()
                    ->map(function ($reservation) {
                        return $this->formatReservationData($reservation);
                    }),
            ]
        ]);
    }

    protected function formatReservationData($reservation)
    {
        return [
            'id' => $reservation->id,
            'property_id' => $reservation->property_id,
            'property_title' => $reservation->property->title,
            'property_image' => $reservation->property->images->first()?->image_url,
            'user_id' => $reservation->user_id,
            'user_name' => $reservation->user->name,
            'user_email' => $reservation->user->email,
            'user_phone' => $reservation->user->phone,
            'user_avatar' => $reservation->user->profile?->profile_image,
            'price' => $reservation->price,
            'special_requests' => $reservation->special_requests,
            'start_date' => $reservation->start_date,
            'end_date' => $reservation->end_date,
            'status' => $reservation->status,
            'created_at' => $reservation->created_at,
            'replies' => $reservation->replies->map(function ($reply) {
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
    }

    public function updateStatus(Request $request, Reservation $reservation)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled,completed',
        ]);

        // Authorization - ensure user owns this reservation
        // if ($reservation->user_id !== Auth::id()) {
        //     abort(403);
        // }

        // Additional business logic checks could go here
        // For example, can't cancel a completed reservation
        if ($reservation->status === 'completed' && $request->status === 'cancelled') {
            return back()->withErrors(['status' => 'Cannot cancel a completed reservation']);
        }

        $reservation->update(['status' => $request->status]);

        return back();
    }

    public function getReplies(Reservation $reservation)
    {
        // Authorization
        // if ($reservation->user_id !== Auth::id()) {
        //     abort(403);
        // }

        $replies = $reservation->replies()
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

        return response()->json([
            'reservation_id' => $reservation->id,
            'replies' => $replies,
        ]);
    }

    public function sendMessage(Request $request, Reservation $reservation)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        // Authorization
        // if ($reservation->user_id !== Auth::id()) {
        //     abort(403);
        // }

        $reply = $reservation->replies()->create([
            'sender_id' => Auth::id(),
            'message' => $request->message,
        ]);

        return back();
    }

    public function markReplyAsRead(Reply $reply)
    {
        // Authorization - ensure this reply belongs to a reservation the user owns
        if (
            $reply->replyable_type !== Reservation::class ||
            $reply->replyable->user_id !== Auth::id()
        ) {
            abort(403);
        }

        $reply->update(['is_read' => true]);

        return response()->json(['success' => true]);
    }
}
