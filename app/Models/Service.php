<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    use HasFactory;

    protected $casts = [
        'tags' => 'array', // 👈 important to treat JSON as PHP array
        'is_active' => 'boolean',
        'price' => 'float',
    ];
    protected $fillable = ['id', 'name', 'price', 'description', 'category_id', 'created_by', 'is_active', 'photo', 'tags'];
    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class);
    }
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    public function steps(): HasMany
    {
        return $this->hasMany(ServiceStep::class);
    }
    public function fields(): HasMany
    {
        return $this->hasMany(ServiceField::class);
    }
}
