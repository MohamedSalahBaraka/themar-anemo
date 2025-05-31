<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->timestamp('cancel_at')
                ->nullable()
                ->after('expires_at')
                ->comment('When the subscription is scheduled to be canceled (for cancel-at-period-end)');
            $table->enum('billing_frequency', ['monthly', 'yearly'])
                ->default('monthly')
                ->after('cancel_at');
        });
    }

    public function down()
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn('cancel_at');
            $table->dropColumn('billing_frequency');
        });
    }
};
