<?php

namespace App\Http\Controllers;

use App\Models\PPAEmployee;
use App\Models\LogsModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\RegisterRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\URL;

class AuthController extends Controller
{
    /**
     * Register the system
     */
    public function register(RegisterRequest $request) {
        try {
            if ($request->hasFile('avatar') && $request->file('avatar')->isValid() &&
                $request->hasFile('esig') && $request->file('esig')->isValid()) {
                
                $dp = $request->file('avatar');
                $dp_extension = $dp->getClientOriginalExtension();
                $esig = $request->file('esig');
                $esig_extension = $esig->getClientOriginalExtension();
    
                // Check if the image is png, jpeg, jpg
                if (($dp_extension !== 'png' && $dp_extension !== 'jpeg' && $dp_extension !== 'jpg') || 
                    ($esig_extension !== 'png' && $esig_extension !== 'jpeg' && $esig_extension !== 'jpg')) {
                    return response()->json(['message' => "This is not the format that we want"], 400);
                }

                // Check if the passwords is are not match
                if($request->input('password') != $request->input('consfirmPassword')){
                    return response()->json(['error' => "Passwords do not match"], 422);
                }
    
                // Generate a file name
                $name = preg_replace('/\s+/', '_', trim($request->input('firstname'))) . '_' . $request->input('lastname');
                $dp_name = $name . '_avatar.' . $dp_extension;
                $esig_name = $name . '_esignature.' . $esig_extension;
    
                $user = PPAEmployee::create([
                    'firstname' => $request->input('firstname'),
                    'middlename' => $request->input('middlename'),
                    'lastname' => $request->input('lastname'),
                    'gender' => $request->input('gender'),
                    'division' => $request->input('division'),
                    'position' => $request->input('position'),
                    'code_clearance' => $request->input('code_clearance'),
                    'avatar' => $dp_name,
                    'esign' => $esig_name,
                    'username' => $request->input('username'),
                    'password' => Hash::make($request->input('password')),
                    'status' => $request->input('status'),
                ]);
    
                // Save files to storage
                Storage::disk('public')->put('displaypicture/' . $dp_name, file_get_contents($dp));
                Storage::disk('public')->put('displayesig/' . $esig_name, file_get_contents($esig));

                // Logs
                $logs = new LogsModel();
                $logs->category = 'User';
                $logs->message = $request->input('firstname') . ' ' . $request->input('middlename') . '. ' . $request->input('lastname') . ' has been added to the system database ';
                $logs->save();
                
                return response()->json([
                    'message' => "Product successfully created."
                ], 200);
            } else {
                return response()->json([
                    'message' => "Invalid image file."
                ], 400);
            }
        } catch (\Exception $e) {
            // Log the exception for debugging
            Log::error('Exception: ' . $e->getMessage());
    
            return response()->json([
                'message' => "Something went wrong. Please check the server logs for more details."
            ], 500);
        }
    }

    /**
     * Login on the system
     */
    public function login(Request $request){

        // Root URL
        $rootUrl = URL::to('/');

        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string'
        ]);

        $user = PPAEmployee::where('username', $credentials['username'])->first();

        // Check if the user account exists and the password is valid
        if(!$user || !Hash::check($credentials['password'], $user->password)){
            return response()->json(['error' => 'Invalid Username / Password'], 422);
        }

        // Check if the user is need to change pass
        if($user->status == 2){
            return response()->json(['error' => 'Change Pass'], 422);
        }

        // Check if the user is active
        if($user->status == 0){
            return response()->json(['error' => 'This account is no longer active'], 404);
        }

        $userdata = [
            'id' => $user->id,
            'name' => $user->firstname . ' ' . $user->middlename . '. ' . $user->lastname,
            'firstname' => $user->firstname,
            'gender' => $user->gender,
            'avatar' =>  $rootUrl . '/storage/displaypicture/' . $user->avatar
        ];

        return response([
            'userid' => $userdata,
            'code' => $user->code_clearance,
            'token' => $user->createToken('main')->plainTextToken
        ]);
    
    }

    /**
     * Logout on the system
     */
    public function logout(Request $request){
        /** @var PPAUser $user */
        $user = Auth::user();
        $user->currentAccessToken()->delete();

        return response([
            'success' => true
        ]);
    }

    
}
