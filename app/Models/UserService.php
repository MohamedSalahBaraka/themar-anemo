<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class UserService extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'service_id', 'status', 'current_step_id'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function currentStep(): BelongsTo
    {
        return $this->belongsTo(ServiceStep::class, 'current_step_id');
    }

    public function fieldValues(): HasMany
    {
        return $this->hasMany(UserServiceFieldValue::class);
    }

    public function steps(): HasMany
    {
        return $this->hasMany(UserServiceStep::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(UserServiceAttachment::class);
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ServiceActivityLog::class);
    }
    public function review(): HasOne
    {
        return $this->hasOne(UserServiceReview::class);
    }
}
