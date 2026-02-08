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
        Schema::create('weather_reports', function (Blueprint $table) {
            $table->id('report_id');
            $table->text('report_message');
            $table->date('report_date');
            $table->string('report_action')->nullable();
            $table->unsignedBigInteger('weather_id')->nullable();
            $table->unsignedBigInteger('batch_id')->nullable();
            $table->foreign('batch_id')->references('batch_id')->on('batches')->onDelete('set null');
            $table->unsignedBigInteger('staff_id')->nullable();
            $table->foreign('staff_id')->references('id')->on('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('weather_reports');
    }
};
