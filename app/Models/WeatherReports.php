<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeatherReports extends Model
{
    protected $primaryKey = 'report_id';
    protected $fillable = [
        'report_message',
        'report_date',
        'report_action',
        'weather_id',
        'staff_id'
    ];
}
