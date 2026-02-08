<?php

namespace App\Http\Controllers;

use App\Models\WeatherAlert;
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
            $staffId = auth()->check() ? auth()->user()->id : null;

            // Format alert_action from postpone details
            $postponeDuration = $validated['postpone_duration'] ?? 'N/A';
            $postponeTimestamp = $validated['postpone_timestamp'] ?? 'N/A';
            $alertAction = 'Postpone Duration: ' . $postponeDuration . ' | Postpone Timestamp: ' . $postponeTimestamp;

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
                'log_message' => 'Weather alert created: ' . substr($validated['alert_message'], 0, 50) . '... | Severity: ' . $validated['alert_severity'] . ' | Postpone: ' . $postponeDuration . ' | Timestamp: ' . $postponeTimestamp,
                'task' => 'weather data alert',
                'created_at' => now()
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
