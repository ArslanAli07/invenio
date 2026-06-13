<?php

namespace App\Policies;

use App\Models\PurchaseOrder;
use App\Models\User;

class PurchaseOrderPolicy
{
    public function before(User $user, string $ability): bool|null
    {
        if (! $user->isActive()) {
            return false;
        }

        return null;
    }

    /**
     * View any PO list.
     * PRD §6.3 — Admin, Manager, Staff can view.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('admin', 'manager', 'staff', 'supplier');
    }

    public function view(User $user, PurchaseOrder $purchaseOrder): bool
    {
        if ($user->hasRole('admin', 'manager', 'staff')) {
            return true;
        }

        if ($user->isSupplier()) {
            return $user->supplier_id === $purchaseOrder->supplier_id;
        }

        return false;
    }

    /**
     * Create / edit a DRAFT purchase order.
     * PRD §6.3 — Admin, Manager, Staff.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('admin', 'manager', 'staff');
    }

    /**
     * Edit a PO — only allowed when status is 'draft'.
     * PRD §6.2.2 — Any other status makes the PO immutable.
     */
    public function update(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return $user->hasRole('admin', 'manager', 'staff')
            && $purchaseOrder->isDraft();
    }

    /**
     * Send a PO to the supplier (triggers email + sets sent_at).
     * PRD §6.3 — Admin and Manager only.
     */
    public function send(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return $user->hasRole('admin', 'manager')
            && $purchaseOrder->isDraft();
    }

    /**
     * Receive PO items (partial or full).
     * PRD §6.3 — Admin, Manager, Staff.
     * PO must be in sent or partially_received state.
     */
    public function receive(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return $user->hasRole('admin', 'manager', 'staff')
            && in_array($purchaseOrder->status, ['sent', 'partially_received'], true);
    }

    /**
     * Cancel a PO.
     * PRD §6.3 — Admin and Manager only.
     * Cannot cancel a fully received PO.
     */
    public function cancel(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return $user->hasRole('admin', 'manager')
            && $purchaseOrder->status !== 'received';
    }

    /** Hard delete — Admin only, and only draft POs. */
    public function delete(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return $user->isAdmin() && $purchaseOrder->isDraft();
    }
}
