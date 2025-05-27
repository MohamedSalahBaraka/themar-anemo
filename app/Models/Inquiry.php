<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inquiry extends Model
{
    use HasFactory;

    protected $fillable = ['id', 'user_id', 'property_id', 'message', 'contact_method'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
