<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Equipments extends Model
{
    protected $table = 'equipments';
    protected $primaryKey = 'equipment_id';
    protected $fillable = [
        'equipment_name',
        'created_at'
    ];

    public function inventory()
    {
        return $this->hasOne(EquipmentInventory::class, 'batch_id', 'batch_id');
    }
}
