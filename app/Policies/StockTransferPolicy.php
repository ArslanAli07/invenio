<?php

namespace App\Policies;

use App\Models\StockTransfer;
use App\Models\User;

class StockTransferPolicy
{
    /**
     * Deny inactive accounts before any policy method runs.
     */
    public function before(User $user, string $ability): bool|null
    {
        if (! $user->isActive()) {
            return false;
        }

        return null;
    }

    /**
     * All active users (Admin, Manager, Staff) can view transfer logs.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * All active users can view individual transfer logs.
     */
    public function view(User $user, StockTransfer $stockTransfer): bool
    {
        return true;
    }

    /**
     * All active roles (Admin, Manager, Staff) can log stock transfers.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('admin', 'manager', 'staff');
    }
}
