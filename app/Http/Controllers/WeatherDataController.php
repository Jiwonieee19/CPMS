<?php

namespace App\Http\Controllers;

use App\Models\WeatherData;
use App\Models\Logs;
use Illuminate\Http\Request;

class WeatherDataController extends Controller
{
    /**
     * Store weather data
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'temperature' => 'required|numeric',
                'humidity' => 'required|numeric|between:0,100',
                'wind_speed' => 'required|numeric',
                'weather_condition' => 'required|string|max:100',
                'temperature_end' => 'nullable|numeric',
                'humidity_end' => 'nullable|numeric|between:0,100',
                'wind_speed_end' => 'nullable|numeric',
                'weather_condition_end' => 'nullable|string|max:100'
            ]);

            $weatherData = WeatherData::create([
                'data_date' => now()->format('Y-m-d'),
                'temperature' => $validated['temperature'],
                'humidity' => $validated['humidity'],
                'wind_speed' => $validated['wind_speed'],
                'weather_condition' => $validated['weather_condition'],
                'temperature_end' => $validated['temperature_end'] ?? null,
                'humidity_end' => $validated['humidity_end'] ?? null,
                'wind_speed_end' => $validated['wind_speed_end'] ?? null,
                'weather_condition_end' => $validated['weather_condition_end'] ?? null
            ]);

            // Build log message with ranges if end values exist
            $tempMsg = 'Temp ' . $validated['temperature'] . '°C';
            if (isset($validated['temperature_end'])) {
                $tempMsg .= ' - ' . $validated['temperature_end'] . '°C';
            }
            
            $humidityMsg = 'Humidity ' . $validated['humidity'] . '%';
            if (isset($validated['humidity_end'])) {
                $humidityMsg .= ' - ' . $validated['humidity_end'] . '%';
            }
            
            $windMsg = 'Wind Speed ' . $validated['wind_speed'] . ' m/s';
            if (isset($validated['wind_speed_end'])) {
                $windMsg .= ' - ' . $validated['wind_speed_end'] . ' m/s';
            }
            
            Logs::create([
                'log_type' => 'weather',
                'log_message' => 'Weather data recorded: ' . $tempMsg . ', ' . $humidityMsg . ', ' . $windMsg . ', Condition: ' . $validated['weather_condition'],
                'created_at' => now()
            ]);

            return response()->json([
                'message' => 'Weather data stored successfully',
                'data' => $weatherData
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error storing weather data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get latest weather data
     */
    public function getLatest()
    {
        try {
            $weatherData = WeatherData::orderBy('data_date', 'desc')
                ->first();

            return response()->json([
                'message' => 'Latest weather data retrieved',
                'data' => $weatherData
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving weather data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all weather data for a date range
     */
    public function getByDateRange(Request $request)
    {
        try {
            $validated = $request->validate([
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date'
            ]);

            $weatherData = WeatherData::whereBetween('data_date', [$validated['start_date'], $validated['end_date']])
                ->orderBy('data_date', 'desc')
                ->get();

            return response()->json([
                'message' => 'Weather data retrieved for date range',
                'data' => $weatherData
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving weather data: ' . $e->getMessage()
            ], 500);
        }
    }
}
