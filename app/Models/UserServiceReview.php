<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserServiceReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_service_id',
        'rating',
        'review',
        'is_public'
    ];

    protected $casts = [
        'is_public' => 'boolean'
    ];

    public function userService()
    {
        return $this->belongsTo(UserService::class);
    }

    public function user()
    {
        return $this->through('userService')->has('user');
    }

    public function service()
    {
        return $this->through('userService')->has('service');
    }
}
