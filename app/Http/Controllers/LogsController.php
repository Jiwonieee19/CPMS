<?php

namespace App\Http\Controllers;

use App\Models\Logs;
use Illuminate\Http\Request;

class LogsController extends Controller
{
    /**
     * Generate simplified task description from log message
     */
    private function getSimplifiedTask($logDescription, $logType, $logTask = null)
    {
        // Account logs
        if (stripos($logDescription, 'new staff account') !== false || stripos($logDescription, 'account added') !== false) {
            return 'Account Added';
        }
        if (stripos($logDescription, 'staff account updated') !== false || stripos($logDescription, 'account updated') !== false || stripos($logDescription, 'account edited') !== false || stripos($logDescription, 'staff account edited') !== false) {
            // Extract account ID and changes from log description
            $accId = '';
            $changes = '';
            
            if (preg_match('/\(acc-(\d+)\)/', $logDescription, $matches)) {
                $accId = 'acc-' . $matches[1];
            }
            
            if (preg_match('/\(edited: ([^)]+)\)/', $logDescription, $matches)) {
                $rawChanges = trim($matches[1]);
                // Extract just the field names, remove old->new values like "role:staff->quality analyst"
                $changes = preg_replace('/:[^,]+/', '', $rawChanges);
            }
            
            if ($accId && $changes) {
                return 'Account Edited: ' . $changes . ' ' . $accId;
            }
            
            return 'Account Edited';
        }
        if (stripos($logDescription, 'deactivated') !== false) {
            return 'Account Deactivated';
        }
        if (stripos($logDescription, 'reactivated') !== false || stripos($logDescription, 'activated') !== false) {
            return 'Account Reactivated';
        }

        // Inventory logs - Batch operations
        if (stripos($logDescription, 'fresh batch added') !== false) {
            return 'Fresh Batch Added';
        }
        if (stripos($logDescription, 'picked up') !== false) {
            return 'Batch Picked Up';
        }

        // Equipment operations
        if (stripos($logDescription, 'new equipment added') !== false) {
            return 'Equipment Added';
        }
        if (stripos($logDescription, 'stock-in') !== false || stripos($logDescription, 'stock added') !== false) {
            return 'Stock Added';
        }
        if (stripos($logDescription, 'deducted') !== false && $logType === 'equipment_deduction') {
            return 'Equipment Deducted';
        }

        // Equipment alerts
        if ($logType === 'equipment_alert') {
            if (stripos($logDescription, 'insufficient') !== false) {
                return 'Equipment Alert: Insufficient Stock';
            }
            return 'Equipment Alert';
        }

        // Process logs
        if (stripos($logDescription, 'proceeded to Fermenting') !== false) {
            return 'Batch Fermenting';
        }
        if (stripos($logDescription, 'completed to Fermented') !== false) {
            return 'Batch Fermented';
        }
        if (stripos($logDescription, 'proceeded to Drying') !== false) {
            return 'Batch Drying';
        }
        if (stripos($logDescription, 'completed to Dried') !== false) {
            return 'Batch Dried';
        }
        if (stripos($logDescription, 'graded') !== false) {
            return 'Batch Graded';
        }

        // Weather logs
        if ($logType === 'weather_alert') {
            if (stripos($logDescription, 'high temperature') !== false) {
                return 'Weather Alert: High Temperature';
            }
            if (stripos($logDescription, 'high humidity') !== false) {
                return 'Weather Alert: High Humidity';
            }
            if (stripos($logDescription, 'rain') !== false) {
                return 'Weather Alert: Rain Detected';
            }
            return 'Weather Alert';
        }
        if ($logType === 'weather') {
            if ($logTask === 'weather data alert') {
                return 'Weather Data Alert';
            }
            if ($logTask === 'weather data notify') {
                return 'Weather Data Notify';
            }
            return 'Weather Data Logged';
        }

        // Default fallback
        return 'Log Entry';
    }

    /**
     * Display logs filtered by type.
     */
    public function index(Request $request)
    {
        try {
            $type = $request->query('type');

            $query = Logs::query()->with('staff');

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
                // Get performer info from related staff member, or default to Admin
                $performedByRole = 'Admin';
                
                // If staff_id exists and staff relationship is loaded
                if ($log->staff_id && $log->staff) {
                    // Use the related staff member's lastname and role from database
                    $lastname = $log->staff->staff_lastname ?? 'Unknown';
                    $role = ucfirst($log->staff->staff_role ?? 'staff');
                    $performedByRole = "{$lastname} ({$role})";
                }
                
                return [
                    'id' => 'LOG-' . str_pad($log->log_id, 5, '0', STR_PAD_LEFT),
                    'log_id' => $log->log_id,
                    'task' => $this->getSimplifiedTask($log->log_description ?? '', $log->log_type ?? '', $log->log_task ?? null),
                    'batch_id' => $log->batch_id ? 'batch-' . str_pad($log->batch_id, 5, '0', STR_PAD_LEFT) : null,
                    'timeSaved' => $createdAt->format('Y-m-d h:i A'),
                    'date' => $createdAt->format('Y-m-d'),
                    'performedByRole' => $performedByRole
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
            $log = Logs::with('staff')->find($id);

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

            // Get performer info from related staff member, or default to Admin
            $performedByRole = 'Admin';
            
            // If staff_id exists and staff relationship is loaded
            if ($log->staff_id && $log->staff) {
                // Use the related staff member's lastname and role from database
                $lastname = $log->staff->staff_lastname ?? 'Unknown';
                $role = ucfirst($log->staff->staff_role ?? 'staff');
                $performedByRole = "{$lastname} ({$role})";
            }

            // For account logs, create formal description
            $description = $log->log_description ?? 'Log entry';
            if ($log->log_type === 'account' && stripos($log->log_description, 'updated') !== false) {
                // Parse log message for staff name, account ID, and changes
                $staffName = '';
                $accId = '';
                $changesFormatted = '';
                
                // Extract staff name
                if (preg_match('/Staff account updated: ([^(]+)/', $log->log_description, $matches)) {
                    $staffName = trim($matches[1]);
                }
                
                // Extract account ID
                if (preg_match('/\(acc-(\d+)\)/', $log->log_description, $matches)) {
                    $accId = $matches[1];
                }
                
                // Extract changes and format them
                if (preg_match('/\(edited: ([^)]+)\)/', $log->log_description, $matches)) {
                    $rawChanges = trim($matches[1]);
                    $changeList = explode(', ', $rawChanges);
                    $formattedChanges = [];
                    
                    foreach ($changeList as $change) {
                        if ($change === 'password') {
                            $formattedChanges[] = 'password';
                        } elseif (strpos($change, ':') !== false) {
                            // Format is "field:oldValue->newValue"
                            list($field, $values) = explode(':', $change, 2);
                            list($oldVal, $newVal) = explode('->', $values, 2);
                            $formattedChanges[] = "{$field} from {$oldVal} to {$newVal}";
                        }
                    }
                    
                    $changesFormatted = implode(', ', $formattedChanges);
                }
                
                // Create formal sentence description
                if ($staffName && $accId && $changesFormatted) {
                    $description = "The staff account of {$staffName} with account ID {$accId} has been updated. Changes made: {$changesFormatted}.";
                }
            }
            
            // For logs with batch_id, append or replace batch ID in description
            if ($log->batch_id) {
                $formattedBatchId = 'batch-' . str_pad($log->batch_id, 5, '0', STR_PAD_LEFT);
                
                // If the message mentions "fresh batch", replace with "fresh batch-00009"
                if (stripos($description, 'fresh batch') !== false) {
                    $description = preg_replace('/fresh batch(?!\-)/i', 'fresh ' . $formattedBatchId, $description);
                }
                // Else if it mentions standalone "batch", replace with "batch-00009"
                elseif (preg_match('/\bbatch\b(?!\-)/', $description)) {
                    $description = preg_replace('/\bbatch\b(?!\-)/', $formattedBatchId, $description);
                }
                // Otherwise, append the batch ID at the end
                else {
                    $description .= ' for ' . $formattedBatchId;
                }
            }

            // For weather logs, include timestamp and field details in description
            if (in_array($log->log_type, ['weather', 'weather_alert'])) {
                $baseMessage = $log->log_description;
                
                // Extract parts from message
                $message = '';
                $severity = '';
                $postpone = '';
                $action = '';
                $timestamp = '';
                
                if (preg_match('/^([^|]+)/', $baseMessage, $matches)) {
                    $message = trim($matches[1]);
                    // Remove trailing "..." if present
                    $message = rtrim($message, '.');
                }
                if (preg_match('/Severity:\s*([^ |]+)/', $baseMessage, $matches)) {
                    $severity = trim($matches[1]);
                }
                if (preg_match('/Postpone:\s*([^ |]+)/', $baseMessage, $matches)) {
                    $postpone = trim($matches[1]);
                }
                if (preg_match('/Action:\s*([^|]+)/', $baseMessage, $matches)) {
                    $action = trim($matches[1]);
                }
                if (preg_match('/Timestamp:\s*(.+)$/', $baseMessage, $matches)) {
                    $timestamp = trim($matches[1]);
                }
                
                // Determine if this is an alert or notify to set appropriate time label
                $timeLabel = ($log->log_task === 'weather data alert') ? 'Postpone Time:' : 'Drying Time:';
                
                // Format as multiple lines
                $description = $message . "\n";
                if ($severity || $postpone) {
                    $details = [];
                    if ($severity) $details[] = "Severity: " . $severity;
                    if ($postpone) $details[] = "Postpone: " . $postpone;
                    $description .= " " . implode(" , ", $details) . "\n";
                }
                // Only add time if we have a valid timestamp from the log
                if ($timestamp && $timestamp !== 'N/A' && !empty(trim($timestamp))) {
                    // Add spaces around dash in time range (2PM-7PM becomes 2PM - 7PM)
                    $timestamp = preg_replace('/(\d+(?::\d+)?(?:AM|PM|am|pm))-(\d+(?::\d+)?(?:AM|PM|am|pm))/i', '$1 - $2', $timestamp);
                    $description .= $timeLabel . " " . $timestamp;
                }
            }

            return response()->json([
                'message' => 'Log retrieved successfully',
                'log' => [
                    'id' => 'LOG-' . str_pad($log->log_id, 5, '0', STR_PAD_LEFT),
                    'task' => $log->log_description ?? 'Log entry',
                    'description' => $description,
                    'timeSaved' => $createdAt->format('Y-m-d h:i A'),
                    'date' => $createdAt->format('Y-m-d'),
                    'performedByRole' => $performedByRole,
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