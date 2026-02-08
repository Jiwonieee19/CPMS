<?php

namespace App\Http\Controllers;

use App\Models\Logs;
use Illuminate\Http\Request;

class LogsController extends Controller
{
    /**
     * Generate simplified task description from log message
     */
    private function getSimplifiedTask($logMessage, $logType, $task = null)
    {
        // Account logs
        if (stripos($logMessage, 'new staff account') !== false || stripos($logMessage, 'account added') !== false) {
            return 'Account Added';
        }
        if (stripos($logMessage, 'staff account updated') !== false || stripos($logMessage, 'account updated') !== false || stripos($logMessage, 'account edited') !== false || stripos($logMessage, 'staff account edited') !== false) {
            // Extract account ID and changes from log message
            $accId = '';
            $changes = '';
            
            if (preg_match('/\(acc-(\d+)\)/', $logMessage, $matches)) {
                $accId = 'acc-' . $matches[1];
            }
            
            if (preg_match('/\(edited: ([^)]+)\)/', $logMessage, $matches)) {
                $rawChanges = trim($matches[1]);
                // Extract just the field names, remove old->new values like "role:staff->quality analyst"
                $changes = preg_replace('/:[^,]+/', '', $rawChanges);
            }
            
            if ($accId && $changes) {
                return 'Account Edited: ' . $changes . ' ' . $accId;
            }
            
            return 'Account Edited';
        }
        if (stripos($logMessage, 'deactivated') !== false) {
            return 'Account Deactivated';
        }
        if (stripos($logMessage, 'reactivated') !== false || stripos($logMessage, 'activated') !== false) {
            return 'Account Reactivated';
        }

        // Inventory logs - Batch operations
        if (stripos($logMessage, 'fresh batch added') !== false) {
            return 'Fresh Batch Added';
        }
        if (stripos($logMessage, 'picked up') !== false) {
            return 'Batch Picked Up';
        }

        // Equipment operations
        if (stripos($logMessage, 'new equipment added') !== false) {
            return 'Equipment Added';
        }
        if (stripos($logMessage, 'stock-in') !== false || stripos($logMessage, 'stock added') !== false) {
            return 'Stock Added';
        }
        if (stripos($logMessage, 'deducted') !== false && $logType === 'equipment_deduction') {
            return 'Equipment Deducted';
        }

        // Equipment alerts
        if ($logType === 'equipment_alert') {
            if (stripos($logMessage, 'insufficient') !== false) {
                return 'Equipment Alert: Insufficient Stock';
            }
            return 'Equipment Alert';
        }

        // Process logs
        if (stripos($logMessage, 'proceeded to Fermenting') !== false) {
            return 'Batch Fermenting';
        }
        if (stripos($logMessage, 'completed to Fermented') !== false) {
            return 'Batch Fermented';
        }
        if (stripos($logMessage, 'proceeded to Drying') !== false) {
            return 'Batch Drying';
        }
        if (stripos($logMessage, 'completed to Dried') !== false) {
            return 'Batch Dried';
        }
        if (stripos($logMessage, 'graded') !== false) {
            return 'Batch Graded';
        }

        // Weather logs
        if ($logType === 'weather_alert') {
            if (stripos($logMessage, 'high temperature') !== false) {
                return 'Weather Alert: High Temperature';
            }
            if (stripos($logMessage, 'high humidity') !== false) {
                return 'Weather Alert: High Humidity';
            }
            if (stripos($logMessage, 'rain') !== false) {
                return 'Weather Alert: Rain Detected';
            }
            return 'Weather Alert';
        }
        if ($logType === 'weather') {
            if ($task === 'weather data alert') {
                return 'Weather Data Alert';
            }
            if ($task === 'weather data notify') {
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
                // Get role from related staff member, or fall back to performed_by_role or 'Admin'
                $performedByRole = 'Admin';  // Default to Admin when staff is not explicitly set
                
                // NULL staff_id means it was the static admin (converted from staff_id=0)
                if ($log->staff_id === null) {
                    $performedByRole = 'Admin';
                } elseif ($log->staff_id === 0) {
                    // Legacy: direct staff_id=0 (shouldn't happen with new code)
                    $performedByRole = 'Admin';
                } elseif ($log->staff) {
                    // Use the related staff member's role from database
                    $performedByRole = ucfirst($log->staff->staff_role ?? 'Admin');
                } elseif ($log->performed_by_role) {
                    // Fall back to performed_by_role field if it exists
                    $performedByRole = $log->performed_by_role;
                }
                
                return [
                    'id' => 'LOG-' . str_pad($log->log_id, 5, '0', STR_PAD_LEFT),
                    'log_id' => $log->log_id,
                    'task' => $this->getSimplifiedTask($log->log_message ?? '', $log->log_type ?? '', $log->task ?? null),
                    'batch_id' => $log->batch_id ? 'batch-' . str_pad($log->batch_id, 5, '0', STR_PAD_LEFT) : null,
                    'timeSaved' => $createdAt->format('Y-m-d H:i A'),
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

            // Get role from related staff member, or fall back to performed_by_role or 'Admin'
            $performedByRole = 'Admin';  // Default to Admin when staff is not explicitly set
            
            // NULL staff_id means it was the static admin (converted from staff_id=0)
            if ($log->staff_id === null) {
                $performedByRole = 'Admin';
            } elseif ($log->staff_id === 0) {
                // Legacy: direct staff_id=0 (shouldn't happen with new code)
                $performedByRole = 'Admin';
            } elseif ($log->staff) {
                // Use the related staff member's role from database
                $performedByRole = ucfirst($log->staff->staff_role ?? 'Admin');
            } elseif ($log->performed_by_role) {
                // Fall back to performed_by_role field if it exists
                $performedByRole = $log->performed_by_role;
            }

            // For account logs, create formal description
            $description = $log->log_message ?? 'Log entry';
            if ($log->log_type === 'account' && stripos($log->log_message, 'updated') !== false) {
                // Parse log message for staff name, account ID, and changes
                $staffName = '';
                $accId = '';
                $changesFormatted = '';
                
                // Extract staff name
                if (preg_match('/Staff account updated: ([^(]+)/', $log->log_message, $matches)) {
                    $staffName = trim($matches[1]);
                }
                
                // Extract account ID
                if (preg_match('/\(acc-(\d+)\)/', $log->log_message, $matches)) {
                    $accId = $matches[1];
                }
                
                // Extract changes and format them
                if (preg_match('/\(edited: ([^)]+)\)/', $log->log_message, $matches)) {
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
                $baseMessage = $log->log_message;
                
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
                $timeLabel = ($log->task === 'weather data alert') ? 'Postpone Time:' : 'Drying Time:';
                
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
                    'task' => $log->log_message ?? 'Log entry',
                    'description' => $description,
                    'timeSaved' => $createdAt->format('Y-m-d H:i A'),
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