<?php

namespace App\Http\Controllers;

use App\Models\WeatherReports;
use App\Models\WeatherData;
use App\Models\Staffs;
use App\Models\Logs;
use Illuminate\Http\Request;

class WeatherReportController extends Controller
{
    private function resolveStaffId(): ?int
    {
        $currentUser = \Illuminate\Support\Facades\Session::get('user');
        $staffId = $currentUser['staff_id'] ?? null;

        if (!$staffId || (int) $staffId === 0) {
            return null;
        }

        return Staffs::where('staff_id', (int) $staffId)->exists()
            ? (int) $staffId
            : null;
    }

    /**
     * Store a newly created weather report
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'report_message' => 'required|string|max:1000',
                'max_duration' => 'required|integer|between:1,12',
                'optimal_time' => ['required', 'string', 'regex:/^\d{1,2}(:\d{2})?(AM|PM)-\d{1,2}(:\d{2})?(AM|PM)$/'],
                'weather_id' => 'nullable|exists:weather_data,weather_id'
            ]);

            $reportAction = 'Max Duration: ' . $validated['max_duration'] . ', Optimal Time: ' . $validated['optimal_time'];

            $staffId = $this->resolveStaffId();

            $report = WeatherReports::create([
                'report_message' => $validated['report_message'],
                'report_date' => now()->format('Y-m-d'),
                'report_action' => $reportAction,
                'weather_id' => $validated['weather_id'] ?? null,
                'staff_id' => $staffId
            ]);

            $optimalTime = $validated['optimal_time'];

            $weatherSummary = '';
            if (!empty($validated['weather_id'])) {
                $weatherData = WeatherData::find($validated['weather_id']);
                if ($weatherData) {
                    $tempRange = $weatherData->temperature_end !== null
                        ? $weatherData->temperature . '°C - ' . $weatherData->temperature_end . '°C'
                        : $weatherData->temperature . '°C';
                    $humidityRange = $weatherData->humidity_end !== null
                        ? $weatherData->humidity . '% - ' . $weatherData->humidity_end . '%'
                        : $weatherData->humidity . '%';
                    $windRange = $weatherData->wind_speed_end !== null
                        ? $weatherData->wind_speed . ' m/s - ' . $weatherData->wind_speed_end . ' m/s'
                        : $weatherData->wind_speed . ' m/s';

                    $weatherSummary = "\nTemperature: {$tempRange}\nHumidity: {$humidityRange}\nWind: {$windRange}";
                }
            }

            Logs::create([
                'log_type' => 'weather',
                'log_description' => 'Weather Report Created: ' . $validated['report_message']
                    . $weatherSummary
                    . "\nDrying Time: " . $optimalTime,
                'log_task' => 'weather data notify',
                'created_at' => now(),
                'staff_id' => $staffId
            ]);

            return response()->json([
                'message' => 'Weather report created successfully',
                'report' => $report
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating weather report: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all weather reports
     */
    public function getAll()
    {
        try {
            $reports = WeatherReports::orderBy('report_date', 'desc')
                ->get();

            return response()->json([
                'message' => 'Weather reports retrieved',
                'reports' => $reports
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving weather reports: ' . $e->getMessage()
            ], 500);
        }
    }
}
