<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    use HasFactory;
    protected $fillable = ['id', 'transaction_id', 'invoice_number', 'invoice_pdf_url'];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }
}
