<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StaffsController;

Route::get('/', function () {
    return inertia('LoginPage');
});

Route::get('/dashboard', function () {
    return inertia('DashboardPage');
});

Route::get('/weather', function () {
    return inertia('LoginPage');
});

Route::get('/process', function () {
    return inertia('ProcessPage');
});

Route::get('/logs', function () {
    return inertia('LogsPage');
});

Route::get('/inventory', function () {
    return inertia('InventoryPage');
});

Route::get('/accounts', function () {
    return inertia('AccountsPage');
});

Route::get('/logout', function () {
    return inertia('LoginPage');
});

// API Routes (with CSRF protection)
Route::post('/api/staffs', [StaffsController::class, 'store']);
