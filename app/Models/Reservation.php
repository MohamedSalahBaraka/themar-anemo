<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Reservation extends Model
{

    protected $fillable = ['id', 'property_id', 'user_id', 'price', 'special_requests', 'start_date', 'end_date', 'status'];
    public function replies()
    {
        return $this->morphMany(Reply::class, 'replyable')->latest();
    }
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
