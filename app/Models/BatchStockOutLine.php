<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BatchStockOutLine extends Model
{
    protected $table = 'batch_stock_out_line';
    protected $primaryKey = 'batch_stock_out_id';
    public $timestamps = false;

    protected $fillable = [
        'batch_id',
        'stock_out_date'
    ];

    public function batch()
    {
        return $this->belongsTo(Batches::class, 'batch_id', 'batch_id');
    }
}
