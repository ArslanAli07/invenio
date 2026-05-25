<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    /**
     * Seed the 3 warehouse/store locations per PRD §11.3.
     */
    public function run(): void
    {
        $locations = [
            [
                'code'      => 'WH-01',
                'name'      => 'Main Warehouse',
                'address'   => '12 Industrial Estate Road, Block A, Karachi',
                'is_active' => true,
            ],
            [
                'code'      => 'WH-02',
                'name'      => 'Secondary Warehouse',
                'address'   => '45 Logistics Park, Unit 7, Lahore',
                'is_active' => true,
            ],
            [
                'code'      => 'STORE-01',
                'name'      => 'Retail Store',
                'address'   => 'Shop 3, Ground Floor, Business Centre, Islamabad',
                'is_active' => true,
            ],
        ];

        foreach ($locations as $data) {
            Location::firstOrCreate(['code' => $data['code']], $data);
        }
    }
}
