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
            // Check if columns already exist to avoid duplicate column errors
            if (!Schema::hasColumn('logs', 'log_type')) {
                $table->string('log_type')->nullable()->comment('Type of log: equipment_alert, batch_alert, etc');
            }
            if (!Schema::hasColumn('logs', 'log_message')) {
                $table->text('log_message')->nullable();
            }
            if (!Schema::hasColumn('logs', 'severity')) {
                $table->string('severity')->nullable()->comment('critical, warning, info');
            }
            if (!Schema::hasColumn('logs', 'batch_id')) {
                $table->unsignedBigInteger('batch_id')->nullable();
                $table->foreign('batch_id')->references('batch_id')->on('batches')->onDelete('set null');
            }
            if (!Schema::hasColumn('logs', 'equipment_id')) {
                $table->unsignedBigInteger('equipment_id')->nullable();
                $table->foreign('equipment_id')->references('equipment_id')->on('equipments')->onDelete('set null');
            }
            if (!Schema::hasColumn('logs', 'process_id')) {
                $table->unsignedBigInteger('process_id')->nullable();
                $table->foreign('process_id')->references('process_id')->on('processes')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('logs', function (Blueprint $table) {
            if (Schema::hasColumn('logs', 'batch_id')) {
                $table->dropForeign(['batch_id']);
                $table->dropColumn('batch_id');
            }
            if (Schema::hasColumn('logs', 'equipment_id')) {
                $table->dropForeign(['equipment_id']);
                $table->dropColumn('equipment_id');
            }
            if (Schema::hasColumn('logs', 'process_id')) {
                $table->dropForeign(['process_id']);
                $table->dropColumn('process_id');
            }
            if (Schema::hasColumn('logs', 'log_type')) {
                $table->dropColumn('log_type');
            }
            if (Schema::hasColumn('logs', 'log_message')) {
                $table->dropColumn('log_message');
            }
            if (Schema::hasColumn('logs', 'severity')) {
                $table->dropColumn('severity');
            }
        });
    }
};
