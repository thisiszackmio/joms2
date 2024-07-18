<?php

namespace App\Http\Controllers;

use App\Http\Requests\InspectionFormRequest;
use App\Http\Requests\GetNotificationRequest;
use App\Http\Requests\StoreAdminInspectionRequest;
use App\Http\Requests\Inspector_Form_Request;
use App\Models\Inspection_Form;
use App\Models\PPAUser;
use App\Models\AssignPersonnel;
use App\Models\Inspector_Form;
use App\Models\AdminInspectionForm;
use App\Models\NotificationModel;
use App\Models\Logs;
use App\Models\NotificationsModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class InspectionFormController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $inspectionForms = Inspection_Form::with('user')->orderBy('created_at', 'desc')->get();

        $responseData = [];

        foreach ($inspectionForms as $inspectionForm) {
            // Access the related PPAUser data
            $ppaUser = $inspectionForm->user;
    
            // You can now access PPAUser properties like fname, lname, etc.
            $userName = $ppaUser->fname;
            $userMiddleInitial = $ppaUser->mname;
            $userLastName = $ppaUser->lname;
            $userclearance = $ppaUser->code_clearance;
    
            // Add the Inspection_Form data along with related PPAUser data to the response
            $responseData[] = [
                'inspection_form' => $inspectionForm,
                'user_details' => [
                    'fname' => $userName,
                    'mname' => $userMiddleInitial,
                    'lname' => $userLastName,
                    'code_clearance' => $userclearance,
                ]
            ];
        }

        return response()->json($responseData);
    }

    /**
     * Show data on Pre-Repair/Post Repair Inspection Form Page.
     */
    public function getInspectionForm(Request $request, $id)
    {
        // Root URL
        $rootUrl = URL::to('/');

        $InspectionRequest = Inspection_Form::find($id);
        $AdminInspectionRequest = AdminInspectionForm::where('inspection__form_id', $id)->first();
        $InspectorRequest = Inspector_Form::where('inspection__form_id', $id)->first();

        //Get the requestor data
        $ppaUser = $InspectionRequest->user;
        $reqUser = $ppaUser->fname . ' ' . $ppaUser->mname. '. ' . $ppaUser->lname;
        $reqSignature = ('http://20.20.2.1:81/storage/app/public/esignature/' . $ppaUser->image);
        //$reqSignature =  $rootUrl . '/storage/esignature/' . $ppaUser->image;

        //Get the Supervisor data
        $supervisor = PPAUser::find($InspectionRequest->supervisor_name);
        $supervisorName = $supervisor->fname . ' ' . $supervisor->mname. '. ' . $supervisor->lname;
        $supervisorSignature = ('http://20.20.2.1:81/storage/app/public/esignature/' . $supervisor->image);
        //$supervisorSignature = $rootUrl . '/storage/esignature/' . $supervisor->image;

        //Get the GSO data
        $gsoUser =  PPAUser::where('code_clearance', 3)->first();
        $gsoName = $gsoUser->fname . ' ' . $gsoUser->mname. '. ' . $gsoUser->lname;
        $gsoSignature = ('http://20.20.2.1:81/storage/app/public/esignature/' . $gsoUser->image);
        //$gsoSignature = $rootUrl . '/storage/esignature/' . $gsoUser->image;

        //Get Admin Manager data
        $managerUser = PPAUser::where('code_clearance', 1)->first();
        $managerName = $managerUser->fname . ' ' . $managerUser->mname. '. ' . $managerUser->lname;
        $managerSignature = ('http://20.20.2.1:81/storage/app/public/esignature/' . $managerUser->image);
        //$managerSignature = $rootUrl . '/storage/esignature/' . $managerUser->image;

        //Get Personnel data
        if ($AdminInspectionRequest !== null || $InspectorRequest !== null){
            $personnelfetch = $AdminInspectionRequest->where('inspection__form_id', $id)->pluck('assign_personnel')->first();
            $personnelUser =  PPAUser::where('id', $personnelfetch)->first();
            $personnelId = $personnelUser->id;
            $personnelName = $personnelUser->fname . ' ' . $personnelUser->mname. '. ' . $personnelUser->lname;
            $personnelSignature = ('http://20.20.2.1:81/storage/app/public/esignature/' . $personnelUser->image);
            //$personnelSignature = $rootUrl . '/storage/esignature/' . $personnelUser->image;
        } else {
            $personnelfetch = null;
            $personnelUser =  null;
            $personnelId = null;
            $personnelName = null;
            $personnelSignature = null;
            $$AdminInspectionRequest = null;
        }

        //For Assign Personnel
        $pro = $InspectionRequest->type_of_property;
        if ($pro == "Vehicle Supplies & Materials") {
            $PersonnelHehe = [
                "Driver/Mechanic",
                "Janitorial Service",
                "Watering Services",
            ];
        } elseif ($pro == "IT Equipment & Related Materials") {
            $PersonnelHehe = [
                "IT Service",
                "Electronics",
                "Electrical Works",
                "Engineering Services",
            ];
        } else {
            $PersonnelHehe = [
                "Driver/Mechanic",
                "IT Service",
                "Janitorial Service",
                "Electronics",
                "Electrical Works",
                "Watering Services",
                "Engineering Services",
            ];
        }
        $assignPersonnels = AssignPersonnel::with('user')->whereIn("type_of_personnel", $PersonnelHehe)->get();

            $respondData = [
                'requestor' => [
                        'r_id' => $ppaUser->id,
                        'r_name' => $reqUser,
                        'r_sign' => $reqSignature
                    ],
                'supervisor' => [
                        'sup_id' => $supervisor->id,
                        'supName' => $supervisorName,
                        'supSign' => $supervisorSignature
                    ],
                'gso' => [
                        'gso_id' => $gsoUser->id,
                        'gsoName' => $gsoName,
                        'gsoSign' => $gsoSignature
                    ],
                'manager' => [
                        'ad_id' => $managerUser->id,
                        'ad_name' => $managerName,
                        'ad_sign' => $managerSignature
                    ],
                'personnel' => [
                    'p_id' => $personnelId,
                    'p_name' => $personnelName,
                    'p_sign' => $personnelSignature
                    ],
                'partA' => $InspectionRequest,
                'partB' => $AdminInspectionRequest,
                'partCD' => $InspectorRequest,
                'assign_personnel' => $assignPersonnels->map(function ($assignPersonnel) {
                    return [
                        'ap_id' => $assignPersonnel->user->id,
                        'ap_name' => $assignPersonnel->user->fname.' '.$assignPersonnel->user->mname.'. '.$assignPersonnel->user->lname,
                        'ap_type' => $assignPersonnel->type_of_personnel
                    ];
                })->toArray()
                 
            ];

        return response()->json($respondData);
    }

    /**
     * Show My Request On Inspection.
     */
    public function myRequestInspec(Request $request, $id)
    {
        //Find the ID of the User
        $myRequest = PPAUser::find($id);

        //Get the request
        $getInspectionForm = Inspection_Form::where('user_id', $id)->orderBy('created_at', 'desc')->get(); 
        $iID = $getInspectionForm->pluck('supervisor_name')->all();
        $getSup = PPAUser::whereIn('id', $iID)->get();
        $InspectionData = $getInspectionForm->map(function ($inspectionForm) use ($getSup) {
            $sup = $getSup->where('id', $inspectionForm->supervisor_name)->first();
            $supName = $sup->fname . ' ' .$sup->mname.'. ' . $sup->lname;
            $acqCostFormatted = number_format($inspectionForm->acq_cost, 2);
            return [
                'id' => $inspectionForm->id,
                'user_id' => $inspectionForm->user_id,
                'date_of_request' => $inspectionForm->date_of_request,
                'property_number' => $inspectionForm->property_number,
                'acq_date' => $inspectionForm->acq_date,
                'acq_cost' => $acqCostFormatted,
                'brand_model' => $inspectionForm->brand_model,
                'serial_engine_no' => $inspectionForm->serial_engine_no,
                'type_of_property' => $inspectionForm->type_of_property,
                'property_description' => $inspectionForm->property_description,
                'location' => $inspectionForm->location,
                'complain' => $inspectionForm->complain,
                'supervisor_name' => $supName,
                'remarks' => $inspectionForm->remarks
            ];
        });

        return response()->json($InspectionData);

    }

    /**
     * Store a newly created resource in storage.
     * Part A
     */
    public function store(InspectionFormRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = auth()->user()->id;

        // Send the data on Inspection Form
        $deploymentData = Inspection_Form::create($data);
        $deploymentData->save();

        // Creating logs
        $logs = new Logs();
        $logs->remarks = $request->input('logs');
        $logs->save();
        
        if(!$deploymentData){
            return response()->json(['error' => 'Data Error'], 500);
        }

        //Store Notifications
        // $noti = new NotificationsModel();
        // $noti->sender_id = $request->input('supervisor_name');
        // $noti->type_of_request = 'Pre-Repair/Post Repair Inspect Form';
        // $noti->message = $request->input('message');
        // $noti->status = 1;
        // $noti->save();

        return response()->json(['message' => 'Deployment data created successfully'], 200);
        
    }

    /**
     * Update Part A
     */
    public function updatePartA(Request $request, $id)
    {
        // Validate
        $validatedData = $request->validate([
            'property_number' => 'required|string',
            'acq_date' => 'required|string',
            'acq_cost' => 'required|string',
            'brand_model' => 'required|string',
            'serial_engine_no' => 'required|string',
        ]);

        $updateIns = Inspection_Form::where('id', $id)->first();

        if(!$updateIns){
            return response()->json(['message' => 'Facility not found'], 404);
        }

        $updateIns->update([
            'property_number' => $validatedData['property_number'],
            'acq_date' => $validatedData['acq_date'],
            'acq_cost' => $validatedData['acq_cost'],
            'brand_model' => $validatedData['brand_model'],
            'serial_engine_no' => $validatedData['serial_engine_no']
        ]);

        // Creating logs
        $logs = new Logs();
        $logs->remarks = $request->input('logs');
        $logs->save();

        return response()->json(['message' => 'OPR instruction stored successfully'], 200);
    }

    /**
     * Update Part B
     */
    public function updatePartB(Request $request, $id)
    {
        // Validate
        $validatedData = $request->validate([
            'date_of_last_repair' => 'required|string',
            'nature_of_last_repair' => 'required|string',
            'assign_personnel' => 'required|numeric',
        ]);

        $updateIns = AdminInspectionForm::where('inspection__form_id', $id)->first();

        if(!$updateIns){
            return response()->json(['message' => 'Facility not found'], 404);
        }

        $updateIns->update([
            'date_of_last_repair' => $validatedData['date_of_last_repair'],
            'nature_of_last_repair' => $validatedData['nature_of_last_repair'],
            'assign_personnel' => $validatedData['assign_personnel'],
        ]);

        // Creating logs
        $logs = new Logs();
        $logs->remarks = $request->input('logs');
        $logs->save();

        return response()->json(['message' => 'OPR instruction stored successfully'], 200);
    }

    /**
     * Update Part C
     */
    public function updatePartC(Request $request, $id)
    {
        // Validate
        $validatedData = $request->validate([
            'findings' => 'required|string',
            'recommendations' => 'required|string',
        ]);

        $updateIns = Inspector_Form::where('inspection__form_id', $id)->first();

        if(!$updateIns){
            return response()->json(['message' => 'Facility not found'], 404);
        }

        $updateIns->update([
            'findings' => $validatedData['findings'],
            'recommendations' => $validatedData['recommendations'],
        ]);

        // Creating logs
        $logs = new Logs();
        $logs->remarks = $request->input('logs');
        $logs->save();

        return response()->json(['message' => 'OPR instruction stored successfully'], 200);

    }

    /**
     * Update Part D
     */
    public function updatePartD(Request $request, $id)
    {
        // Validate
        $validatedData = $request->validate([
            'remarks' => 'required|string',
        ]);

        $updateIns = Inspector_Form::where('inspection__form_id', $id)->first();

        if(!$updateIns){
            return response()->json(['message' => 'Facility not found'], 404);
        }

        $updateIns->update([
            'remarks' => $validatedData['remarks'],
        ]);

        // Creating logs
        $logs = new Logs();
        $logs->remarks = $request->input('logs');
        $logs->save();

        return response()->json(['message' => 'OPR instruction stored successfully'], 200);
    }

    /**
     * Store a Part B of the Form.
     */
    public function storeAdmin(StoreAdminInspectionRequest $request, $id)
    {
        $datatwo = $request->validated();

        $findInspection = Inspection_Form::find($id);

        $newRecord = $findInspection->relatedModels()->create([
            'date_of_filling' => $datatwo['date_of_filling'],
            'date_of_last_repair' => $datatwo['date_of_last_repair'],
            'nature_of_last_repair' => $datatwo['nature_of_last_repair'],
            'assign_personnel' => $datatwo['assign_personnel'],
        ]);

        Inspector_Form::create([
            'inspection__form_id' => $findInspection->id,
            'before_repair_date' => '1970/01/01',
            'findings' => 'no data',
            'recommendations' => 'no data',
        ]);

        // After creating the related model, update the admin_approval to 2
        $findInspection->update([
            'admin_approval' => 3,
            'inspector_status' => 3,
            'remarks' => "The GSO has finished filling out the Part B form and is waiting for the Admin Manager to approve",
        ]);

        $logs = Logs::create([
            'remarks' => $request->input('logs'),
        ]);
        
        if ($findInspection && $logs) {
            return response()->json(['message' => 'Deployment data created successfully'], 200);
        } else {
            return response()->json(['message' => 'Failed to update the request'], 500);
        }

    }

    /**
     * Store a Part C of the Form.
     */
    public function storeInspectorForm(Request $request, $id)
    {
        // Validation rules
        $validatedData = $request->validate([
            'findings' => 'required|string',
            'recommendations' => 'required|string',
        ]);

        // Find the inspection form
        $findInspection = Inspection_Form::find($id);

        // Find inspector forms related to the inspection form
        $findInspector = Inspector_Form::where('inspection__form_id', $id)->get();

        // Update each inspector form
        foreach ($findInspector as $record) {
            $record->update([
                'before_repair_date' => $request->input('before_repair_date'),
                'findings' => $validatedData['findings'],
                'recommendations' => $validatedData['recommendations'],
            ]);
        }

        // Update inspection form status
        $findInspection->inspector_status = 2;
        $findInspection->remarks = "The inspector checked the request";

        // Save changes
        if ($findInspection->save()) {
            $logs = new Logs();
            $logs->remarks = $request->input('logs');
            $logs->save();

            return response()->json(['message' => 'Inspector form updated successfully'], 200);
        } else {
            return response()->json(['message' => 'Failed to update the request'], 500);
        }
    }

    /**
     * Input Final Data on Inspector on Part D
     */
    public function InspectorPartB(Request $request, $id)
    {
        // Validation rules
        $validatedData = $request->validate([
            'remarks' => 'required|string',
        ]);

        $p2 = Inspector_Form::where('inspection__form_id', $id)->get();

        foreach ($p2 as $record) {
            $record->update([
                'after_reapir_date' => $request->input('after_reapir_date'),
                'remarks' => $validatedData['remarks'],
            ]);
        }

        $inspR = $p2->first()->inspection__form_id;
    
        $findInspection = Inspection_Form::find($inspR);

        $logs = new Logs();
        $logs->remarks = $request->input('logs');
        $logs->save();

        if ($findInspection) {
            $findInspection->inspector_status = 1;
            $findInspection->remarks = "The inspector completed the request";
            $findInspection->save();

            return response()->json(['message' => 'Update successful'], 200);
        } else {
            return response()->json(['message' => 'Failed to update the request'], 500);
        }

    }

    /**
     * For Supervisor Approval
     */
    public function updateApprove(Request $request, $id)
    {
        // Find the Inspection_Form record with the given ID
        $approveRequest = Inspection_Form::find($id);

        // Update the approval status and remarks of the Inspection_Form record
        $approveRequest->supervisor_approval = 1;
        $approveRequest->admin_approval = 4;
        $approveRequest->remarks = "Approved by Supervisor";

        // Save the updated Inspection_Form record to the database
        if ($approveRequest->save()) {
            // Create a new Logs record with the remarks from the request
            $logs = new Logs();
            $logs->remarks = $request->input('logs');
            $logs->save();

            // Return a success response
            return response()->json(['message' => 'Deployment data updated successfully'], 200);
        } else {
            // Return an error response
            return response()->json(['message' => 'Failed to update the request'], 500);
        }
    }

    /**
     * For Supervisor Disapproval
     */
    public function updateDisapprove(Request $request, $id)
    {

        $disapproveRequest = Inspection_Form::find($id);

        $disapproveRequest->supervisor_approval = 2;
        $disapproveRequest->form_status = 1;
        $reason = $request->input('reason');
        if($reason == 'Others'){
            $disapproveRequest->remarks = "Disapproved by Supervisor (Reason: " .$request->input('other_reason'). ")";
        }else{
            $disapproveRequest->remarks = "Disapproved by Supervisor (Reason: " .$request->input('reason'). ")";
        }

        if ($disapproveRequest->save()) {
            // Create a new Logs record with the remarks from the request
            $logs = new Logs();
            $logs->remarks = $request->input('logs');
            $logs->save();

            // Return a success response
            return response()->json(['message' => 'Deployment data created successfully'], 200);
        } else {
            return response()->json(['message' => 'Failed to update the request'], 500);
        }
    }

    /**
     * For Admin Approval
     */
    public function updateAdminApprove(Request $request, $id)
    {
        $approveAdminRequest = Inspection_Form::find($id);
        $getInspectorStat = Inspector_Form::where('inspection__form_id', $id)->first();

        if ($approveAdminRequest) {
            $approveAdminRequest->admin_approval = 1;
            $approveAdminRequest->remarks = "Approved by Admin Manager";

            if ($approveAdminRequest->save()) {

                // Create a new Logs record with the remarks from the request
                $logs = new Logs();
                $logs->remarks = $request->input('logs');
                $logs->save();

                return response()->json(['message' => 'Deployment data created successfully'], 200);
            }
        }

        return response()->json(['message' => 'Failed to update the request on Admin'], 500);
    
    }

    /**
     * For Admin Disapproval
     */
    public function updateAdminDisapprove(Request $request, $id)
    {
        $disapproveAdminRequest = Inspection_Form::find($id);
    
        $disapproveAdminRequest->admin_approval = 2;
        $disapproveAdminRequest->remarks = "Disapproved by Admin Manager (Reason: ".$request->input('adminReason').")";

        if ($disapproveAdminRequest->save()) {
            // Create a new Logs record with the remarks from the request
            $logs = new Logs();
            $logs->remarks = $request->input('logs');
            $logs->save();

            return response()->json(['message' => 'Deployment data created successfully'], 200);
        } else {
            return response()->json(['message' => 'Failed to update the request'], 500);
        }
    }

    /**
     * Close the Request
     */
    public function closeRequest(Request $request, $id)
    {
        $inspectionRequest = Inspection_Form::find($id);
        $inspectionRequest->form_status = 1;
        $inspectionRequest->remarks = "The request is closed";
        $inspectionRequest->save();

        // Create a new Logs record with the remarks from the request
        $logs = new Logs();
        $logs->remarks = $request->input('logs');
        $logs->save();
        
        return response()->json(['message' => 'Request closed successfully'], 200);
    }
}
