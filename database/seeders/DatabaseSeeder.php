<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Run in dependency order:
     * Users → Categories → Locations → Suppliers → Products
     * → StockLedger → PurchaseOrders → WebhookEndpoints
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
            LocationSeeder::class,
            SupplierSeeder::class,
            ProductSeeder::class,
            StockLedgerSeeder::class,
            PurchaseOrderSeeder::class,
            WebhookEndpointSeeder::class,
        ]);
    }
}

