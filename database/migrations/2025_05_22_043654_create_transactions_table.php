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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger(
                'user_id' // Foreign key to users tables
            )->index();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->enum('type', ['subscription', 'service']);
            $table->decimal('amount', 12, 2);
            $table->enum('method', ['credit_card', 'paypal', 'bank', 'cash']);
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
            $table->string('reference')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
