<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = ['id', 'user_id', 'type', 'amount', 'method', 'status', 'reference', 'paid_at'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
