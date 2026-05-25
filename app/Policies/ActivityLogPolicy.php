<?php

namespace App\Policies;

use App\Models\ActivityLog;
use App\Models\User;

class ActivityLogPolicy
{
    public function before(User $user, string $ability): bool|null
    {
        if (! $user->isActive()) {
            return false;
        }

        return null;
    }

    /**
     * PRD §6.3 — View activity log: Admin and Manager.
     * Activity logs are read-only — no create/update/delete via UI.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('admin', 'manager');
    }

    public function view(User $user, ActivityLog $activityLog): bool
    {
        return $user->hasRole('admin', 'manager');
    }

    /** Logs are immutable — these always return false. */
    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, ActivityLog $activityLog): bool
    {
        return false;
    }

    public function delete(User $user, ActivityLog $activityLog): bool
    {
        return false;
    }
}
