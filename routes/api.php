<?php

use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\InquiryController;
use App\Http\Controllers\Api\PackageController;
use App\Http\Controllers\Api\PropertyController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\SubscriptionController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/login', [LoginController::class, 'store']);
    Route::middleware('auth:sanctum')->post('/logout', [LoginController::class, 'destroy']);
    Route::get('/register/packages', [RegisterController::class, 'packages']);
    Route::post('/register', [RegisterController::class, 'store']);
});
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/', [HomeController::class, 'index']);
    Route::get('/inquiries', [InquiryController::class, 'index']);
    Route::post('/inquiries/{inquiry}/mark-as-read', [InquiryController::class, 'markAsRead']);
});
Route::middleware('auth:sanctum')->prefix('packages')->group(function () {
    Route::get('/', [PackageController::class, 'index']);
    Route::post('/', [PackageController::class, 'store']);
    Route::put('/{package}', [PackageController::class, 'update']);
    Route::delete('/{package}', [PackageController::class, 'destroy']);
});
// Public routes
Route::get('/properties/types', [PropertyController::class, 'propertyTypes']);
Route::get('/properties/purposes', [PropertyController::class, 'purposeTypes']);
Route::get('/properties/{property}', [PropertyController::class, 'show']);
Route::post('/properties/{property}/inquiries', [PropertyController::class, 'storeInquiry']);
Route::post('/properties/{property}/reservations', [PropertyController::class, 'storeReservation']);
Route::get('/search', [SearchController::class, 'index']);

// Admin routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/properties/pending', [PropertyController::class, 'pendingProperties']);
    Route::post('/properties/{property}/approve', [PropertyController::class, 'approveProperty']);
});

// Authenticated user routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/properties', [PropertyController::class, 'index']);
    Route::post('/user/properties', [PropertyController::class, 'store']);
    Route::put('/user/properties/{property}', [PropertyController::class, 'update']);
    Route::patch('/user/properties/{property}/status', [PropertyController::class, 'updateStatus']);
    Route::delete('/user/properties/{property}', [PropertyController::class, 'destroy']);
});
// Public routes
Route::get('/services', [ServiceController::class, 'index']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/services/{service}/purchase', [ServiceController::class, 'purchase']);
    Route::get('/user/services', [ServiceController::class, 'userServices']);
});
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/subscriptions', [SubscriptionController::class, 'index']);
    Route::post('/subscriptions/subscribe/{package}', [SubscriptionController::class, 'subscribe']);
    Route::post('/subscriptions/cancel', [SubscriptionController::class, 'cancel']);
    Route::get('/invoices/{invoice}', [SubscriptionController::class, 'showInvoice']);
});
Route::apiResource('users', \App\Http\Controllers\Api\UserController::class);
Route::patch('/users/{user}/status', [\App\Http\Controllers\Api\UserController::class, 'updateStatus']);
