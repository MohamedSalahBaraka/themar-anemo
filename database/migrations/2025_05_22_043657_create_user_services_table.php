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
        Schema::create('user_services', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->unsignedBigInteger('service_id')->index();
            $table->unsignedBigInteger('property_id')->nullable()->index();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('service_id')->references('id')->on('services')->onDelete('cascade');
            $table->foreign('property_id')->references('id')->on('properties')->onDelete('set null');
            $table->enum('status', ['active', 'expired'])->default('active');
            $table->timestamp('purchased_at');
            $table->timestamp('expires_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_services');
    }
};
