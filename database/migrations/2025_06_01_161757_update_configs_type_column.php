<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('configs', function (Blueprint $table) {
            $table->enum('type', ['boolean', 'text', 'link', 'enum', 'number', 'json', 'textarea'])->default('text')->change();
        });
    }

    public function down(): void
    {
        Schema::table('configs', function (Blueprint $table) {
            $table->enum('type', ['boolean', 'text', 'link', 'enum', 'number'])->default('text')->change();
        });
    }
};
