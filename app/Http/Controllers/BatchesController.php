<?php

namespace App\Http\Controllers;

use App\Models\Batches;
use App\Models\BatchInventory;
use App\Models\Equipments;
use App\Models\EquipmentInventory;
use App\Models\Logs;
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
        $equipmentInventory->equipment_status = 'Available';
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
            $inventories = BatchInventory::whereNotIn('batch_status', ['Fermenting', 'Drying', 'Dried'])
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
            
            return response()->json([
                'message' => 'Batches retrieved successfully',
                'batches' => $transformedBatches
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
                    'created_at' => now()
                ]);

                // Create batch inventory entry with fresh status
                BatchInventory::create([
                    'batch_id' => $batch->batch_id,
                    'batch_weight' => $validated['initial_weight'],
                    'batch_status' => 'Fresh',
                    'created_at' => now()
                ]);

                Logs::create([
                    'log_type' => 'inventory',
                    'log_message' => 'New fresh batch added: BATCH-' . str_pad($batch->batch_id, 5, '0', STR_PAD_LEFT) . ' (' . $validated['initial_weight'] . ' kg)',
                    'severity' => 'info',
                    'batch_id' => $batch->batch_id,
                    'created_at' => now()
                ]);

                if ($deduction) {
                    Logs::create([
                        'log_type' => 'equipment_deduction',
                        'log_message' => "Deducted {$deduction['quantity']} {$deduction['equipment']->equipment_name} for fresh batch",
                        'severity' => 'info',
                        'equipment_id' => $deduction['equipment']->equipment_id,
                        'created_at' => now()
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

                Logs::create([
                    'log_type' => 'equipment_alert',
                    'log_message' => $message,
                    'severity' => 'critical',
                    'equipment_id' => $equipment ? $equipment->equipment_id : null,
                    'created_at' => now()
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
                    $hoursElapsed = now()->diffInHours($batch->created_at);
                    $dayCount = max(1, (int) ceil($hoursElapsed / 24));
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
                        // Extract quantity from log message (e.g., "Deducted 4 rack for processing")
                        preg_match('/Deducted (\d+)/', $log->log_message, $matches);
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
            
            $batch = Batches::findOrFail($batchId);
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
                            $boxesInventory->equipment_status = 'Available';
                            $boxesInventory->save();
                            
                            // Log equipment deduction
                            Logs::create([
                                'batch_id' => $batchId,
                                'equipment_id' => $boxesEquipment->equipment_id,
                                'log_type' => 'equipment_deduction',
                                'log_message' => 'Deducted ' . $boxesUsed . ' boxes for grading batch BATCH-' . str_pad($batchId, 5, '0', STR_PAD_LEFT),
                                'severity' => 'info',
                                'created_at' => now()
                            ]);
                        }
                    }
                }
            }

            // Update batch inventory status to Graded
            $inventory->batch_status = 'Graded';
            $inventory->save();

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
                'batch_id' => $batchId,
                'log_type' => 'process',
                'log_message' => 'Batch BATCH-' . str_pad($batchId, 5, '0', STR_PAD_LEFT) . ' graded - Grade A: ' . (int)($request->input('grade_a') ?? 0) . ', Grade B: ' . (int)($request->input('grade_b') ?? 0) . ', Reject: ' . (int)($request->input('reject') ?? 0),
                'severity' => 'info',
                'created_at' => now()
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
}
