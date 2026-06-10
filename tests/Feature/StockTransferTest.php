<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Location;
use App\Models\Product;
use App\Models\StockLedger;
use App\Models\StockTransfer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StockTransferTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $staff;
    private Category $category;
    private Location $locationA;
    private Location $locationB;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);
        $this->staff = User::factory()->create(['role' => 'staff', 'status' => 'active']);

        $this->category = Category::create(['name' => 'Category A', 'is_active' => true]);
        $this->locationA = Location::create(['code' => 'LOC-A', 'name' => 'Location A', 'is_active' => true]);
        $this->locationB = Location::create(['code' => 'LOC-B', 'name' => 'Location B', 'is_active' => true]);

        $this->product = Product::create([
            'sku' => 'PROD-01',
            'name' => 'Product 01',
            'unit' => 'pcs',
            'category_id' => $this->category->id,
            'reorder_level' => 10,
            'is_active' => true,
        ]);
    }

    public function test_unauthenticated_user_is_redirected_to_login(): void
    {
        $this->get(route('transfers.index'))->assertRedirect(route('login'));
        $this->get(route('transfers.create'))->assertRedirect(route('login'));
        $this->post(route('transfers.store'), [])->assertRedirect(route('login'));
    }

    public function test_active_staff_can_view_transfers_log_and_create_form(): void
    {
        $response = $this->actingAs($this->staff)->get(route('transfers.index'));
        $response->assertStatus(200);

        $responseCreate = $this->actingAs($this->staff)->get(route('transfers.create'));
        $responseCreate->assertStatus(200);
    }

    public function test_valid_stock_transfer_adjusts_ledger_atomically(): void
    {
        // Add 20 units of stock to Location A
        StockLedger::create([
            'product_id' => $this->product->id,
            'location_id' => $this->locationA->id,
            'type' => 'in',
            'quantity' => 20.0,
            'created_by' => $this->admin->id,
        ]);
        StockLedger::bustCache($this->product->id, $this->locationA->id);

        $this->assertEquals(20.0, StockLedger::computeStock($this->product->id, $this->locationA->id));
        $this->assertEquals(0.0, StockLedger::computeStock($this->product->id, $this->locationB->id));

        // Transfer 8 units from A to B
        $response = $this->actingAs($this->staff)->post(route('transfers.store'), [
            'product_id' => $this->product->id,
            'from_location_id' => $this->locationA->id,
            'to_location_id' => $this->locationB->id,
            'quantity' => 8.0,
            'notes' => 'Weekly restock',
        ]);

        $response->assertRedirect(route('transfers.index'));
        $response->assertSessionHas('success');

        // Check transfer record was created
        $this->assertDatabaseHas('stock_transfers', [
            'product_id' => $this->product->id,
            'from_location_id' => $this->locationA->id,
            'to_location_id' => $this->locationB->id,
            'quantity' => 8.000,
            'notes' => 'Weekly restock',
            'created_by' => $this->staff->id,
        ]);

        // Check stock quantities
        $this->assertEquals(12.0, StockLedger::computeStock($this->product->id, $this->locationA->id));
        $this->assertEquals(8.0, StockLedger::computeStock($this->product->id, $this->locationB->id));

        // Check ledger entries are present
        $this->assertDatabaseHas('stock_ledger', [
            'product_id' => $this->product->id,
            'location_id' => $this->locationA->id,
            'type' => 'out',
            'quantity' => 8.0,
            'reference_type' => StockTransfer::class,
        ]);

        $this->assertDatabaseHas('stock_ledger', [
            'product_id' => $this->product->id,
            'location_id' => $this->locationB->id,
            'type' => 'in',
            'quantity' => 8.0,
            'reference_type' => StockTransfer::class,
        ]);
    }

    public function test_cannot_transfer_to_same_location(): void
    {
        $response = $this->actingAs($this->admin)->post(route('transfers.store'), [
            'product_id' => $this->product->id,
            'from_location_id' => $this->locationA->id,
            'to_location_id' => $this->locationA->id,
            'quantity' => 5.0,
        ]);

        $response->assertSessionHasErrors(['to_location_id']);
    }

    public function test_cannot_transfer_insufficient_stock(): void
    {
        // A starts with 3 units
        StockLedger::create([
            'product_id' => $this->product->id,
            'location_id' => $this->locationA->id,
            'type' => 'in',
            'quantity' => 3.0,
            'created_by' => $this->admin->id,
        ]);
        StockLedger::bustCache($this->product->id, $this->locationA->id);

        // Try to transfer 5 units
        $response = $this->actingAs($this->staff)->post(route('transfers.store'), [
            'product_id' => $this->product->id,
            'from_location_id' => $this->locationA->id,
            'to_location_id' => $this->locationB->id,
            'quantity' => 5.0,
        ]);

        $response->assertSessionHasErrors(['quantity']);
    }

    public function test_cannot_transfer_inactive_product_or_locations(): void
    {
        $inactiveProduct = Product::create([
            'sku' => 'INACTIVE-1',
            'name' => 'Inactive Prod',
            'unit' => 'pcs',
            'category_id' => $this->category->id,
            'reorder_level' => 10,
            'is_active' => false,
        ]);

        $response = $this->actingAs($this->admin)->post(route('transfers.store'), [
            'product_id' => $inactiveProduct->id,
            'from_location_id' => $this->locationA->id,
            'to_location_id' => $this->locationB->id,
            'quantity' => 2.0,
        ]);
        $response->assertSessionHasErrors(['product_id']);

        $inactiveLocation = Location::create(['code' => 'INACTIVE-LOC', 'name' => 'Inactive Warehouse', 'is_active' => false]);

        $responseLoc = $this->actingAs($this->admin)->post(route('transfers.store'), [
            'product_id' => $this->product->id,
            'from_location_id' => $this->locationA->id,
            'to_location_id' => $inactiveLocation->id,
            'quantity' => 2.0,
        ]);
        $responseLoc->assertSessionHasErrors(['to_location_id']);
    }

    public function test_deactivated_users_cannot_access_transfers(): void
    {
        $inactiveUser = User::factory()->create(['role' => 'staff', 'status' => 'inactive']);

        $this->actingAs($inactiveUser)->get(route('transfers.index'))->assertStatus(403);
        $this->actingAs($inactiveUser)->get(route('transfers.create'))->assertStatus(403);
        $this->actingAs($inactiveUser)->post(route('transfers.store'), [])->assertStatus(403);
    }
}
