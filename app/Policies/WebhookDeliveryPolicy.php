<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WebhookDelivery;

class WebhookDeliveryPolicy
{
    public function before(User $user, string $ability): bool|null
    {
        if (! $user->isActive()) {
            return false;
        }

        return null;
    }

    /**
     * PRD §6.3 — View webhook delivery log: Admin and Manager only.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('admin', 'manager');
    }

    public function view(User $user, WebhookDelivery $webhookDelivery): bool
    {
        return $user->hasRole('admin', 'manager');
    }

    /**
     * Delivery records are append-only — written only by the job system.
     * No user action should ever create, update, or delete them directly.
     */
    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, WebhookDelivery $webhookDelivery): bool
    {
        return false;
    }

    public function delete(User $user, WebhookDelivery $webhookDelivery): bool
    {
        return false;
    }
}
