<?php

namespace App\Http\Controllers;

use App\Models\WeatherReports;
use App\Models\Logs;
use Illuminate\Http\Request;

class WeatherReportController extends Controller
{
    /**
     * Store a newly created weather report
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'report_message' => 'required|string|max:1000',
                'report_action' => 'nullable|string|max:255',
                'weather_id' => 'nullable|exists:weather_data,weather_id'
            ]);

            // Get authenticated staff_id from session or request
            $staffId = auth()->check() ? auth()->user()->id : null;

            $report = WeatherReports::create([
                'report_message' => $validated['report_message'],
                'report_date' => now()->format('Y-m-d'),
                'report_action' => $validated['report_action'] ?? null,
                'weather_id' => $validated['weather_id'] ?? null,
                'staff_id' => $staffId
            ]);

            // Extract optimal time from report_action for timestamp
            $optimalTime = 'N/A';
            if (isset($validated['report_action']) && preg_match('/Optimal Time:\s*([^,]+)/', $validated['report_action'], $matches)) {
                $optimalTime = trim($matches[1]);
            }

            Logs::create([
                'log_type' => 'weather',
                'log_message' => 'Weather report created: ' . substr($validated['report_message'], 0, 50) . '... | Action: ' . substr($validated['report_action'] ?? 'N/A', 0, 50) . ' | Timestamp: ' . $optimalTime,
                'task' => 'weather data notify',
                'created_at' => now()
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
