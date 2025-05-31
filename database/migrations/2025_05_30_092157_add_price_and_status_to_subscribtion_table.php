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
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->decimal('price', 10, 2)->nullable()->after('is_active');

            // Add status column
            $table->enum('status', ['active', 'pending', 'canceled', 'expired'])->default('pending')->after('price');

            // Drop is_active column
            $table->dropColumn('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            // Add is_active column back
            $table->boolean('is_active')->default(true);

            // Drop the added columns
            $table->dropColumn(['price', 'status']);
        });
    }
};
