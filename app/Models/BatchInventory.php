<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BatchInventory extends Model
{
    protected $table = 'batch_inventory';
    protected $primaryKey = 'batch_inventory_id';

    protected $fillable = [
        'batch_id',
        'batch_weight',
        'batch_status',
        'created_at',
        'updated_at'
    ];

    public function batch()
    {
        return $this->belongsTo(Batches::class, 'batch_id', 'batch_id');
    }
}
