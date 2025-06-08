<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Package extends Model
{
    use HasFactory;
    protected $casts = [
        'features' => 'array', // 👈 important to treat JSON as PHP array
        'isActive' => 'boolean',
    ];

    protected $fillable = ['id', 'name', 'price', 'yearly_price', 'max_listings', 'max_adds', 'features', 'isActive', 'user_type', 'description'];
}
