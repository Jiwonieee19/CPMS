<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EquipmentStockOutLine extends Model
{
    protected $table = 'equipment_stock_out_line';
    protected $primaryKey = 'equipment_stock_out_id';

    protected $fillable = [
        'equipment_inventory_id',
        'stock_out_quantity',
        'stock_out_date',
    ];

    public function equipmentInventory()
    {
        return $this->belongsTo(EquipmentInventory::class, 'equipment_inventory_id', 'equipment_inventory_id');
    }
}
