<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Subscription;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SubscriptionController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        return response()->json([
            'packages' => Package::where('isActive', true)->get()->map(function ($package) {
                return [
                    'id' => $package->id,
                    'name' => $package->name,
                    'price' => (int)$package->price,
                    'yearly_price' => (int)$package->yearly_price,
                    'duration' => $package->duration,
                    'description' => $package->description,
                    'max_listings' => $package->max_listings,
                    'user_type' => $package->user_type,
                    'features' => $package->features ?? [],
                    'is_active' => $package->is_active,
                ];
            }),
            'current_subscription' => $user->subscription ? [
                'id' => $user->subscription->id,
                'package_id' => $user->subscription->package_id,
                'started_at' => $user->subscription->started_at?->toISOString(),
                'expires_at' => $user->subscription->expires_at?->toISOString(),
                'status' => $user->subscription->status,
                'billing_frequency' => $user->subscription->billing_frequency,
                'days_remaining' => now()->diffInDays($user->subscription->expires_at, false),
                'package' => [
                    'id' => $user->subscription->package->id,
                    'name' => $user->subscription->package->name,
                    'price' => $user->subscription->package->price,
                    'yearly_price' => $user->subscription->package->yearly_price,
                    'duration' => $user->subscription->package->duration,
                    'max_listings' => $user->subscription->package->max_listings,
                    'features' => $user->subscription->package->features ?? [],
                ]
            ] : null,
            // 'transactions' => $user->transactions()
            // ->with('invoice')
            // ->latest()
            // ->get()
            // ->map(function ($transaction) {
            //     return [
            //         'id' => $transaction->id,
            //         'type' => $transaction->type,
            //         'amount' => $transaction->amount,
            //         'method' => $transaction->method,
            //         'status' => $transaction->status,
            //         'reference' => $transaction->reference,
            //         'paid_at' => $transaction->paid_at?->toISOString(),
            //         'created_at' => $transaction->created_at->toISOString(),
            //         'invoice' => $transaction->invoice ? [
            //             'id' => $transaction->invoice->id,
            //             'invoice_number' => $transaction->invoice->invoice_number,
            //             'invoice_pdf_url' => $transaction->invoice->invoice_pdf_url,
            //             'amount' => $transaction->invoice->amount,
            //             'tax' => $transaction->invoice->tax,
            //             'total_amount' => $transaction->invoice->total_amount,
            //             'issue_date' => $transaction->invoice->created_at->toDateString(),
            //             'due_date' => $transaction->invoice->created_at->addDays(30)->toDateString(),
            //         ] : null
            //     ];
            // }),
        ]);
    }

    public function subscribe(Request $request)
    {
        $request->validate([
            'package_id' => 'required|exists:packages,id',
            'billing_frequency' => 'required|in:monthly,yearly',
            'payment_method_id' => 'required_if:method,card|string', // For Stripe
            'method' => 'required|in:card,paypal,bank_transfer',
        ]);

        $user = $request->user();
        $package = Package::findOrFail($request->package_id);

        // Check if user already has an active subscription
        if ($user->subscription && !$user->subscription->isExpired()) {
            return response()->json([
                'message' => 'You already have an active subscription',
                'current_subscription' => [
                    'expires_at' => $user->subscription->expires_at->toISOString(),
                    'days_remaining' => now()->diffInDays($user->subscription->expires_at, false)
                ]
            ], 422);
        }

        // Process payment
        try {
            $subscription = $user->subscribeToPackage(
                $package,
                $request->billing_frequency,
                $request->method,
                $request->payment_method_id ?? null
            );

            return response()->json([
                'message' => 'Subscription created successfully',
                'subscription' => [
                    'id' => $subscription->id,
                    'package_id' => $subscription->package_id,
                    'expires_at' => $subscription->expires_at->toISOString(),
                    'billing_frequency' => $subscription->billing_frequency,
                    'status' => $subscription->status,
                ],
                'transaction' => [
                    'id' => $subscription->transaction->id,
                    'amount' => $subscription->transaction->amount,
                    'status' => $subscription->transaction->status,
                    'invoice_url' => $subscription->transaction->invoice->invoice_pdf_url ?? null,
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Payment failed: ' . $e->getMessage()
            ], 400);
        }
    }

    public function cancelSubscription(Request $request)
    {
        $user = $request->user();

        if (!$user->subscription) {
            return response()->json([
                'message' => 'No active subscription found'
            ], 404);
        }

        $user->subscription->update([
            'cancel_at' => now(),
            'status' => 'cancelled'
        ]);

        return response()->json([
            'message' => 'Subscription cancelled successfully',
            'subscription' => [
                'id' => $user->subscription->id,
                'status' => $user->subscription->status,
                'expires_at' => $user->subscription->expires_at->toISOString(),
                'days_remaining' => now()->diffInDays($user->subscription->expires_at, false)
            ]
        ]);
    }

    public function getInvoice($invoiceId)
    {
        $invoice = Transaction::with('invoice')
            ->where('user_id', Auth::id())
            ->findOrFail($invoiceId)
            ->invoice;

        return response()->json([
            'invoice' => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'invoice_pdf_url' => $invoice->invoice_pdf_url,
                'amount' => $invoice->amount,
                'tax' => $invoice->tax,
                'total_amount' => $invoice->total_amount,
                'issue_date' => $invoice->created_at->toDateString(),
                'due_date' => $invoice->created_at->addDays(30)->toDateString(),
                'status' => $invoice->status,
            ]
        ]);
    }
}
