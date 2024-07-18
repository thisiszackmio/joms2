<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PPAUser;
use App\Models\AssignPersonnel;
use App\Models\AdminInspectionForm;
use App\Models\VehicleForm;
use App\Models\Logs;
use App\Http\Requests\AssignPersonnelRequest;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    /**
     * Get Supervisor on (Inspection For,\m)
     */
    public function getSupervisor()
    {
        $getUser = PPAUser::where('code_clearance', 4)->get();

        $filteredUsers = $getUser->map(function ($user){
            $id = $user->id;
            $fullname = $user->fname. ' ' .$user->mname. '. ' .$user->lname; 
            return [
                'id' => $id,
                'fullname' => $fullname
            ];
        });

        return response()->json($filteredUsers);
    }
    

    /**
     * Display all Users (User List)
     */
    public function getAllUser(){
        $Allusers = PPAUser::orderBy('lname')->get();
        
        $userData = [];

        foreach ($Allusers as $user){
            $userData[] = [
                'userId' => $user->id,
                'name' => strtoupper($user->lname). ", ".$user->fname. " ".$user->mname. ".",
                'username' => basename($user->username),
                'division' => $user->division,
                'position' => $user->position,
                'code_clearance' => $user->code_clearance,
                'esig' => $user->image
            ];
        }

        return response()->json($userData);
    }

    /**
     * Display User Details
     */
    public function getUserDetails($id){

        // Root URL
        $rootUrl = URL::to('/');

        $getUser = PPAUser::find($id);

        $userData = [
            'id' => $getUser->id,
            'name' => $getUser->fname ." " . $getUser->mname . ". " . $getUser->lname,
            'position' => $getUser->position,
            'division' => $getUser->division,
            'code' => $getUser->code_clearance,
            'username' => basename($getUser->username),
            'signature' =>  ('http://20.20.2.1:81/storage/app/public/esignature/' . $getUser->image),
            //'signature' =>  $rootUrl . '/storage/esignature/' . $getUser->image,
            'image_name' => $getUser->image
        ];

        return response()->json($userData);
    }

    /**
     * Get all the Assign Personnels
     */
    public function getPersonnel(){
        $getPersonnel = AssignPersonnel::orderBy('type_of_personnel')->get();
        $personnelIds = $getPersonnel->pluck('user_id');
        $userDetails = PPAUser::whereIn('id', $personnelIds)->get();

        $getInspDet = AdminInspectionForm::all();
        
        $getVehicleDet = VehicleForm::all();
        $driverNames = $getVehicleDet->pluck('driver');
        $getVehicleCount = $driverNames->groupBy(function ($item) {
            return $item; // Group by driver names
        })->map(function ($group) {
            return $group->count(); // Count occurrences of each driver name
        });

        $PersonnelDetails = $getPersonnel->map(function ($personnel) use ($userDetails, $getInspDet, $getVehicleCount){
            $user = $userDetails->where('id', $personnel->user_id)->first();
            $userName = $user->fname . ' ' . $user->mname . '. ' . $user->lname;
            $getInspId = $getInspDet->where('assign_personnel', $personnel->user_id);

            return [
                'personnel_id' => $personnel->id,
                'personnel_name' => $userName,
                'personnel_type' => $personnel->type_of_personnel,
                'count' => $getInspId->count() + $getVehicleCount->get($userName, 0),
            ];
        });

        return response()->json($PersonnelDetails);
    }

    /**
     * Assign User
     */
    public function AssignPersonnel(){
        $getPersonnel = AssignPersonnel::all();
        $personnelIds = $getPersonnel->pluck('user_id');

        $ppa = PPAUser::queryUserExcept($personnelIds)->where('image', '!=', 'null')->whereNotNull('image');

        $formattedUsers = $ppa->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->fname . ' ' . $user->mname . '. ' . $user->lname
            ];
        })->values()->all();

        return response()->json($formattedUsers);
    }

     /**
     * Get Driver Information.
     */
    public function getDriver()
    {
        $driverRecords = AssignPersonnel::where('type_of_personnel', 'Driver/Mechanic')->get();
        $driverIds = $driverRecords->pluck('user_id')->all();

        $drivers = PPAUser::whereIn('id', $driverIds)->get();
        $driverNames = $drivers->map(function ($driver) {
            return [
                'driver_id' => $driver->id,
                'driver_name' => $driver->fname . ' ' . $driver->mname . '. ' . $driver->lname,
            ];
        });

        return response()->json($driverNames);
    }

    /**
     * Update User Details
     * (position, division, username)
     */
    public function updateUserDetails(Request $request, $id)
    {

        //Validate
        $validatedData = $request->validate([
            'position' => 'nullable|string',
            'division' => 'nullable|string',
            'username' => 'nullable|string',
            'code_clearance' => 'nullable|numeric'
        ]);

        $getUser = PPAUser::find($id);

        if (!$getUser) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $updateResult = $getUser->update([
            'position' => $validatedData['position'],
            'division' => $validatedData['division'],
            'username' => $validatedData['username'],
            'code_clearance' => $validatedData['code_clearance'],
        ]);

        if ($updateResult) {
             // Creating logs
             $logs = new Logs();
             $logs->remarks = $request->input('logs');
             $logs->save();

            return response()->json(['message' => 'User details updated successfully.'], 200);
        } else {
            return response()->json(['message' => 'There area some missing.'], 204);
        }

    }

    /**
     * Update User's Signature
     */
    public function updateSignature(Request $validatedData, $id){

        // Validate the request
        $validatedData->validate([
            'image' => [
                'nullable',
                'file',
                'mimes:png',
                'max:2000',
            ],
        ]);

        $getUser = PPAUser::find($id);

        if (!$getUser) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        // Check if a file was uploaded
        if ($validatedData->hasFile('image')) {
            $image = $validatedData->file('image');
            $extension = $image->getClientOriginalExtension();

            $name = str_replace(' ', '_', trim($getUser->fname)) . '_' . $getUser->lname;
            $timestamp = now()->format('Y');
            $imageName = $name . '_' . $timestamp . '.' . $extension;

            // Delete the old image
            if (!empty($getUser->image) && Storage::disk('public')->exists('esignature/' . $getUser->image)) {
                Storage::disk('public')->delete('esignature/' . $getUser->image);
            }

            // Save the image to the public disk
            Storage::disk('public')->put('esignature/' . $imageName, file_get_contents($image));

            // Update the user's e-signature field in the database
            $getUser->update(['image' => $imageName]);

            // Creating logs
            $logs = new Logs();
            $logs->remarks = $validatedData->input('logs');
            $logs->save();

            return response()->json(['message' => 'E-Signature updated successfully'], 200);
        } else {
            return response()->json(['message' => 'No file uploaded'], 422);
        }

    }

    /**
     * Update User's Password
     */
    public function updatePassword(Request $request, $id){

        $request->validate([
            'password' => [
                'required',
                Password::min(8) // At least 8 characters
                    ->mixedCase() // At least one uppercase and one lowercase character
                    ->numbers()    // At least one number
                    ->symbols()    // At least one symbol
            ],
        ]);

        $getUser = PPAUser::find($id);

        if (!$getUser) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $updateResult = $getUser->update([
            'password' => Hash::make($request->input('password')),
            'pwd_change' => 1
        ]);

        if ($updateResult) {
             // Creating logs
             $logs = new Logs();
             $logs->remarks = $request->input('logs');
             $logs->save();

            return response()->json(['message' => 'User details updated successfully.'], 200);
        } else {
            return response()->json(['message' => 'There area some missing.'], 204);
        }
    }

    /**
     * Update User's Password (their own password)
     */
    public function updateUserPassword(Request $request, $id){

        $request->validate([
            'password' => [
                'required',
                Password::min(8) // At least 8 characters
                    ->mixedCase() // At least one uppercase and one lowercase character
                    ->numbers()    // At least one number
                    ->symbols()    // At least one symbol
            ],
        ]);

        $getUser = PPAUser::find($id);

        if (!$getUser) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $updateResult = $getUser->update([
            'password' => Hash::make($request->input('password')),
            'pwd_change' => 0
        ]);

        if ($updateResult) {
            // Creating logs
            $logs = new Logs();
            $logs->remarks = $request->input('logs');
            $logs->save();

           return response()->json(['message' => 'User details updated successfully.'], 200);
       } else {
           return response()->json(['message' => 'There area some missing.'], 204);
       }
    }

    /**
     * Store Assign Personnel
     */
    public function assign(AssignPersonnelRequest $request){
        $data = $request->validated();

        $deploymentData = AssignPersonnel::create($data);

        if (!$deploymentData) {
            return response()->json(['error' => 'Data Error'], 500);
        } else {
            $update = PPAUser::where('id', $data['user_id'])->first();
            if ($update->code_clearance == 5) {
                $update->code_clearance = 6;
                $update->save(); // Save the changes to the database

                // Creating logs
                $logs = new Logs();
                $logs->remarks = $request->input('logs');
                $logs->save();
            }
        }

        return response()->json(['message' => 'Deployment data created successfully'], 200);
    }

    /**
     * Remove Personnel List on View Form.
     */
    public function RemovePersonnel(Request $request, $id)
    {
        $user = AssignPersonnel::find($id);
    
        if (!$user) {
            return response()->json(['message' => 'Personnel not found'], 404);
        }

        $update = PPAUser::where('id', $user->user_id)->first();
        $update->code_clearance;

        if ($update->code_clearance == 6) {
            $update->code_clearance = 5;
            $update->save();
        }

        // Creating logs
        $logs = new Logs();
        $logs->remarks = $request->input('logs');
        $logs->save();
        
        $user->delete();
    
        return response()->json(['message' => 'Personnel deleted successfully'], 200);
    }

    /**
     * Delete / Remove Account
     */
    public function DeleteAccount(Request $request, $id)
    {
        $getUser = PPAUser::find($id);

        if (!$getUser) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $getUser->code_clearance = 0;
        $getUser->save();

        // Create a new Logs record with the remarks from the request
        $logs = new Logs();
        $logs->remarks = $request->input('logs');
        $logs->save();

        return response()->json(['message' => 'Request closed successfully'], 200);
    }
}
