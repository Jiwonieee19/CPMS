<?php

namespace App\Http\Controllers;

use App\Models\Staffs;
use Illuminate\Http\Request;

class StaffsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
                'staff_password' => 'required|string|min:8',
                'staff_role' => 'required|string|max:100'
            ]);

            $validated['staff_password'] = bcrypt($validated['staff_password']);
            $validated['staff_status'] = 'active';
            
            $staff = Staffs::create($validated);

            return response()->json([
                'message' => 'Staff account created successfully',
                'staff' => $staff
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating staff account: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Staffs $staffs)
    {
        //
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
    public function update(Request $request, Staffs $staffs)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Staffs $staffs)
    {
        //
    }
}
