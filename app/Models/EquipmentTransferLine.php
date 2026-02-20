<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EquipmentTransferLine extends Model
{
    protected $table = 'equipment_transfer_line';
    protected $primaryKey = 'equipment_transfer_line_id';
    public $timestamps = false;

    protected $fillable = [
        'equipment_inventory_id',
        'equipment_transfer_quantity',
        'equipment_transfer_date',
        'equipment_transfer_from',
        'equipment_transfer_to',
    ];
    public function equipmentInventory()
    {
        return $this->belongsTo(EquipmentInventory::class, 'equipment_inventory_id', 'equipment_inventory_id');
    }
}
