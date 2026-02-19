<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('equipment_stock_in_line', function (Blueprint $table) {
            $table->id('equipment_stock_in_line_id');
            $table->unsignedBigInteger('equipment_inventory_id');
            $table->foreign('equipment_inventory_id')->references('equipment_inventory_id')->on('equipment_inventory')->onDelete('cascade');
            $table->string('supplier_name');
            $table->unsignedInteger('stock_in_quantity');
            $table->timestamp('stock_in_date')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_stock_in_line');
    }
};
