<?php

use App\Http\Controllers\Admin\UserServiceAttachmentController;
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
use App\Http\Controllers\FaqController;
use App\Http\Controllers\InquiryController;
use App\Http\Controllers\PublicServiceController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\ServiceBuilderController;
use App\Http\Controllers\ServiceCategoryController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\TeamMemberController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserServiceController;
use App\Http\Controllers\UserServiceReviewController;
use App\Http\Controllers\UserSubscriptionController;
use App\Http\Controllers\UserUserServiceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/pricing', [HomeController::class, 'pricing'])->name('pricing');
Route::get('/Faq', [HomeController::class, 'Faq'])->name('Faq');
Route::get('/Page/{key}', [HomeController::class, 'Page'])->name('Page');
Route::get('/about-us', [HomeController::class, 'AboutUs'])->name('AboutUs');
Route::get('/services', [PublicServiceController::class, 'index'])->name('public.services.index');
Route::get('/services/{service}', [PublicServiceController::class, 'show'])->name('public.services.show');
Route::get('/cities', [PropertyController::class, 'cities']);
Route::get('/properties/search', [SearchController::class, 'index'])->name('properties.search');
Route::get('/properties/{property}', [PropertyController::class, 'show'])->name('properties.show');
Route::post('/properties/{property}/inquiries', [PropertyController::class, 'storeInquiry'])->name('properties.inquiries.store');
Route::post('/properties/{property}/reservations', [PropertyController::class, 'storeReservation'])->name('properties.reservations.store');

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);
    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store']);
});

/*
|--------------------------------------------------------------------------
| Authenticated User Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {
    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Service application
    Route::post('/services/{service}/apply', [PublicServiceController::class, 'apply'])
        ->name('public.services.apply');
});

/*
|--------------------------------------------------------------------------
| Regular User Routes (Non-Admin)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->prefix('user')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('user.dashboard');

    // Inquiries
    Route::get('/inquiries', [InquiryController::class, 'index'])->name('user.inquiries.index');
    Route::put('/inquiries/{inquiry}/mark-read', [InquiryController::class, 'markAsRead'])->name('user.inquiries.mark-read');
    Route::get('/inquiries/{inquiry}/replies', [InquiryController::class, 'getReplies'])->name('user.inquiries.replies');
    Route::post('/inquiries/{inquiry}/reply', [InquiryController::class, 'reply'])->name('user.inquiries.reply');
    Route::post('/replies/{reply}/mark-read', [InquiryController::class, 'markReplyAsRead'])->name('user.replies.mark-read');

    // Reservations
    Route::get('/reservations', [ReservationController::class, 'index'])->name('user.reservations');
    Route::put('/reservations/{reservation}/status', [ReservationController::class, 'updateStatus'])->name('user.reservations.update-status');
    Route::get('/reservations/{reservation}/replies', [ReservationController::class, 'getReplies'])->name('user.reservations.replies');
    Route::post('/reservations/{reservation}/message', [ReservationController::class, 'sendMessage'])->name('user.reservations.send-message');
    Route::post('/replies/{reply}/mark-read', [ReservationController::class, 'markReplyAsRead'])->name('user.reservations.mark-reply-read');

    // Properties
    Route::get('/properties/create', [PropertyController::class, 'create'])->name('user.properties.create');
    Route::get('/properties/{property}/edit', [PropertyController::class, 'edit'])->name('user.properties.edit');
    Route::put('/properties/update/status/{property}', [PropertyController::class, 'updateStatus'])->name('user.properties.update.status');
    Route::put('/properties/update/featured/{property}', [PropertyController::class, 'updatefeatured'])->name('user.properties.update.featured');
    Route::get('/properties', [PropertyController::class, 'index'])->name('user.properties.index');
    Route::post('/properties', [PropertyController::class, 'store'])->name('user.properties.store');
    Route::put('/properties/{property}', [PropertyController::class, 'update'])->name('user.properties.update');
    Route::delete('/properties/{property}', [PropertyController::class, 'destroy'])->name('user.properties.destroy');

    // Services
    Route::get('/services', [ServiceController::class, 'index'])->name('user.services.index');
    Route::post('/services/purchase', [ServiceController::class, 'purchase'])->name('user.services.purchase');

    // Subscriptions
    Route::get('/subscription', [SubscriptionController::class, 'index'])->name('user.subscription.index');
    Route::post('/subscription/subscribe', [SubscriptionController::class, 'subscribe'])->name('user.subscriptions.subscribe');
    Route::get('/invoices/{invoice}', [SubscriptionController::class, 'showInvoice'])->name('user.invoices.show');

    // Service Orders
    Route::get('/my-services-orders', [UserUserServiceController::class, 'index'])->name('user.user-services.index');
    Route::get('/my-services-orders/{user_service}', [UserUserServiceController::class, 'show'])->name('user.user-services.show');
    Route::post('/my-services-orders/{user_service}/submit-rating', [UserUserServiceController::class, 'submitRating'])->name('user.user-services.submit-rating');

    // Service progress
    Route::post('/user-services/{userService}/step', [UserServiceController::class, 'updateStep'])->name('user-services.update-step');

    // File attachments
    Route::post('/attachments', [UserServiceAttachmentController::class, 'store']);
    Route::delete('/attachments/{attachment}', [UserServiceAttachmentController::class, 'destroy']);
    Route::post('/profile/{type}', [ProfileController::class, 'upload'])->name('user.profile.upload');
    Route::put('/profile', [ProfileController::class, 'updateProfile'])->name('user.profile.update');
});

/*
|--------------------------------------------------------------------------
| Admin Routes (Requires Admin Role)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    // Dashboard
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/dashboard/revenue-data', [AdminDashboardController::class, 'getRevenueData']);
    Route::get('/dashboard/custom-revenue-data', [AdminDashboardController::class, 'getCustomDateRevenueData']);

    // Packages
    Route::get('/packages', [PackageController::class, 'index'])->name('admin.packages.index');
    Route::post('/packages/upsert', [PackageController::class, 'upsert'])->name('admin.packages.upsert');

    // Users
    Route::get('/users', [UserController::class, 'index'])->name('admin.users.index');
    Route::put('/users/{user}/status', [UserController::class, 'updateStatus'])->name('admin.users.update-status');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('admin.users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('admin.users.destroy');
    Route::get('/users/{user}', [UserController::class, 'approve'])->name('admin.users.approve');
    Route::post('/users/{user}/profile/{type}', [UserController::class, 'upload'])->name('admin.users.profile.upload');

    // User Subscriptions
    Route::post('/users/{user}/subscriptions', [UserSubscriptionController::class, 'store'])->name('admin.users.subscriptions.create');
    Route::put('/users/{user}/subscriptions', [UserSubscriptionController::class, 'update'])->name('admin.users.subscriptions.update');
    Route::delete('/users/{user}/subscriptions/{subscription}', [UserSubscriptionController::class, 'destroy'])->name('admin.users.subscriptions.destroy');
    Route::get('/users/{user}/subscriptions/{subscription}', [UserSubscriptionController::class, 'approve'])->name('admin.users.subscriptions.approve');

    // Properties
    Route::get('/properties', [PropertyController::class, 'propertyManagement'])->name('admin.properties');
    Route::put('/properties/{property}', [PropertyController::class, 'update'])->name('admin.properties.update');
    Route::delete('/properties/{property}', [PropertyController::class, 'destroy'])->name('admin.properties.destroy');
    Route::post('/properties/{property}/approve', [PropertyController::class, 'approve'])->name('admin.properties.approve');

    // Team Members
    Route::resource('/team-members', TeamMemberController::class)->names('admin.team-members');

    // FAQs
    Route::resource('/faqs', FaqController::class)->names('admin.faqs');
    Route::post('/faqs/reorder', [FaqController::class, 'reorder'])->name('faqs.reorder');

    // Cities
    Route::resource('/cities', \App\Http\Controllers\CityController::class)->names('admin.cities');

    // About Values
    Route::put('/about-values', [ConfigController::class, 'updateAboutValues'])->name('admin.about-values.update');
    Route::post('/about-values/upload', [ConfigController::class, 'upload'])->name('admin.about-values.upload');

    // Services
    Route::resource('service-categories', ServiceCategoryController::class)->except(['show']);
    Route::get('/user-services', [UserServiceController::class, 'index'])->name('user-services.index');
    Route::get('/user-services/{user_service}', [UserServiceController::class, 'show'])->name('admin.user-services.show');
    Route::post('user-services/{user_service}/update-fields', [UserServiceController::class, 'updateFields'])->name('admin.user-services.update-fields');
    Route::post('user-services/{user_service}/upload', [UserServiceController::class, 'upload'])->name('admin.user-services.upload');
    Route::get('/user-services/{userService}/form', [UserServiceController::class, 'showForm'])->name('admin.user-services.form');
    Route::post('/user-services/{userService}/save-step', [UserServiceController::class, 'saveStep'])->name('admin.user-services.save-step');
    Route::get('/user-services/{userService}/step/{step}', [UserServiceController::class, 'getStepData'])->name('admin.user-services.step-data');
    Route::resource('services', ServiceController::class)->except(['show'])->names("admin.services");
    Route::patch('services/{service}/toggle-status', [ServiceController::class, 'toggleStatus'])->name('services.toggle-status');

    // Reviews
    Route::post('/user-services/{userService}/review', [UserServiceReviewController::class, 'store'])->name('admin.user-services.review.store');
    Route::put('/user-services/{userService}/review', [UserServiceReviewController::class, 'update'])->name('admin.user-services.review.update');
    Route::delete('/user-services/{userService}/review', [UserServiceReviewController::class, 'destroy'])->name('admin.user-services.review.destroy');
    Route::get('/reviews', [\App\Http\Controllers\Admin\ReviewController::class, 'index'])->name('admin.reviews.index');
    Route::get('/reviews/{review}/edit', [\App\Http\Controllers\Admin\ReviewController::class, 'edit'])->name('admin.reviews.edit');
    Route::put('/reviews/{review}', [\App\Http\Controllers\Admin\ReviewController::class, 'update'])->name('admin.reviews.update');
    Route::delete('/reviews/{review}', [\App\Http\Controllers\Admin\ReviewController::class, 'destroy'])->name('admin.reviews.destroy');
    Route::post('/reviews/{review}/toggle-visibility', [\App\Http\Controllers\Admin\ReviewController::class, 'toggleVisibility'])->name('admin.reviews.toggle-visibility');

    // Attachments
    Route::post('/attachments', [UserServiceAttachmentController::class, 'store']);
    Route::delete('/attachments/{attachment}', [UserServiceAttachmentController::class, 'destroy']);
    Route::get('/user-services/{userService}/attachments', [UserServiceAttachmentController::class, 'index']);

    // Configurations
    Route::prefix('configs')->name('configs.')->group(function () {
        Route::get('/', [ConfigController::class, 'index'])->name('index');
        Route::put('/', [ConfigController::class, 'update'])->name('update');
        Route::post('/upload-logo', [ConfigController::class, 'uploadLogo'])->name('uploadLogo');
    });
});

require __DIR__ . '/auth.php';
require __DIR__ . '/api.php';
