<?php

use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\HomeController;
use App\Http\Controllers\API\InquiryController;
use App\Http\Controllers\API\ProfileAPIController;
use App\Http\Controllers\API\PropertyAPIController;
use App\Http\Controllers\API\PublicServiceAPIController;
use App\Http\Controllers\API\SearchAPIController;
use App\Http\Controllers\API\SubscriptionController;
use App\Http\Controllers\API\UserServiceAPIController;
use App\Http\Controllers\Auth\API\LoginController;
use App\Http\Controllers\Auth\API\RegisterController;
use Illuminate\Support\Facades\Route;

Route::prefix('api')->group(function () {
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('/login', [LoginController::class, 'store']);
        Route::post('/logout', [LoginController::class, 'destroy'])->middleware('auth:sanctum');
        Route::get('/register/packages', [RegisterController::class, 'getPackages']);
        Route::post('/register', [RegisterController::class, 'store']);
    });

    // Public routes
    Route::prefix('home')->group(function () {
        Route::get('/', [HomeController::class, 'index']);
        Route::get('/pricing', [HomeController::class, 'pricing']);
        Route::get('/faqs', [HomeController::class, 'faqs']);
        Route::get('/page/{key}', [HomeController::class, 'page']);
        Route::get('/about', [HomeController::class, 'aboutUs']);
        Route::get('/configs', [HomeController::class, 'getConfigs']);
    });

    // Search route
    Route::get('/search', [SearchAPIController::class, 'index']);

    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {
        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index']);

        // Public services
        Route::prefix('services')->group(function () {
            Route::get('/', [PublicServiceAPIController::class, 'index']);
            Route::get('/{service}', [PublicServiceAPIController::class, 'show']);
            Route::post('/{service}/apply', [PublicServiceAPIController::class, 'apply']);
        });

        // Inquiries
        Route::prefix('inquiries')->group(function () {
            Route::get('/', [InquiryController::class, 'index']);
            Route::get('/{inquiry}', [InquiryController::class, 'show']);
            Route::post('/{inquiry}/reply', [InquiryController::class, 'reply']);
            Route::put('/{inquiry}/mark-read', [InquiryController::class, 'markAsRead']);
            Route::put('/replies/{reply}/mark-read', [InquiryController::class, 'markReplyAsRead']);
        });

        // Subscriptions
        Route::prefix('subscriptions')->group(function () {
            Route::get('/', [SubscriptionController::class, 'index']);
            Route::post('/', [SubscriptionController::class, 'subscribe']);
            Route::delete('/', [SubscriptionController::class, 'cancelSubscription']);
            Route::get('/invoices/{invoice}', [SubscriptionController::class, 'getInvoice']);
        });

        // Properties
        Route::prefix('properties')->group(function () {
            Route::get('/cities', [PropertyAPIController::class, 'cities']);
            Route::get('/management', [PropertyAPIController::class, 'propertyManagement']);
            Route::post('/{property}/approve', [PropertyAPIController::class, 'approve']);
            Route::get('/', [PropertyAPIController::class, 'index']);
            Route::get('/create', [PropertyAPIController::class, 'create']);
            Route::get('/{property}/edit', [PropertyAPIController::class, 'edit']);
            Route::put('/{property}', [PropertyAPIController::class, 'update']);
            Route::post('/', [PropertyAPIController::class, 'store']);
            Route::put('/{property}/status', [PropertyAPIController::class, 'updateStatus']);
            Route::delete('/{property}', [PropertyAPIController::class, 'destroy']);
            Route::get('/{property}', [PropertyAPIController::class, 'show']);
            Route::post('/{property}/inquiries', [PropertyAPIController::class, 'storeInquiry']);
            Route::post('/{property}/reservations', [PropertyAPIController::class, 'storeReservation']);
            Route::put('/{property}/update-featured', [PropertyAPIController::class, 'updateFeatured']);
        });
        // Profile API
        Route::get('/profile', [ProfileAPIController::class, 'show']);
        Route::put('/profile', [ProfileAPIController::class, 'update']);
        Route::post('/profile/image', [ProfileAPIController::class, 'uploadImage']);
        Route::put('/profile/details', [ProfileAPIController::class, 'updateProfileDetails']);
        Route::delete('/profile', [ProfileAPIController::class, 'destroy']);
        // User services
        Route::prefix('user-services')->group(function () {
            Route::get('/', [UserServiceAPIController::class, 'index']);
            Route::get('/{user_service}', [UserServiceAPIController::class, 'show']);
            Route::post('/{user_service}/ratings', [UserServiceAPIController::class, 'submitRating']);
        });
    });
});
