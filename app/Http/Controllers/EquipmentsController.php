<?php

namespace App\Http\Controllers;

use App\Models\Equipments;
use App\Models\EquipmentInventory;
use App\Models\EquipmentStockInLine;
use App\Models\Logs;
use Illuminate\Http\Request;

class EquipmentsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $equipments = Equipments::with('inventory')->get();
            
            $transformedEquipments = $equipments->map(function ($equipment) {
                $inventory = $equipment->inventory;
                $quantity = $inventory ? (int)($inventory->quantity ?? $inventory->equipment_status) : 0;
                $status = EquipmentInventory::statusFromQuantity($quantity);
                if ($inventory && $inventory->equipment_status !== $status) {
                    $inventory->equipment_status = $status;
                    $inventory->save();
                }
                return [
                    'id' => 'EQ-' . str_pad($equipment->equipment_id, 3, '0', STR_PAD_LEFT),
                    'item' => $equipment->equipment_name,
                    'equipment_type' => $equipment->equipment_type,
                    'quantity' => $quantity,
                    'status' => $status,
                    'equipment_id' => $equipment->equipment_id
                ];
            });
            
            return response()->json([
                'message' => 'Equipments retrieved successfully',
                'equipments' => $transformedEquipments
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving equipments: ' . $e->getMessage()
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
                'equipment_name' => 'required|string|max:255',
                'quantity' => 'required|integer|min:0',
                'equipment_type' => 'nullable|string|in:sack,rack,box'
            ]);

            $nameLower = strtolower($validated['equipment_name']);
            $inferredType = null;
            if (str_contains($nameLower, 'sack')) {
                $inferredType = 'sack';
            } elseif (str_contains($nameLower, 'rack')) {
                $inferredType = 'rack';
            } elseif (str_contains($nameLower, 'box')) {
                $inferredType = 'box';
            }

            $equipmentType = $validated['equipment_type'] ?? $inferredType;

            $equipment = Equipments::create([
                'equipment_name' => ucfirst($validated['equipment_name']),
                'equipment_type' => $equipmentType
            ]);

            // Create equipment inventory entry with quantity
            EquipmentInventory::create([
                'equipment_id' => $equipment->equipment_id,
                'equipment_status' => EquipmentInventory::statusFromQuantity((int)$validated['quantity']),
                'quantity' => $validated['quantity']
            ]);

            $currentUser = \Illuminate\Support\Facades\Session::get('user');
            $staffId = $currentUser['staff_id'] ?? null;
            if ($staffId === 0) {
                $staffId = null;
            }

            Logs::create([
                'log_type' => 'inventory',
                'log_description' => 'New equipment added: ' . $equipment->equipment_name . ' (Qty: ' . $validated['quantity'] . ')',
                'created_at' => now(),
                'equipment_id' => $equipment->equipment_id,
                'staff_id' => $staffId
            ]);

            return response()->json([
                'message' => 'Equipment created successfully',
                'equipment' => $equipment
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating equipment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add stock to existing equipment
     */
    public function stockIn(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'supplier_name' => 'required|string|max:255',
                'quantity' => 'required|integer|min:1'
            ]);

            // Find equipment
            $equipment = Equipments::findOrFail($id);
            
            // Find or create equipment inventory
            $inventory = EquipmentInventory::where('equipment_id', $id)->first();
            
            if (!$inventory) {
                $inventory = EquipmentInventory::create([
                    'equipment_id' => $id,
                    'equipment_status' => EquipmentInventory::statusFromQuantity(0),
                    'quantity' => 0
                ]);
            }

            // Create stock in line record
            $stockInLine = EquipmentStockInLine::create([
                'equipment_inventory_id' => $inventory->equipment_inventory_id,
                'supplier_name' => $validated['supplier_name'],
                'stock_in_weight' => $validated['quantity'],
                'stock_in_date' => now()
            ]);

            // Update inventory quantity
            $currentQuantity = (int)($inventory->quantity ?? $inventory->equipment_status ?? 0);
            $inventory->quantity = $currentQuantity + (int)$validated['quantity'];
            $inventory->equipment_status = EquipmentInventory::statusFromQuantity((int)$inventory->quantity);
            $inventory->save();

            $currentUser = \Illuminate\Support\Facades\Session::get('user');
            $staffId = $currentUser['staff_id'] ?? null;
            if ($staffId === 0) {
                $staffId = null;
            }

            Logs::create([
                'log_type' => 'inventory',
                'log_description' => 'Stock added for ' . $equipment->equipment_name . ' (+' . $validated['quantity'] . ')',
                'created_at' => now(),
                'equipment_id' => $equipment->equipment_id,
                'staff_id' => $staffId
            ]);

            return response()->json([
                'message' => 'Stock added successfully',
                'equipment' => $equipment,
                'new_quantity' => $inventory->quantity
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error adding stock: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Equipments $equipments)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Equipments $equipments)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Equipments $equipments)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Equipments $equipments)
    {
        //
    }
}
