<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserServiceAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_service_id',
        'step_id',
        'uploaded_by',
        'file_path',
        'type',
        'note'
    ];

    public function userService()
    {
        return $this->belongsTo(UserService::class);
    }

    public function step()
    {
        return $this->belongsTo(ServiceStep::class);
    }

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function getFileUrlAttribute()
    {
        return asset('storage/' . $this->file_path);
    }
}
