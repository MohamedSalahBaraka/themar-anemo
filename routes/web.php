<?php

use App\Http\Controllers\PackageController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\ConfigController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InquiryController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserSubscriptionController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });
// Route::get('/home', function () {
//     return Inertia::render('SearchResultsPage');
// });
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/pricing', [HomeController::class, 'pricing'])->name('pricing');
Route::get('/about-us', [HomeController::class, 'AboutUs'])->name('AboutUs');
// Other routes...
// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});
Route::get('/admin/properties', [PropertyController::class, 'propertyManagement'])
    ->name('admin.properties');
Route::get('/properties/search', [SearchController::class, 'index'])
    ->name('properties.search');
Route::get('/properties/{property}', [PropertyController::class, 'show'])->name('properties.show');
Route::post('/properties/{property}/inquiries', [PropertyController::class, 'storeInquiry'])->name('properties.inquiries.store');
Route::post('/properties/{property}/reservations', [PropertyController::class, 'storeReservation'])->name('properties.reservations.store');
Route::post('/admin/properties/{property}/approve', [PropertyController::class, 'approve'])
    ->name('admin.properties.approve');
Route::get('/admin/users', [UserController::class, 'index'])
    ->name('admin.users.index');

Route::put('/admin/users/{user}/status', [UserController::class, 'updateStatus'])
    ->name('admin.users.update-status');

Route::put('/admin/users/{user}', [UserController::class, 'update'])
    ->name('admin.users.update');

Route::delete('/admin/users/{user}', [UserController::class, 'destroy'])
    ->name('admin.users.destroy');
Route::delete('/admin/users/{user}', [UserController::class, 'destroy'])
    ->name('admin.users.destroy');
Route::get('/admin/users/{user}', [UserController::class, 'approve'])
    ->name('admin.users.approve');
Route::prefix('admin')->middleware(['auth'])->group(function () {
    Route::get('/packages', [PackageController::class, 'index'])->name('admin.packages.index');
    Route::post('/packages', [PackageController::class, 'store'])->name('admin.packages.store');
    Route::put('/packages/{package}', [PackageController::class, 'update'])->name('admin.packages.update');
    Route::delete('/packages/{package}', [PackageController::class, 'destroy'])->name('admin.packages.destroy');
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/dashboard/revenue-data', [AdminDashboardController::class, 'getRevenueData']);
    Route::get('/dashboard/custom-revenue-data', [AdminDashboardController::class, 'getCustomDateRevenueData']);
    Route::post('/users/{user}/profile/{type}', [UserController::class, 'upload'])
        ->name('admin.users.profile.upload');
    Route::post('/users/{user}/subscriptions', [UserSubscriptionController::class, 'store'])
        ->name('admin.users.subscriptions.create');
    Route::put('/users/{user}/subscriptions', [UserSubscriptionController::class, 'update'])
        ->name('admin.users.subscriptions.update');
    Route::delete('/users/{user}/subscriptions/{subscription}', [UserSubscriptionController::class, 'destroy'])
        ->name('admin.users.subscriptions.destroy');
    Route::get('/users/{user}/subscriptions/{subscription}', [UserSubscriptionController::class, 'approve'])
        ->name('admin.users.subscriptions.approve');
    Route::put('/properties/{property}', [PropertyController::class, 'update'])->name('admin.properties.update');
    Route::delete('/properties/{property}', [PropertyController::class, 'destroy'])->name('admin.properties.destroy');
});
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);
    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store']);
    // Route::get('/register', [RegisterController::class, 'create'])->name('register');
    // other auth routes...
});
Route::middleware(['auth', 'verified'])->prefix('user')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('user.dashboard');
    Route::get('/inquiries', [InquiryController::class, 'index'])->name('user.inquiries.index');
    Route::put('/inquiries/{inquiry}/mark-read', [InquiryController::class, 'markAsRead'])->name('user.inquiries.mark-read');
    Route::get('/inquiries/{inquiry}/replies', [InquiryController::class, 'getReplies'])
        ->name('user.inquiries.replies')
        ->middleware('auth');

    Route::post('/inquiries/{inquiry}/reply', [InquiryController::class, 'reply'])
        ->name('user.inquiries.reply')
        ->middleware('auth');

    Route::post('/replies/{reply}/mark-read', [InquiryController::class, 'markReplyAsRead'])
        ->name('user.replies.mark-read')
        ->middleware('auth');
    // Reservations
    Route::get('/reservations', [ReservationController::class, 'index'])->name('user.reservations');
    Route::put('/reservations/{reservation}/status', [ReservationController::class, 'updateStatus'])->name('user.reservations.update-status');
    Route::get('/reservations/{reservation}/replies', [ReservationController::class, 'getReplies'])->name('user.reservations.replies');
    Route::post('/reservations/{reservation}/message', [ReservationController::class, 'sendMessage'])->name('user.reservations.send-message');
    Route::post('/replies/{reply}/mark-read', [ReservationController::class, 'markReplyAsRead'])->name('user.reservations.mark-reply-read');

    Route::get('/properties/create', [PropertyController::class, 'create'])->name('user.properties.create');
    Route::get('/properties/{property}/edit', [PropertyController::class, 'edit'])->name('user.properties.edit');
    Route::put('/properties/update/status/{property}', [PropertyController::class, 'updateStatus'])->name('user.properties.update.status');
    Route::get('/properties', [PropertyController::class, 'index'])->name('user.properties.index');
    Route::post('/properties', [PropertyController::class, 'store'])->name('user.properties.store');
    Route::put('/properties/{property}', [PropertyController::class, 'update'])->name('user.properties.update');
    Route::delete('/properties/{property}', [PropertyController::class, 'destroy'])->name('user.properties.destroy');
    Route::get('/services', [ServiceController::class, 'index'])->name('user.services.index');
    Route::post('/services/purchase', [ServiceController::class, 'purchase'])->name('user.services.purchase');
    Route::get('/subscription', [SubscriptionController::class, 'index'])->name('user.subscription.index');
    Route::post('/subscription/subscribe', [SubscriptionController::class, 'subscribe'])->name('user.subscriptions.subscribe');
    Route::get('/invoices/{invoice}', [SubscriptionController::class, 'showInvoice'])->name('user.invoices.show');

    // Other user routes...
});


Route::prefix('admin/configs')->name('admin.configs.')->middleware(['auth'])->group(function () {
    Route::get('/', [ConfigController::class, 'index'])->name('index');
    Route::put('/', [ConfigController::class, 'update'])->name('update');
    Route::post('/upload-logo', [ConfigController::class, 'uploadLogo'])->name('uploadLogo');
});

require __DIR__ . '/auth.php';
