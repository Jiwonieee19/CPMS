<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeatherAlert extends Model
{
    protected $primaryKey = 'alert_id';
    protected $fillable = [
        'alert_message',
        'alert_severity',
        'alert_action',
        'alert_date',
        'weather_id',
        'staff_id'
    ];
}
