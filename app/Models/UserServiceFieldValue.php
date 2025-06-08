<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserServiceFieldValue extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_service_id',
        'service_field_id',
        'value'
    ];

    public function userService()
    {
        return $this->belongsTo(UserService::class);
    }

    public function field()
    {
        return $this->belongsTo(ServiceField::class, 'service_field_id');
    }
}
