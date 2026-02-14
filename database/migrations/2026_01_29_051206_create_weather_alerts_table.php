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
        Schema::create('weather_alerts', function (Blueprint $table) {
            $table->id('alert_id');
            $table->text('alert_message');
            $table->string('alert_severity')->default('medium')->comment('low, medium, high');
            $table->string('alert_action')->nullable()->comment('Postpone details: Postpone: X, Return: Y');
            $table->date('alert_date');
            $table->unsignedBigInteger('weather_id')->nullable();
            $table->unsignedBigInteger('batch_id')->nullable();
            $table->foreign('batch_id')->references('batch_id')->on('batches')->onDelete('set null');
            $table->unsignedBigInteger('staff_id')->nullable();
            $table->foreign('staff_id')->references('staff_id')->on('staffs')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('weather_alerts');
    }
};
