<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add equipment_type to equipments table
        Schema::table('equipments', function (Blueprint $table) {
            $table->string('equipment_type')->after('equipment_name')->nullable()->comment('sack or rack');
        });

        // Add quantity to equipment_inventory table
        Schema::table('equipment_inventory', function (Blueprint $table) {
            $table->integer('quantity')->after('equipment_status')->default(0)->comment('Available quantity of equipment');
        });

        DB::statement('UPDATE equipment_inventory SET quantity = equipment_status');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('equipments', function (Blueprint $table) {
            $table->dropColumn('equipment_type');
        });

        Schema::table('equipment_inventory', function (Blueprint $table) {
            $table->dropColumn('quantity');
        });
    }
};
