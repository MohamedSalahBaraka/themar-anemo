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
        Schema::create('user_service_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_service_id')->constrained('user_services')->onDelete('cascade');
            $table->foreignId('service_step_id')->constrained('service_steps')->onDelete('cascade');
            $table->string('status')->default('pending');
            $table->text('admin_note')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_service_steps');
    }
};
