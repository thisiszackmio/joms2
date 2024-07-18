<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Models\PPAUser;
use App\Models\Logs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        try{

            // Check if the username already exists
            $existingUser = PPAUser::where('username', $request->input('username'))->first();

            if ($existingUser) {
                return response()->json([
                    'message' => "Username is already taken. Please choose a different username."
                ], 422);
            }

            // Query to check if the input division and code clearance exist
            $inputRegister = PPAUser::where('division', $request->input('division'))->where('code_clearance', $request->input('code_clearance'))->first();

            // Query to check if there's an existing Port Manager
            $checkPM =  PPAUser::where('division', 'Office of the Port Manager')->where('code_clearance', 2)->first();

            if ($inputRegister && $checkPM && $inputRegister->id === $checkPM->id) {
                return response()->json([
                    'message' => "Port Manager Code Clearance is already taken"
                ], 422);
            }

            // Query if there's a existing Division Manager
            $checkDM = PPAUser::where('division', $request->input('division'))
            ->where('code_clearance', 4)
            ->first();

            if ($inputRegister && $checkDM && $inputRegister->id === $checkDM->id) {
                return response()->json([
                    'message' => $request->input('division') . " Manager Code Clearance is already taken"
                ], 422);
            }

            // Query if there's a existing Division Manager
            $checkAM = PPAUser::where('division', 'Administrative Division')
            ->where('code_clearance', 1)
            ->first();

            if ($inputRegister && $checkAM && $inputRegister->id === $checkAM->id) {
                return response()->json([
                    'message' => $request->input('division') . " Manager Code Clearance is already taken"
                ], 422);
            }

            if ($request->hasFile('image') && $request->file('image')->isValid()) {
                $image = $request->file('image');
                $extension = $image->getClientOriginalExtension();
    
                // Check if the file is a PNG image
                if ($extension !== 'png') {
                    return response()->json([
                        'message' => "Only PNG images are allowed."
                    ], 400);
                }
    
                // Generate a filename based on name and timestamp
                $name = str_replace(' ', '_', trim($request->input('fname'))) . '_' . $request->input('lname');
                $timestamp = now()->format('Y');
                $imageName = $name . '_' . $timestamp . '.' . $extension;
    
                /** @var \App\Models\User $user */
                $user = PPAUser::create([
                    'fname' => $request->input('fname'),
                    'mname' => $request->input('mname'),
                    'lname' => $request->input('lname'),
                    'gender' => $request->input('gender'),
                    'image' => $imageName,
                    'username' => $request->input('username'),
                    'division' => $request->input('division'),
                    'position' => $request->input('position'),
                    'code_clearance' => $request->input('code_clearance'),
                    'pwd_change' => $request->input('code_clearance'),
                    'password' => Hash::make($request->input('pwd_change')),
                ]);
                $token = $user->createToken('main')->plainTextToken;
    
                Storage::disk('public')->put('esignature/' . $imageName, file_get_contents($image));
    
                // Creating logs
                $logs = new Logs();
                $logs->remarks = $request->input('remarks');
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
    

    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        $useracc = PPAUser::where('username', $credentials['username'])->first();

        // Check if the user account exists and the password is valid
        if (!$useracc || !Hash::check($credentials['password'], $useracc->password)) {
            return response()->json(['message' => 'Invalid Username / Password'], 422);
        }

        if ($useracc->code_clearance == 0) {
            return response()->json(['message' => 'Account Deactivate'], 500);
        }else{  
            // Determine the user's role based on the 'code_clearance' value
            $userRole = null;
            $codeClearance = (int) $useracc->code_clearance;
            // $id = $useracc->id;
            // $lastname = $useracc->lname;

            if ($codeClearance === 10 || $codeClearance === 7) {
                // Hackers
                $userRole = 'h4ck3rZ@1Oppa';
            }else if ($codeClearance === 1 || $codeClearance === 3 || $codeClearance === 4){
                // Admin
                $userRole = '4DmIn@Pp4';
            }else if ($codeClearance === 2){
                // Port Manager
                $userRole = 'Pm@PP4';
            }else if ($codeClearance === 6){
                // Personnel
                $userRole = 'P3rs0nn3lz@pPa';
            }else{
                $userRole = 'users';
            }

            // Generate a token for the user
            $token = $useracc->createToken('main')->plainTextToken;

            // Return the response with user data and role
            return response([
                'user' => $useracc,
                'role' => $userRole, 
                'token' => $token,
            ]);
        }
    }

    public function logout(Request $request)
    {
        /** @var PPAUser $user */
        $user = Auth::user();
        $user->currentAccessToken()->delete();

        return response([
            'success' => true
        ]);
    }
}
