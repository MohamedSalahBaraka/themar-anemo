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
        $subscription = $user->subscription();

        return response()->json([
            'data' => [
                'packages' => Package::active()->get()->map(function ($package) {
                    return [
                        'id' => $package->id,
                        'name' => $package->name,
                        'price' => (int) $package->price,
                        'billing_frequency' => $package->billing_frequency,
                        'description' => $package->description,
                        'max_listings' => $package->max_listings,
                        'features' => $package->features ?? [],
                        'is_active' => $package->is_active,
                        'subscribe_url' => url("/api/subscriptions/subscribe/{$package->id}"),
                    ];
                }),
                'current_subscription' => $subscription ? [
                    'id' => $subscription->id,
                    'package_id' => $subscription->package_id,
                    'started_at' => $subscription->started_at->toIso8601String(),
                    'expires_at' => $subscription->expires_at->toIso8601String(),
                    'is_active' => $subscription->is_active,
                    'days_remaining' => now()->diffInDays($subscription->expires_at, false),
                    'package' => [
                        'id' => $subscription->package->id,
                        'name' => $subscription->package->name,
                        'price' => $subscription->package->price,
                        'billing_frequency' => $subscription->package->billing_frequency,
                        'max_listings' => $subscription->package->max_listings,
                        'features' => $subscription->package->features ?? [],
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
                'can_subscribe' => !$subscription || $subscription->expires_at < now()->addDays(7),
                'active_listings_count' => $user->properties()->count(),
                'max_listings' => $subscription ? $subscription->package->max_listings : 0,
            ]
        ], Response::HTTP_OK);
    }

    public function subscribe(Request $request, Package $package)
    {
        $user = $request->user();
        $subscription = $user->subscription();

        // Check if user has an active subscription that hasn't expired
        if ($subscription && $subscription->expires_at > now()) {
            return response()->json([
                'message' => 'You already have an active subscription',
                'current_subscription' => [
                    'expires_at' => $subscription->expires_at->toIso8601String(),
                    'days_remaining' => now()->diffInDays($subscription->expires_at, false),
                ]
            ], Response::HTTP_CONFLICT);
        }

        // Process payment (would integrate with payment gateway in real app)
        // $payment = $this->processPayment($user, $package->price);

        // Create subscription
        $package = Package::findOrFail($request->package_id);
        $duration = $package->billing_frequency === 'yearly' ? 365 : 30;

        $subscription =  $user->subscriptions()->create([
            'package_id' => $package->id,
            'expires_at' => now()->addDays($duration),
            'billing_frequency' => $request->billing_frequency ?? 'monthly',
            'cancel_at' => null, // Explicitly set to null for new subscriptions
            'is_active' => true,
        ]);

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
        $subscription = $user->subscription();

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
