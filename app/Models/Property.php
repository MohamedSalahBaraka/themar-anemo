<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'user_id',
        'title',
        'description',
        'type',
        'status',
        'purpose',
        'price',
        'area',
        'bedrooms',
        'bathrooms',
        'floor',
        'latitude',
        'longitude',
        'address',
        'published_at',
        'expires_at',
        'is_featured',
        'rejection_reason',
        'approved',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function images()
    {
        return $this->hasMany(PropertyImage::class);
    }
    public function views()
    {
        return $this->hasMany(PropertyView::class);
    }
    public  function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }
    // Query scope for pending properties
    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }
    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('approved', true);
    }
    public function scopeRejected(Builder $query): Builder
    {
        return $query->where('status', 'rejected');
    }
    public function inquiries()
    {
        return $this->hasMany(Inquiry::class);
    }
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }
    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }
    public function scopeExpired(Builder $query): Builder
    {
        return $query->where('expires_at', '<', now());
    }
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('published_at', '<=', now());
    }
    public function scopeUnpublished(Builder $query): Builder
    {
        return $query->where('published_at', '>', now());
    }
    public function scopeByUser(Builder $query, $userId): Builder
    {
        return $query->where('user_id', $userId);
    }
}
