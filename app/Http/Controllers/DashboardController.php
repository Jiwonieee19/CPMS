<?php

namespace App\Http\Controllers;

use App\Models\Process;
use App\Models\BatchInventory;
use App\Models\EquipmentInventory;
use App\Models\Staffs;
use App\Models\WeatherAlert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get status information for dashboard
     */
    public function getStatus()
    {
        try {
            // Process Status: Check if there are any active processes today
            $activeProcessCount = Process::whereIn('process_status', ['Fermenting', 'Drying'])
                ->whereDate('created_at', today())
                ->count();
            $processStatus = $activeProcessCount > 0 ? 'Active' : 'Idle';
            $processColor = $activeProcessCount > 0 ? 'yellow' : 'gray';

            // Equipment Status: Check average equipment inventory levels
            $totalEquipments = EquipmentInventory::count();
            if ($totalEquipments > 0) {
                $lowStockCount = EquipmentInventory::where('quantity', '<', 30)->count();
                $normalStockCount = EquipmentInventory::whereBetween('quantity', [30, 59])->count();
                $highStockCount = EquipmentInventory::where('quantity', '>=', 60)->count();
                
                // Determine overall equipment status based on majority
                if ($lowStockCount >= $totalEquipments * 0.5) {
                    $equipmentStatus = 'Low';
                    $equipmentColor = 'red';
                } elseif ($highStockCount >= $totalEquipments * 0.5) {
                    $equipmentStatus = 'High';
                    $equipmentColor = 'green';
                } else {
                    $equipmentStatus = 'Normal';
                    $equipmentColor = 'yellow';
                }
            } else {
                $equipmentStatus = 'Unknown';
                $equipmentColor = 'gray';
            }

            // Staff Status: Check active staff count
            $activeStaffCount = Staffs::where('staff_status', 'active')->count();
            if ($activeStaffCount >= 20) {
                $staffStatus = 'High';
                $staffColor = 'green';
            } elseif ($activeStaffCount >= 10) {
                $staffStatus = 'Normal';
                $staffColor = 'yellow';
            } else {
                $staffStatus = 'Low';
                $staffColor = 'red';
            }

            // Weather Status: Check for recent weather alerts (last 24 hours)
            $recentHighAlerts = WeatherAlert::where('alert_severity', 'high')
                ->where('alert_date', '>=', now()->subDay())
                ->count();
            $recentMediumAlerts = WeatherAlert::where('alert_severity', 'medium')
                ->where('alert_date', '>=', now()->subDay())
                ->count();
            
            if ($recentHighAlerts > 0) {
                $weatherStatus = 'Alert';
                $weatherColor = 'red';
            } elseif ($recentMediumAlerts > 0) {
                $weatherStatus = 'Warning';
                $weatherColor = 'yellow';
            } else {
                $weatherStatus = 'Stable';
                $weatherColor = 'green';
            }

            return response()->json([
                'message' => 'Status information retrieved successfully',
                'data' => [
                    'process' => ['status' => $processStatus, 'color' => $processColor],
                    'equipment' => ['status' => $equipmentStatus, 'color' => $equipmentColor],
                    'staff' => ['status' => $staffStatus, 'color' => $staffColor],
                    'weather' => ['status' => $weatherStatus, 'color' => $weatherColor],
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get logs report statistics
     */
    public function getLogsReport()
    {
        try {
            $logsModel = \App\Models\Logs::class;
            
            // Count different log types/tasks
            $stats = [
                'batch_fermented' => DB::table('logs')
                    ->whereRaw('LOWER(log_description) LIKE ?', ['%completed to fermented%'])
                    ->count(),
                'batch_dried' => DB::table('logs')
                    ->whereRaw('LOWER(log_description) LIKE ?', ['%completed to dried%'])
                    ->count(),
                'batch_graded' => DB::table('logs')
                    ->whereRaw('LOWER(log_description) LIKE ?', ['%graded%'])
                    ->where('log_type', 'process')
                    ->count(),
                'account_edited' => DB::table('logs')
                    ->where('log_type', 'account')
                    ->whereRaw('LOWER(log_description) LIKE ?', ['%updated%'])
                    ->count(),
                'account_added' => DB::table('logs')
                    ->where('log_type', 'account')
                    ->whereRaw('LOWER(log_description) LIKE ?', ['%new staff account%'])
                    ->orWhereRaw('LOWER(log_description) LIKE ?', ['%account added%'])
                    ->count(),
                'stock_added' => DB::table('logs')
                    ->whereRaw('LOWER(log_description) LIKE ?', ['%stock added%'])
                    ->count()
            ];
            
            return response()->json([
                'message' => 'Logs report retrieved successfully',
                'data' => $stats
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving logs report: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get process overview statistics for the last 6 days
     */
    public function getProcessOverview()
    {
        try {
            $data = [];
            
            // Get data for the last 6 days (5 days ago to today)
            for ($i = 5; $i >= 0; $i--) {
                $date = now()->subDays($i);
                $dayName = $i === 0 ? 'TODAY' : strtoupper($date->format('D'));
                
                // Count batches in Fermenting status created on this day
                $fermenting = Process::whereDate('created_at', $date->format('Y-m-d'))
                    ->where('process_status', 'Fermenting')
                    ->count();
                
                // Count batches in Drying status created on this day
                $drying = Process::whereDate('created_at', $date->format('Y-m-d'))
                    ->where('process_status', 'Drying')
                    ->count();
                
                $data[] = [
                    'day' => $dayName,
                    'drying' => $drying,
                    'fermenting' => $fermenting
                ];
            }
            
            return response()->json([
                'message' => 'Process overview retrieved successfully',
                'data' => $data
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving process overview: ' . $e->getMessage()
            ], 500);
        }
    }
}
