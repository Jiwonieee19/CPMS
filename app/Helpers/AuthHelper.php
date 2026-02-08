<?php

use Illuminate\Support\Facades\Session;

if (!function_exists('getCurrentUser')) {
    /**
     * Get the current authenticated user from session
     * 
     * @return array|null
     */
    function getCurrentUser() {
        return Session::get('user');
    }
}

if (!function_exists('getCurrentUserRole')) {
    /**
     * Get the current authenticated user's role
     * 
     * @return string
     */
    function getCurrentUserRole() {
        $user = Session::get('user');
        return $user ? ucfirst($user['staff_role'] ?? 'system') : 'System';
    }
}

if (!function_exists('getCurrentUserId')) {
    /**
     * Get the current authenticated user's ID
     * 
     * @return int|null
     */
    function getCurrentUserId() {
        $user = Session::get('user');
        return $user ? $user['staff_id'] ?? null : null;
    }
}
