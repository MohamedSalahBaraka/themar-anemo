<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServiceStep extends Model
{
    protected $fillable = [
        'service_id',
        'title',
        'description',
        'order',
        'deadline_days'
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function fields(): HasMany
    {
        return $this->hasMany(ServiceField::class, 'step_id')->orderBy('order');
    }

    public function userSteps()
    {
        return $this->hasMany(UserServiceStep::class, 'service_step_id');
    }
}
