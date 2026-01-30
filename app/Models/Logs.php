<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Logs extends Model
{
    protected $table = 'logs';
    
    protected $fillable = [
        'log_type',
        'log_message',
        'severity',
        'batch_id',
        'equipment_id',
        'process_id',
        'created_at',
        'updated_at'
    ];
}
