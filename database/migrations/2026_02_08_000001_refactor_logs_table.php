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
            // Rename id to log_id
            if (Schema::hasColumn('logs', 'id') && !Schema::hasColumn('logs', 'log_id')) {
                $table->renameColumn('id', 'log_id');
            }
        });

        Schema::table('logs', function (Blueprint $table) {
            // Add staff_id if it doesn't exist
            if (!Schema::hasColumn('logs', 'staff_id')) {
                $table->unsignedBigInteger('staff_id')->nullable()->after('log_id');
            }
        });

        // Add foreign key constraint
        Schema::table('logs', function (Blueprint $table) {
            $table->foreign('staff_id')
                  ->references('staff_id')
                  ->on('staffs')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('logs', function (Blueprint $table) {
            // Drop foreign key
            $table->dropForeign(['staff_id']);
        });

        Schema::table('logs', function (Blueprint $table) {
            // Remove staff_id column
            if (Schema::hasColumn('logs', 'staff_id')) {
                $table->dropColumn('staff_id');
            }
            
            // Rename log_id back to id
            if (Schema::hasColumn('logs', 'log_id')) {
                $table->renameColumn('log_id', 'id');
            }
        });
    }
};
