<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inquiry extends Model
{
    use HasFactory;

    protected $fillable = ['id', 'user_id', 'property_id', 'message', 'phone', 'name', 'email', 'status'];

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
    /**
     * Get all of the inquiry's replies.
     */
    public function replies()
    {
        return $this->morphMany(Reply::class, 'replyable')->latest();
    }
}
