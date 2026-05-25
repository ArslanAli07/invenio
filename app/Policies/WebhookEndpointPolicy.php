<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WebhookEndpoint;

class WebhookEndpointPolicy
{
    public function before(User $user, string $ability): bool|null
    {
        if (! $user->isActive()) {
            return false;
        }

        return null;
    }

    /**
     * PRD §6.3 — Manage webhook endpoints: Admin ONLY.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, WebhookEndpoint $webhookEndpoint): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, WebhookEndpoint $webhookEndpoint): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, WebhookEndpoint $webhookEndpoint): bool
    {
        return $user->isAdmin();
    }

    /** Toggle active/inactive state. */
    public function toggleActive(User $user, WebhookEndpoint $webhookEndpoint): bool
    {
        return $user->isAdmin();
    }

    /**
     * Send a test ping — bypasses cooldown, fires immediately.
     * PRD §8.7 — Admin only.
     */
    public function testPing(User $user, WebhookEndpoint $webhookEndpoint): bool
    {
        return $user->isAdmin();
    }
}
