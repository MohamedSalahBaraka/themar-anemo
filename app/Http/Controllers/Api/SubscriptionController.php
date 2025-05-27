<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Subscription;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $activeSubscription = $user->activeSubscription();

        return response()->json([
            'data' => [
                'packages' => Package::active()->get()->map(function ($package) {
                    return [
                        'id' => $package->id,
                        'name' => $package->name,
                        'price' => (int) $package->price,
                        'duration' => $package->duration,
                        'description' => $package->description,
                        'max_listings' => $package->max_listings,
                        'features' => $package->features ?? [],
                        'is_active' => $package->is_active,
                        'subscribe_url' => url("/api/subscriptions/subscribe/{$package->id}"),
                    ];
                }),
                'current_subscription' => $activeSubscription ? [
                    'id' => $activeSubscription->id,
                    'package_id' => $activeSubscription->package_id,
                    'started_at' => $activeSubscription->started_at->toIso8601String(),
                    'expires_at' => $activeSubscription->expires_at->toIso8601String(),
                    'is_active' => $activeSubscription->is_active,
                    'days_remaining' => now()->diffInDays($activeSubscription->expires_at, false),
                    'package' => [
                        'id' => $activeSubscription->package->id,
                        'name' => $activeSubscription->package->name,
                        'price' => $activeSubscription->package->price,
                        'duration' => $activeSubscription->package->duration,
                        'max_listings' => $activeSubscription->package->max_listings,
                        'features' => $activeSubscription->package->features ?? [],
                    ]
                ] : null,
                'transactions' => $user->transactions()
                    ->with('invoice')
                    ->latest()
                    ->get()
                    ->map(function ($transaction) {
                        return [
                            'id' => $transaction->id,
                            'type' => $transaction->type,
                            'amount' => $transaction->amount,
                            'method' => $transaction->method,
                            'status' => $transaction->status,
                            'reference' => $transaction->reference,
                            'paid_at' => $transaction->paid_at?->toIso8601String(),
                            'created_at' => $transaction->created_at->toIso8601String(),
                            'invoice' => $transaction->invoice ? [
                                'invoice_number' => $transaction->invoice->invoice_number,
                                'invoice_pdf_url' => $transaction->invoice->invoice_pdf_url,
                                'issue_date' => $transaction->invoice->created_at->toDateString(),
                                'due_date' => $transaction->invoice->created_at->addDays(30)->toDateString(),
                                'download_url' => url("/api/invoices/{$transaction->invoice->id}/download"),
                            ] : null
                        ];
                    }),
            ],
            'meta' => [
                'can_subscribe' => !$activeSubscription || $activeSubscription->expires_at < now()->addDays(7),
                'active_listings_count' => $user->properties()->count(),
                'max_listings' => $activeSubscription ? $activeSubscription->package->max_listings : 0,
            ]
        ], Response::HTTP_OK);
    }

    public function subscribe(Request $request, Package $package)
    {
        $user = $request->user();
        $activeSubscription = $user->activeSubscription();

        // Check if user has an active subscription that hasn't expired
        if ($activeSubscription && $activeSubscription->expires_at > now()) {
            return response()->json([
                'message' => 'You already have an active subscription',
                'current_subscription' => [
                    'expires_at' => $activeSubscription->expires_at->toIso8601String(),
                    'days_remaining' => now()->diffInDays($activeSubscription->expires_at, false),
                ]
            ], Response::HTTP_CONFLICT);
        }

        // Process payment (would integrate with payment gateway in real app)
        // $payment = $this->processPayment($user, $package->price);

        // Create subscription
        $subscription = $user->subscribeToPackage($package);

        // Create transaction record
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'subscription_id' => $subscription->id,
            'amount' => $package->price,
            'type' => 'subscription',
            'status' => 'completed',
            'method' => 'stripe', // or whatever payment method
        ]);

        return response()->json([
            'message' => 'Subscription created successfully',
            'data' => [
                'subscription' => [
                    'id' => $subscription->id,
                    'package_id' => $package->id,
                    'package_name' => $package->name,
                    'started_at' => $subscription->started_at->toIso8601String(),
                    'expires_at' => $subscription->expires_at->toIso8601String(),
                    'max_listings' => $package->max_listings,
                ],
                'transaction' => [
                    'id' => $transaction->id,
                    'amount' => $transaction->amount,
                    'reference' => $transaction->reference,
                ]
            ],
            'links' => [
                'view_subscription' => url('/api/subscriptions/current'),
                'view_invoice' => url("/api/invoices/{$transaction->id}"),
            ]
        ], Response::HTTP_CREATED);
    }

    public function showInvoice($invoiceId)
    {
        $invoice = Transaction::findOrFail($invoiceId)->invoice;

        return response()->json([
            'data' => [
                'invoice_number' => $invoice->invoice_number,
                'issue_date' => $invoice->created_at->toDateString(),
                'due_date' => $invoice->due_date?->toDateString(),
                'amount' => $invoice->amount,
                'tax' => $invoice->tax,
                'total_amount' => $invoice->total_amount,
                'pdf_url' => $invoice->invoice_pdf_url,
                'download_url' => url("/api/invoices/{$invoice->id}/download"),
            ]
        ], Response::HTTP_OK);
    }

    public function cancel(Request $request)
    {
        $user = $request->user();
        $subscription = $user->activeSubscription();

        if (!$subscription) {
            return response()->json([
                'message' => 'No active subscription found'
            ], Response::HTTP_NOT_FOUND);
        }

        // Implement cancellation logic
        $subscription->update([
            'is_active' => false,
            'cancelled_at' => now()
        ]);

        return response()->json([
            'message' => 'Subscription cancelled successfully',
            'data' => [
                'cancelled_at' => now()->toIso8601String(),
                'expires_at' => $subscription->expires_at->toIso8601String(),
                'refund_eligible' => $subscription->expires_at > now()->addDays(7),
            ]
        ], Response::HTTP_OK);
    }
}
