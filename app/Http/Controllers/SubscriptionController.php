<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    public function index()
    {
        $user_id = Auth::id();
        $user = User::find($user_id);

        if (!$user) {
            return redirect()->route('login')->with('error', 'You must be logged in to view subscriptions.');
        }
        $subscription = $user->subscription();
        return Inertia::render('user/SubscriptionPage', [
            'packages' => Package::where('isActive', true)->get()->map(function ($package) {
                return [
                    'id' => $package->id,
                    'name' => $package->name,
                    'price' => (int) $package->price,
                    'duration' => $package->duration,
                    'description' => $package->description,
                    'max_listings' => $package->max_listings,
                    'features' => $package->features ?? [],
                    'is_active' => $package->is_active,
                ];
            }),
            'currentSubscription' => $subscription ? [
                'id' => $subscription->id,
                'package_id' => $subscription->package_id,
                'started_at' => $subscription->started_at,
                'expires_at' => $subscription->expires_at,
                'is_active' => $subscription->is_active,
                'package' => [
                    'id' => $subscription->package->id,
                    'name' => $subscription->package->name,
                    'price' => $subscription->package->price,
                    'duration' => $subscription->package->duration,
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
                        'paid_at' => $transaction->paid_at?->toDateTimeString(),
                        'created_at' => $transaction->created_at->toDateTimeString(),
                        'invoice' => $transaction->invoice ? [
                            'invoice_number' => $transaction->invoice->invoice_number,
                            'invoice_pdf_url' => $transaction->invoice->invoice_pdf_url,
                            'issue_date' => $transaction->invoice->created_at->toDateString(),
                            'due_date' => $transaction->invoice->created_at->addDays(30)->toDateString(),
                        ] : null
                    ];
                }),
        ]);
    }

    public function subscribe(Request $request)
    {
        $request->validate([
            'package_id' => 'required|exists:packages,id',
        ]);

        $package = Package::findOrFail($request->package_id);
        $user = $request->user();

        // Process payment and create subscription
        $subscription = $user->subscribeToPackage($package);

        return back()->with('success', 'Subscription created successfully');
    }

    public function showInvoice($invoiceId)
    {
        $invoice = Transaction::findOrFail($invoiceId)->invoice;

        return Inertia::render('user/SubscriptionPage', [
            'invoice' => [
                'invoiceNumber' => $invoice->number,
                'issueDate' => $invoice->created_at,
                'dueDate' => $invoice->due_date,
                'totalAmount' => $invoice->total_amount,
                'amount' => $invoice->amount,
                'tax' => $invoice->tax
            ],
        ]);
    }
}
