<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Logs extends Model
{
    protected $table = 'logs';
    protected $primaryKey = 'log_id';
    public $incrementing = true;
    protected $keyType = 'int';
    
    protected $fillable = [
        'log_type',
        'log_description',
        'log_task',
        'batch_id',
        'equipment_id',
        'process_id',
        'created_at',
        'updated_at',
        'staff_id'
    ];

    /**
     * Get the staff member who performed this action
     */
    public function staff()
    {
        return $this->belongsTo(Staffs::class, 'staff_id', 'staff_id');
    }
}
