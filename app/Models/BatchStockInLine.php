<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Batch_Stock_In_Line extends Model
{
    protected $table = 'batch_stock_in_line';
    protected $primaryKey = 'batch_stock_in_id';

    protected $fillable = [
        'batch_id',
        'batch_inventory_id',
        'supplier_name',
        'stock_in_weight',
        'stock_in_date,'
    ];

    public function batch()
    {
        return $this->belongsTo(Batches::class, 'batch_id', 'batch_id');
    }

    public function inventory()
    {
        return $this->belongsTo(BatchInventory::class, 'batch_inventory_id', 'batch_inventory_id');
    }
}
