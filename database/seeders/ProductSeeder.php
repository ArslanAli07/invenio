<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Seed 30 products spread across all 6 categories.
     * The 8 required products from PRD §11.3 are seeded first.
     * NOTE: Stock levels are seeded separately in StockLedgerSeeder.
     */
    public function run(): void
    {
        // Resolve category IDs
        $cats = Category::pluck('id', 'name');

        $products = [
            // ── Electronics (6 products) ──────────────────────────────────
            ['sku' => 'ELEC-001', 'name' => 'USB-C Hub 7-Port',          'unit' => 'pcs',    'category' => 'Electronics',      'reorder_level' => 10, 'description' => '7-in-1 USB-C hub with 4K HDMI, USB 3.0 x3, SD card reader, and 100W PD charging.'],
            ['sku' => 'ELEC-002', 'name' => 'Wireless Keyboard',          'unit' => 'pcs',    'category' => 'Electronics',      'reorder_level' => 5,  'description' => 'Compact Bluetooth keyboard, multi-device, 12-month battery life.'],
            ['sku' => 'ELEC-003', 'name' => 'Wireless Mouse',             'unit' => 'pcs',    'category' => 'Electronics',      'reorder_level' => 5,  'description' => 'Ergonomic silent wireless mouse with DPI switching.'],
            ['sku' => 'ELEC-004', 'name' => 'HDMI Cable 2m',              'unit' => 'pcs',    'category' => 'Electronics',      'reorder_level' => 15, 'description' => 'High-speed HDMI 2.0 cable, 4K@60Hz support.'],
            ['sku' => 'ELEC-005', 'name' => 'USB-A to USB-C Cable 1m',   'unit' => 'pcs',    'category' => 'Electronics',      'reorder_level' => 20, 'description' => 'Braided nylon USB-A to USB-C fast-charge cable.'],
            ['sku' => 'ELEC-006', 'name' => 'Webcam Full HD 1080p',       'unit' => 'pcs',    'category' => 'Electronics',      'reorder_level' => 3,  'description' => 'Plug-and-play 1080p webcam with built-in noise-cancelling mic.'],

            // ── Office Supplies (7 products) ─────────────────────────────
            ['sku' => 'OFF-001',  'name' => 'A4 Copy Paper 500-Sheet Ream','unit' => 'ream',   'category' => 'Office Supplies',  'reorder_level' => 20, 'description' => '80 gsm bright white A4 copy paper, acid-free.'],
            ['sku' => 'OFF-002',  'name' => 'Ballpoint Pens Box/50',       'unit' => 'box',    'category' => 'Office Supplies',  'reorder_level' => 10, 'description' => 'Blue ink ballpoint pens, medium point, box of 50.'],
            ['sku' => 'OFF-003',  'name' => 'Sticky Notes 76×76mm Pack/5', 'unit' => 'pack',   'category' => 'Office Supplies',  'reorder_level' => 8,  'description' => 'Repositionable sticky notes, assorted colours, pack of 5 pads.'],
            ['sku' => 'OFF-004',  'name' => 'Stapler Heavy-Duty',          'unit' => 'pcs',    'category' => 'Office Supplies',  'reorder_level' => 3,  'description' => 'Desktop stapler, handles up to 50 sheets, includes staples.'],
            ['sku' => 'OFF-005',  'name' => 'Staples Box/5000',            'unit' => 'box',    'category' => 'Office Supplies',  'reorder_level' => 6,  'description' => 'Standard 26/6 staples, box of 5000.'],
            ['sku' => 'OFF-006',  'name' => 'Whiteboard Markers Set/8',    'unit' => 'set',    'category' => 'Office Supplies',  'reorder_level' => 5,  'description' => 'Dry-erase markers, chisel tip, 8 assorted colours.'],
            ['sku' => 'OFF-007',  'name' => 'Lever Arch File A4',          'unit' => 'pcs',    'category' => 'Office Supplies',  'reorder_level' => 10, 'description' => 'A4 lever arch file, 75mm spine, polypropylene cover.'],

            // ── Cleaning (4 products) ──────────────────────────────────
            ['sku' => 'CLN-001',  'name' => 'Floor Cleaner 5L',            'unit' => 'bottle', 'category' => 'Cleaning',         'reorder_level' => 5,  'description' => 'Concentrated pine-scented floor cleaner, 5 litre bottle.'],
            ['sku' => 'CLN-002',  'name' => 'Hand Sanitizer 500ml',        'unit' => 'bottle', 'category' => 'Cleaning',         'reorder_level' => 15, 'description' => '70% isopropyl alcohol hand sanitizer with moisturiser.'],
            ['sku' => 'CLN-003',  'name' => 'Disinfectant Spray 750ml',    'unit' => 'bottle', 'category' => 'Cleaning',         'reorder_level' => 8,  'description' => 'Multi-surface disinfectant spray, kills 99.9% of bacteria.'],
            ['sku' => 'CLN-004',  'name' => 'Mop and Bucket Set',          'unit' => 'set',    'category' => 'Cleaning',         'reorder_level' => 2,  'description' => 'Heavy-duty mop with wringer bucket, 10L capacity.'],

            // ── Packaging (4 products) ──────────────────────────────────
            ['sku' => 'PKG-001',  'name' => 'Bubble Wrap Roll 50m',        'unit' => 'roll',   'category' => 'Packaging',        'reorder_level' => 3,  'description' => '300mm wide bubble wrap roll, 50m length, small bubble.'],
            ['sku' => 'PKG-002',  'name' => 'Cardboard Boxes Pack/20',     'unit' => 'pack',   'category' => 'Packaging',        'reorder_level' => 5,  'description' => 'Single-wall cardboard boxes 30×20×15cm, pack of 20.'],
            ['sku' => 'PKG-003',  'name' => 'Packing Tape 48mm×50m',       'unit' => 'roll',   'category' => 'Packaging',        'reorder_level' => 10, 'description' => 'Clear heavy-duty packing tape with strong adhesive.'],
            ['sku' => 'PKG-004',  'name' => 'Stretch Wrap Film 500mm',     'unit' => 'roll',   'category' => 'Packaging',        'reorder_level' => 4,  'description' => 'Hand stretch wrap film, 500mm×300m, 23 micron.'],

            // ── Tools (5 products) ──────────────────────────────────────
            ['sku' => 'TOOL-001', 'name' => 'Box Cutter Safety',           'unit' => 'pcs',    'category' => 'Tools',            'reorder_level' => 8,  'description' => 'Auto-retractable safety box cutter with spare blades.'],
            ['sku' => 'TOOL-002', 'name' => 'Screwdriver Set 12-Piece',    'unit' => 'set',    'category' => 'Tools',            'reorder_level' => 3,  'description' => 'Magnetic screwdriver set, flat and Phillips, ergonomic handles.'],
            ['sku' => 'TOOL-003', 'name' => 'Cable Ties Pack/100',         'unit' => 'pack',   'category' => 'Tools',            'reorder_level' => 10, 'description' => 'Nylon cable ties, 200mm×3.6mm, black, pack of 100.'],
            ['sku' => 'TOOL-004', 'name' => 'Measuring Tape 5m',           'unit' => 'pcs',    'category' => 'Tools',            'reorder_level' => 4,  'description' => 'Steel measuring tape, 5m, auto-lock, belt clip.'],
            ['sku' => 'TOOL-005', 'name' => 'Heavy-Duty Gloves L',         'unit' => 'pair',   'category' => 'Tools',            'reorder_level' => 6,  'description' => 'Leather palm work gloves, size L, cut-resistant.'],

            // ── Safety Equipment (4 products) ─────────────────────────
            ['sku' => 'SAFE-001', 'name' => 'Nitrile Gloves Box/100',      'unit' => 'box',    'category' => 'Safety Equipment', 'reorder_level' => 4,  'description' => 'Powder-free nitrile disposable gloves, size M, box of 100.'],
            ['sku' => 'SAFE-002', 'name' => 'Safety Helmet',               'unit' => 'pcs',    'category' => 'Safety Equipment', 'reorder_level' => 5,  'description' => 'Hard hat, HDPE shell, 6-point suspension, adjustable ratchet.'],
            ['sku' => 'SAFE-003', 'name' => 'High-Vis Vest',               'unit' => 'pcs',    'category' => 'Safety Equipment', 'reorder_level' => 8,  'description' => 'Class 2 high-visibility vest, ANSI/ISEA 107 compliant, size M.'],
            ['sku' => 'SAFE-004', 'name' => 'First Aid Kit 50-Person',     'unit' => 'kit',    'category' => 'Safety Equipment', 'reorder_level' => 2,  'description' => 'Workplace first aid kit, BS8599-1 compliant, 50-person coverage.'],
        ];

        foreach ($products as $data) {
            Product::firstOrCreate(
                ['sku' => $data['sku']],
                [
                    'name'          => $data['name'],
                    'description'   => $data['description'],
                    'unit'          => $data['unit'],
                    'category_id'   => $cats[$data['category']],
                    'reorder_level' => $data['reorder_level'],
                    'is_active'     => true,
                ]
            );
        }
    }
}
