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
        Schema::table('logs', function (Blueprint $table) {
            // Drop severity column if it exists
            if (Schema::hasColumn('logs', 'severity')) {
                $table->dropColumn('severity');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('logs', function (Blueprint $table) {
            // Add severity column back
            if (!Schema::hasColumn('logs', 'severity')) {
                $table->string('severity')->default('info');
            }
        });
    }
};
