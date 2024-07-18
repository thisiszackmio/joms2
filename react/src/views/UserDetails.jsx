import React, { useEffect, useState } from "react";
import PageComponent from "../components/PageComponent";
import { Link, useParams } from "react-router-dom";
import { useUserStateContext } from "../context/ContextProvider";
import axiosClient from "../axios";
import submitAnimation from '../assets/loading_nobg.gif';
import loadingAnimation from '/public/ppa_logo_animationn_v4.gif';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function UserDetails(){

  //Date Format
  function formatDate(dateString) {
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  // popup
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState("");
  const [popupMessage, setPopupMessage] = useState("");

  const {id} = useParams();
  const { userRole, currentUser } = useUserStateContext();
  const [submitLoading, setSubmitLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [user, getUser] = useState([]);

  // Appearance
  const [showUpdateForm, setUpdateForm] = useState(false);
  const [changeEsig, setChangeEsig] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  // Table
  const [displayRequest, setDisplayRequest] = useState([]);
  const [displayFacRequest, setDisplayFacRequest] = useState([]);
  const [displayRequestVehicle, setDisplayRequestVehicle] = useState([]);

  // Values
  const [position, setPosition] = useState("");
  const [division, setDivision] = useState("");
  const [username, setUername] = useState("");
  const [code, setCode] = useState("");
  const [uploadedUpdateFileName, setUploadedUpdateFileName] = useState("");
  const [uploadUpdateEsignature, setUploadUpdateEsignature] = useState('');
  const [UpdatePassword, setUpdatePassword] = useState("");

  // Get the data
  const fetchUserDetails = () => {
    axiosClient.get(`/userdetail/${id}`)
    .then(response => {
      const usersData = response.data;
      const signature = usersData.signature;
      const enctyptSig = btoa(signature);
      const decodedUrl = atob(enctyptSig);

      //console.log(decodedUrl);
      usersData.signature = decodedUrl;
      getUser(usersData);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
  }

  // Show User's Request List (Inspection Repair)
  const fetchInspectForm = () => {
    axiosClient
    .get(`/myinspecreq/${id}`)
    .then((response) => {
      const responseData = response.data;

        const mappedData = responseData.map((dataItem) => {
          return{
            id: dataItem.id,
            date_of_request: dataItem.date_of_request,
            remarks: dataItem.remarks
          }
        })

        setDisplayRequest({mappedData});
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
  }

  // On Facility / Venue Request List
  const fetchFacilityForm = () => {
    axiosClient
    .get(`/myfacilityformrequest/${id}`)
    .then((response) => {
      const responseData = response.data;
      const viewFacilityData = responseData.view_facility;

      const mappedData = viewFacilityData.map((dataItem) => {
        return{
          id: dataItem.id,
          date_requested: dataItem.date_requested,
          remarks: dataItem.remarks
        }
      })

      setDisplayFacRequest({mappedData});
      
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
  }

  // On Vehicle Slip Request List
  const fetchVehicleSlipForm = () => {
    axiosClient
    .get(`/myvehicleformrequest/${id}`)
    .then((response) => {
      const responseData = response.data;
      const viewVehicleSlipData = responseData.view_vehicle;

      const mappedData = viewVehicleSlipData.map((dataItem, index) => {
        return{
          id: dataItem.id,
          date_requested: dataItem.date_of_request,
          remarks: dataItem.remarks
        }
      })

      setDisplayRequestVehicle({mappedData});
      setIsLoading(false);

    })
    .catch((error) => {
        console.error('Error fetching data:', error);
    });
  }

  // Fetch the data
  useEffect(()=>{
    fetchUserDetails();
    fetchInspectForm();
    fetchFacilityForm();
    fetchVehicleSlipForm();
  },[id]);

  // Dev Error Text
  const DevErrorText = (
    <div>
      <p className="popup-title">Something Wrong!</p>
      <p className="popup-message">There was a problem, please contact the developer. (Error 500)</p>
    </div>
  );

  // Delete the user account (but not totally delete)
  const handleDeleteAccount = () => {
    setShowPopup(true);
    setPopupContent('delete');
    setPopupMessage(
      <div>
        <p className="popup-title">Are You Sure?</p>
        <p className="popup-message">If you delete this account, it will not remove from the database unless you want a pernament deletion</p>
      </div>
    );
  }

  // Confirm Delete Account
  function confirmDeleteAccount(id){

    setSubmitLoading(true);

    const logs = `${currentUser.fname} ${currentUser.mname}. ${currentUser.lname} delete ${user?.name}'s account`

    axiosClient
    .put(`removeaccount/${id}`, {
      logs: logs
    })
    .then(() => { 
      setShowPopup(true);
      setPopupContent('success');
      setPopupMessage(
        <div>
          <p className="popup-title">Success</p>
          <p className="popup-message">You remove {user?.name}'s account </p>
        </div>
      );
      setSubmitLoading(false);
    })
    .catch(() => {
      setShowPopup(true);
      setPopupContent('error');
      setPopupMessage(DevErrorText);
      setSubmitLoading(false);
    });
  }

  const handleContextMenu = (event) => { event.preventDefault(); };

  // Trigger Update Details Form
  const handleEditDetails = () => { setUpdateForm(true); }
  const handleChangeESig = () => { setChangeEsig(true); }
  const handleChangePwd = () => { setChangePassword(true); }

  const handleDisableEdit = () => {
    setUpdateForm(false);
    setChangeEsig(false);
    setChangePassword(false);
    setUpdatePassword("")
    setPosition("");
    setDivision("");
    setUername("");
    setCode("");
    setUploadedUpdateFileName("");
    setUploadUpdateEsignature("");
  }

  // Check User Details
  function handleCheckForms(){
    if(!position && !division && !username && !code) {
      setShowPopup(true);
      setPopupContent('error');
      setPopupMessage(
        <div>
          <p className="popup-title">Oops!</p>
          <p className="popup-message">You forgot to fill up the form</p>
        </div>
      );
      setSubmitLoading(false);
    } else {
      setShowPopup(true);
      setPopupContent('warning');
      setPopupMessage(
        <div>
          <p className="popup-title">Double Check</p>
          <p>Position: <b>{position ? position:user.position}</b></p>
          <p>Division: <b>{division ? division:user.division}</b></p>
          <p>Username: <b>{username ? username:user.username}</b></p>
          <p>Code Clearance: <b>{code ? code:user.code}</b></p>
        </div>
      );
    }
  }

  // Submit the Update Information
  const SubmitUserDetails = (event) => {
    event.preventDefault();

    setSubmitLoading(true);

    const logs = `${currentUser.fname} ${currentUser.mname}. ${currentUser.lname} updated details on ${user?.name}'s account`;
      
    const updateData = {
      position: position ? position : user.position,
      division: division ? division : user.division,
      username: username ? username : user.username,
      code_clearance: code ? code : user.code,
      logs: logs
    };

    axiosClient
    .put(`userupdatedet/${id}`, updateData)
    .then(() => {
      setShowPopup(true);
      setPopupContent('success');
      setPopupMessage(
        <div>
          <p className="popup-title">Success</p>
          <p className="popup-message">The user information has been updated</p>
        </div>
      );
    })
    .catch((error) => {
      if (error.response && error.response.status === 404) {
        // User not found
        setShowPopup(true);
        setPopupContent('error');
        setPopupMessage(
          <div>
            <p className="popup-title">User not Found!</p>
            <p className="popup-message">You cannot update the user detail, please inform the developer (Error 404)</p>
          </div>
        );
      } else if (error.response && error.response.status === 204){
        // Something wrong on submitting
        setShowPopup(true);
        setPopupContent('error');
        setPopupMessage(
          <div>
            <p className="popup-title">There is something wrong</p>
            <p className="popup-message">Please contact the developer on the issue (Error 204)</p>
          </div>
        );
      } else {
        // System Error
        setShowPopup(true);
        setPopupContent('error');
        setPopupMessage(DevErrorText);
      }
    })
    .finally(() => {
      setSubmitLoading(false);
    });
  }

  // Change Signature
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setUploadedUpdateFileName(selectedFile.name);
    setUploadUpdateEsignature(selectedFile);
  }

  const changeSignature = (event) => {
    event.preventDefault();

    setSubmitLoading(true);

    const logs = `${currentUser.fname} ${currentUser.mname}. ${currentUser.lname} updated e-signature on ${user?.name}'s account`;

    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('image', uploadUpdateEsignature);
    formData.append('logs', logs);

    axiosClient
    .post(`changesg/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "x-rapidapi-host": "file-upload8.p.rapidapi.com",
        "x-rapidapi-key": "your-rapidapi-key-here",
      },
    })
    .then(() => {
      setShowPopup(true);
      setPopupContent('success');
      setPopupMessage(
        <div>
          <p className="popup-title">Success</p>
          <p className="popup-message">The user esignature has been updated</p>
        </div>
      );
      setSubmitLoading(false);
    })
    .catch((error) => {
      if (error.response && error.response.status === 404) {
        // User not found
        setShowPopup(true);
        setPopupContent('error');
        setPopupMessage(
          <div>
            <p className="popup-title">User not Found!</p>
            <p className="popup-message">You cannot update the user detail, please inform the developer (Error 404)</p>
          </div>
        );
        setSubmitLoading(false);
      } else if (error.response && error.response.status === 422){
        // Something wrong
        setShowPopup(true);
        setPopupContent('error');
        setPopupMessage(
          <div>
            <p className="popup-title">There is something wrong</p>
            <p className="popup-message">Please contact the developer on the issue (Error 422)</p>
          </div>
        );
        setSubmitLoading(false);
      } else {
        // System Error
        setShowPopup(true);
        setPopupContent('error');
        setPopupMessage(DevErrorText);
        setSubmitLoading(false);
      }
    })
    .finally(() => {
      setSubmitLoading(false);
    });
  }

  // Change Password
  const changePass = (event) => {
    event.preventDefault();

    setSubmitLoading(true);

    const logs = `${currentUser.fname} ${currentUser.mname}. ${currentUser.lname} updated password on ${user?.name}'s account`;

    axiosClient
    .put(`changepwd/${id}`, {
      password: UpdatePassword,
      logs: logs
    })
    .then(() => { 
      setShowPopup(true);
      setPopupContent('success');
      setPopupMessage(
        <div>
          <p className="popup-title">Success</p>
          <p className="popup-message">The user password has been updated</p>
        </div>
      );
      setSubmitLoading(false);
    })
    .catch((error) => {
      if (error.response && error.response.status === 404) {
        // User Not Found
        setShowPopup(true);
        setPopupContent('error');
        setPopupMessage(
          <div>
            <p className="popup-title">User not Found!</p>
            <p className="popup-message">You cannot update the user detail, please inform the developer (Error 404)</p>
          </div>
        );
        setSubmitLoading(false);
      } else if (error.response && error.response.status === 204){
        // Something wrong on the submitting
        setShowPopup(true);
        setPopupContent('error');
        setPopupMessage(
          <div>
            <p className="popup-title">There is something wrong</p>
            <p className="popup-message">Please contact the developer on the issue (Error 204)</p>
          </div>
        );
        setSubmitLoading(false);
      } else if (error.response && error.response.status === 422){
        // Password validation
        setShowPopup(true);
        setPopupContent('error');
        setPopupMessage(
          <div>
            <p className="popup-title">Invalid Password</p>
            <p className="popup-message">Password must contain at least 8 characters, one uppercase letter, one number, and one symbol.</p>
          </div>
        );
        setSubmitLoading(false);
      } else {
        // System Error
        setShowPopup(true);
        setPopupContent('error');
        setPopupMessage(DevErrorText);
        setSubmitLoading(false);
      }
    })
    .finally(() => {
      setSubmitLoading(false);
    });
  }

  //Close Popup on Error
  const justclose = () => {
    setShowPopup(false);
  }

  //Close Popup on Success
  const closePopup = () => {
    setShowPopup(false);
    setSubmitLoading(false);
    setIsLoading(true);
    handleDisableEdit();
    fetchUserDetails();
    fetchInspectForm();
    fetchFacilityForm();
    fetchVehicleSlipForm();
  }

  // Restrictions
  const Authorize = userRole == 'h4ck3rZ@1Oppa';

  return(
  <PageComponent title="User Detail">

    {/* Main Content */}
    {isLoading ? (
      <div className="fixed top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-center bg-white bg-opacity-100 z-50">
        <img
          className="mx-auto h-44 w-auto"
          src={loadingAnimation}
          alt="Your Company"
        />
        <span className="ml-2 animate-heartbeat">Loading User Details</span>
      </div>
    ):(
    <>
      {id == currentUser.id || Authorize ? (
        <div className="font-roboto">

          {/* For Authorize Button Only */}
          {Authorize && (
            <div className="flex justify-between mb-10">
              {/* Back button */}
              <button className="px-6 py-2 btn-default">
                <Link to="/ppauserlist">Back to User List</Link>
              </button>
              
              {/* Delete Account */}
              {user?.code != 0 ? (
                <button onClick={handleDeleteAccount} className="px-6 py-2 btn-error">
                  Delete Account
                </button>
              ):null}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">

            {/* User Account Details */}
            <div className="col-span-1">

              {/* Account Details */}
              <div>

                {/* Account Status*/}
                <div className="flex items-center">
                  <div className="w-56">
                    <label className="block text-lg font-bold leading-6 text-gray-900">
                      User Status:
                    </label> 
                  </div>
                  <div className="w-full pl-1 text-lg">
                    {user?.code != 0 ? ("Active"):("Deleted")}
                  </div>
                </div>

                {/* User ID */}
                <div className="flex items-center mt-5">
                  <div className="w-56">
                    <label className="block text-lg font-bold leading-6 text-gray-900">
                      User ID:
                    </label> 
                  </div>
                  <div className="w-full pl-1 text-lg">
                    {user?.id}
                  </div>
                </div>

                {/* Name */}
                <div className="flex items-center mt-5">
                  <div className="w-56">
                    <label className="block text-lg font-bold leading-6 text-gray-900">
                      Name:
                    </label> 
                  </div>
                  <div className="w-full pl-1 text-lg">
                    {user?.name}
                  </div>
                </div>

                {user?.code != 0 ? (
                <>
                  {/* For Position, Division, Username, Code Clearance*/}
                  <form id="user_details" onSubmit={SubmitUserDetails} enctype="multipart/form-data">

                  {/* Position */}
                  <div className="flex items-center mt-5">
                    <div className="w-56">
                      <label className="block text-lg font-bold leading-6 text-gray-900">
                      Position:
                      </label> 
                    </div>
                    {showUpdateForm ? (
                      <div className="w-full">
                        <input
                          type="text"
                          name="user_position"
                          id="user_position"
                          value={position}
                          onChange={ev => setPosition(ev.target.value)}
                          placeholder={user?.position}
                          className="block w-80 rounded-md border-1 p-1.5 form-text text-lg border-gray-300 focus:ring-0 focus:border-gray-400 bg-gray-200"
                        />
                      </div>
                    ):(
                      <div className="w-full pl-1 text-lg">
                        {user?.position}
                      </div>
                    )}
                  </div>

                  {/* Division */}
                  <div className="flex items-center mt-5">
                    <div className="w-56">
                      <label className="block text-lg font-bold leading-6 text-gray-900">
                      Division:
                      </label> 
                    </div>
                    {showUpdateForm ? (
                      <div className="w-full">

                        <select 
                          name="division" 
                          id="division"
                          value={division}
                          onChange={ev => setDivision(ev.target.value)}
                          className="block w-80 rounded-md border-1 p-1.5 form-text text-lg border-gray-300 focus:ring-0 focus:border-gray-400 bg-gray-200"
                        >
                          <option value="" disabled>Select Here (Leave it if same Division)</option>
                          <option value="Administrative Division">Administrative Division</option>
                          <option value="Finance Division">Finance Division</option>
                          <option value="Office of the Port Manager">Office of the Port Manager</option>
                          <option value="Port Service Division">Port Service Division</option>
                          <option value="Port Police Division">Port Police Division</option>
                          <option value="Engineering Service Division">Engineering Service Division</option>
                          <option value="Terminal Management Office - Tubod">Terminal Management Office - Tubod</option>
                        </select>
                      </div>
                    ):(
                      <div className="w-full pl-1 text-lg">
                        {user?.division}
                      </div>
                    )}
                  </div>

                  {/* Username */}
                  <div className="flex items-center mt-5">
                    <div className="w-56">
                      <label className="block text-lg font-bold leading-6 text-gray-900">
                      Username:
                      </label> 
                    </div>
                    {showUpdateForm ? (
                      <div className="w-full">
                        <input
                          type="text"
                          name="firetruck_purpose"
                          id="firetruck_purpose"
                          autoComplete="firetruck_purpose"
                          value={username}
                          onChange={ev => setUername(ev.target.value)}
                          placeholder={user?.username}
                          className="block w-80 rounded-md border-1 p-1.5 form-text text-lg border-gray-300 focus:ring-0 focus:border-gray-400 bg-gray-200"
                        />
                      </div>
                    ):(
                      <div className="w-full pl-1 text-lg">
                        {user?.username}
                      </div>
                    )}
                  </div>

                  {/* Code Clearance */}
                  {Authorize && (
                    <div className="flex items-center mt-5">
                      <div className="w-56">
                        <label className="block text-lg font-bold leading-6 text-gray-900">
                          Code Clearance:
                        </label> 
                      </div>
                      {showUpdateForm ? (
                        <div className="w-full">
                          <select 
                            name="code_clearance" 
                            id="code_clearance"
                            value={code}
                            onChange={ev => setCode(ev.target.value)}
                            className="block w-80 rounded-md border-1 p-1.5 form-text text-lg border-gray-300 focus:ring-0 focus:border-gray-400 bg-gray-200"
                          >
                            <option value="" disabled>Choose Code Clearance</option>
                            <option value="1">1 - Admin Division Manager</option>
                            <option value="2">2 - Port Manager</option>
                            <option value="3">3 - General Service Officer</option>
                            <option value="4">4 - Division Manager/Supervisor</option>
                            <option value="5">5 - Regular and COS Employee</option>
                            <option value="6">6 - Assign Personnel</option>
                            <option value="7">7 - System Administration</option>
                            {currentUser.code_clearance == 10 && (
                            <option value="10">Super Administration</option>
                            )}
                          </select>
                        </div>
                      ):(
                        <div className="w-full pl-1 text-lg">
                          {user?.code === 1 && `${user?.code} - Admin Manager`}
                          {user?.code === 2 && `${user?.code} - Port Manager`}
                          {user?.code === 3 && `${user?.code} - General Service Officer`}
                          {user?.code === 4 && `${user?.code} - Division Manager / Supervisor`}
                          {user?.code === 5 && `${user?.code} - Regular and Contract of Service`}
                          {user?.code === 6 && `${user?.code} - Assign Personnel`}
                          {user?.code === 7 && `${user?.code} - System Administrator`}
                          {user?.code === 10 && `Super Admin`}
                        </div>
                      )}
                    </div>
                  )}

                  </form>

                  {/* Signature */}
                  <div className="flex items-center mt-5">
                  <div className="w-56">
                    <label className="block text-lg font-bold leading-6 text-gray-900">
                    Signature:
                    </label> 
                  </div>
                  {changeEsig ? (
                    <form id="change-esig" onSubmit={changeSignature} method="POST" action="#" enctype="multipart/form-data">
                      <div>
                        <div className="flex">
                          <div class="mt-2 w-80 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                            <div class="text-center">
                              <svg class="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path fill-rule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clip-rule="evenodd" />
                              </svg>
                              <div class="mt-4 text-sm leading-6 text-gray-600">
                                <label for="esignature" class="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                                  <span>Upload your new E-sig here</span>
                                  <input 
                                    id="esignature" 
                                    name="esignature" 
                                    type="file" 
                                    accept=".png"
                                    class="sr-only" 
                                    onChange={handleFileChange} 
                                    required 
                                  />
                                </label>
                              </div>
                              <p class="pl-1 text-sm">PNG only up to 2MB</p>
                              {uploadedUpdateFileName &&  <label for="cover-photo" class="block text-sm font-medium leading-6 text-gray-900">File Name: {uploadedUpdateFileName}</label> }
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  ):(
                    <div className="w-full pl-1 text-lg">
                      <div>
                          {user?.image_name == "null" ? (
                          <>
                            <div className="w-full pl-1 text-lg">No Signature</div>
                          </>
                          ):(
                          <>
                            <img src={user?.signature} alt="User Signature" onContextMenu={handleContextMenu} />
                          </>
                          )}
                      </div>
                    </div>
                  )}
                  </div>

                </>
                ):null}

              </div>
              
              {user?.code != 0 ? (
              <>
                {/* Preview E-signature */}
                {(Authorize && user?.image_name) && (
                <>
                <div className="flex mt-6">
                  <div>
                    <h2 className="text-base font-bold leading-7 text-gray-900"> E-sig Preview </h2>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <label htmlFor="type_of_property" className="block text-sm font-normal leading-6"> REQUESTED BY:</label>
                      <div className="mt-4">
                        <div className="w-64 mx-auto border-b text-center border-black pl-1" style={{ position: 'relative' }}>
                          <div>
                          <img 
                            src={user?.signature}
                            alt="User Signature" 
                            className="ppa-esignature-prf"
                            onContextMenu={handleContextMenu}
                          />
                          </div>
                          <span className="text-base font-bold">{user?.name}</span>
                        </div>
                        <label htmlFor="type_of_property" className="block text-xs text-center font-medium italic"> End-User </label>
                      </div>
                    </div>
                  </div>
                </div>
                </>
                )}  

                {/* Change Password */}
                {changePassword && (
                <form id="change-pwd" onSubmit={changePass} className="mt-6">

                <div>
                  <h2 className="text-base font-bold leading-7 font-roboto"> Update Password </h2>
                </div>

                  {/* New Password */}
                  <div className="flex items-center mt-5">
                    <div className="w-56">
                      <label className="block text-lg font-bold leading-6 text-gray-900">
                      New Password:
                      </label> 
                    </div>
                      <div className="w-full">
                        <input
                          id="password"
                          name="password"
                          type="text"
                          required
                          value={UpdatePassword}
                          onChange={ev => setUpdatePassword(ev.target.value)}
                          className="block w-80 rounded-md border-1 p-1.5 form-text text-lg border-gray-300 focus:ring-0 focus:border-gray-400 bg-gray-200"
                        />
                        <p className="lower-text">At least 8 characters, one uppercase, number and symbbol</p>
                      </div>
                  </div>

                </form>
                )}
              </>
              ):null}

            </div>

            {/* User Account Details */}
            {(Authorize && user?.code != 0) ? (
              <div className="col-span-1">

                {/* Display Table on Inspection Repair*/}
                <div style={{ maxHeight: '200px', overflowY: 'auto'}}>
                  <table className="ppa-table font-roboto" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th colSpan={4} className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Pre/Post Repair Inspection Form</th>
                      </tr>
                    </thead>
                    <tbody style={{ backgroundColor: '#fff' }}>
                    {displayRequest?.mappedData?.length > 0 ? (
                      displayRequest?.mappedData?.map((getData) => (
                        <tr key={getData.id}>
                          <td className="px-3 py-2 text-center align-top table-font">Ctrl No. {getData.id}</td>
                          <td className="px-3 py-2 align-top table-font">Date Request: {formatDate(getData.date_of_request)}</td>
                          <td className="px-3 py-2 align-top table-font">Remarks: {getData.remarks}</td>
                          <td className="px-3 py-3 text-center w-1">
                            <div className="flex justify-center">
                              <Link to={`/repairinspectionform/${getData.id}`}>
                                <button 
                                  className="text-green-600 font-bold py-1 px-2"
                                  title="View Request"
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                </button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    ):(
                      <tr>
                        <td className="px-3 py-2 text-center align-top font-bold w-1 table-font">No Request</td>
                      </tr>
                    )}
                    </tbody>
                  </table>
                </div>

                {/* Display Table for Facility/Vennue Request */}
                <div className="mt-5" style={{ maxHeight: '200px', overflowY: 'auto'}}>
                  <table className="ppa-table font-roboto" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th colSpan={4} className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Facility / Venue Form</th>
                      </tr>
                    </thead>
                    <tbody style={{ backgroundColor: '#fff' }}>
                    {displayFacRequest?.mappedData?.length > 0 ? (
                      displayFacRequest.mappedData.map((getData) => (
                        <tr key={getData.id}>
                          <td className="px-3 py-2 text-center align-top border-custom table-font">Ctrl No. {getData.id}</td>
                          <td className="px-3 py-2 align-top table-font">Date Request: {formatDate(getData.date_requested)}</td>
                          <td className="px-3 py-2 align-top table-font">Remarks: {getData.remarks} </td>
                          <td className="px-3 py-3 align-top w-1">
                            <div className="flex justify-center">
                            <Link to={`/facilityvenueform/${getData.id}`}>
                              <button 
                                className="text-green-600 font-bold py-1 px-2"
                                title="View Request"
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </button>
                            </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    ):(
                      <tr>
                        <td className="px-3 py-2 text-center align-top font-bold w-1 table-font">No Request</td>
                      </tr>
                    )}
                    </tbody>
                  </table>
                </div>

                {/* Display Table for Vehicle Slip Request */}
                <div className="mt-5" style={{ maxHeight: '200px', overflowY: 'auto'}}>
                  <table className="ppa-table font-roboto" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th colSpan={4} className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Vehicle Slip Form</th>
                      </tr>
                    </thead>
                    <tbody style={{ backgroundColor: '#fff' }}>
                    {displayRequestVehicle?.mappedData?.length > 0 ? (
                      displayRequestVehicle?.mappedData?.map((getData) => (
                        <tr key={getData.id}>
                          <td className="px-3 py-2 align-top text-center text-base table-font">Ctrl No. {getData.id}</td>
                          <td className="px-3 py-2 align-top text-base table-font">Date Request: {formatDate(getData.date_requested)}</td>
                          <td className="px-3 py-2 align-top w-auto text-base table-font">Remarks: {getData.remarks}</td>
                          <td className="px-3 py-3 align-top w-12">
                            <div className="flex justify-center">
                              <Link to={`/vehicleslipform/${getData.id}`}>
                                <button 
                                  className="text-green-600 font-bold py-1 px-2"
                                  title="View Request"
                                >
                                  <FontAwesomeIcon icon={faEye} /> 
                                </button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    ):(
                      <tr>
                        <td className="px-3 py-2 text-center align-top font-bold w-1 table-font">No Request</td>
                      </tr>
                    )}
                    </tbody>
                  </table>
                </div>

              </div>
            ):null}

          </div>

          {/* Buttons */}
          {user?.code != 0 ? (
            <div className="flex mt-10">
              {Authorize && (
              <>
                {/* Edit User Details */}
                {showUpdateForm ? (
                <div>
                  {/* Cancel */}
                  <button onClick={handleDisableEdit} className="px-6 py-2 btn-cancel">
                    Cancel
                  </button>
                  {/* Submit */}
                  <button onClick={handleCheckForms} className="px-6 py-2 ml-2 btn-submit">
                    Submit
                  </button>
                </div>
                ):(
                  <button onClick={handleEditDetails} className="px-6 py-2 ml-2 btn-default" disabled={changePassword || changeEsig}>
                    Edit User Details
                  </button>
                )}

                {/* Change Password */}
                {changePassword ? (
                  <div>

                    {/* Cancel */}
                    <button onClick={handleDisableEdit} className="px-6 py-2 btn-cancel">
                      Cancel
                    </button>
      
                    {/* Submit */}
                    <button
                      form="change-pwd"
                      type="submit"
                      className={`px-6 py-2 ml-2 btn-submit ${
                        submitLoading && 'btn-submitting'
                      }`}
                      disabled={submitLoading}
                    >
                      {submitLoading ? (
                        <div className="flex">
                          <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
                          <span className="ml-2">Processing</span>
                        </div>
                      ) : (
                        'Submit'
                      )}
                    </button>
      
                  </div>
                ):(
                  <button onClick={handleChangePwd} className="px-6 py-2 ml-2 btn-default" disabled={changeEsig || showUpdateForm}>
                    Change Password
                  </button>
                )}

                {/* Change E-sig */}
                {changeEsig ? (
                  <div>

                    {/* Cancel */}
                    <button onClick={handleDisableEdit} className="px-6 py-2 btn-cancel">
                      Cancel
                    </button>

                    {/* Submit */}
                    <button
                      form="change-esig"
                      type="submit"
                      className={`px-6 py-2 ml-2 btn-submit ${
                        submitLoading && 'btn-submitting'
                      }`}
                      disabled={submitLoading}
                    >
                      {submitLoading ? (
                        <div className="flex">
                          <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
                          <span className="ml-2">Processing</span>
                        </div>
                      ) : (
                        'Submit'
                      )}
                    </button>

                  </div>
                ):(
                  <button onClick={handleChangeESig} className="px-6 py-2 ml-2 btn-default" disabled={changePassword || showUpdateForm}>
                    Change E-Sig
                  </button>
                )}

              </>
              )}
            </div>
          ):null}

        </div>
      ):(
        // Display Forbidden Message
        <div className="Forbidden-area">
          <div className="forbidden-title">You are not allowed here. ( Error 403 )</div>
        </div>
      )}
    </>
    )}

    {/* Popup Content */}
    {showPopup && (
      <div className="fixed inset-0 flex items-center justify-center z-50">

        {/* Semi-transparent black overlay */}
        <div className="fixed inset-0 bg-black opacity-40"></div>

        {/* Popup content with background blur */}
        <div className="absolute p-6 rounded-lg shadow-md bg-white backdrop-blur-lg animate-fade-down" style={{ width: '350px' }}>

          {/* Notification Icons */}
          <div class="f-modal-alert">
            {/* Error */}
            {popupContent == 'error' && (
              <div className="f-modal-icon f-modal-error animate">
                <span className="f-modal-x-mark">
                  <span className="f-modal-line f-modal-left animateXLeft"></span>
                  <span className="f-modal-line f-modal-right animateXRight"></span>
                </span>
              </div>
            )}
            {/* Warning */}
            {(popupContent == 'warning' || popupContent == 'warningD' || popupContent == 'delete') && (
              <div class="f-modal-icon f-modal-warning scaleWarning">
                <span class="f-modal-body pulseWarningIns"></span>
                <span class="f-modal-dot pulseWarningIns"></span>
              </div>
            )}
            {/* Success */}
            {popupContent == 'success' && (
              <div class="f-modal-icon f-modal-success animate">
                <span class="f-modal-line f-modal-tip animateSuccessTip"></span>
                <span class="f-modal-line f-modal-long animateSuccessLong"></span>
              </div>
            )}
          </div>

          {/* Popup Message */}
          <p className="text-lg text-center font-roboto"> {popupMessage} </p>

          {/* Buttons */}
          <div className="flex justify-center mt-4 font-roboto">

            {/* Error */}
            {popupContent == 'error' && (
              <button onClick={justclose} className="w-full py-2 btn-error">
                Close
              </button>
            )}

            {/* Warning */}
            {(popupContent == 'warning') && (
            <>
              {/* Confirm */}
              {!submitLoading && (
                <button form="user_details" className="w-1/2 py-2 popup-confirm">
                  <FontAwesomeIcon icon={faCheck} /> Confirm
                </button>
              )}
              {/* Cancel */}
              {!submitLoading && (
                <button onClick={justclose} className="w-1/2 py-2 popup-cancel">
                  <FontAwesomeIcon icon={faTimes} /> Cancel
                </button>
              )}
              {/* Process */}
              {submitLoading && (
                <button className="w-full cursor-not-allowed py-2 btn-process">
                  <div className="flex items-center justify-center">
                    <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
                    <span className="ml-2">Processing</span>
                  </div>
                </button>
              )}
            </>  
            )}

            {/* Delete */}
            {(popupContent == 'delete') && (
            <>
              {/* Confirm */}
              {!submitLoading && (
                <button onClick={() => confirmDeleteAccount(user?.id)} className="w-1/2 py-2 popup-confirm">
                  <FontAwesomeIcon icon={faCheck} /> Confirm
                </button>
              )}
              {/* Cancel */}
              {!submitLoading && (
                <button onClick={justclose} className="w-1/2 py-2 popup-cancel">
                  <FontAwesomeIcon icon={faTimes} /> Cancel
                </button>
              )}
              {/* Process */}
              {submitLoading && (
                <button className="w-full cursor-not-allowed py-2 btn-process">
                  <div className="flex items-center justify-center">
                    <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
                    <span className="ml-2">Processing</span>
                  </div>
                </button>
              )}
            </>
            )}

            {/* Success */}
            {popupContent == 'success' && (
              <button onClick={closePopup} className="w-full py-2 btn-success">
                Close
              </button>
            )}

          </div>

        </div>

      </div>
    )}
    {/* End of Popup */}

  </PageComponent>
  )
}