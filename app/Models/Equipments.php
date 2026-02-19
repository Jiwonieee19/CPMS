<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Equipments extends Model
{
    protected $table = 'equipments';
    protected $primaryKey = 'equipment_id';
    
    // Disable updated_at since table only has created_at
    const UPDATED_AT = null;
    
    protected $fillable = [
        'equipment_name',
        'supplier_name',
        'equipment_type',
        'created_at'
    ];

    public function inventory()
    {
        return $this->hasOne(EquipmentInventory::class, 'equipment_id', 'equipment_id');
    }
}
