<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Location;
use App\Models\Product;
use App\Models\StockLedger;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_dashboard(): void
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_access_dashboard_with_all_props(): void
    {
        $user = User::factory()->create(['role' => 'manager', 'status' => 'active']);
        
        $category = Category::create(['name' => 'Test Category', 'is_active' => true]);
        $location = Location::create(['code' => 'LOC1', 'name' => 'Test Location', 'is_active' => true]);
        $product = Product::create([
            'sku' => 'TEST-01',
            'name' => 'Test Product',
            'category_id' => $category->id,
            'reorder_level' => 10,
            'unit' => 'pcs',
            'is_active' => true,
        ]);

        // Create some stock ledger entries to generate chart data
        StockLedger::create([
            'product_id' => $product->id,
            'location_id' => $location->id,
            'type' => 'in',
            'quantity' => 15.0,
            'created_by' => $user->id,
        ]);

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->has('stats')
            ->has('lowStockProducts')
            ->has('recentPos')
            ->has('recentMovements')
            ->has('locationStock')
            ->has('categoryStock')
            ->has('movementsTrend')
        );
    }
}
