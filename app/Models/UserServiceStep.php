<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserServiceStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_service_id',
        'service_step_id',
        'status',
        'admin_note',
        'completed_at'
    ];

    protected $dates = ['completed_at'];

    public function userService()
    {
        return $this->belongsTo(UserService::class);
    }

    public function serviceStep()
    {
        return $this->belongsTo(ServiceStep::class);
    }
}
