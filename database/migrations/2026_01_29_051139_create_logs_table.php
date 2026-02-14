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
        Schema::create('logs', function (Blueprint $table) {
            $table->bigIncrements('log_id');
            $table->string('log_type')->nullable()->comment('Type of log: equipment_alert, batch_alert, etc');
            $table->text('log_description')->nullable();
            $table->string('log_task')->nullable()->comment('Task type: weather data alert, weather data notify, etc');
            $table->unsignedBigInteger('batch_id')->nullable();
            $table->unsignedBigInteger('equipment_id')->nullable();
            $table->unsignedBigInteger('process_id')->nullable();
            $table->unsignedBigInteger('staff_id')->nullable();
            $table->timestamps();

            $table->foreign('batch_id')->references('batch_id')->on('batches')->onDelete('set null');
            $table->foreign('equipment_id')->references('equipment_id')->on('equipments')->onDelete('set null');
            $table->foreign('process_id')->references('process_id')->on('processes')->onDelete('set null');
            $table->foreign('staff_id')->references('staff_id')->on('staffs')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('logs');
    }
};
