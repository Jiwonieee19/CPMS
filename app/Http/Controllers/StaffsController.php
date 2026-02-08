<?php

namespace App\Http\Controllers;

use App\Models\Staffs;
use App\Models\Logs;
use Illuminate\Http\Request;

class StaffsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $staffs = Staffs::all();
            
            // Transform the data to match frontend expectations
            $transformedStaffs = $staffs->map(function ($staff) {
                return [
                    'id' => str_pad($staff->staff_id, 5, '0', STR_PAD_LEFT),
                    'fullname' => $staff->staff_firstname . ' ' . $staff->staff_lastname,
                    'role' => $staff->staff_role,
                    'status' => ucfirst($staff->staff_status),
                    'email' => $staff->staff_email,
                    'contact' => $staff->staff_contact,
                    'staff_id' => $staff->staff_id
                ];
            });
            
            return response()->json([
                'message' => 'Staffs retrieved successfully',
                'staffs' => $transformedStaffs
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving staffs: ' . $e->getMessage()
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
                'staff_firstname' => 'required|string|max:255',
                'staff_lastname' => 'required|string|max:255',
                'staff_email' => 'required|email|unique:staffs',
                'staff_contact' => 'required|string|max:20',
                'staff_password' => 'required|string|min:8|confirmed',
                'staff_role' => 'required|string|max:100'
            ]);

            $validated['staff_password'] = bcrypt($validated['staff_password']);
            $validated['staff_status'] = 'active';
            
            $staff = Staffs::create($validated);

            // Get current user info from session
            $currentUser = \Illuminate\Support\Facades\Session::get('user');
            $staffId = $currentUser['staff_id'] ?? null;

            Logs::create([
                'staff_id' => $staffId,
                'log_type' => 'account',
                'log_message' => 'New staff account created: ' . $staff->staff_firstname . ' ' . $staff->staff_lastname,
                'severity' => 'info',
                'created_at' => now()
            ]);

            // Check if request expects JSON (API) or Inertia
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Staff account created successfully',
                    'staff' => $staff
                ], 201);
            }

            // Inertia redirect with success message
            return back()->with('success', 'Staff account created successfully');
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $e->errors()
                ], 422);
            }
            // Inertia will automatically handle validation errors
            throw $e;
            
        } catch (\Exception $e) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Error creating staff account: ' . $e->getMessage()
                ], 500);
            }
            return back()->with('error', 'Error creating staff account: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $staff = Staffs::find($id);
            
            if (!$staff) {
                return response()->json([
                    'message' => 'Staff not found'
                ], 404);
            }
            
            $transformedStaff = [
                'id' => str_pad($staff->staff_id, 5, '0', STR_PAD_LEFT),
                'first_name' => $staff->staff_firstname,
                'last_name' => $staff->staff_lastname,
                'fullname' => $staff->staff_firstname . ' ' . $staff->staff_lastname,
                'role' => $staff->staff_role,
                'status' => ucfirst($staff->staff_status),
                'email' => $staff->staff_email,
                'contact' => $staff->staff_contact,
                'staff_id' => $staff->staff_id
            ];
            
            return response()->json([
                'message' => 'Staff retrieved successfully',
                'staff' => $transformedStaff
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving staff: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Staffs $staffs)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $staff = Staffs::find($id);
            
            if (!$staff) {
                return response()->json([
                    'message' => 'Staff not found'
                ], 404);
            }
            
            $validated = $request->validate([
                'staff_firstname' => 'sometimes|string|max:255',
                'staff_lastname' => 'sometimes|string|max:255',
                'staff_email' => 'sometimes|email|unique:staffs,staff_email,' . $id . ',staff_id',
                'staff_contact' => 'sometimes|string|max:20',
                'staff_role' => 'sometimes|string|max:100',
                'staff_status' => 'sometimes|in:active,inactive',
                'staff_password' => 'sometimes|string|min:8|confirmed'
            ]);

            // Track changes for logging
            $changes = [];
            $fieldLabels = [
                'staff_firstname' => 'first name',
                'staff_lastname' => 'last name',
                'staff_email' => 'email',
                'staff_contact' => 'contact',
                'staff_role' => 'role',
                'staff_status' => 'status'
            ];

            foreach ($validated as $key => $value) {
                if ($key === 'staff_password') {
                    $changes[] = 'password';
                    $validated[$key] = bcrypt($value);
                } elseif ($key === 'staff_password_confirmation') {
                    // Skip confirmation field
                    continue;
                } elseif (isset($fieldLabels[$key]) && $staff->$key != $value) {
                    $oldValue = $staff->$key;
                    $newValue = $value;
                    $changes[] = $fieldLabels[$key] . ':' . $oldValue . '->' . $newValue;
                }
            }
            
            $staff->update($validated);

            // Build detailed log message
            $changesText = count($changes) > 0 ? implode(', ', $changes) : 'no fields';
            $staffIdPadded = str_pad($staff->staff_id, 5, '0', STR_PAD_LEFT);
            $logMessage = 'Staff account updated: ' . $staff->staff_firstname . ' ' . $staff->staff_lastname . ' (acc-' . $staffIdPadded . ') (edited: ' . $changesText . ')';

            Logs::create([
                'staff_id' => getCurrentUserId(),
                'log_type' => 'account',
                'log_message' => $logMessage,
                'severity' => 'info',
                'created_at' => now()
            ]);
            
            return response()->json([
                'message' => 'Staff updated successfully',
                'staff' => $staff
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating staff: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $staff = Staffs::find($id);
            
            if (!$staff) {
                return response()->json([
                    'message' => 'Staff not found'
                ], 404);
            }
            
            $staff->update([
                'staff_status' => 'inactive'
            ]);

            $staffIdPadded = str_pad($staff->staff_id, 5, '0', STR_PAD_LEFT);
            Logs::create([
                'staff_id' => getCurrentUserId(),
                'log_type' => 'account',
                'log_message' => 'Staff account set to inactive: ' . $staff->staff_firstname . ' ' . $staff->staff_lastname . ' (acc-' . $staffIdPadded . ')',
                'severity' => 'warning',
                'created_at' => now()
            ]);
            
            return response()->json([
                'message' => 'Staff set to inactive successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating staff status: ' . $e->getMessage()
            ], 500);
        }
    }
}
