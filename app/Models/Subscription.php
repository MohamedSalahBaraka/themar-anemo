<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = ['id', 'user_id', 'package_id', 'started_at', 'expires_at', 'status', 'price', 'cancel_at'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }
    // In your Subscription model
    public function isScheduledForCancellation(): bool
    {
        return !is_null($this->cancel_at);
    }

    public function isActive(): bool
    {
        return is_null($this->cancel_at) && ($this->ends_at === null || $this->ends_at->isFuture());
    }
}
