<?php

namespace Tests\Feature;

use App\Mail\PurchaseOrderSentMail;
use App\Models\Category;
use App\Models\Location;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\StockLedger;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PurchaseOrderTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $manager;
    protected User $staff;
    protected Supplier $supplier;
    protected Location $location;
    protected Product $productA;
    protected Product $productB;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::create([
            'name' => 'Admin User', 'email' => 'admin@invenio.test',
            'password' => bcrypt('password'), 'role' => 'admin', 'status' => 'active',
        ]);
        $this->manager = User::create([
            'name' => 'Manager User', 'email' => 'manager@invenio.test',
            'password' => bcrypt('password'), 'role' => 'manager', 'status' => 'active',
        ]);
        $this->staff = User::create([
            'name' => 'Staff User', 'email' => 'staff@invenio.test',
            'password' => bcrypt('password'), 'role' => 'staff', 'status' => 'active',
        ]);

        $this->supplier = Supplier::create([
            'name' => 'Test Supplier', 'email' => 'orders@testsupplier.test', 'is_active' => true,
        ]);
        $this->location = Location::create([
            'code' => 'WH-TEST', 'name' => 'Test Warehouse', 'is_active' => true,
        ]);

        $category = Category::create(['name' => 'Test Category', 'is_active' => true]);
        $this->productA = Product::create([
            'sku' => 'PROD-A', 'name' => 'Product Alpha', 'unit' => 'pcs',
            'category_id' => $category->id, 'reorder_level' => 5, 'is_active' => true,
        ]);
        $this->productB = Product::create([
            'sku' => 'PROD-B', 'name' => 'Product Beta', 'unit' => 'kg',
            'category_id' => $category->id, 'reorder_level' => 10, 'is_active' => true,
        ]);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function validPoPayload(array $overrides = []): array
    {
        return array_merge([
            'supplier_id' => $this->supplier->id,
            'location_id' => $this->location->id,
            'expected_at' => now()->addDays(14)->toDateString(),
            'notes'       => 'Test order notes.',
            'items'       => [
                ['product_id' => $this->productA->id, 'qty_ordered' => 50, 'unit_cost' => 10.00],
                ['product_id' => $this->productB->id, 'qty_ordered' => 25, 'unit_cost' => 5.50],
            ],
        ], $overrides);
    }

    private function createDraftPo(?User $user = null): PurchaseOrder
    {
        $user ??= $this->admin;
        $po = PurchaseOrder::create([
            'po_number'   => PurchaseOrder::generatePoNumber(),
            'supplier_id' => $this->supplier->id,
            'location_id' => $this->location->id,
            'status'      => 'draft',
            'created_by'  => $user->id,
        ]);
        PurchaseOrderItem::insert([
            ['purchase_order_id' => $po->id, 'product_id' => $this->productA->id, 'qty_ordered' => 50, 'unit_cost' => 10.00, 'qty_received' => 0],
            ['purchase_order_id' => $po->id, 'product_id' => $this->productB->id, 'qty_ordered' => 25, 'unit_cost' => 5.50, 'qty_received' => 0],
        ]);
        return $po;
    }

    // ─── Create ───────────────────────────────────────────────────────────────

    public function test_admin_can_create_draft_po_with_line_items(): void
    {
        $response = $this->actingAs($this->admin)
            ->post('/purchase-orders', $this->validPoPayload());

        $response->assertRedirectContains('/purchase-orders/');
        $response->assertSessionHas('success');

        $this->assertDatabaseCount('purchase_orders', 1);
        $this->assertDatabaseCount('purchase_order_items', 2);

        $po = PurchaseOrder::first();
        $this->assertEquals('draft', $po->status);
        $this->assertStringStartsWith('PO-', $po->po_number);
    }

    public function test_staff_can_create_draft_po(): void
    {
        $response = $this->actingAs($this->staff)
            ->post('/purchase-orders', $this->validPoPayload());

        $response->assertRedirectContains('/purchase-orders/');
        $this->assertDatabaseCount('purchase_orders', 1);
    }

    public function test_po_requires_at_least_one_line_item(): void
    {
        $response = $this->actingAs($this->admin)
            ->post('/purchase-orders', $this->validPoPayload(['items' => []]));

        $response->assertSessionHasErrors('items');
        $this->assertDatabaseCount('purchase_orders', 0);
    }

    public function test_po_number_is_generated_server_side_and_unique(): void
    {
        $this->actingAs($this->admin)->post('/purchase-orders', $this->validPoPayload());
        $this->actingAs($this->admin)->post('/purchase-orders', $this->validPoPayload());

        $poNumbers = PurchaseOrder::pluck('po_number');
        $this->assertCount(2, $poNumbers->unique());
    }

    public function test_inactive_supplier_is_rejected(): void
    {
        $inactiveSupplier = Supplier::create([
            'name' => 'Inactive Supplier', 'email' => 'x@x.test', 'is_active' => false,
        ]);

        $response = $this->actingAs($this->admin)
            ->post('/purchase-orders', $this->validPoPayload(['supplier_id' => $inactiveSupplier->id]));

        $response->assertSessionHasErrors('supplier_id');
        $this->assertDatabaseCount('purchase_orders', 0);
    }

    // ─── Edit draft ───────────────────────────────────────────────────────────

    public function test_draft_po_can_be_edited(): void
    {
        $po = $this->createDraftPo();

        $response = $this->actingAs($this->admin)
            ->put("/purchase-orders/{$po->id}", $this->validPoPayload([
                'notes' => 'Updated notes.',
                'items' => [
                    ['product_id' => $this->productA->id, 'qty_ordered' => 100, 'unit_cost' => 9.50],
                ],
            ]));

        $response->assertRedirectContains('/purchase-orders/');
        $this->assertDatabaseHas('purchase_orders', ['id' => $po->id, 'notes' => 'Updated notes.']);
        // Old 2 items replaced by 1 new item
        $this->assertDatabaseCount('purchase_order_items', 1);
        $this->assertDatabaseHas('purchase_order_items', ['product_id' => $this->productA->id, 'qty_ordered' => 100]);
    }

    public function test_sent_po_cannot_be_edited(): void
    {
        $po = $this->createDraftPo();
        $po->update(['status' => 'sent', 'sent_at' => now()]);

        $response = $this->actingAs($this->admin)
            ->put("/purchase-orders/{$po->id}", $this->validPoPayload());

        $response->assertStatus(403);
    }

    // ─── Send ─────────────────────────────────────────────────────────────────

    public function test_manager_can_send_draft_po_and_mail_is_queued(): void
    {
        Mail::fake();

        $po = $this->createDraftPo();

        $response = $this->actingAs($this->manager)
            ->post("/purchase-orders/{$po->id}/send");

        $response->assertSessionHas('success');

        $po->refresh();
        $this->assertEquals('sent', $po->status);
        $this->assertNotNull($po->sent_at);

        Mail::assertQueued(PurchaseOrderSentMail::class, function ($mail) use ($po) {
            return $mail->purchaseOrder->id === $po->id;
        });
    }

    public function test_staff_cannot_send_a_po(): void
    {
        Mail::fake();

        $po = $this->createDraftPo();

        $response = $this->actingAs($this->staff)
            ->post("/purchase-orders/{$po->id}/send");

        $response->assertStatus(403);

        $po->refresh();
        $this->assertEquals('draft', $po->status);
        Mail::assertNotQueued(PurchaseOrderSentMail::class);
    }

    public function test_cannot_send_po_without_supplier_email(): void
    {
        Mail::fake();

        $noEmailSupplier = Supplier::create(['name' => 'No Email Supplier', 'is_active' => true]);
        $po = PurchaseOrder::create([
            'po_number'   => 'PO-TEST-9999',
            'supplier_id' => $noEmailSupplier->id,
            'location_id' => $this->location->id,
            'status'      => 'draft',
            'created_by'  => $this->admin->id,
        ]);
        PurchaseOrderItem::create([
            'purchase_order_id' => $po->id, 'product_id' => $this->productA->id,
            'qty_ordered' => 10, 'unit_cost' => 5, 'qty_received' => 0,
        ]);

        $response = $this->actingAs($this->admin)
            ->post("/purchase-orders/{$po->id}/send");

        $response->assertSessionHasErrors('send');
        Mail::assertNotQueued(PurchaseOrderSentMail::class);
    }

    // ─── Receive ──────────────────────────────────────────────────────────────

    public function test_partial_receive_creates_ledger_entries_and_updates_qty_received(): void
    {
        $po = $this->createDraftPo();
        $po->update(['status' => 'sent', 'sent_at' => now()]);
        $items = $po->items()->get();

        // Receive only the first item (partial receive)
        $response = $this->actingAs($this->admin)
            ->post("/purchase-orders/{$po->id}/receive", [
                'items' => [
                    ['item_id' => $items[0]->id, 'qty_received' => 20],
                ],
            ]);

        $response->assertSessionHas('success');

        $po->refresh();
        $this->assertEquals('partially_received', $po->status);

        $items[0]->refresh();
        $this->assertEquals(20, (float) $items[0]->qty_received);

        // Ledger entry created correctly
        $this->assertDatabaseHas('stock_ledger', [
            'product_id'     => $this->productA->id,
            'location_id'    => $this->location->id,
            'type'           => 'in',
            'quantity'       => 20,
            'reference_type' => PurchaseOrder::class,
            'reference_id'   => $po->id,
        ]);

        // Stock cache busted — computeStock returns the real value
        $this->assertEquals(20.0, StockLedger::computeStock($this->productA->id, $this->location->id));
    }

    public function test_full_receive_sets_po_status_to_received(): void
    {
        $po = $this->createDraftPo();
        $po->update(['status' => 'sent', 'sent_at' => now()]);
        $items = $po->items()->get();

        $response = $this->actingAs($this->admin)
            ->post("/purchase-orders/{$po->id}/receive", [
                'items' => [
                    ['item_id' => $items[0]->id, 'qty_received' => 50],
                    ['item_id' => $items[1]->id, 'qty_received' => 25],
                ],
            ]);

        $response->assertSessionHas('success');
        $po->refresh();
        $this->assertEquals('received', $po->status);
    }

    public function test_cannot_receive_more_than_outstanding_qty(): void
    {
        $po = $this->createDraftPo();
        $po->update(['status' => 'sent', 'sent_at' => now()]);
        $item = $po->items()->first();

        $response = $this->actingAs($this->admin)
            ->post("/purchase-orders/{$po->id}/receive", [
                'items' => [
                    ['item_id' => $item->id, 'qty_received' => 999],
                ],
            ]);

        $response->assertSessionHasErrors("items.0.qty_received");
        $item->refresh();
        $this->assertEquals(0, (float) $item->qty_received);
        $this->assertDatabaseCount('stock_ledger', 0);
    }

    public function test_item_belonging_to_different_po_is_rejected(): void
    {
        $po1 = $this->createDraftPo();
        $po1->update(['status' => 'sent', 'sent_at' => now()]);

        $po2 = $this->createDraftPo();
        $po2->update(['status' => 'sent', 'sent_at' => now()]);
        $foreignItem = $po2->items()->first();

        // Try to receive an item from po2 while targeting po1
        $response = $this->actingAs($this->admin)
            ->post("/purchase-orders/{$po1->id}/receive", [
                'items' => [
                    ['item_id' => $foreignItem->id, 'qty_received' => 5],
                ],
            ]);

        $response->assertSessionHasErrors('items.0.item_id');
        $this->assertDatabaseCount('stock_ledger', 0);
    }

    public function test_staff_can_receive_po_items(): void
    {
        $po = $this->createDraftPo();
        $po->update(['status' => 'sent', 'sent_at' => now()]);
        $item = $po->items()->first();

        $response = $this->actingAs($this->staff)
            ->post("/purchase-orders/{$po->id}/receive", [
                'items' => [['item_id' => $item->id, 'qty_received' => 10]],
            ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseCount('stock_ledger', 1);
    }

    // ─── Cancel ───────────────────────────────────────────────────────────────

    public function test_cancellation_does_not_reverse_stock(): void
    {
        $po = $this->createDraftPo();
        $po->update(['status' => 'sent', 'sent_at' => now()]);
        $item = $po->items()->first();

        // Receive some items first
        $this->actingAs($this->admin)->post("/purchase-orders/{$po->id}/receive", [
            'items' => [['item_id' => $item->id, 'qty_received' => 15]],
        ]);

        $stockBefore = StockLedger::computeStock($this->productA->id, $this->location->id);
        $this->assertEquals(15.0, $stockBefore);

        // Now cancel
        $po->refresh();
        $response = $this->actingAs($this->admin)
            ->post("/purchase-orders/{$po->id}/cancel");

        $response->assertSessionHas('success');
        $po->refresh();
        $this->assertEquals('cancelled', $po->status);

        // Stock must remain unchanged — ledger is permanent
        $stockAfter = StockLedger::computeStock($this->productA->id, $this->location->id);
        $this->assertEquals(15.0, $stockAfter);
        $this->assertDatabaseCount('stock_ledger', 1);
    }

    public function test_staff_cannot_cancel_a_po(): void
    {
        $po = $this->createDraftPo();

        $response = $this->actingAs($this->staff)
            ->post("/purchase-orders/{$po->id}/cancel");

        $response->assertStatus(403);
        $po->refresh();
        $this->assertEquals('draft', $po->status);
    }

    public function test_received_po_cannot_be_cancelled(): void
    {
        $po = $this->createDraftPo();
        $po->update(['status' => 'received']);

        $response = $this->actingAs($this->admin)
            ->post("/purchase-orders/{$po->id}/cancel");

        $response->assertStatus(403);
        $po->refresh();
        $this->assertEquals('received', $po->status);
    }
}
