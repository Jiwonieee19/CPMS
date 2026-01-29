<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EquipmentInventory extends Model
{
    protected $table = 'equipment_inventory';
    protected $primaryKey = 'equipment_inventory_id';

    protected $fillable = [
        'equipment_id',
        'equipment_status',
        'created_at',
        'updated_at'
    ];

    public function equipment()
    {
        return $this->belongsTo(Equipments::class, 'equipment_id', 'equipment_id');
    }
}
