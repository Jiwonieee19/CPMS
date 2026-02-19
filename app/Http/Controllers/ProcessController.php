<?php

namespace App\Http\Controllers;

use App\Models\Batches;
use App\Models\BatchTransferLine;
use App\Models\Process;
use App\Models\BatchInventory;
use App\Models\Equipments;
use App\Models\EquipmentInventory;
use App\Models\EquipmentTransferLine;
use App\Models\Logs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProcessController extends Controller
{
    /**
     * Display a listing of processes (Fermenting and Drying)
     */
    public function index()
    {
        try {
            $processes = Process::with('batch.inventory')
                ->whereIn('process_status', ['Fermenting', 'Drying'])
                ->get();
            
            $transformedProcesses = $processes->map(function ($process) {
                $batch = $process->batch;
                $inventory = $batch ? $batch->inventory : null;
                
                // Calculate day count (days since process created) starting from Day 1
                if ($process->created_at) {
                    $createdDate = \Carbon\Carbon::parse($process->created_at);
                    $daysElapsed = (int) $createdDate->diffInDays(now());
                    $dayCount = max(1, $daysElapsed + 1);
                } else {
                    $dayCount = 1;
                }
                
                // Get the number of racks used for this batch from equipment deduction logs
                $rackEquipment = Equipments::where('equipment_type', 'rack')->first();
                $racksUsed = 0;
                
                if ($rackEquipment) {
                    // Sum up all rack deductions for this batch
                    $rackDeductionLogs = Logs::where('batch_id', $process->batch_id)
                        ->where('equipment_id', $rackEquipment->equipment_id)
                        ->where('log_type', 'equipment_deduction')
                        ->get();
                    
                    foreach ($rackDeductionLogs as $log) {
                        // Extract quantity from log description (e.g., "Deducted 4 rack for processing")
                        preg_match('/Deducted (\d+)/', $log->log_description, $matches);
                        if (isset($matches[1])) {
                            $racksUsed += (int)$matches[1];
                        }
                    }
                }
                
                return [
                    'id' => 'BATCH-' . str_pad($process->batch_id, 5, '0', STR_PAD_LEFT),
                    'dayCount' => $dayCount,
                    'racks' => $racksUsed,
                    'status' => $process->process_status,
                    'process_id' => $process->process_id,
                    'batch_id' => $process->batch_id
                ];
            });
            
            return response()->json([
                'message' => 'Processes retrieved successfully',
                'processes' => $transformedProcesses
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving processes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate equipment requirements based on batch weight and status
     */
    private function calculateEquipmentNeeds($batchWeight, $status)
    {
        $needs = [];
        
        if ($status === 'Fresh') {
            // 1 sack per 50kg, then 2 racks per 1 sack (for Fermenting)
            $sacksNeeded = ceil($batchWeight / 50);
            $needs['rack'] = $sacksNeeded * 2;
        }
        
        return $needs;
    }

    /**
     * Deduct equipment from inventory
     */
    private function findEquipmentByType($equipmentType)
    {
        $type = strtolower($equipmentType);
        $type = rtrim($type, 's');
        $equipment = Equipments::where('equipment_type', $type)->first();

        if (!$equipment) {
            $equipment = Equipments::whereRaw('LOWER(equipment_name) LIKE ?', ['%' . $type . '%'])->first();
        }

        return $equipment;
    }

    private function deductEquipment($equipmentType, $quantity)
    {
        $equipment = $this->findEquipmentByType($equipmentType);

        if (!$equipment) {
            throw new \RuntimeException("EQUIPMENT_NOT_FOUND|{$equipmentType}");
        }

        $equipmentInventory = EquipmentInventory::where('equipment_id', $equipment->equipment_id)->first();

        if (!$equipmentInventory) {
            throw new \RuntimeException("EQUIPMENT_INVENTORY_NOT_FOUND|{$equipmentType}");
        }

        $availableQuantity = (int)($equipmentInventory->quantity ?? $equipmentInventory->equipment_status ?? 0);

        if ($availableQuantity < $quantity) {
            throw new \RuntimeException("INSUFFICIENT_EQUIPMENT|{$equipmentType}|{$quantity}|{$availableQuantity}");
        }

        $equipmentInventory->quantity = $availableQuantity - $quantity;
        $equipmentInventory->equipment_status = EquipmentInventory::statusFromQuantity((int)$equipmentInventory->quantity);
        $equipmentInventory->save();

        return [
            'equipment' => $equipment,
            'quantity' => $quantity
        ];
    }

    /**
     * Proceed batch to processing stage with equipment deduction
     */
    public function proceed(Request $request, $batchId)
    {
        try {
            $validated = $request->validate([
                'batch_id' => 'required|integer'
            ]);

            // Find batch
            $batch = Batches::findOrFail($batchId);
            
            // Get batch inventory to check status
            $inventory = BatchInventory::where('batch_id', $batchId)->first();
            
            if (!$inventory) {
                return response()->json([
                    'message' => 'Batch inventory not found'
                ], 404);
            }

            // Determine next status based on current status
            $currentStatus = $inventory->batch_status;
            
            if ($currentStatus === 'Fresh') {
                $nextStatus = 'Fermenting';
            } elseif ($currentStatus === 'Fermented') {
                $nextStatus = 'Drying';
            } else {
                return response()->json([
                    'message' => 'Only Fresh or Fermented batches can proceed to processing'
                ], 422);
            }

            DB::beginTransaction();

            try {
                // Create process record first
                $process = Process::create([
                    'batch_id' => $batchId,
                    'process_status' => $nextStatus,
                    'created_at' => now()
                ]);

                // Calculate equipment needs based on batch weight and current status
                $batchWeight = $inventory->batch_weight;
                $equipmentNeeds = $this->calculateEquipmentNeeds($batchWeight, $currentStatus);

                $deductions = [];

                // Deduct equipment from inventory
                foreach ($equipmentNeeds as $equipmentType => $quantityNeeded) {
                    $deductions[] = $this->deductEquipment($equipmentType, $quantityNeeded);
                }

                foreach ($deductions as $deduction) {
                    $equipmentInventory = EquipmentInventory::where('equipment_id', $deduction['equipment']->equipment_id)->first();

                    if ($equipmentInventory) {
                        EquipmentTransferLine::create([
                            'equipment_inventory_id' => $equipmentInventory->equipment_inventory_id,
                            'equipment_transfer_quantity' => $deduction['quantity'],
                            'equipment_transfer_date' => now(),
                            'equipment_transfer_from' => $currentStatus,
                            'equipment_transfer_to' => $nextStatus,
                        ]);
                    }
                }

                // Update batch inventory status
                $inventory->batch_status = $nextStatus;
                $inventory->save();

                BatchTransferLine::create([
                    'batch_inventory_id' => $inventory->batch_inventory_id,
                    'batch_transfer_date' => now(),
                    'batch_transfer_from' => $currentStatus,
                    'batch_transfer_to' => $nextStatus,
                ]);

                DB::commit();

                // Get current user info
                $currentUser = \Illuminate\Support\Facades\Session::get('user');
                $staffId = $currentUser['staff_id'] ?? null;
                if ($staffId === 0) {
                    $staffId = null;
                }

                // Log deductions after successful commit
                foreach ($deductions as $deduction) {
                    Logs::create([
                        'log_type' => 'equipment_deduction',
                        'log_description' => "Deducted {$deduction['quantity']} {$deduction['equipment']->equipment_name} for processing",
                        'created_at' => now(),
                        'batch_id' => $batchId,
                        'equipment_id' => $deduction['equipment']->equipment_id,
                        'staff_id' => $staffId
                    ]);
                }

                Logs::create([
                    'log_type' => 'process',
                    'log_description' => 'BATCH-' . str_pad($batchId, 5, '0', STR_PAD_LEFT) . ' proceeded to ' . $nextStatus,
                    'severity' => 'info',
                    'batch_id' => $batchId,
                    'process_id' => $process->process_id,
                    'created_at' => now(),
                    'staff_id' => $staffId
                ]);

                return response()->json([
                    'message' => "Batch proceeded to {$nextStatus} successfully",
                    'process' => $process,
                    'equipment_used' => $equipmentNeeds
                ], 200);
            } catch (\RuntimeException $e) {
                DB::rollBack();
                // Get current user info
                $currentUser = \Illuminate\Support\Facades\Session::get('user');
                $staffId = $currentUser['staff_id'] ?? null;
                if ($staffId === 0) {
                    $staffId = null;
                }
                $parts = explode('|', $e->getMessage());
                $code = $parts[0] ?? 'EQUIPMENT_ERROR';
                $equipmentType = $parts[1] ?? 'unknown';
                $needed = $parts[2] ?? null;
                $available = $parts[3] ?? null;

                $equipment = $this->findEquipmentByType($equipmentType);

                $label = rtrim($equipmentType, 's');
                $message = match ($code) {
                    'EQUIPMENT_NOT_FOUND' => "Equipment type '{$label}' not found in system",
                    'EQUIPMENT_INVENTORY_NOT_FOUND' => "Equipment inventory for '{$label}' not found",
                    'INSUFFICIENT_EQUIPMENT' => "Insufficient {$label} available. Need: {$needed}, Available: {$available}",
                    default => 'Equipment error occurred'
                };

                Logs::create([
                    'log_type' => 'equipment_alert',
                    'log_description' => $message,
                    'created_at' => now(),
                    'batch_id' => $batchId,
                    'equipment_id' => $equipment ? $equipment->equipment_id : null,
                    'staff_id' => $staffId ?? null
                ]);

                return response()->json([
                    'message' => $message
                ], 422);
            } catch (\Exception $e) {
                DB::rollBack();

                return response()->json([
                    'message' => 'Error proceeding batch: ' . $e->getMessage()
                ], 500);
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error proceeding batch: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Complete processing and return batch to inventory
     */
    public function complete(Request $request, $processId)
    {
        try {
            $validated = $request->validate([
                'process_id' => 'required|integer'
            ]);

            $currentUser = \Illuminate\Support\Facades\Session::get('user');
            $staffId = $currentUser['staff_id'] ?? null;
            if ($staffId === 0) {
                $staffId = null;
            }
            // Find process
            $process = Process::findOrFail($processId);
            $batchId = $process->batch_id;
            
            // Get batch inventory
            $inventory = BatchInventory::where('batch_id', $batchId)->first();
            
            if (!$inventory) {
                return response()->json([
                    'message' => 'Batch inventory not found'
                ], 404);
            }

            // Determine completed status based on current process status
            $currentStatus = $process->process_status;
            
            if ($currentStatus === 'Fermenting') {
                $completedStatus = 'Fermented';
            } elseif ($currentStatus === 'Drying') {
                $completedStatus = 'Dried';
            } else {
                return response()->json([
                    'message' => 'Invalid process status'
                ], 422);
            }

            // Update inventory status
            $inventory->batch_status = $completedStatus;
            $inventory->save();

            BatchTransferLine::create([
                'batch_inventory_id' => $inventory->batch_inventory_id,
                'batch_transfer_date' => now(),
                'batch_transfer_from' => $currentStatus,
                'batch_transfer_to' => $completedStatus,
            ]);

            // Delete process record (removed from processing)
            $process->delete();

            Logs::create([
                'log_type' => 'process',
                'log_description' => 'Batch BATCH-' . str_pad($batchId, 5, '0', STR_PAD_LEFT) . ' completed to ' . $completedStatus,
                'created_at' => now(),
                'batch_id' => $batchId,
                'staff_id' => $staffId
            ]);

            return response()->json([
                'message' => 'Batch completed and returned to inventory successfully',
                'batch_id' => $batchId
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error completing process: ' . $e->getMessage()
            ], 500);
        }
    }
}
