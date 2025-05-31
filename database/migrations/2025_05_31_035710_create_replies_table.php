<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('replies', function (Blueprint $table) {
            $table->id();
            $table->text('message');
            $table->boolean('is_read')->default(false);

            // Polymorphic relationship
            $table->morphs('replyable');

            // Sender information
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();

            $table->timestamps();

            // Indexes for better performance
            $table->index(['replyable_id', 'replyable_type']);
            $table->index('sender_id');
            $table->index('is_read');
        });
    }

    public function down()
    {
        Schema::dropIfExists('replies');
    }
};
