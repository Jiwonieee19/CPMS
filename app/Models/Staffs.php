<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Staffs extends Model
{
    protected $table = 'staffs';
    protected $primaryKey = 'staff_id';

    protected $fillable = [
        'staff_firstname',
        'staff_lastname',
        'staff_role',
        'staff_email',
        'staff_contact',
        'staff_password',
        'staff_status'
    ];
}