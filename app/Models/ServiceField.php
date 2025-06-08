<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ServiceField extends Model
{
    protected $fillable = [
        'service_id',
        'step_id',
        'label',
        'field_type',
        'required',
        'show_on_creation',
        'options',
        'order',
        'dependency'
    ];

    protected $casts = [
        'options' => 'array',
        'dependency' => 'array',
        'required' => 'boolean',
        'show_on_creation' => 'boolean',
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function step(): BelongsTo
    {
        return $this->belongsTo(ServiceStep::class);
    }
    public function value(): HasOne
    {
        return $this->hasOne(UserServiceFieldValue::class);
    }
}
