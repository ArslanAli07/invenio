<?php

namespace App\Policies;

use App\Models\CustomerOrder;
use App\Models\User;

class CustomerOrderPolicy
{
    public function before(User $user, string $ability): bool|null
    {
        if (! $user->isActive()) {
            return false;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasRole('admin', 'manager', 'staff');
    }

    public function view(User $user, CustomerOrder $customerOrder): bool
    {
        return $user->hasRole('admin', 'manager', 'staff');
    }

    public function update(User $user, CustomerOrder $customerOrder): bool
    {
        return $user->hasRole('admin', 'manager');
    }

    public function cancel(User $user, CustomerOrder $customerOrder): bool
    {
        return $user->hasRole('admin', 'manager') && $customerOrder->canBeCancelled();
    }
}
