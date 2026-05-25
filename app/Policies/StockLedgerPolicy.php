<?php

namespace App\Policies;

use App\Models\StockLedger;
use App\Models\User;

class StockLedgerPolicy
{
    public function before(User $user, string $ability): bool|null
    {
        if (! $user->isActive()) {
            return false;
        }

        return null;
    }

    /**
     * View movement history.
     * PRD §6.3 — All roles can view stock levels and movements.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, StockLedger $stockLedger): bool
    {
        return true;
    }

    /**
     * Create any stock movement (in / out / adjust).
     * PRD §6.3 — Admin, Manager, Staff. SupplierUser cannot.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('admin', 'manager', 'staff');
    }

    /**
     * Force a stock-out that would take stock below zero.
     * PRD §6.3 — Admin ONLY. Must also provide a non-empty note (enforced in FormRequest).
     */
    public function forceNegative(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Ledger entries are immutable — no update or delete.
     * These methods exist only to satisfy the interface; they always return false.
     */
    public function update(User $user, StockLedger $stockLedger): bool
    {
        return false;
    }

    public function delete(User $user, StockLedger $stockLedger): bool
    {
        return false;
    }
}
