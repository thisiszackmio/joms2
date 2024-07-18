import React, { useEffect, useState } from "react";
import PageComponent from "../components/PageComponent";
import submitAnimation from '../assets/loading_nobg.gif';
import { useUserStateContext } from "../context/ContextProvider";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import axiosClient from "../axios";

export default function UserAssign(){

  const { userRole, currentUser } = useUserStateContext();

  const [submitLoading, setSubmitLoading] = useState(false);
  const [inputErrors, setInputErrors] = useState({});

  // Popup
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState("");
  const [popupMessage, setPopupMessage] = useState("");

  // Variable
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [mname, setMname] = useState('');
  const [gender, setGender] = useState('');
  const [username, setUsername] = useState('');
  const [division, setDivision] = useState('');
  const [jobPosition, setJobPosition] = useState('');
  const [code_clearance, setCodeClearance] = useState('')
  const [password, setPassword] = useState('');
  const [passwordCorfirmation, setPasswordConfirmation] = useState('');
  const [uploadEsignature, setUploadEsignature] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // Capitalize the first letter
  const capitalizeFirstLetter = (value) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setUploadedFileName(selectedFile.name);
    setUploadEsignature(selectedFile);
  };

  const onSubmit = (ev) => {
    ev.preventDefault();

    const remarks = `${currentUser.fname} ${currentUser.mname}. ${currentUser.lname} has registered ${fname} ${mname}. ${lname}'s account`;

    setSubmitLoading(true);

    const formData = new FormData();
    formData.append("fname", fname);
    formData.append("mname", mname);
    formData.append("lname", lname);
    formData.append("gender", gender);
    formData.append("image", uploadEsignature);
    formData.append("username", username);
    formData.append("division", division);
    formData.append("position", jobPosition);
    formData.append("code_clearance", code_clearance);
    formData.append("password", password);
    formData.append("password_confirmation", passwordCorfirmation);
    formData.append("pwd_change", 1);
    formData.append("remarks", remarks);

    axiosClient.post("/register", formData, {
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
          <p className="popup-title">Register Complete!</p>
          <p className="popup-message"> The new user was added to the database</p>
        </div>
      );
      setSubmitLoading(false);
    })
    .catch((error) => {
      const responseErrors = error.response.data.message;
      //alert(responseErrors);
      setShowPopup(true);
      setPopupContent('error');
      setPopupMessage(
        <div>
          <p className="popup-title">Invalid</p>
          <p className="popup-message">{responseErrors}</p>
        </div>
      );
      setSubmitLoading(false);
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
    setSubmitLoading(false);
    setShowPopup(false);
    window.location.href = '/ppauserlist/';
  }

  // Restrictions
  const Authorize = userRole == 'h4ck3rZ@1Oppa';

  return(
    <PageComponent title="Registration Form">

      {/* Main Content */}
      {Authorize ? (
      <div className="font-roboto">

        <h2 className="text-left font-bold text-base">
          Fill-up the form
        </h2>

        <form onSubmit={onSubmit} className="space-y-6" action="#" method="POST" enctype="multipart/form-data">
        
          <div className="grid grid-cols-2 gap-4">

            {/* 1st Column */}
            <div className="col-span-1">

              {/* Name (First Name) */}
              <div className="flex items-center mt-10">
                <div className="w-36">
                  <label htmlFor="rep_property_no" className="block text-base font-medium leading-6 text-black">
                    First Name:
                  </label> 
                </div>
                <div className="w-64">
                  <input
                    id="fname"
                    name="fname"
                    type="text"
                    autoComplete="fname"
                    value={fname}
                    onChange={ev => setFname(capitalizeFirstLetter(ev.target.value))}
                    placeholder="Juan"
                    className="block w-full ppa-form input-placeholder"
                  />
                  {!fname && inputErrors.fname && (
                    <p className="font-roboto form-validation">You must input the first name</p>
                  )}
                </div>
              </div>

              {/* Name (Middle Initial) */}
              <div className="flex items-center mt-4">
                <div className="w-36">
                  <label htmlFor="rep_property_no" className="block text-base font-medium leading-6 text-black">
                    Middle Initial:
                  </label> 
                </div>
                <div className="w-64">
                  <input
                    id="mname"
                    name="mname"
                    type="text"
                    autoComplete="mname"
                    value={mname}
                    onChange={ev => setMname(capitalizeFirstLetter(ev.target.value))}
                    maxLength={2}
                    placeholder="A"
                    className="block w-full ppa-form input-placeholder"
                  />
                  {!mname && inputErrors.mname && (
                    <p className="font-roboto form-validation">You must input the middle initial</p>
                  )}
                </div>
              </div>

              {/* Name (Last Name) */}
              <div className="flex items-center mt-4">
                <div className="w-36">
                  <label htmlFor="rep_property_no" className="block text-base font-medium leading-6 text-black">
                    Last Name:
                  </label> 
                </div>
                <div className="w-64">
                  <input
                    id="lname"
                    name="lname"
                    type="text"
                    autoComplete="lname"
                    value={lname}
                    onChange={ev => setLname(capitalizeFirstLetter(ev.target.value))}
                    placeholder="Dela Cruz"
                    className="block w-full ppa-form input-placeholder"
                  />
                  {!lname && inputErrors.lname && (
                    <p className="font-roboto form-validation">You must input the last name</p>
                  )}
                </div>
              </div>

              {/* Gender */}
              <div className="flex items-center mt-4">
                <div className="w-36">
                  <label htmlFor="rep_property_no" className="block text-base font-medium leading-6 text-black">
                    Gender:
                  </label> 
                </div>
                <div className="w-64">
                  <select 
                    name="gender" 
                    id="gender"
                    value={gender}
                    onChange={ev => setGender(ev.target.value)}
                    className="block w-full ppa-form input-placeholder"
                    style={{ color: '#A9A9A9' }}
                  >
                    <option value="" disabled>Choose Gender</option>
                    <option value="Male" style={{ color: '#272727' }}>Male</option>
                    <option value="Female" style={{ color: '#272727' }}>Female</option>
                  </select>
                  {!gender && inputErrors.gender && (
                    <p className="font-roboto form-validation">You must input the gender</p>
                  )}
                </div>
              </div>

              {/* Division */}
              <div className="flex items-center mt-4">
                <div className="w-36">
                  <label htmlFor="rep_property_no" className="block text-base font-medium leading-6 text-black">
                    Division:
                  </label> 
                </div>
                <div className="w-64">
                  <select 
                    name="division" 
                    id="division"
                    value={division}
                    onChange={ev => setDivision(ev.target.value)}
                    className="block w-full ppa-form input-placeholder"
                    style={{ color: '#A9A9A9' }}
                  >
                    <option value="" disabled>Choose Division</option>
                    <option value="Administrative Division" style={{ color: '#272727' }}>Administrative Division</option>
                    <option value="Finance Division" style={{ color: '#272727' }}>Finance Division</option>
                    <option value="Office of the Port Manager" style={{ color: '#272727' }}>Office of the Port Manager</option>
                    <option value="Port Service Division" style={{ color: '#272727' }}>Port Service Division</option>
                    <option value="Port Police Division" style={{ color: '#272727' }}>Port Police Division</option>
                    <option value="Engineering Service Division" style={{ color: '#272727' }}>Engineering Service Division</option>
                    <option value="Terminal Management Office - Tubod" style={{ color: '#272727' }}>Terminal Management Office - Tubod</option>
                  </select>
                  {!division && inputErrors.division && (
                    <p className="font-roboto form-validation">You must input the division</p>
                  )}
                </div>
              </div>

              {/* Position */}
              <div className="flex items-center mt-4">
                <div className="w-36">
                  <label htmlFor="rep_property_no" className="block text-base font-medium leading-6 text-black">
                    Position:
                  </label> 
                </div>
                <div className="w-64">
                  <input
                    id="position"
                    name="position"
                    type="text"
                    autoComplete="position"
                    value={jobPosition}
                    onChange={ev => setJobPosition(capitalizeFirstLetter(ev.target.value))}
                    placeholder="Division Manager A"
                    className="block w-full ppa-form input-placeholder"
                  />
                  {!jobPosition && inputErrors.position && (
                    <p className="font-roboto form-validation">You must input the position</p>
                  )}
                </div>
              </div>

            </div>

            {/* 2nd Column */}
            <div className="col-span-1">

              {/* Username */}
              <div className="flex items-center mt-10">
                <div className="w-36">
                  <label htmlFor="rep_property_no" className="block text-base font-medium leading-6 text-black">
                    Username:
                  </label> 
                </div>
                <div className="w-64">
                  <input
                    id="position"
                    name="position"
                    type="text"
                    value={username}
                    onChange={ev => setUsername(ev.target.value)}
                    className="block w-full ppa-form input-placeholder"
                  />
                  {!username && inputErrors.username && (
                    <p className="font-roboto form-validation">You must input the username</p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="flex items-center mt-4">
                <div className="w-36">
                  <label htmlFor="rep_property_no" className="block text-base font-medium leading-6 text-black">
                    Password:
                  </label> 
                </div>
                <div className="w-64 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={ev => setPassword(ev.target.value)}
                    className="block w-full ppa-form input-placeholder"
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bottom-0 px-3 h-full icon-form"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              {/* Password Confirmation*/}
              <div className="flex items-center mt-4">
                <div className="w-36">
                  <label htmlFor="rep_property_no" className="block text-base font-medium leading-6 text-black">
                    Repeat Password:
                  </label> 
                </div>
                <div className="w-64 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPasswordConfirm ? 'text' : 'password'}
                    autoComplete="position"
                    value={passwordCorfirmation}
                    onChange={ev => setPasswordConfirmation(ev.target.value)}
                    className="block w-full ppa-form input-placeholder"
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bottom-0 px-3 h-full icon-form"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  >
                    <FontAwesomeIcon icon={showPasswordConfirm ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>
              {passwordCorfirmation && !password && ( <p className="font-roboto form-validation" style={{ marginLeft: '145px' }}>You have not input the password</p> )}
              {!passwordCorfirmation || !password || (passwordCorfirmation == password) ? null : ( <p className="font-roboto form-validation" style={{ marginLeft: '145px' }}>New Password and Confirm Password are not match</p> )}

              {/* Electronic Signature */}
              <div className="flex items-center mt-5">
                <div className="w-36">
                <label htmlFor="rep_property_no" className="block text-base font-medium leading-6 text-black">
                    Upload E-Sig:
                  </label> 
                </div>

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
        
                        />
                      </label>
                    </div>
                    <p class="pl-1 text-sm">PNG only up to 2MB</p>
                    {uploadedFileName &&  <label for="cover-photo" class="block text-sm font-medium leading-6 text-gray-900">File Name: {uploadedFileName}</label> }
                  </div>
                </div>
              </div>
              {!uploadEsignature && inputErrors.image && (
                <p className="font-roboto form-validation" style={{ marginLeft: '145px' }}>You must input the e-signature</p>
              )}

            </div>

          </div>

          {/* Code Clearance */}
          <div className="flex items-center">
                <div className="w-36 mt-2">
                  <label htmlFor="rep_property_no" className="block text-base font-medium leading-6 text-black">
                    Code Clearance:
                  </label> 
                </div>
                <div className="w-full mt-2 flex flex-wrap">

                  {/* Code 1 */}
                  <div className="flex items-center mr-6">
                    <input 
                      type="radio" 
                      id="code_clearance" 
                      name="code_clearance" 
                      value="1"
                      checked={code_clearance === '1'}
                      onChange={ev => setCodeClearance(ev.target.value)}
                      className="text-gray-300 border-gray-500 focus:ring-gray-300"
                    />
                    <label htmlFor="code_clearance_1" className="ml-2 text-base font-medium text-gray-900">1 - Admin Division Manager</label>
                  </div>

                  {/* Code 2 */}
                  <div className="flex items-center mr-6">
                    <input 
                      type="radio" 
                      id="code_clearance" 
                      name="code_clearance" 
                      value="2"
                      checked={code_clearance === '2'}
                      onChange={ev => setCodeClearance(ev.target.value)}
                      className="text-gray-300 border-gray-500 focus:ring-gray-300"
                    />
                    <label htmlFor="code_clearance_2" className="ml-2 text-base font-medium text-gray-900">2 - Port Manager</label>
                  </div>

                  {/* Code 3 */}
                  <div className="flex items-center mr-6">
                    <input 
                      type="radio" 
                      id="code_clearance" 
                      name="code_clearance" 
                      value="3"
                      checked={code_clearance === '3'}
                      onChange={ev => setCodeClearance(ev.target.value)}
                      className="text-gray-300 border-gray-500 focus:ring-gray-300"
                    />
                    <label htmlFor="code_clearance_3" className="ml-2 text-base font-medium text-gray-900">3 - General Service Officer</label>
                  </div>

                  {/* Code 4 */}
                  <div className="flex items-center mr-6">
                    <input 
                      type="radio" 
                      id="code_clearance" 
                      name="code_clearance" 
                      value="4"
                      checked={code_clearance === '4'}
                      onChange={ev => setCodeClearance(ev.target.value)}
                      className="text-gray-300 border-gray-500 focus:ring-gray-300"
                    />
                    <label htmlFor="code_clearance_4" className="ml-2 text-base font-medium text-gray-900">4 - Division Manager</label>
                  </div>

                  {/* Code 5 */}
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="code_clearance" 
                      name="code_clearance" 
                      value="5"
                      checked={code_clearance === '5'}
                      onChange={ev => setCodeClearance(ev.target.value)}
                      className="text-gray-300 border-gray-500 focus:ring-gray-300"
                    />
                    <label htmlFor="code_clearance_5" className="ml-2 text-base font-medium text-gray-900">5 - Regular or COS</label>
                  </div>

                </div>
          </div>
          {!code_clearance && inputErrors.code_clearance && (
            <p className="font-roboto form-validation" style={{ marginLeft: '130px', marginTop: '5px' }}>You must input the code clearance</p>
          )}

          {/* Button */}
          <button type="submit"
            className={`px-6 py-2 btn-submit ${ submitLoading && 'btn-submitting'}`}
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

        </form>

      </div>
      ):(
        // Display Forbidden Message
        <div className="Forbidden-area">
          <div className="forbidden-title">You are not allowed here. ( Error 403 )</div>
        </div>
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
              {(popupContent == 'warning' || popupContent == 'warningD') && (
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
            <p className="text-lg text-center"> {popupMessage} </p>

            {/* Buttons */}
            <div className="flex justify-center mt-4">

              {/* Error */}
              {popupContent == 'error' && (
                <button onClick={justclose} className="w-full py-2 btn-error">
                  Close
                </button>
              )}

              {/* Warning */}
              {popupContent == 'warning' && (
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

    </PageComponent>
  );
}