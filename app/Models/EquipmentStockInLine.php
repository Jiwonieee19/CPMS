<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Equipment_Stock_In_Line extends Model
{
    protected $table = 'equipment_stock_in_line';
    protected $primaryKey = 'equipment_stock_in_id';

    protected $fillable = [
        'equipment_id',
        'equipment_inventory_id',
        'supplier_name',
        'stock_in_condition',
        'stock_in_date',
    ];

    public function equipment()
    {
        return $this->belongsTo(Equipments::class, 'equipment_id', 'equipment_id');
    }

    public function inventory()
    {
        return $this->belongsTo(EquipmentInventory::class, 'equipment_inventory_id', 'equipment_inventory_id');
    }
}
