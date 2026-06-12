<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /** Admin + Manager can access. Staff cannot. */
    public function index(Request $request): Response
    {
        $query = User::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name',  'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($role = $request->input('role')) {
            $query->where('role', $role);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $users = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Users/Index', [
            'users'   => $users,
            'filters' => $request->only(['search', 'role', 'status']),
            'can'     => [
                'create' => in_array(auth()->user()->role, ['admin', 'manager']),
                'update' => in_array(auth()->user()->role, ['admin', 'manager']),
                'delete' => auth()->user()->role === 'admin',
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role'     => ['required', Rule::in(['admin', 'manager', 'staff'])],
            'is_active'=> ['boolean'],
        ]);

        // Managers cannot create admins
        if (auth()->user()->role === 'manager' && $data['role'] === 'admin') {
            abort(403, 'Managers cannot create admin accounts.');
        }

        User::create([
            'name'      => $data['name'],
            'email'     => $data['email'],
            'password'  => Hash::make($data['password']),
            'role'      => $data['role'],
            'status'    => ($data['is_active'] ?? true) ? 'active' : 'inactive',
        ]);

        return back()->with('success', "User \"{$data['name']}\" created successfully.");
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        // Managers cannot edit admins
        if (auth()->user()->role === 'manager' && $user->role === 'admin') {
            abort(403, 'Managers cannot edit admin accounts.');
        }

        $data = $request->validate([
            'name'      => ['required', 'string', 'max:255'],
            'email'     => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password'  => ['nullable', 'string', 'min:8'],
            'role'      => ['required', Rule::in(['admin', 'manager', 'staff'])],
            'is_active' => ['boolean'],
        ]);

        // Managers cannot promote anyone to admin
        if (auth()->user()->role === 'manager' && $data['role'] === 'admin') {
            abort(403, 'Managers cannot assign admin role.');
        }

        // Prevent the last admin from being demoted or deactivated
        if ($user->role === 'admin' && ($data['role'] !== 'admin' || !($data['is_active'] ?? true))) {
            $adminCount = User::where('role', 'admin')->where('status', 'active')->count();
            if ($adminCount <= 1) {
                return back()->withErrors(['role' => 'Cannot demote or deactivate the last active admin.']);
            }
        }

        $updateData = [
            'name'      => $data['name'],
            'email'     => $data['email'],
            'role'      => $data['role'],
            'status'    => ($data['is_active'] ?? true) ? 'active' : 'inactive',
        ];

        if (!empty($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
        }

        $user->update($updateData);

        return back()->with('success', "User \"{$user->name}\" updated.");
    }

    public function destroy(User $user): RedirectResponse
    {
        // Prevent self-deletion
        if ($user->id === auth()->id()) {
            return back()->withErrors(['delete' => 'You cannot delete your own account.']);
        }

        // Prevent last admin deletion
        if ($user->role === 'admin') {
            $adminCount = User::where('role', 'admin')->where('status', 'active')->count();
            if ($adminCount <= 1) {
                return back()->withErrors(['delete' => 'Cannot delete the last admin account.']);
            }
        }

        $name = $user->name;
        $user->update(['status' => 'inactive']);   // Soft-deactivate — never hard delete

        return back()->with('success', "\"{$name}\" has been deactivated.");
    }
}
