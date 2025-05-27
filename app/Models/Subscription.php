<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = ['id', 'user_id', 'package_id', 'started_at', 'expires_at', 'is_active'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }
}
