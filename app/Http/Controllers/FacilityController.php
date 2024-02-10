<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\FacilityRequest;
use App\Models\PPAUser;
use App\Models\FacilityModel;
use Illuminate\Support\Facades\URL;

class FacilityController extends Controller
{
     /**
     * Show data on Facility Form page
     */
    public function show(Request $request, $id)
    {
        //Get the data
        $viewRequest = FacilityModel::find($id);

        //Get the user details
        $ppaUser = $viewRequest->user;
        $endUser = $ppaUser->fname . ' ' . $ppaUser->mname. '. ' . $ppaUser->lname;
        $userSignature = URL::to('/storage/esignature/' . $ppaUser->image);

        $ManagerUser = PPAUser::where('code_clearance', 1)->first();
        $ManagerName = $ManagerUser->fname . ' ' . $ManagerUser->mname. '. ' . $ManagerUser->lname;
        $ManagerSignature = URL::to('/storage/esignature/' . $ManagerUser->image);

        // Create the response data
        $respondData = [
            'main_form' => $viewRequest,
            'requestor' => [
                'name' => $endUser,
                'signature' => $userSignature,
                'position' => $ppaUser->position
            ],
            'manager' => [
                'name' => $ManagerName,
                'signature' => $ManagerSignature,
            ]
        ];

        return response()->json($respondData);
    }

    /**
     * For OPR Form on GSO
     */
    public function StoreOPRFormGSO(Request $request, $id)
    {
        //Validate
        $validatedData = $request->validate([
            'obr_comment' => 'nullable|string',
        ]);

        // Find the facility by ID
        $facilityOPR = FacilityModel::where('id', $id)->first();

        // Check if the facility exists
        if (!$facilityOPR) {
            return response()->json(['message' => 'Facility not found'], 404);
        }

        // Update the obr_instruct field
        $facilityOPR->update([
            'obr_comment' => $validatedData['obr_comment'],
            'admin_approval' => 1
        ]);

        return response()->json(['message' => 'OPR instruction stored successfully'], 200);

    }

    /**
     * For OPR Form on Admin
     */
    public function StoreOPRFormAdmin(Request $request, $id)
    {
        //Validate
        $validatedData = $request->validate([
            'obr_instruct' => 'nullable|string',
        ]);

        // Find the facility by ID
        $facilityOPR = FacilityModel::where('id', $id)->first();

        // Check if the facility exists
        if (!$facilityOPR) {
            return response()->json(['message' => 'Facility not found'], 404);
        }

        // Update the obr_instruct field
        $facilityOPR->update([
            'obr_instruct' => $validatedData['obr_instruct'],
        ]);

        return response()->json(['message' => 'OPR instruction stored successfully'], 200);

    }

    /**
     * Store a newly created resource in storage.
     * Request Facility and Venue
     */
    public function store(FacilityRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = auth()->user()->id;

        $userId = PPAUser::find($data['user_id']);

        $deploymentData = FacilityModel::create($data);

        if (!$deploymentData) {
            return response()->json(['error' => 'Data Error'], 500);
        }

        // return a response, for example:
        return response()->json(['message' => 'Deployment data created successfully'], 200);
    }

    /**
     * For Approve Form
     */
    public function AdminApproval(Request $request, $id)
    {
        // Find the facility by ID
        $facility = FacilityModel::find($id);

        // Check if the facility exists
        if (!$facility) {
            return response()->json(['message' => 'Facility not found'], 404);
        }

        // Update the obr_instruct field
        $facility->update([
            'admin_approval' => 2,
            'date_approve' => today(),
        ]);

        $facility->remarks = "The Admin Manager has approve your request";

        if ($facility->save()) {
            return response()->json(['message' => 'Deployment data created successfully'], 200);
        } else {
            return response()->json(['message' => 'Failed to update the request'], 500);
        }

        return response()->json(['message' => 'OPR instruction stored successfully'], 200);

    }

    /**
     * For Dispprove Form
     */
    public function AdminDispprove(Request $request, $id)
    {
        // Find the facility by ID
        $facility = FacilityModel::find($id);

        // Check if the facility exists
        if (!$facility) {
            return response()->json(['message' => 'Facility not found'], 404);
        }

        // Update the obr_instruct field
        $facility->update([
            'admin_approval' => 3,
            'date_approve' => today(),
        ]);

        return response()->json(['message' => 'OPR instruction stored successfully'], 200);

    }
}
