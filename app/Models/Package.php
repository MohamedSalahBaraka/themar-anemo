<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Package extends Model
{
    use HasFactory;

    protected $fillable = ['id', 'name', 'price', 'yearly_price', 'max_listings', 'features', 'isActive', 'user_type', 'description'];
}
