<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed the 4 default users — one per role.
     * PRD §11.2 — all documented in README under "Default Accounts".
     */
    public function run(): void
    {
        $users = [
            [
                'name'              => 'Admin User',
                'email'             => 'admin@invenio.test',
                'password'          => Hash::make('password'),
                'role'              => 'admin',
                'status'            => 'active',
                'email_verified_at' => now(),
            ],
            [
                'name'              => 'Manager User',
                'email'             => 'manager@invenio.test',
                'password'          => Hash::make('password'),
                'role'              => 'manager',
                'status'            => 'active',
                'email_verified_at' => now(),
            ],
            [
                'name'              => 'Staff User',
                'email'             => 'staff@invenio.test',
                'password'          => Hash::make('password'),
                'role'              => 'staff',
                'status'            => 'active',
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $userData) {
            User::firstOrCreate(['email' => $userData['email']], $userData);
        }
    }
}
