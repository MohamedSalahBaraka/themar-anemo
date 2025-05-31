<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reply extends Model
{
    use HasFactory;

    protected $fillable = [
        'message',
        'is_read',
        'sender_id',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    /**
     * Get the parent replyable model (Inquiry or Reservation).
     */
    public function replyable()
    {
        return $this->morphTo();
    }

    /**
     * Get the user who sent the reply.
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Mark the reply as read.
     */
    public function markAsRead()
    {
        $this->update(['is_read' => true]);
    }

    /**
     * Scope a query to only include unread replies.
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }
}
