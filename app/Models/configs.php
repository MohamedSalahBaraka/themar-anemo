<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class configs extends Model
{

    protected $fillable = ['id', 'type', 'key', 'value', "options"];
}
