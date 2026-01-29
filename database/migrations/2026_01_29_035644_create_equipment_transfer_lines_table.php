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
        Schema::create('equipment_transfer_line', function (Blueprint $table) {
            $table->id('equipment_transfer_line_id');
            $table->unsignedBigInteger('equipment_inventory_id');
            $table->foreign('equipment_inventory_id')->references('equipment_inventory_id')->on('equipment_inventory')->onDelete('cascade');
            $table->integer('equipment_transfer_quantity');
            $table->dateTime('equipment_transfer_date');
            $table->string('equipment_transfer_from');
            $table->string('equipment_transfer_to');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_transfer_line');
    }
};
