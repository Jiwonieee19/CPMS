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
        Schema::create('weather_data', function (Blueprint $table) {
            $table->id('weather_id');
            $table->date('data_date');
            $table->decimal('temperature', 5, 2);
            $table->decimal('temperature_end', 5, 2)->nullable();
            $table->integer('humidity');
            $table->integer('humidity_end')->nullable();
            $table->decimal('wind_speed', 5, 2);
            $table->decimal('wind_speed_end', 5, 2)->nullable();
            $table->string('weather_condition')->nullable()->comment('rainy, sunny, cloudy, etc.');
            $table->string('weather_condition_end')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('weather_data');
    }
};
