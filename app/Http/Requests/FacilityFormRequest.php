<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FacilityFormRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules()
    {
        return [
            'user_id' => 'exists:p_p_a_users,id',
            'date_requested' => 'required|date',
            'request_office' => 'required|string',
            'title_of_activity' => 'required|string',
            'date_start' => 'required|date',
            'time_start' => 'required|date_format:H:i',
            'date_end' => 'required|date',
            'time_end' => 'required|date_format:H:i',
            'mph' => 'required|numeric',
            'conference' => 'required|numeric',
            'dorm' => 'required|numeric',
            'other' => 'required|numeric',
            'admin_approval' => 'required|numeric',
            'date_approve' => 'nullable|date',
            'obr_instruct' => 'nullable|string',
            'obr_comment' => 'nullable|string',
            'remarks' => 'nullable|string',
        ];
    }
}
