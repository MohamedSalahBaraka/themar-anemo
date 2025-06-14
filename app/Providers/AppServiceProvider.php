<?php

namespace App\Providers;

use App\Models\configs;
use App\Models\Service;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        Schema::defaultStringLength(191); // 191 * 4 = 764 < 767

        Builder::macro('filter', function ($callback) {
            return $callback($this);
        });
        Inertia::share('appConfigs', function () {
            return configs::where('is_public', true)->pluck('value', 'key')->toArray();
        });
        Inertia::share('footerServices', function () {
            return Service::where('is_active', true)->limit(5)->get();
        });
    }
}
