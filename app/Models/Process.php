<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Process extends Model
{
    protected $table = 'processes';
    protected $primaryKey = 'process_id';
    public $timestamps = false;
    
    protected $fillable = [
        'batch_id',
        'process_status',
        'created_at'
    ];

    public function batch()
    {
        return $this->belongsTo(Batches::class, 'batch_id', 'batch_id');
    }
}
