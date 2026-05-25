<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Category;
use App\Models\Location;
use App\Models\Supplier;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MasterDataCrudTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $staff;

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

        $this->staff = User::create([
            'name' => 'Staff User',
            'email' => 'staff@invenio.test',
            'password' => bcrypt('password'),
            'role' => 'staff',
            'status' => 'active',
        ]);
    }

    public function test_admin_can_view_categories_list(): void
    {
        $response = $this->actingAs($this->admin)->get('/categories');
        $response->assertStatus(200);
    }

    public function test_staff_can_view_categories_list(): void
    {
        $response = $this->actingAs($this->staff)->get('/categories');
        $response->assertStatus(200);
    }

    public function test_admin_can_create_category(): void
    {
        $response = $this->actingAs($this->admin)->post('/categories', [
            'name' => 'Mechanical Fasteners',
            'is_active' => true,
        ]);

        $response->assertRedirect(route('categories.index'));
        $this->assertDatabaseHas('categories', ['name' => 'Mechanical Fasteners']);
    }

    public function test_staff_cannot_create_category(): void
    {
        $response = $this->actingAs($this->staff)->post('/categories', [
            'name' => 'Unauthorized Category',
            'is_active' => true,
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('categories', ['name' => 'Unauthorized Category']);
    }

    public function test_category_validation_requires_unique_name(): void
    {
        Category::create(['name' => 'Dup Category', 'is_active' => true]);

        $response = $this->actingAs($this->admin)->post('/categories', [
            'name' => 'Dup Category',
            'is_active' => true,
        ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_admin_can_create_location(): void
    {
        $response = $this->actingAs($this->admin)->post('/locations', [
            'code' => 'WH-EAST',
            'name' => 'East Coast Main Distribution Facility',
            'address' => '500 Logistics Way, NJ',
            'is_active' => true,
        ]);

        $response->assertRedirect(route('locations.index'));
        $this->assertDatabaseHas('locations', ['code' => 'WH-EAST']);
    }

    public function test_location_validation_enforces_alpha_dash_code(): void
    {
        $response = $this->actingAs($this->admin)->post('/locations', [
            'code' => 'WH EAST INVALID CODE',
            'name' => 'Invalid Code Location',
            'is_active' => true,
        ]);

        $response->assertSessionHasErrors('code');
    }

    public function test_sku_availability_check_api(): void
    {
        $category = Category::create(['name' => 'Tools', 'is_active' => true]);
        Product::create([
            'sku' => 'TOOL-100',
            'name' => 'Power Hammer Pro',
            'unit' => 'pcs',
            'category_id' => $category->id,
            'reorder_level' => 5,
            'is_active' => true,
        ]);

        // Check unavailable SKU
        $response = $this->actingAs($this->admin)->post('/products/check-sku', [
            'sku' => 'TOOL-100',
        ]);
        $response->assertJson(['available' => false]);

        // Check available SKU
        $response = $this->actingAs($this->admin)->post('/products/check-sku', [
            'sku' => 'TOOL-200',
        ]);
        $response->assertJson(['available' => true]);
    }
}
