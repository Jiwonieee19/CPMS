<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Batches extends Model
{
    protected $table = 'batches';
    protected $primaryKey = 'batch_id';
    public $timestamps = false;
    
    protected $fillable = [
        'harvest_date',
        'initial_condition',
        'initial_weight',
        'created_at'
    ];

    public function inventory()
    {
        return $this->hasOne(BatchInventory::class, 'batch_id', 'batch_id');
    }
}
