<?php

namespace App\Http\Controllers;

use App\Models\Batches;
use App\Models\BatchInventory;
use App\Models\BatchTransferLine;
use App\Models\BatchStockOutLine;
use App\Models\Equipments;
use App\Models\EquipmentInventory;
use App\Models\EquipmentStockOutLine;
use App\Models\Logs;
use App\Models\QualityGrading;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BatchesController extends Controller
{
    /**
     * Find equipment by type or name
     */
    private function findEquipmentByType($equipmentType)
    {
        $type = strtolower($equipmentType);
        $equipment = Equipments::where('equipment_type', $type)->first();

        if (!$equipment) {
            $equipment = Equipments::whereRaw('LOWER(equipment_name) LIKE ?', ['%' . $type . '%'])->first();
        }

        return $equipment;
    }

    /**
     * Deduct equipment from inventory
     */
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
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            // Get all batch inventory records that are NOT in processing stages or dried
            $inventories = BatchInventory::whereNotIn('batch_status', ['Fermenting', 'Drying', 'Dried', 'Graded'])
                ->with('batch')
                ->get();
            
            $transformedBatches = $inventories->map(function ($inventory) {
                $weight = (int)$inventory->batch_weight;
                $status = $inventory->batch_status;

                $itemUsed = 'Cacao Beans';
                $displayQuantity = $weight;

                if ($status === 'Fresh') {
                    $itemUsed = 'Sacks';
                    $displayQuantity = (int)ceil($weight / 50);
                } elseif ($status === 'Fermented') {
                    $itemUsed = 'Racks';
                    $sacksNeeded = (int)ceil($weight / 50);
                    $displayQuantity = $sacksNeeded * 2;
                }

                return [
                    'id' => 'BATCH-' . str_pad($inventory->batch_id, 5, '0', STR_PAD_LEFT),
                    'item' => $itemUsed,
                    'quantity' => $displayQuantity,
                    'weight' => $weight,
                    'status' => $status,
                    'batch_id' => $inventory->batch_id
                ];
            });
            
            // Get graded batches with boxes information from quality_gradings
            $gradedInventories = BatchInventory::where('batch_status', 'Graded')
                ->with('batch')
                ->get();

            $gradedBatches = $gradedInventories->map(function ($inventory) {
                // Get quality grading data for this batch
                $grading = QualityGrading::where('batch_id', $inventory->batch_id)->first();
                
                $totalBoxes = 0;
                if ($grading) {
                    $totalBoxes = (int)($grading->grade_a + $grading->grade_b + $grading->reject);
                }
                
                return [
                    'id' => 'BATCH-' . str_pad($inventory->batch_id, 5, '0', STR_PAD_LEFT),
                    'item' => 'Boxes',
                    'quantity' => $totalBoxes,
                    'weight' => (int)$inventory->batch_weight,
                    'status' => $inventory->batch_status,
                    'batch_id' => $inventory->batch_id
                ];
            });
            
            $allBatches = $transformedBatches->concat($gradedBatches);
            
            return response()->json([
                'message' => 'Batches retrieved successfully',
                'batches' => $allBatches
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving batches: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'harvest_date' => 'required|date',
                'initial_weight' => 'required|numeric|min:0',
                'supplier_name' => 'required|string|max:255'
            ]);

            $weight = (float)$validated['initial_weight'];
            $sacksNeeded = (int)ceil($weight / 50);

            DB::beginTransaction();

            try {
                $deduction = null;

                if ($sacksNeeded > 0) {
                    $deduction = $this->deductEquipment('sack', $sacksNeeded);
                }

                // Create batch with fresh condition
                $batch = Batches::create([
                    'harvest_date' => $validated['harvest_date'],
                    'initial_condition' => 'Fresh',
                    'initial_weight' => $validated['initial_weight'],
                    'supplier_name' => $validated['supplier_name'],
                    'created_at' => now()
                ]);

                // Create batch inventory entry with fresh status
                BatchInventory::create([
                    'batch_id' => $batch->batch_id,
                    'batch_weight' => $validated['initial_weight'],
                    'batch_status' => 'Fresh',
                    'created_at' => now()
                ]);

                $currentUser = \Illuminate\Support\Facades\Session::get('user');
                $staffId = $currentUser['staff_id'] ?? null;

                // For static admin (staff_id=0), store NULL to avoid foreign key constraint
                if ($staffId === 0) {
                    $staffId = null;
                }
                Logs::create([
                    'log_type' => 'inventory',
                    'log_description' => 'New fresh batch added: BATCH-' . str_pad($batch->batch_id, 5, '0', STR_PAD_LEFT) . ' (' . $validated['initial_weight'] . ' kg)',
                    'log_task' => 'fresh batch added',
                    'batch_id' => $batch->batch_id,
                    'created_at' => now(),
                    'staff_id' => $staffId
                ]);

                if ($deduction) {
                    Logs::create([
                        'log_type' => 'equipment_deduction',
                        'log_description' => "Deducted {$deduction['quantity']} {$deduction['equipment']->equipment_name} for fresh batch",
                        'log_task' => 'equipment deducted',
                        'batch_id' => $batch->batch_id,
                        'equipment_id' => $deduction['equipment']->equipment_id,
                        'created_at' => now(),
                        'staff_id' => $staffId
                    ]);
                }

                DB::commit();

                return response()->json([
                    'message' => 'Fresh beans batch created successfully',
                    'batch' => $batch
                ], 201);
            } catch (\RuntimeException $e) {
                DB::rollBack();

                $parts = explode('|', $e->getMessage());
                $code = $parts[0] ?? 'EQUIPMENT_ERROR';
                $equipmentType = $parts[1] ?? 'unknown';
                $needed = $parts[2] ?? null;
                $available = $parts[3] ?? null;

                $equipment = $this->findEquipmentByType($equipmentType);

                $message = match ($code) {
                    'EQUIPMENT_NOT_FOUND' => "Equipment type '{$equipmentType}' not found in system",
                    'EQUIPMENT_INVENTORY_NOT_FOUND' => "Equipment inventory for '{$equipmentType}' not found",
                    'INSUFFICIENT_EQUIPMENT' => "Insufficient {$equipmentType} available. Need: {$needed}, Available: {$available}",
                    default => 'Equipment error occurred'
                };

                $currentUser = \Illuminate\Support\Facades\Session::get('user');
                $staffIdLog = $currentUser['staff_id'] ?? null;
                if ($staffIdLog === 0) {
                    $staffIdLog = null;
                }
                Logs::create([
                    'log_type' => 'equipment_alert',
                    'log_description' => $message,
                    'log_task' => 'equipment alert',
                    'created_at' => now(),
                    'equipment_id' => $equipment ? $equipment->equipment_id : null,
                    'staff_id' => $staffIdLog
                ]);

                return response()->json([
                    'message' => $message
                ], 422);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating batch: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Batches $batches)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Batches $batches)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Batches $batches)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Batches $batches)
    {
        //
    }

    /**
     * Get dried batches for grading queue
     */
    public function getDried()
    {
        try {
            // Get all batch inventory records with Dried status
            $inventories = BatchInventory::where('batch_status', 'Dried')
                ->with('batch')
                ->get();
            
            $transformedBatches = $inventories->map(function ($inventory) {
                // Calculate days since batch was created
                $batch = $inventory->batch;
                if ($batch && $batch->created_at) {
                    $createdDate = \Carbon\Carbon::parse($batch->created_at);
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
                    $rackDeductionLogs = Logs::where('batch_id', $inventory->batch_id)
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
                    'id' => 'BATCH-' . str_pad($inventory->batch_id, 5, '0', STR_PAD_LEFT),
                    'dayCount' => $dayCount,
                    'racks' => $racksUsed,
                    'status' => $inventory->batch_status,
                    'batch_id' => $inventory->batch_id
                ];
            });
            
            return response()->json([
                'message' => 'Dried batches retrieved successfully',
                'batches' => $transformedBatches
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving dried batches: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Grade a batch and update its status
     */
    public function grade($id, Request $request)
    {
        try {
            // Extract batch_id from formatted ID or use it directly
            $batchId = is_numeric($id) ? $id : (int)str_replace('BATCH-', '', $id);
            
            // Get current user info for logging
            $currentUser = \Illuminate\Support\Facades\Session::get('user');
            $staffId = $currentUser['staff_id'] ?? null;
            if ($staffId === 0) {
                $staffId = null;
            }
            Batches::findOrFail($batchId);
            $inventory = BatchInventory::where('batch_id', $batchId)->first();
            
            if (!$inventory) {
                return response()->json([
                    'message' => 'Batch inventory not found'
                ], 404);
            }

            // Get boxes needed
            $boxesUsed = (int)($request->input('boxes_used') ?? 0);
            
            // Deduct boxes from equipment inventory if needed
            if ($boxesUsed > 0) {
                $boxesEquipment = Equipments::where('equipment_type', 'boxes')->first();
                
                if ($boxesEquipment) {
                    $boxesInventory = EquipmentInventory::where('equipment_id', $boxesEquipment->equipment_id)->first();
                    
                    if ($boxesInventory) {
                        $currentQuantity = (int)($boxesInventory->quantity ?? $boxesInventory->equipment_status ?? 0);
                        
                        if ($currentQuantity >= $boxesUsed) {
                            $boxesInventory->quantity = $currentQuantity - $boxesUsed;
                            $boxesInventory->equipment_status = EquipmentInventory::statusFromQuantity((int)$boxesInventory->quantity);
                            $boxesInventory->save();
                            
                            // Log equipment deduction
                            Logs::create([
                                'log_type' => 'equipment_deduction',
                                'log_description' => 'Deducted ' . $boxesUsed . ' boxes for grading batch BATCH-' . str_pad($batchId, 5, '0', STR_PAD_LEFT),
                                'log_task' => 'equipment deducted',
                                'created_at' => now(),
                                'batch_id' => $batchId,
                                'equipment_id' => $boxesEquipment->equipment_id,
                                'staff_id' => $staffId
                            ]);
                        }
                    }
                }
            }

            $previousStatus = $inventory->batch_status;

            // Update batch inventory status to Graded
            $inventory->batch_status = 'Graded';
            $inventory->save();

            BatchTransferLine::create([
                'batch_inventory_id' => $inventory->batch_inventory_id,
                'batch_transfer_date' => now(),
                'batch_transfer_from' => $previousStatus,
                'batch_transfer_to' => 'Graded',
            ]);

            // Create quality grading record
            DB::table('quality_gradings')->insert([
                'batch_id' => $batchId,
                'grade_a' => (int)($request->input('grade_a') ?? 0),
                'grade_b' => (int)($request->input('grade_b') ?? 0),
                'reject' => (int)($request->input('reject') ?? 0),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Log the grading activity
            Logs::create([
                'log_type' => 'process',
                'log_description' => 'BATCH-' . str_pad($batchId, 5, '0', STR_PAD_LEFT) . " graded:\n- Grade A: " . (int)($request->input('grade_a') ?? 0) . "\n- Grade B: " . (int)($request->input('grade_b') ?? 0) . "\n- Reject: " . (int)($request->input('reject') ?? 0),
                'log_task' => 'batch graded',
                'created_at' => now(),
                'batch_id' => $batchId,
                'staff_id' => $staffId
            ]);

            return response()->json([
                'message' => 'Batch graded successfully',
                'batch_id' => $batchId,
                'status' => 'Graded'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error grading batch: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process batch pickup and remove from inventory
     */
    public function pickup($id, Request $request)
    {
        try {
            // Extract batch_id from formatted ID or use it directly
            $batchId = is_numeric($id) ? $id : (int)str_replace('BATCH-', '', $id);
            
            // Get current user info for logging
            $currentUser = \Illuminate\Support\Facades\Session::get('user');
            $staffId = $currentUser['staff_id'] ?? null;
            if ($staffId === 0) {
                $staffId = null;
            }
            $batch = Batches::findOrFail($batchId);
            $inventory = BatchInventory::where('batch_id', $batchId)->first();
            
            if (!$inventory) {
                return response()->json([
                    'message' => 'Batch inventory not found'
                ], 404);
            }

            $grading = QualityGrading::where('batch_id', $batchId)->first();
            $boxesUsed = $grading ? (int)($grading->grade_a + $grading->grade_b + $grading->reject) : 0;

            if ($boxesUsed > 0) {
                $boxesEquipment = Equipments::whereIn('equipment_type', ['boxes', 'box'])->first();

                if (!$boxesEquipment) {
                    $boxesEquipment = Equipments::whereRaw('LOWER(equipment_name) LIKE ?', ['%box%'])->first();
                }

                if ($boxesEquipment) {
                    $boxesInventory = EquipmentInventory::where('equipment_id', $boxesEquipment->equipment_id)->first();

                    if ($boxesInventory) {
                        EquipmentStockOutLine::create([
                            'equipment_inventory_id' => $boxesInventory->equipment_inventory_id,
                            'stock_out_quantity' => $boxesUsed,
                            'stock_out_date' => now(),
                        ]);
                    }
                }
            }

            BatchStockOutLine::create([
                'batch_id' => $batchId,
                'stock_out_date' => now()
            ]);

            // Log the pickup activity
            Logs::create([
                'log_type' => 'inventory',
                'log_description' => 'Batch BATCH-' . str_pad($batchId, 5, '0', STR_PAD_LEFT) . ' picked up by Auro Chocolate',
                'log_task' => 'batch picked up',
                'created_at' => now(),
                'batch_id' => $batchId,
                'staff_id' => $staffId
            ]);

            // Delete the batch from inventory
            $inventory->delete();

            return response()->json([
                'message' => 'Batch picked up successfully',
                'batch_id' => $batchId
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error processing pickup: ' . $e->getMessage()
            ], 500);
        }
    }
}
