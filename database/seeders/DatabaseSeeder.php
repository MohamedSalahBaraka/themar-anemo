<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        \App\Models\User::factory(10)->create();
        \App\Models\Package::factory(3)->create();
        // \App\Models\Service::factory(5)->create();
        \App\Models\Property::factory(20)->create();
        \App\Models\Subscription::factory(10)->create();
        \App\Models\Transaction::factory(10)->create();
    }
}
