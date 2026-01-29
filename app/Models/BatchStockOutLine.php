<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BatchStockOutLine extends Model
{
    protected $table = 'batch_stock_out_line';
    protected $primaryKey = 'batch_stock_out_id';

    protected $fillable = [
        'batch_inventory_id',
        'stock_out_weight',
        'stock_out_date'
    ];

    public function batchInventory()
    {
        return $this->belongsTo(BatchInventory::class, 'batch_inventory_id', 'batch_inventory_id');
    }
}
