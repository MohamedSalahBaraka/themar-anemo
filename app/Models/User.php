<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = ['id', 'name', 'email', 'password', 'phone', 'role', 'status'];

    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class);
    }

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
    public function inquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class);
    }
    public function activeSubscription()
    {
        return $this->subscriptions()->with('package')->where('expires_at', '>', now())
            ->where('is_active', true)
            ->latest()
            ->first();
    }
    public function recentlyViewedProperties()
    {
        return $this->ViewedProperties()
            ->orderBy("viewed_at", "desc");
    }
    public function PropertyViews(): HasMany
    {
        return $this->hasMany(PropertyView::class);
    }

    public function receivedInquiries(): HasManyThrough
    {
        return $this->hasManyThrough(
            Inquiry::class,
            Property::class,
            'user_id',      // Foreign key on Property table...
            'property_id',  // Foreign key on Inquiry table...
            'id',           // Local key on User table...
            'id'            // Local key on Property table...
        );
    }

    public function ViewedProperties(): HasManyThrough
    {
        return $this->hasManyThrough(
            Property::class,
            PropertyView::class,
            'user_id', // Foreign key on PropertyView table
            'id', // Foreign key on Property table
            'id', // Local key on User table
            'property_id' // Local key on PropertyView table
        );
    }
    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
