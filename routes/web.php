<?php

use Illuminate\Support\Facades\Route;

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
    return inertia('LoginPage');
});

Route::get('/logs', function () {
    return inertia('LoginPage');
});

Route::get('/inventory', function () {
    return inertia('LoginPage');
});

Route::get('/accounts', function () {
    return inertia('LoginPage');
});
