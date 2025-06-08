<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class ServiceCategory extends Model
{
    protected $fillable = ['name', 'icon'];

    protected function iconUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->icon ? asset('storage/' . $this->icon) : null,
        );
    }
}
