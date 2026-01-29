<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BatchTransferLine extends Model
{
    protected $table = 'batch_transfer_line';
    protected $primaryKey = 'batch_transfer_line_id';

    protected $fillable = [
        'batch_inventory_id',
        'batch_transfer_weight',
        'batch_transfer_date',
        'batch_transfer_from',
        'batch_transfer_to',
    ];

    public function batchInventory()
    {
        return $this->belongsTo(BatchInventory::class, 'batch_inventory_id', 'batch_inventory_id');
    }
}
