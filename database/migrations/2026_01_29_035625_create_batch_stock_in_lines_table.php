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
        Schema::create('batch_stock_in_line', function (Blueprint $table) {
            $table->id('batch_stock_in_id');
            $table->unsignedBigInteger('batch_inventory_id');
            $table->foreign('batch_inventory_id')->references('batch_inventory_id')->on('batch_inventory')->onDelete('cascade');
            $table->string('supplier_name');
            $table->decimal('stock_in_weight', 10, 2);
            $table->timestamp('stock_in_date')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batch_stock_in_line');
    }
};
