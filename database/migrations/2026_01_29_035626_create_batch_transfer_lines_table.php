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
        Schema::create('batch_transfer_line', function (Blueprint $table) {
            $table->id('batch_transfer_line_id');
            $table->unsignedBigInteger('batch_inventory_id');
            $table->foreign('batch_inventory_id')->references('batch_inventory_id')->on('batch_inventory')->onDelete('cascade');
            $table->dateTime('batch_transfer_date');
            $table->string('batch_transfer_from');
            $table->string('batch_transfer_to');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batch_transfer_line');
    }
};
