<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EquipmentStockInLine extends Model
{
    protected $table = 'equipment_stock_in_line';
    protected $primaryKey = 'equipment_stock_in_line_id';
    public $timestamps = false;

    protected $fillable = [
        'equipment_inventory_id',
        'supplier_name',
        'stock_in_weight',
        'stock_in_date',
    ];

    public function inventory()
    {
        return $this->belongsTo(EquipmentInventory::class, 'equipment_inventory_id', 'equipment_inventory_id');
    }
}
