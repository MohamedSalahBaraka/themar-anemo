<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Profile extends Model
{
    use HasFactory;


    protected $fillable = ['id', 'user_id', 'company_name', 'profile_image', 'bio', 'address', 'national_id', 'tax_id', "id_photo"];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
