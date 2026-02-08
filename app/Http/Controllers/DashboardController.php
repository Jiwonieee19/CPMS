<?php

namespace App\Http\Controllers;

use App\Models\Process;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
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
                    ->whereRaw('LOWER(log_message) LIKE ?', ['%completed to fermented%'])
                    ->count(),
                'batch_dried' => DB::table('logs')
                    ->whereRaw('LOWER(log_message) LIKE ?', ['%completed to dried%'])
                    ->count(),
                'batch_graded' => DB::table('logs')
                    ->whereRaw('LOWER(log_message) LIKE ?', ['%graded%'])
                    ->where('log_type', 'process')
                    ->count(),
                'account_edited' => DB::table('logs')
                    ->where('log_type', 'account')
                    ->whereRaw('LOWER(log_message) LIKE ?', ['%updated%'])
                    ->count(),
                'account_added' => DB::table('logs')
                    ->where('log_type', 'account')
                    ->whereRaw('LOWER(log_message) LIKE ?', ['%new staff account%'])
                    ->orWhereRaw('LOWER(log_message) LIKE ?', ['%account added%'])
                    ->count(),
                'stock_added' => DB::table('logs')
                    ->whereRaw('LOWER(log_message) LIKE ?', ['%stock added%'])
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
