<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class WeatherController extends Controller
{
    // Davao coordinates
    const DAVAO_LATITUDE = 7.0897;
    const DAVAO_LONGITUDE = 125.6127;
    const CACHE_DURATION = 600; // Cache for 10 minutes


    public function getWeather()
    {
        $response = Http::withOptions([
            'verify' => false, // local dev fix
        ])->get('https://api.weatherapi.com/v1/forecast.json', [
            'key'  => '01b1825f8453469cb2560127263001',
            'q'    => 'Davao City',
            'days' => 1,
        ]);

        return Inertia::render('WeatherPage', [
            'weather' => $response->json(),
        ]);
    }

    /**
     * Fetch hourly weather data from Open-Meteo API
     */
    public function getHourlyWeather()
    {
        try {
            // Try to get cached data first
            $cachedData = Cache::get('davao_weather_hourly');
            if ($cachedData) {
                return response()->json($cachedData);
            }

            // Fetch from Open-Meteo API
            $response = Http::get('https://api.open-meteo.com/v1/forecast', [
                'latitude' => self::DAVAO_LATITUDE,
                'longitude' => self::DAVAO_LONGITUDE,
                'hourly' => 'temperature_2m,relative_humidity_2m,wind_speed_10m',
                'timezone' => 'Asia/Manila',
                'forecast_days' => 1
            ]);

            dd($response->body());

            if ($response->failed()) {
                return response()->json([
                    'error' => 'Failed to fetch weather data'
                ], 500);
            }

            $data = $response->json();

            // Transform the data into hourly format
            $hourly = $data['hourly'];
            $times = $hourly['time'];
            $temperatures = $hourly['temperature_2m'];
            $humidities = $hourly['relative_humidity_2m'];
            $windSpeeds = $hourly['wind_speed_10m'];

            $formattedData = [];
            foreach ($times as $index => $time) {
                // Extract hour from ISO format time (YYYY-MM-DDTHH:MM)
                $hour = date('g', strtotime($time));
                $period = date('a', strtotime($time)); // am or pm
                $hourLabel = $hour . $period;

                // Handle 12am case
                if ($hour == 12 && $period == 'am') {
                    $hourLabel = '12am';
                } elseif ($hour == 12 && $period == 'pm') {
                    $hourLabel = '12pm';
                }

                $formattedData[] = [
                    'hour' => $hourLabel,
                    'temperature' => round($temperatures[$index], 1),
                    'humidity' => $humidities[$index],
                    'windSpeed' => round($windSpeeds[$index], 1)
                ];
            }

            // Cache the result
            Cache::put('davao_weather_hourly', $formattedData, self::CACHE_DURATION);

            return response()->json($formattedData);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching weather data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current weather for Davao
     */
    public function getCurrentWeather()
    {
        try {
            $cachedData = Cache::get('davao_weather_current');
            if ($cachedData) {
                return response()->json($cachedData);
            }

            $response = Http::get('https://api.open-meteo.com/v1/forecast', [
                'latitude' => self::DAVAO_LATITUDE,
                'longitude' => self::DAVAO_LONGITUDE,
                'current' => 'temperature_2m,relative_humidity_2m,wind_speed_10m',
                'timezone' => 'Asia/Manila'
            ]);

            if ($response->failed()) {
                return response()->json([
                    'error' => 'Failed to fetch weather data'
                ], 500);
            }

            $data = $response->json();
            $current = $data['current'];

            $formattedData = [
                'temperature' => $current['temperature_2m'],
                'humidity' => $current['relative_humidity_2m'],
                'windSpeed' => $current['wind_speed_10m'],
                'time' => $current['time']
            ];

            Cache::put('davao_weather_current', $formattedData, self::CACHE_DURATION);

            return response()->json($formattedData);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching current weather: ' . $e->getMessage()
            ], 500);
        }
    }
}
