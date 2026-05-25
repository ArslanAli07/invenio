<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\WebhookEndpoint;
use Illuminate\Database\Seeder;

class WebhookEndpointSeeder extends Seeder
{
    /**
     * Seed 1 example webhook endpoint — inactive by default per PRD §11.1.
     * Admin can activate it under Settings → Webhooks.
     */
    public function run(): void
    {
        $admin = User::where('email', 'admin@invenio.test')->firstOrFail();

        WebhookEndpoint::firstOrCreate(
            ['url' => 'https://webhook.site/example-invenio'],
            [
                'event'      => 'stock.low',
                'secret'     => null,
                'is_active'  => false, // inactive by default per PRD
                'created_by' => $admin->id,
            ]
        );
    }
}
