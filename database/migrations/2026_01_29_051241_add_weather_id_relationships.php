<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add weather_id foreign key to weather_alerts
        Schema::table('weather_alerts', function (Blueprint $table) {
            $table->foreign('weather_id')->references('weather_id')->on('weather_data')->onDelete('set null');
        });

        // Add weather_id foreign key to weather_reports
        Schema::table('weather_reports', function (Blueprint $table) {
            $table->foreign('weather_id')->references('weather_id')->on('weather_data')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('weather_alerts', function (Blueprint $table) {
            $table->dropForeign(['weather_id']);
        });

        Schema::table('weather_reports', function (Blueprint $table) {
            $table->dropForeign(['weather_id']);
        });
    }
};

