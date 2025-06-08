<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAboutValuesTable extends Migration
{
    public function up()
    {
        Schema::create('about_values', function (Blueprint $table) {
            $table->id();
            $table->string('icon')->nullable(); // icon class name or image URL
            $table->string('title');
            $table->text('details');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('about_values');
    }
}
