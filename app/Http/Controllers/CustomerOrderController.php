<?php

namespace App\Http\Controllers;

use App\Models\CustomerOrder;
use App\Models\Location;
use App\Models\StockLedger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class CustomerOrderController extends Controller
{
    /**
     * Display a listing of customer orders.
     */
    public function index(Request $request)
    {
        Gate::authorize('viewAny', CustomerOrder::class);

        $query = CustomerOrder::query()
            ->with(['fulfillingLocation']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('location_id')) {
            $query->where('fulfilling_location_id', $request->location_id);
        }

        $orders = $query
            ->orderBy('created_at', 'desc')
            ->paginate(25)
            ->withQueryString();

        $locations = Location::active()->orderBy('name')->get(['id', 'code', 'name']);

        return Inertia::render('CustomerOrders/Index', [
            'orders'    => $orders,
            'locations' => $locations,
            'filters'   => $request->only(['search', 'status', 'location_id']),
        ]);
    }

    /**
     * Display the specified customer order.
     */
    public function show(Request $request, CustomerOrder $order)
    {
        Gate::authorize('view', $order);

        $order->load(['fulfillingLocation', 'cancelledBy', 'items.product', 'items.variant']);

        return Inertia::render('CustomerOrders/Show', [
            'order' => $order,
            'can'   => [
                'update' => $request->user()->can('update', $order),
                'cancel' => $request->user()->can('cancel', $order),
            ]
        ]);
    }

    /**
     * Advance the order status.
     */
    public function updateStatus(Request $request, CustomerOrder $order)
    {
        Gate::authorize('update', $order);

        $data = $request->validate([
            'status' => ['required', 'string'],
        ]);

        $newStatus = $data['status'];

        if (! $order->canTransitionTo($newStatus)) {
            return back()->with('error', "Invalid status transition from {$order->status} to {$newStatus}.");
        }

        $order->update(['status' => $newStatus]);

        return back()->with('success', "Order status updated to " . ucfirst($newStatus) . ".");
    }

    /**
     * Cancel the order and reverse stock deductions.
     */
    public function cancel(Request $request, CustomerOrder $order)
    {
        Gate::authorize('cancel', $order);

        $data = $request->validate([
            'cancellation_reason' => ['required', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($order, $data, $request) {
            $order->update([
                'status'              => CustomerOrder::STATUS_CANCELLED,
                'cancelled_by'        => $request->user()->id,
                'cancelled_at'        => now(),
                'cancellation_reason' => $data['cancellation_reason'],
            ]);

            // Reverse stock for all items
            // Assuming stock was deducted when the order was placed (Phase 14)
            // so we add it back.
            foreach ($order->items as $item) {
                StockLedger::create([
                    'product_id'     => $item->product_id,
                    'variant_id'     => $item->variant_id,
                    'location_id'    => $order->fulfilling_location_id,
                    'type'           => 'in',
                    'quantity'       => $item->quantity, // Return the stock
                    'reference_type' => CustomerOrder::class,
                    'reference_id'   => $order->id,
                    'note'           => "Order Cancelled: {$order->order_number} - {$data['cancellation_reason']}",
                    'created_by'     => $request->user()->id,
                ]);

                StockLedger::bustCache($item->product_id, $order->fulfilling_location_id, $item->variant_id);
            }
        });

        return back()->with('success', "Order {$order->order_number} has been cancelled and stock returned.");
    }
}
