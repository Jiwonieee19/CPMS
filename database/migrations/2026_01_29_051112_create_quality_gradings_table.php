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
        Schema::create('quality_gradings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('batch_id');
            $table->integer('grade_a')->default(0);
            $table->integer('grade_b')->default(0);
            $table->integer('reject')->default(0);
            $table->timestamps();
            
            // Foreign key constraint
            $table->foreign('batch_id')->references('batch_id')->on('batches')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quality_gradings');
    }
};
