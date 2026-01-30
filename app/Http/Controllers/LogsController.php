<?php

namespace App\Http\Controllers;

use App\Models\Logs;
use Illuminate\Http\Request;

class LogsController extends Controller
{
    /**
     * Display logs filtered by type.
     */
    public function index(Request $request)
    {
        try {
            $type = $request->query('type');

            $query = Logs::query();

            if ($type) {
                switch ($type) {
                    case 'inventory':
                        $query->whereIn('log_type', ['inventory', 'equipment_alert', 'equipment_deduction']);
                        break;
                    case 'process':
                        $query->whereIn('log_type', ['process']);
                        break;
                    case 'account':
                        $query->whereIn('log_type', ['account']);
                        break;
                    case 'weather':
                        $query->whereIn('log_type', ['weather', 'weather_alert']);
                        break;
                    default:
                        break;
                }
            }

            $logs = $query->orderBy('created_at', 'desc')->get();

            $transformed = $logs->map(function ($log) {
                $createdAt = ($log->created_at ?? now())->setTimezone('Asia/Manila');
                return [
                    'id' => 'LOG-' . str_pad($log->id, 5, '0', STR_PAD_LEFT),
                    'log_id' => $log->id,
                    'task' => $log->log_message ?? 'Log entry',
                    'timeSaved' => $createdAt->format('h:i A'),
                    'date' => $createdAt->format('Y-m-d')
                ];
            });

            return response()->json([
                'message' => 'Logs retrieved successfully',
                'logs' => $transformed
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving logs: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display a specific log entry.
     */
    public function show($id)
    {
        try {
            $log = Logs::find($id);

            if (!$log) {
                return response()->json([
                    'message' => 'Log not found'
                ], 404);
            }

            $createdAt = ($log->created_at ?? now())->setTimezone('Asia/Manila');

            $typeLabel = match ($log->log_type) {
                'inventory', 'equipment_alert', 'equipment_deduction' => 'Inventory Log',
                'process' => 'Process Log',
                'account' => 'Account Log',
                'weather', 'weather_alert' => 'Weather Log',
                default => 'Log'
            };

            return response()->json([
                'message' => 'Log retrieved successfully',
                'log' => [
                    'id' => 'LOG-' . str_pad($log->id, 5, '0', STR_PAD_LEFT),
                    'task' => $log->log_message ?? 'Log entry',
                    'description' => $log->log_message ?? 'Log entry',
                    'timeSaved' => $createdAt->format('h:i A'),
                    'date' => $createdAt->format('Y-m-d'),
                    'type' => $typeLabel
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving log: ' . $e->getMessage()
            ], 500);
        }
    }
}