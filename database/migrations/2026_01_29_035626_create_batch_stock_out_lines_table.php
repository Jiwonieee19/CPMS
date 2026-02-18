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
            $table->unsignedBigInteger('batch_id')->nullable()->comment('Original batch ID for reference');
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
