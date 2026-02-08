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
            // Add staff_id and performed_by_role columns if they don't exist
            if (!Schema::hasColumn('logs', 'staff_id')) {
                $table->unsignedBigInteger('staff_id')->nullable()->after('id');
            }
            if (!Schema::hasColumn('logs', 'performed_by_role')) {
                $table->string('performed_by_role')->default('system')->after('staff_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('logs', function (Blueprint $table) {
            $table->dropColumn(['staff_id', 'performed_by_role']);
        });
    }
};
