<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\InspectionFormController;
use App\Http\Controllers\FacilityController;
use App\Http\Controllers\AssignPersonnelController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GetNotificationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VehicleFormController;
use App\Http\Controllers\EquipmentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->group(function(){
    Route::post('/logout', [AuthController::class, 'logout']);

    // Dashboard
    Route::get('/getcount', [DashboardController::class, 'getCountRequest']);
    Route::get('/getlogs', [DashboardController::class, 'getLogs']);

    //User Details
    Route::get('/users', [UserController::class, 'getAllUser']);
    Route::get('/userdetail/{id}', [UserController::class, 'getUserDetails']);
    Route::get('/getpersonnel', [UserController::class, 'getPersonnel']);
    Route::get('/personnelname', [UserController::class, 'AssignPersonnel']);
    Route::get('/getsupervisor', [UserController::class, 'getSupervisor']);
    Route::get('/getdriver', [UserController::class, 'getDriver']);
    Route::put('/userupdatedet/{id}', [UserController::class, 'updateUserDetails']);
    Route::put('/changesg/{id}', [UserController::class, 'updateSignature']);
    Route::put('/changepwd/{id}', [UserController::class, 'updatePassword']);
    Route::put('/removeaccount/{id}', [UserController::class, 'DeleteAccount']);
    Route::delete('/removepersonnel/{id}', [UserController::class, 'RemovePersonnel']);
    Route::post('/assignpersonnel', [UserController::class, 'assign']);

    //Inspection Form
    Route::get('/inspectionform/{id}', [InspectionFormController::class, 'getInspectionForm']);
    Route::get('/requestrepair', [InspectionFormController::class, 'index']); 
    Route::get('/myinspecreq/{id}', [InspectionFormController::class, 'myRequestInspec']);
    Route::put('/inspector/{id}', [InspectionFormController::class, 'storeInspectorForm']);
    Route::put('/updateparta/{id}', [InspectionFormController::class, 'updatePartA']);
    Route::put('/updatepartb/{id}', [InspectionFormController::class, 'updatePartB']);  
    Route::put('/updatepartc/{id}', [InspectionFormController::class, 'updatePartC']); 
    Route::put('/updatepartd/{id}', [InspectionFormController::class, 'updatePartD']); 
    Route::put('/inspectorpartb/{id}', [InspectionFormController::class, 'InspectorPartB']);
    Route::put('/approve/{id}', [InspectionFormController::class, 'updateApprove']);
    Route::put('/disapprove/{id}', [InspectionFormController::class, 'updateDisapprove']);
    Route::put('/admin_approve/{id}', [InspectionFormController::class, 'updateAdminApprove']);
    Route::put('/admin_disapprove/{id}', [InspectionFormController::class, 'updateAdminDisapprove']);
    Route::put('/insprequestclose/{id}', [InspectionFormController::class, 'closeRequest']); 
    Route::post('/submitrepairformrequest', [InspectionFormController::class, 'store']);
    Route::post('/inspectionformrequesttwo/{id}', [InspectionFormController::class, 'storeAdmin']);

    //Facility Form
    Route::get('/facilityform', [FacilityController::class, 'index']);
    Route::get('/facilityform/{id}', [FacilityController::class, 'show']);
    Route::get('/myfacilityformrequest/{id}', [FacilityController::class, 'myRequest']);
    Route::get('/checkavailability', [FacilityController::class, 'checkAvailability']);
    Route::put('/facilityopr/{id}', [FacilityController::class, 'StoreOPRFormGSO']);
    Route::put('/facilityopradmin/{id}', [FacilityController::class, 'StoreOPRFormAdmin']);
    Route::put('/facilityapproval/{id}', [FacilityController::class, 'AdminApproval']);
    Route::put('/facilitydisapproval/{id}', [FacilityController::class, 'AdminDispprove']);
    Route::put('/requestclose/{id}', [FacilityController::class, 'CloseRequest']);
    Route::post('/facilityformrequest', [FacilityController::class, 'store']);

    //Vehicle Slip
    Route::get('/vehicleform', [VehicleFormController::class, 'index']);
    Route::get('/vehicleform/{id}', [VehicleFormController::class, 'show']);
    Route::get('/myvehicleformrequest/{id}', [VehicleFormController::class, 'myRequest']);
    Route::put('/getvehicleslip/{id}', [VehicleFormController::class, 'submitVehicle']);
    Route::put('/vehicleformapprove/{id}', [VehicleFormController::class, 'adminApprove']);
    Route::put('/vehicleformdisapprove/{id}', [VehicleFormController::class, 'adminDisapprove']);
    Route::put('/closevehicleslip/{id}', [VehicleFormController::class, 'closeRequest']);
    Route::post('/vehicleformrequest', [VehicleFormController::class, 'store']);

    //For Equipment Form
    Route::get('/myequipmentformrequest/{id}', [EquipmentController::class, 'myRequestEquipment']);
    Route::get('/equipmentform', [EquipmentController::class, 'showList']);
    Route::get('/viewequipment/{id}', [EquipmentController::class, 'equipmentForm']);
    Route::put('/equipmentsupap/{id}', [EquipmentController::class, 'SupAp']);
    Route::put('/equipmentsupdp/{id}', [EquipmentController::class, 'SupDp']);
    Route::put('/equipmentmanap/{id}', [EquipmentController::class, 'ManAp']);
    Route::put('/equipmentmandp/{id}', [EquipmentController::class, 'ManDp']);
    Route::put('/equipmentmanins/{id}', [EquipmentController::class, 'AdminInstruct']);
    Route::post('/equipmentformrequest', [EquipmentController::class, 'store']);

    Route::put('/equipmentgsoform/{id}', [EquipmentController::class, 'GSOForm']);
    Route::put('/equipmentgclose/{id}', [EquipmentController::class, 'closeRequest']);

});
Route::middleware(['auth'])->group(function () {
    Route::get('/getuser', [DashboardController::class, 'getCurrentUser']);
});

//New Get Notifications
Route::get('/notification/{id}', [GetNotificationController::class, 'GetNotification']); 
Route::get('/notif/{id}', [GetNotificationController::class, 'NewNotification']); 

// Landing Page
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::put('/changeuserpwd/{id}', [UserController::class, 'updateUserPassword']);

Route::get('/getpending/{id}', [DashboardController::class, 'getPendingRequest']);

//Test area