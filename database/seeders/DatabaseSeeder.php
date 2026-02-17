<?php

namespace Database\Seeders;

use App\Models\BatchInventory;
use App\Models\Batches;
use App\Models\EquipmentInventory;
use App\Models\Equipments;
use App\Models\Logs;
use App\Models\Process;
use App\Models\Staffs;
use App\Models\User;
use App\Models\WeatherAlert;
use App\Models\WeatherData;
use App\Models\WeatherReports;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Demo data disabled
        /*
        $now = Carbon::now();

        if (DB::table('users')->count() === 0) {
            User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);
        }

        if (DB::table('staffs')->count() === 0) {
            $staffProfiles = [
                [
                    'staff_firstname' => 'Alicia',
                    'staff_lastname' => 'Santos',
                    'staff_role' => 'inventory manager',
                    'staff_email' => 'inventory@cacao.local',
                    'staff_contact' => '09170000001'
                ],
                [
                    'staff_firstname' => 'Ben',
                    'staff_lastname' => 'Reyes',
                    'staff_role' => 'process manager',
                    'staff_email' => 'process@cacao.local',
                    'staff_contact' => '09170000002'
                ],
                [
                    'staff_firstname' => 'Clara',
                    'staff_lastname' => 'Dizon',
                    'staff_role' => 'quality analyst',
                    'staff_email' => 'quality@cacao.local',
                    'staff_contact' => '09170000003'
                ],
                [
                    'staff_firstname' => 'Diego',
                    'staff_lastname' => 'Cruz',
                    'staff_role' => 'weather analyst',
                    'staff_email' => 'weather@cacao.local',
                    'staff_contact' => '09170000004'
                ],
                [
                    'staff_firstname' => 'Emma',
                    'staff_lastname' => 'Velasquez',
                    'staff_role' => 'account manager',
                    'staff_email' => 'accounts@cacao.local',
                    'staff_contact' => '09170000005'
                ],
            ];

            $staffByRole = [];
            foreach ($staffProfiles as $profile) {
                $staff = Staffs::create([
                    ...$profile,
                    'staff_password' => Hash::make('password123'),
                    'staff_status' => 'active'
                ]);
                $staffByRole[$profile['staff_role']] = $staff;
            }
        } else {
            $staffByRole = Staffs::all()->keyBy('staff_role');
        }

        if (DB::table('equipments')->count() === 0) {
            $equipmentSpecs = [
                ['name' => 'Drying Rack', 'type' => 'rack', 'quantity' => 120],
                ['name' => 'Fermentation Sack', 'type' => 'sack', 'quantity' => 80],
                ['name' => 'Grading Boxes', 'type' => 'boxes', 'quantity' => 40],
                ['name' => 'Storage Box', 'type' => 'box', 'quantity' => 25],
            ];

            foreach ($equipmentSpecs as $spec) {
                $equipment = Equipments::create([
                    'equipment_name' => $spec['name'],
                    'equipment_type' => $spec['type'],
                    'created_at' => $now->copy()->subDays(7)
                ]);

                EquipmentInventory::create([
                    'equipment_id' => $equipment->equipment_id,
                    'equipment_status' => EquipmentInventory::statusFromQuantity($spec['quantity']),
                    'quantity' => $spec['quantity'],
                    'created_at' => $now->copy()->subDays(7),
                    'updated_at' => $now->copy()->subDays(1)
                ]);
            }
        }

        if (DB::table('equipment_inventory')->count() > 0 && DB::table('equipment_stock_in_line')->count() === 0) {
            $inventoryIds = DB::table('equipment_inventory')->pluck('equipment_inventory_id');
            foreach ($inventoryIds as $inventoryId) {
                DB::table('equipment_stock_in_line')->insert([
                    'equipment_inventory_id' => $inventoryId,
                    'supplier_name' => 'Local Supplier Co.',
                    'stock_in_weight' => 50,
                    'stock_in_date' => $now->copy()->subDays(6)
                ]);
            }

            $firstInventoryId = $inventoryIds->first();
            if ($firstInventoryId) {
                DB::table('equipment_stock_out_line')->insert([
                    'equipment_inventory_id' => $firstInventoryId,
                    'stock_out_quantity' => 15,
                    'stock_out_date' => $now->copy()->subDays(2)
                ]);
            }
        }

        if (DB::table('batches')->count() === 0) {
            $batchSpecs = [
                ['condition' => 'Fresh', 'weight' => 520.5, 'status' => 'Fresh', 'daysAgo' => 1],
                ['condition' => 'Fresh', 'weight' => 480.0, 'status' => 'Fermenting', 'daysAgo' => 3],
                ['condition' => 'Fermenting', 'weight' => 410.25, 'status' => 'Drying', 'daysAgo' => 6],
                ['condition' => 'Drying', 'weight' => 350.75, 'status' => 'Dried', 'daysAgo' => 9],
                ['condition' => 'Dried', 'weight' => 300.0, 'status' => 'Graded', 'daysAgo' => 12],
            ];

            foreach ($batchSpecs as $spec) {
                $harvestDate = $now->copy()->subDays($spec['daysAgo'])->setTime(7, 30);
                $batch = Batches::create([
                    'harvest_date' => $harvestDate,
                    'initial_condition' => $spec['condition'],
                    'initial_weight' => $spec['weight'],
                    'created_at' => $harvestDate
                ]);

                $inventory = BatchInventory::create([
                    'batch_id' => $batch->batch_id,
                    'batch_weight' => $spec['weight'],
                    'batch_status' => $spec['status'],
                    'created_at' => $harvestDate,
                    'updated_at' => $now->copy()->subDays(1)
                ]);

                if ($spec['status'] === 'Fresh') {
                    DB::table('batch_stock_in_line')->insert([
                        'batch_inventory_id' => $inventory->batch_inventory_id,
                        'supplier_name' => 'Cooperative Farm',
                        'stock_in_weight' => $spec['weight'],
                        'stock_in_date' => $harvestDate
                    ]);
                }

                if (in_array($spec['status'], ['Fermenting', 'Drying'])) {
                    Process::create([
                        'batch_id' => $batch->batch_id,
                        'process_status' => $spec['status'],
                        'created_at' => $harvestDate
                    ]);
                }
            }
        }

        if (DB::table('weather_data')->count() === 0) {
            $weatherEntries = [
                ['temp' => 28.5, 'temp_end' => 30.2, 'humidity' => 70, 'humidity_end' => 76, 'wind' => 10.5, 'wind_end' => 12.0, 'condition' => 'cloudy'],
                ['temp' => 31.0, 'temp_end' => 33.5, 'humidity' => 62, 'humidity_end' => 68, 'wind' => 11.0, 'wind_end' => 14.2, 'condition' => 'sunny'],
                ['temp' => 27.2, 'temp_end' => 28.7, 'humidity' => 80, 'humidity_end' => 85, 'wind' => 8.2, 'wind_end' => 9.1, 'condition' => 'rainy'],
                ['temp' => 29.1, 'temp_end' => 30.1, 'humidity' => 72, 'humidity_end' => 74, 'wind' => 9.7, 'wind_end' => 11.4, 'condition' => 'windy'],
                ['temp' => 26.8, 'temp_end' => 27.5, 'humidity' => 78, 'humidity_end' => 82, 'wind' => 7.5, 'wind_end' => 8.0, 'condition' => 'cloudy'],
            ];

            foreach ($weatherEntries as $index => $entry) {
                WeatherData::create([
                    'data_date' => $now->copy()->subDays(4 - $index)->format('Y-m-d'),
                    'temperature' => $entry['temp'],
                    'temperature_end' => $entry['temp_end'],
                    'humidity' => $entry['humidity'],
                    'humidity_end' => $entry['humidity_end'],
                    'wind_speed' => $entry['wind'],
                    'wind_speed_end' => $entry['wind_end'],
                    'weather_condition' => $entry['condition'],
                    'weather_condition_end' => $entry['condition']
                ]);
            }
        }

        $weatherIds = WeatherData::orderBy('weather_id')->pluck('weather_id');

        if ($weatherIds->count() > 0 && DB::table('weather_reports')->count() === 0) {
            WeatherReports::create([
                'report_message' => 'Good drying conditions expected by mid-afternoon.',
                'report_date' => $now->copy()->format('Y-m-d'),
                'report_action' => 'Max Duration: 4 hours, Optimal Time: 1PM-5PM',
                'weather_id' => $weatherIds->first(),
                'staff_id' => $staffByRole['weather analyst']->staff_id ?? null
            ]);

            WeatherReports::create([
                'report_message' => 'Humidity spike likely after 6PM; cover drying racks.',
                'report_date' => $now->copy()->subDay()->format('Y-m-d'),
                'report_action' => 'Max Duration: 3 hours, Optimal Time: 9AM-12PM',
                'weather_id' => $weatherIds->get(1),
                'staff_id' => $staffByRole['weather analyst']->staff_id ?? null
            ]);
        }

        if ($weatherIds->count() > 0 && DB::table('weather_alerts')->count() === 0) {
            WeatherAlert::create([
                'alert_message' => 'High humidity detected; move batches indoors.',
                'alert_severity' => 'high',
                'alert_action' => 'Postpone Duration: 2 | Postpone Timestamp: 2PM-4PM',
                'alert_date' => $now->copy()->format('Y-m-d'),
                'weather_id' => $weatherIds->last(),
                'staff_id' => $staffByRole['weather analyst']->staff_id ?? null
            ]);

            WeatherAlert::create([
                'alert_message' => 'Light rain expected; delay drying.',
                'alert_severity' => 'medium',
                'alert_action' => 'Postpone Duration: 1 | Postpone Timestamp: 3PM-4PM',
                'alert_date' => $now->copy()->subDay()->format('Y-m-d'),
                'weather_id' => $weatherIds->get(2),
                'staff_id' => $staffByRole['weather analyst']->staff_id ?? null
            ]);
        }

        if (DB::table('logs')->count() === 0) {
            $logs = [
                [
                    'log_type' => 'account',
                    'log_description' => 'New staff account created: Alicia Santos',
                    'staff_id' => $staffByRole['account manager']->staff_id ?? null,
                    'created_at' => $now->copy()->subDays(5)
                ],
                [
                    'log_type' => 'inventory',
                    'log_description' => 'New equipment added: Drying Rack (Qty: 120)',
                    'staff_id' => $staffByRole['inventory manager']->staff_id ?? null,
                    'created_at' => $now->copy()->subDays(4)
                ],
                [
                    'log_type' => 'process',
                    'log_description' => 'Batch BATCH-00002 proceeded to Fermenting',
                    'batch_id' => 2,
                    'staff_id' => $staffByRole['process manager']->staff_id ?? null,
                    'created_at' => $now->copy()->subDays(3)
                ],
                [
                    'log_type' => 'process',
                    'log_description' => 'Batch BATCH-00003 proceeded to Drying',
                    'batch_id' => 3,
                    'staff_id' => $staffByRole['process manager']->staff_id ?? null,
                    'created_at' => $now->copy()->subDays(2)
                ],
                [
                    'log_type' => 'inventory',
                    'log_description' => 'Batch BATCH-00005 graded - Grade A: 120, Grade B: 60, Reject: 12',
                    'batch_id' => 5,
                    'staff_id' => $staffByRole['quality analyst']->staff_id ?? null,
                    'created_at' => $now->copy()->subDay()
                ],
                [
                    'log_type' => 'weather',
                    'log_description' => 'Weather report created: Good drying conditions expected by mid-afternoon...',
                    'log_task' => 'weather data notify',
                    'staff_id' => $staffByRole['weather analyst']->staff_id ?? null,
                    'created_at' => $now->copy()->subDay()
                ],
                [
                    'log_type' => 'weather',
                    'log_description' => 'Weather alert created: High humidity detected; move batches indoors...',
                    'log_task' => 'weather data alert',
                    'staff_id' => $staffByRole['weather analyst']->staff_id ?? null,
                    'created_at' => $now->copy()->subHours(6)
                ],
            ];

            foreach ($logs as $log) {
                Logs::create([
                    ...$log,
                    'updated_at' => $log['created_at'] ?? $now
                ]);
            }
        }
        */
    }
}
