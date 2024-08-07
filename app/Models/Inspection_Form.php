<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inspection_Form extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date_of_request',
        'property_number',
        'acq_date',
        'acq_cost',
        'brand_model',
        'serial_engine_no',
        'type_of_property',
        'property_description',
        'location',
        'complain',
        'supervisor_name',
        'supervisor_approval',
        'admin_approval',
        'inspector_status',
        'form_status',
        'remarks'
    ];

    public function user()
    {
        return $this->belongsTo(PPAUser::class, 'user_id');
    }

    public function relatedModels()
    {
        return $this->hasMany(AdminInspectionForm::class);
    }

    public function ForInspector()
    {
        return $this->hasMany(Inspector_Form::class);
    }
}
