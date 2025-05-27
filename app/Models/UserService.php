<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserService extends Model
{
    use HasFactory;

    protected $fillable = ['id', 'user_id', 'service_id', 'property_id', 'status', 'purchased_at', 'expires_at'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
