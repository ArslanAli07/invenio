<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    /**
     * Seed 4 suppliers per PRD §11.1.
     */
    public function run(): void
    {
        $suppliers = [
            [
                'name'      => 'TechSource International',
                'email'     => 'orders@techsource.test',
                'phone'     => '+92-21-3456-7890',
                'address'   => '88 Electronics Market, Saddar, Karachi',
                'notes'     => 'Primary electronics supplier. Net-30 payment terms.',
                'is_active' => true,
            ],
            [
                'name'      => 'OfficeWorld Supplies Co.',
                'email'     => 'procurement@officeworld.test',
                'phone'     => '+92-42-9876-5432',
                'address'   => '14 Gulberg III, Commercial Area, Lahore',
                'notes'     => 'Stationery and office supplies. Weekly delivery.',
                'is_active' => true,
            ],
            [
                'name'      => 'CleanPro Distributors',
                'email'     => 'sales@cleanpro.test',
                'phone'     => '+92-51-2345-6789',
                'address'   => 'Industrial Zone, Sector I-9, Islamabad',
                'notes'     => 'Cleaning and hygiene products. Minimum order PKR 5,000.',
                'is_active' => true,
            ],
            [
                'name'      => 'SafeGuard Pakistan',
                'email'     => 'supply@safeguard.test',
                'phone'     => '+92-21-4567-8901',
                'address'   => 'SITE Area, Block 6, Karachi',
                'notes'     => 'Safety equipment and PPE. ISO certified.',
                'is_active' => true,
            ],
        ];

        foreach ($suppliers as $data) {
            Supplier::firstOrCreate(['email' => $data['email']], $data);
        }
    }
}
