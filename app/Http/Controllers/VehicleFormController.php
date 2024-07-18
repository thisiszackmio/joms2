<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\VehicleForm;
use App\Models\PPAUser;
use App\Models\Logs;
use App\Http\Requests\VehicleFormRequest;
use Illuminate\Support\Facades\URL;

class VehicleFormController extends Controller
{

    /**
     * Show the information
     */
    public function index()
    {
        $vehicleForms = VehicleForm::with('user')->orderBy('created_at', 'desc')->get();

        $responseData = [];

        foreach ($vehicleForms as $vehicleForm) {
            // Access the related PPAUser data
            $ppaUser = $vehicleForm->user;

            // You can now access PPAUser properties like fname, lname, etc.
            $userName = $ppaUser->fname;
            $userMiddleInitial = $ppaUser->mname;
            $userLastName = $ppaUser->lname;

            // Count the number of passengers for the specific vehicle form ID
            $passengersCount = count(explode("\n", $vehicleForm->passengers));

            $responseData[] = [
                'vehicleForms' => $vehicleForm,
                'passengersCount' => $passengersCount,
                'user_details' => [
                    'fname' => $userName,
                    'mname' => $userMiddleInitial,
                    'lname' => $userLastName,
                ]
            ];
        }

        return response()->json($responseData);
    }

    /**
     * Show information on my request
     */
    public function myRequest(Request $request, $id)
    {
        $myRequest = PPAUser::find($id);

        $getvehicleslipForms = VehicleForm::where('user_id', $id)->orderBy('created_at', 'desc')->get(); 

        $passengersCounts = [];
        
        foreach ($getvehicleslipForms as $vehicleForm) {
            $passengersData = $vehicleForm->passengers;
            $passengersArray = explode("\n", $passengersData);
            $passengersCount = count($passengersArray);
    
            $passengersCounts[] = [
                'passengers_count' => $passengersCount,
            ];
        }

        $respondData = [
            'my_user' => $myRequest,
            'view_vehicle' => $getvehicleslipForms,
            'passenger_count' => $passengersCounts
        ];

        return response()->json($respondData);
    }

    /**
     * Show the information on the Request
     */
    public function show(Request $request, $id)
    {
        // Root URL
        $rootUrl = URL::to('/');
        
        $vehicleForm = VehicleForm::find($id);

        $ppaUser = $vehicleForm->user;
        $endUser = $ppaUser->fname . ' ' . $ppaUser->mname. '. ' . $ppaUser->lname;
        $userSignature = ('http://20.20.2.1:81/storage/app/public/esignature/' . $ppaUser->image);
        //$userSignature = $rootUrl . '/storage/esignature/' . $ppaUser->image;
        $userPosition = $ppaUser->position;

        //For Admin Manager
        $ManagerUser = PPAUser::where('code_clearance', 1)->first(); // ID Number of Maam Daisy

        if (!$ManagerUser) {
            return response()->json(['message' => 'Data not found'], 404);
        }

        $ManagerName = $ManagerUser->fname . ' ' . $ManagerUser->mname. '. ' . $ManagerUser->lname;
        $ManagerSignature = $rootUrl . '/storage/esignature/' . $ManagerUser->image;

        $respondData = [
            'vehicle_form' => $vehicleForm,
            'requestor' => [
                'name' => $endUser,
                'signature' => $userSignature,
                'position' => $userPosition,
            ],
            'manager_user_details' => [
                'manager_name' => $ManagerName,
                'manager_signature' => $ManagerSignature,
            ],
        ];

        return response()->json($respondData);
    }

    /**
     * Submit the information
     */
    public function store(VehicleFormRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = auth()->user()->id;

        $userId = PPAUser::find($data['user_id']);

        $deploymentData = VehicleForm::create($data);

        // Creating logs
        $logs = new Logs();
        $logs->remarks = $request->input('logs');
        $logs->save();

        if (!$deploymentData) {
            return response()->json(['error' => 'Data Error'], 500);
        }

        // return a response, for example:
        return response()->json(['message' => 'Deployment data created successfully'], 200);
    }

    /**
     * Submit a Vehicle Form
     */
    public function submitVehicle (Request $request, $id)
    {
        $validatedData = $request->validate([
            'vehicle_type' => 'required|string',
            'driver' => 'required|string'
        ]);

        $v2 = VehicleForm::find($id);

        if ($v2) {
            $v2->update([
                'vehicle_type' => $validatedData['vehicle_type'],
                'driver' => $validatedData['driver'],
                'admin_approval' => 4,
                'remarks' => 'The GSO has filled your slip and submit to the Admin Manager for approval.'
            ]);
        }

        // Creating logs
        $logs = new Logs();
        $logs->remarks = $request->input('logs');
        $logs->save();

        return response()->json(['message' => 'Vehicle form submitted successfully'], 200);
    }

    /**
     * Approve by the Division Manager
     */
    public function adminApprove(Request $request, $id)
    {
        $approveRequest = VehicleForm::find($id);

        $approveRequest->admin_approval = 2;
        $approveRequest->remarks = 'The Admin Manager has approved the request';

        if ($approveRequest->save()) {
            // Creating logs
            $logs = new Logs();
            $logs->remarks = $request->input('logs');
            $logs->save();

            return response()->json(['message' => 'Deployment data created successfully'], 200);
        } else {
            return response()->json(['message' => 'Failed to update the request'], 500);
        }
    }

    /**
     * Dispprove by the Division Manager
     */
    public function adminDisapprove(Request $request, $id)
    {
        $approveRequest = VehicleForm::find($id);

        $approveRequest->admin_approval = 3;
        $approveRequest->remarks = 'The Admin Manager has disapproved the request';

        if ($approveRequest->save()) {
            // Creating logs
            $logs = new Logs();
            $logs->remarks = $request->input('logs');
            $logs->save();
            
            return response()->json(['message' => 'Deployment data created successfully'], 200);
        } else {
            return response()->json(['message' => 'Failed to update the request'], 500);
        }
    }

    /**
     * Close Request
     */
    public function closeRequest(Request $request, $id)
    {
        $approveRequest = VehicleForm::find($id);

        $approveRequest->admin_approval = 1;
        $approveRequest->remarks = "The request is closed";

        if ($approveRequest->save()) {
            // Creating logs
            $logs = new Logs();
            $logs->remarks = $request->input('logs');
            $logs->save();

            return response()->json(['message' => 'Deployment data created successfully'], 200);
        } else {
            return response()->json(['message' => 'Failed to update the request'], 500);
        }
    }


}
