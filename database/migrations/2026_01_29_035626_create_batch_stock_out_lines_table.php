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
        Schema::create('batch_stock_out_line', function (Blueprint $table) {
            $table->id('batch_stock_out_id');
            $table->unsignedBigInteger('batch_inventory_id');
            $table->foreign('batch_inventory_id')->references('batch_inventory_id')->on('batch_inventory')->onDelete('cascade');
            $table->decimal('stock_out_weight', 10, 2);
            $table->timestamp('stock_out_date')->nullable();
        });


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batch_stock_out_line');
    }
};
