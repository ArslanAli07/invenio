<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Category;
use App\Models\Location;
use App\Models\Product;
use App\Models\StockLedger;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class StockMovementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $manager;
    protected User $staff;
    protected Category $category;
    protected Product $product;
    protected Location $location;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@invenio.test',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        $this->manager = User::create([
            'name' => 'Manager User',
            'email' => 'manager@invenio.test',
            'password' => bcrypt('password'),
            'role' => 'manager',
            'status' => 'active',
        ]);

        $this->staff = User::create([
            'name' => 'Staff User',
            'email' => 'staff@invenio.test',
            'password' => bcrypt('password'),
            'role' => 'staff',
            'status' => 'active',
        ]);

        $this->category = Category::create([
            'name' => 'Hardware',
            'is_active' => true,
        ]);

        $this->location = Location::create([
            'code' => 'WH-MAIN',
            'name' => 'Main Warehouse',
            'address' => '100 Main St',
            'is_active' => true,
        ]);

        $this->product = Product::create([
            'sku' => 'SKU-BOLT-M8',
            'name' => 'M8 Steel Bolt',
            'unit' => 'pcs',
            'category_id' => $this->category->id,
            'reorder_level' => 10,
            'is_active' => true,
        ]);
    }

    public function test_staff_cannot_record_stock_movement(): void
    {
        $response = $this->actingAs($this->staff)->post("/products/{$this->product->id}/movements", [
            'location_id' => $this->location->id,
            'type' => 'in',
            'quantity' => 100,
            'reference_source' => 'Delivery Note #123',
            'note' => 'Initial stock load',
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseCount('stock_ledger', 0);
    }

    public function test_manager_can_record_stock_in(): void
    {
        $response = $this->actingAs($this->manager)->post("/products/{$this->product->id}/movements", [
            'location_id' => $this->location->id,
            'type' => 'in',
            'quantity' => 100.5,
            'reference_source' => 'Delivery Note #123',
            'note' => 'Initial stock load',
        ]);

        $response->assertRedirect(route('products.show', $this->product));
        $response->assertSessionHas('success', 'Stock movement recorded.');

        $this->assertDatabaseHas('stock_ledger', [
            'product_id' => $this->product->id,
            'location_id' => $this->location->id,
            'type' => 'in',
            'quantity' => 100.500,
            'reference_type' => 'Delivery Note #123',
            'reference_id' => null,
            'note' => 'Initial stock load',
            'created_by' => $this->manager->id,
        ]);

        $this->assertEquals(100.5, StockLedger::computeStock($this->product->id, $this->location->id));
    }

    public function test_quantity_must_be_positive_for_in_and_out(): void
    {
        $response = $this->actingAs($this->admin)->post("/products/{$this->product->id}/movements", [
            'location_id' => $this->location->id,
            'type' => 'in',
            'quantity' => -50,
        ]);

        $response->assertSessionHasErrors('quantity');

        $response2 = $this->actingAs($this->admin)->post("/products/{$this->product->id}/movements", [
            'location_id' => $this->location->id,
            'type' => 'out',
            'quantity' => 0,
        ]);

        $response2->assertSessionHasErrors('quantity');
    }

    public function test_cannot_record_movement_for_inactive_location(): void
    {
        $inactiveLocation = Location::create([
            'code' => 'WH-INACTIVE',
            'name' => 'Old Warehouse',
            'is_active' => false,
        ]);

        $response = $this->actingAs($this->admin)->post("/products/{$this->product->id}/movements", [
            'location_id' => $inactiveLocation->id,
            'type' => 'in',
            'quantity' => 100,
        ]);

        $response->assertSessionHasErrors('location_id');
        $this->assertDatabaseCount('stock_ledger', 0);
    }

    public function test_negative_stock_guard_for_out(): void
    {
        // First record some stock in
        StockLedger::create([
            'product_id' => $this->product->id,
            'location_id' => $this->location->id,
            'type' => 'in',
            'quantity' => 50,
            'created_by' => $this->admin->id,
        ]);
        StockLedger::bustCache($this->product->id, $this->location->id);

        // Try to record stock out higher than current stock
        $response = $this->actingAs($this->admin)->post("/products/{$this->product->id}/movements", [
            'location_id' => $this->location->id,
            'type' => 'out',
            'quantity' => 60,
        ]);

        $response->assertSessionHasErrors('quantity');
        $this->assertEquals(50, StockLedger::computeStock($this->product->id, $this->location->id));
    }

    public function test_negative_stock_guard_for_adjustment(): void
    {
        // Record some stock in
        StockLedger::create([
            'product_id' => $this->product->id,
            'location_id' => $this->location->id,
            'type' => 'in',
            'quantity' => 20,
            'created_by' => $this->admin->id,
        ]);
        StockLedger::bustCache($this->product->id, $this->location->id);

        // Record a positive adjustment
        $response = $this->actingAs($this->admin)->post("/products/{$this->product->id}/movements", [
            'location_id' => $this->location->id,
            'type' => 'adjust',
            'quantity' => 10,
        ]);
        $response->assertRedirect();
        $this->assertEquals(30, StockLedger::computeStock($this->product->id, $this->location->id));

        // Record a negative adjustment that results in negative stock (should fail)
        $response2 = $this->actingAs($this->admin)->post("/products/{$this->product->id}/movements", [
            'location_id' => $this->location->id,
            'type' => 'adjust',
            'quantity' => -35,
        ]);

        $response2->assertSessionHasErrors('quantity');
        $this->assertEquals(30, StockLedger::computeStock($this->product->id, $this->location->id));
    }

    public function test_cache_is_busted_correctly_on_movement(): void
    {
        // 1. Initial compute should query DB and cache it
        $this->assertEquals(0, StockLedger::computeStock($this->product->id, $this->location->id));

        // 2. Insert manual movement to stock ledger bypass-style, cache remains 0
        StockLedger::create([
            'product_id' => $this->product->id,
            'location_id' => $this->location->id,
            'type' => 'in',
            'quantity' => 50,
            'created_by' => $this->admin->id,
        ]);

        $this->assertEquals(0, StockLedger::computeStock($this->product->id, $this->location->id));

        // 3. Post a movement via controller, which triggers bustCache
        $response = $this->actingAs($this->admin)->post("/products/{$this->product->id}/movements", [
            'location_id' => $this->location->id,
            'type' => 'in',
            'quantity' => 25,
        ]);

        $response->assertRedirect();

        // 4. Compute stock should now be 75 (50 + 25) because cache was busted
        $this->assertEquals(75, StockLedger::computeStock($this->product->id, $this->location->id));
    }
}
