<?php

namespace App\Http\Controllers;

use App\Mail\PurchaseOrderSentMail;
use App\Models\Location;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\StockLedger;
use App\Models\Supplier;
use App\Http\Requests\StorePurchaseOrderRequest;
use App\Http\Requests\UpdatePurchaseOrderRequest;
use App\Http\Requests\ReceiveItemsRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class PurchaseOrderController extends Controller
{
    // ──────────────────────────────────────────────────────────────────────────
    // Listing & Navigation
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Display a paginated list of purchase orders with optional filters.
     */
    public function index(Request $request)
    {
        Gate::authorize('viewAny', PurchaseOrder::class);

        $query = PurchaseOrder::query()
            ->with(['supplier', 'location', 'createdBy', 'items']);

        // If supplier, restrict to their POs only
        if ($request->user()->isSupplier()) {
            $query->where('supplier_id', $request->user()->supplier_id);
        } else {
            // Only allow filtering by supplier for internal staff
            if ($request->filled('supplier_id')) {
                $query->where('supplier_id', $request->supplier_id);
            }
        }

        if ($request->filled('search')) {
            $query->where('po_number', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $purchaseOrders = $query
            ->orderBy('created_at', 'desc')
            ->paginate(25)
            ->withQueryString();

        $suppliers = Supplier::active()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('PurchaseOrders/Index', [
            'purchaseOrders' => $purchaseOrders,
            'suppliers'      => $suppliers,
            'filters'        => $request->only(['search', 'status', 'supplier_id']),
            'can'            => [
                'create' => $request->user()->can('create', PurchaseOrder::class),
            ],
        ]);
    }

    /**
     * Show the form for creating a new draft PO.
     */
    public function create(Request $request)
    {
        Gate::authorize('create', PurchaseOrder::class);

        return Inertia::render('PurchaseOrders/Create', [
            'suppliers' => Supplier::active()->orderBy('name')->get(['id', 'name', 'email']),
            'locations' => Location::active()->orderBy('name')->get(['id', 'code', 'name']),
            'products'  => Product::with('variants')->active()->orderBy('sku')->get(['id', 'sku', 'name', 'unit']),
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Create & Edit Draft
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Store a new draft purchase order with its line items.
     */
    public function store(StorePurchaseOrderRequest $request)
    {
        $data = $request->validated();

        // Verify supplier and location are active — FormRequest only checks existence
        $supplier = Supplier::where('id', $data['supplier_id'])->where('is_active', true)->first();
        if (! $supplier) {
            return back()->withErrors(['supplier_id' => 'The selected supplier is inactive.'])->withInput();
        }

        $location = Location::where('id', $data['location_id'])->where('is_active', true)->first();
        if (! $location) {
            return back()->withErrors(['location_id' => 'The selected location is inactive.'])->withInput();
        }

        $po = DB::transaction(function () use ($data, $request) {
            $po = PurchaseOrder::create([
                'po_number'   => PurchaseOrder::generatePoNumber(),
                'supplier_id' => $data['supplier_id'],
                'location_id' => $data['location_id'],
                'status'      => 'draft',
                'expected_at' => $data['expected_at'] ?? null,
                'notes'       => $data['notes'] ?? null,
                'created_by'  => $request->user()->id,
            ]);

            foreach ($data['items'] as $item) {
                PurchaseOrderItem::create([
                    'purchase_order_id' => $po->id,
                    'product_id'        => $item['product_id'],
                    'variant_id'        => $item['variant_id'] ?? null,
                    'qty_ordered'       => $item['qty_ordered'],
                    'unit_cost'         => $item['unit_cost'],
                    'qty_received'      => 0,
                ]);
            }

            return $po;
        });

        return redirect()
            ->route('po.show', $po)
            ->with('success', "Purchase order {$po->po_number} created.");
    }

    /**
     * Display a single purchase order with its items and full metadata.
     */
    public function show(Request $request, PurchaseOrder $purchaseOrder)
    {
        Gate::authorize('view', $purchaseOrder);

        $purchaseOrder->load(['supplier', 'location', 'createdBy', 'items.product', 'items.variant']);

        return Inertia::render('PurchaseOrders/Show', [
            'purchaseOrder' => $purchaseOrder,
            'can'           => [
                'edit'    => $request->user()->can('update', $purchaseOrder),
                'send'    => $request->user()->can('send', $purchaseOrder),
                'receive' => $request->user()->can('receive', $purchaseOrder),
                'cancel'  => $request->user()->can('cancel', $purchaseOrder),
                'delete'  => $request->user()->can('delete', $purchaseOrder),
            ],
        ]);
    }

    /**
     * Show the form for editing a draft PO.
     * Non-draft POs are immutable — PRD §6.2.2.
     */
    public function edit(Request $request, PurchaseOrder $purchaseOrder)
    {
        Gate::authorize('update', $purchaseOrder);

        $purchaseOrder->load(['items.product']);

        return Inertia::render('PurchaseOrders/Edit', [
            'purchaseOrder' => $purchaseOrder,
            'suppliers'     => Supplier::active()->orderBy('name')->get(['id', 'name', 'email']),
            'locations'     => Location::active()->orderBy('name')->get(['id', 'code', 'name']),
            'products'      => Product::with('variants')->active()->orderBy('sku')->get(['id', 'sku', 'name', 'unit']),
        ]);
    }

    /**
     * Update a draft PO — replaces all line items on every save.
     * Only allowed while status === 'draft' (enforced by policy).
     */
    public function update(UpdatePurchaseOrderRequest $request, PurchaseOrder $purchaseOrder)
    {
        Gate::authorize('update', $purchaseOrder);

        $data = $request->validated();

        // Verify supplier and location are still active
        $supplier = Supplier::where('id', $data['supplier_id'])->where('is_active', true)->first();
        if (! $supplier) {
            return back()->withErrors(['supplier_id' => 'The selected supplier is inactive.'])->withInput();
        }

        $location = Location::where('id', $data['location_id'])->where('is_active', true)->first();
        if (! $location) {
            return back()->withErrors(['location_id' => 'The selected location is inactive.'])->withInput();
        }

        DB::transaction(function () use ($data, $purchaseOrder) {
            $purchaseOrder->update([
                'supplier_id' => $data['supplier_id'],
                'location_id' => $data['location_id'],
                'expected_at' => $data['expected_at'] ?? null,
                'notes'       => $data['notes'] ?? null,
            ]);

            // Replace all items — only safe while status = draft (no qty_received yet)
            $purchaseOrder->items()->delete();

            foreach ($data['items'] as $item) {
                PurchaseOrderItem::create([
                    'purchase_order_id' => $purchaseOrder->id,
                    'product_id'        => $item['product_id'],
                    'variant_id'        => $item['variant_id'] ?? null,
                    'qty_ordered'       => $item['qty_ordered'],
                    'unit_cost'         => $item['unit_cost'],
                    'qty_received'      => 0,
                ]);
            }
        });

        return redirect()
            ->route('po.show', $purchaseOrder)
            ->with('success', 'Purchase order updated.');
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Status Transitions
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Mark PO as sent and dispatch the supplier email to the queue.
     * PRD §6.2.3 — Admin and Manager only.
     */
    public function send(Request $request, PurchaseOrder $purchaseOrder)
    {
        Gate::authorize('send', $purchaseOrder);

        $purchaseOrder->load(['supplier', 'location', 'items.product']);

        // Guard: supplier must have an email address to receive the PO
        if (empty($purchaseOrder->supplier->email)) {
            return back()->withErrors([
                'send' => 'Cannot send — this supplier has no email address on record.',
            ]);
        }

        $purchaseOrder->update([
            'status'  => 'sent',
            'sent_at' => now(),
        ]);

        // Queued — never sent synchronously in the request cycle
        Mail::queue(new PurchaseOrderSentMail($purchaseOrder));

        return back()->with('success', "PO {$purchaseOrder->po_number} sent to {$purchaseOrder->supplier->name}.");
    }

    /**
     * Record received quantities for one or more line items.
     *
     * Guards (in order):
     *   1. Authorization  — receive policy (Admin, Manager, Staff; PO must be sent/partially_received)
     *   2. Ownership      — each item_id must belong to this PO
     *   3. Qty guard      — received qty must be > 0 and <= outstanding per item
     *   4. Write + status — wrapped in a DB transaction; busts stock cache per item
     *
     * PRD §6.1.4 & §6.1.5
     */
    public function receive(ReceiveItemsRequest $request, PurchaseOrder $purchaseOrder)
    {
        Gate::authorize('receive', $purchaseOrder);

        $data = $request->validated();

        // Load all items belonging to this PO for reference
        $poItems = $purchaseOrder->items()->with('product')->get()->keyBy('id');

        $errors = [];

        foreach ($data['items'] as $index => $row) {
            $item = $poItems->get($row['item_id']);

            // Guard: item must belong to this PO
            if (! $item) {
                $errors["items.{$index}.item_id"] = 'This item does not belong to the purchase order.';
                continue;
            }

            $qtyReceived  = (float) $row['qty_received'];
            $outstanding  = (float) $item->qty_ordered - (float) $item->qty_received;

            // Guard: at least some qty must be received per submitted row
            if ($qtyReceived <= 0) {
                $errors["items.{$index}.qty_received"] = "Quantity must be greater than zero for {$item->product->name}.";
                continue;
            }

            // Guard: cannot receive more than what is still outstanding
            if ($qtyReceived > $outstanding) {
                $errors["items.{$index}.qty_received"] =
                    "Cannot receive {$qtyReceived} — only {$outstanding} {$item->product->unit} outstanding for {$item->product->name}.";
            }
        }

        if (! empty($errors)) {
            return back()->withErrors($errors)->withInput();
        }

        // All guards passed — write inside a transaction
        DB::transaction(function () use ($data, $poItems, $purchaseOrder, $request) {
            foreach ($data['items'] as $row) {
                $item        = $poItems->get($row['item_id']);
                $qtyReceived = (float) $row['qty_received'];

                if ($qtyReceived <= 0) {
                    continue; // skip zero-qty rows silently
                }

                // Increment qty_received on the PO item
                $item->increment('qty_received', $qtyReceived);

                // Write immutable stock-in ledger entry
                // reference_type = full class name → matches polymorphic format used in seeder + Show.jsx
                StockLedger::create([
                    'product_id'     => $item->product_id,
                    'variant_id'     => $item->variant_id,
                    'location_id'    => $purchaseOrder->location_id,
                    'type'           => 'in',
                    'quantity'       => $qtyReceived,
                    'reference_type' => PurchaseOrder::class,
                    'reference_id'   => $purchaseOrder->id,
                    'note'           => "Received via {$purchaseOrder->po_number}",
                    'created_by'     => $request->user()->id,
                ]);

                StockLedger::bustCache($item->product_id, $purchaseOrder->location_id, $item->variant_id);
            }

            // Reload fresh qty_received values to determine new PO status
            $purchaseOrder->load('items');
            $allFulfilled = $purchaseOrder->items->every(
                fn ($i) => (float) $i->qty_received >= (float) $i->qty_ordered
            );

            $purchaseOrder->update([
                'status' => $allFulfilled ? 'received' : 'partially_received',
            ]);
        });

        return back()->with('success', 'Items received and stock updated.');
    }

    /**
     * Cancel a purchase order.
     * Does NOT reverse any stock already received — PRD §6.2.5.
     * Cannot cancel a fully received PO.
     */
    public function cancel(Request $request, PurchaseOrder $purchaseOrder)
    {
        Gate::authorize('cancel', $purchaseOrder);

        $purchaseOrder->update(['status' => 'cancelled']);

        return back()->with('success', "Purchase order {$purchaseOrder->po_number} cancelled.");
    }

    /**
     * Hard-delete a draft PO (Admin only, draft status).
     * Cascades to purchase_order_items via DB constraint.
     */
    public function destroy(Request $request, PurchaseOrder $purchaseOrder)
    {
        Gate::authorize('delete', $purchaseOrder);

        $poNumber = $purchaseOrder->po_number;
        $purchaseOrder->delete();

        return redirect()
            ->route('po.index')
            ->with('success', "Purchase order {$poNumber} deleted.");
    }
}
