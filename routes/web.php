<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StaffsController;
use App\Http\Controllers\EquipmentsController;
use App\Http\Controllers\BatchesController;
use App\Http\Controllers\ProcessController;
use App\Http\Controllers\LogsController;
use App\Http\Controllers\WeatherController;

Route::get('/', function () {
    return inertia('LoginPage');
});

Route::get('/dashboard', function () {
    return inertia('DashboardPage');
});

//Route::get('/weather', function () {
  //  return inertia('WeatherPage');
//});


Route::get('/weather', [WeatherController::class, 'getWeather'])->name('weather');


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

// Staff Routes
Route::get('/staffs/list', [StaffsController::class, 'index'])->name('staffs.index');
Route::post('/staffs', [StaffsController::class, 'store'])->name('staffs.store');
Route::get('/staffs/{id}', [StaffsController::class, 'show'])->name('staffs.show');
Route::put('/staffs/{id}', [StaffsController::class, 'update'])->name('staffs.update');
Route::delete('/staffs/{id}', [StaffsController::class, 'destroy'])->name('staffs.destroy');

// Equipment Routes
Route::get('/equipments/list', [EquipmentsController::class, 'index'])->name('equipments.index');
Route::post('/equipments', [EquipmentsController::class, 'store'])->name('equipments.store');
Route::post('/equipments/{id}/stock-in', [EquipmentsController::class, 'stockIn'])->name('equipments.stockIn');

Route::post('/batches', [BatchesController::class, 'store'])->name('batches.store');
Route::get('/batches/list', [BatchesController::class, 'index'])->name('batches.index');
Route::get('/batches/dried', [BatchesController::class, 'getDried'])->name('batches.dried');

Route::post('/batches/{id}/proceed', [ProcessController::class, 'proceed'])->name('processes.proceed');
Route::get('/processes/list', [ProcessController::class, 'index'])->name('processes.index');
Route::post('/processes/{id}/complete', [ProcessController::class, 'complete'])->name('processes.complete');

Route::get('/logs/list', [LogsController::class, 'index'])->name('logs.index');
Route::get('/logs/{id}', [LogsController::class, 'show'])->name('logs.show');

// Weather Routes


Route::get('/weather/hourly', [WeatherController::class, 'getHourlyWeather'])->name('weather.hourly');
Route::get('/weather/current', [WeatherController::class, 'getCurrentWeather'])->name('weather.current');

// API Routes (with CSRF protection) - Deprecated, use the route above
Route::post('/api/staffs', [StaffsController::class, 'store']);
