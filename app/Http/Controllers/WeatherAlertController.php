<?php

namespace App\Http\Controllers;

use App\Models\WeatherAlert;
use App\Models\WeatherData;
use App\Models\Logs;
use Illuminate\Http\Request;

class WeatherAlertController extends Controller
{
    /**
     * Store a newly created weather alert
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'alert_message' => 'required|string|max:1000',
                'alert_severity' => 'nullable|string|in:low,medium,high',
                'postpone_duration' => 'nullable|string',
                'postpone_timestamp' => 'nullable|string',
                'weather_id' => 'nullable|exists:weather_data,weather_id'
            ]);

            // Get authenticated staff_id from session or request
            $currentUser = \Illuminate\Support\Facades\Session::get('user');
            $staffId = $currentUser['staff_id'] ?? (auth()->check() ? auth()->user()->id : null);
            if ($staffId === 0) {
                $staffId = null;
            }
            // Format alert_action from postpone details
            $postponeDuration = $validated['postpone_duration'] ?? 'N/A';
            $postponeTimestamp = $validated['postpone_timestamp'] ?? 'N/A';
            $alertAction = 'Postpone Duration: ' . $postponeDuration . ' | Postpone Timestamp: ' . $postponeTimestamp;

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

                    $weatherSummary = ' | Temp: ' . $tempRange . ' | Humidity: ' . $humidityRange . ' | Wind: ' . $windRange;
                }
            }

            $alert = WeatherAlert::create([
                'alert_message' => $validated['alert_message'],
                'alert_severity' => $validated['alert_severity'] ?? 'medium',
                'alert_action' => $alertAction,
                'alert_date' => now()->format('Y-m-d'),
                'weather_id' => $validated['weather_id'] ?? null,
                'staff_id' => $staffId
            ]);

            Logs::create([
                'log_type' => 'weather',
                'log_description' => 'Weather alert created: ' . substr($validated['alert_message'], 0, 50) . '... | Severity: ' . $validated['alert_severity'] . ' | Postpone: ' . $postponeDuration . $weatherSummary . ' | Timestamp: ' . $postponeTimestamp,
                'log_task' => 'weather data alert',
                'created_at' => now(),
                'staff_id' => $staffId
            ]);

            return response()->json([
                'message' => 'Weather alert created successfully',
                'alert' => $alert
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating weather alert: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all weather alerts
     */
    public function getActive()
    {
        try {
            $alerts = WeatherAlert::orderBy('alert_date', 'desc')->get();

            return response()->json([
                'message' => 'Weather alerts retrieved',
                'alerts' => $alerts
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving weather alerts: ' . $e->getMessage()
            ], 500);
        }
    }


}
