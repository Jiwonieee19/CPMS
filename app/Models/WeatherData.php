<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeatherData extends Model
{
    protected $primaryKey = 'weather_id';
    protected $fillable = [
        'data_date',
        'temperature',
        'humidity',
        'wind_speed',
        'weather_condition',
        'temperature_end',
        'humidity_end',
        'wind_speed_end',
        'weather_condition_end'
    ];
}
