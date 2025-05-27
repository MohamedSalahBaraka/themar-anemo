<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Property;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        // Basic statistics
        $stats = [
            'users_count' => User::count(),
            'properties_count' => Property::count(),
            'active_listings' => Property::where('status', 'available')->count(),
            'revenue_30days' => Transaction::where('created_at', '>=', now()->subDays(30))
                ->sum('amount'),
        ];

        // Revenue data for the chart (last 7 days by default)
        $revenueData = Transaction::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(amount) as total')
        )
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => Carbon::parse($item->date)->format('M d'),
                    'total' => (float) $item->total,
                ];
            });

        return Inertia::render('admin/Dashboard', [
            'stats' => $stats,
            'revenueData' => $revenueData,
        ]);
    }

    /**
     * Get filtered revenue data based on time range.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRevenueData(Request $request)
    {
        $validated = $request->validate([
            'timeRange' => 'required|in:7days,30days,90days',
        ]);

        $days = match ($validated['timeRange']) {
            '7days' => 7,
            '30days' => 30,
            '90days' => 90,
        };

        $revenueData = Transaction::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(amount) as total')
        )
            ->where('created_at', '>=', now()->subDays($days))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => Carbon::parse($item->date)->format('M d'),
                    'total' => (float) $item->total,
                ];
            });

        return response()->json($revenueData);
    }

    /**
     * Get filtered revenue data based on custom date range.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCustomDateRevenueData(Request $request)
    {
        $validated = $request->validate([
            'startDate' => 'required|date',
            'endDate' => 'required|date|after_or_equal:startDate',
        ]);

        $revenueData = Transaction::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(amount) as total')
        )
            ->whereBetween('created_at', [
                $validated['startDate'],
                Carbon::parse($validated['endDate'])->endOfDay()
            ])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => Carbon::parse($item->date)->format('M d'),
                    'total' => (float) $item->total,
                ];
            });

        return response()->json($revenueData);
    }
}
