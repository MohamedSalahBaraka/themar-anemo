<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->enum('type', ['apartment', 'villa', 'land', 'office']);
            $table->enum('status', ['available', 'sold', 'rented', 'reserved', 'pending', 'rejected'])->default('available');
            $table->enum('purpose', ['sale', 'rent']);
            $table->decimal('price', 12, 2);
            $table->float('area')->nullable();
            $table->integer('bedrooms')->nullable();
            $table->integer('bathrooms')->nullable();
            $table->integer('floor')->nullable();
            $table->double('latitude')->nullable();
            $table->double('longitude')->nullable();
            $table->string('address')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('approved')->default(false);
            $table->string('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
