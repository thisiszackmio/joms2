import axiosClient from "../axios";
import PageComponent from "../components/PageComponent";
import React, { useEffect, useState } from "react";
import loadingAnimation from '/public/ppa_logo_animationn_v4.gif';
import submitAnimation from '../assets/loading_nobg.gif';
import { useParams, useNavigate } from "react-router-dom";
import { useUserStateContext } from "../context/ContextProvider";

export default function VehicleSlipForm(){

  const {id} = useParams();
  const { currentUser } = useUserStateContext();

  useEffect(() => {
    // Redirect to dashboard if pwd_change is not 1
    if (currentUser && currentUser.pwd_change === 1) {
      window.location.href = '/newpassword';
      return null;
    }
  }, [currentUser]);

  const today = new Date().toISOString().split('T')[0];
  const currentDate = new Date();

  function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Add leading zero if needed
    const day = date.getDate().toString().padStart(2, '0'); // Add leading zero if needed
    const hours = date.getHours().toString().padStart(2, '0'); // Add leading zero if needed
    const minutes = date.getMinutes().toString().padStart(2, '0'); // Add leading zero if needed
  
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
  
  const currentDateFormatted = formatDate(currentDate);

  const [DateArrival, setDateArrival] = useState(today);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [inputVechErrors, setInputVechErrors] = useState({});

  //Popup
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [notifications, setNototifications] = useState('');

  //Vehicle Request
  const [VRPurpose, setVRPurpose] = useState('');
  const [VRPlace, setVRPlace] = useState('');
  const [VRDateArrival, setVRDateArrival] = useState('');
  const [VRTimeArrival, setVRTimeArrival] = useState('');
  const [VRPassenger, setVRPassenger] = useState('');

  let output;

  if(VRPassenger == 'none') {
    output = 'None';
  }else{
    output = VRPassenger
  }

  // Submit Form
  const SubmitVehicleForm = (event) => {
    event.preventDefault();

    setSubmitLoading(true);

    const logs = `${currentUser.fname} ${currentUser.mname}. ${currentUser.lname} has submit a request on Vehicle Slip`;
    const remarks = 'Pending';

    if(`${VRDateArrival} ${VRTimeArrival}` >= currentDateFormatted ){
      axiosClient
        .post("vehicleformrequest", {
        date_of_request: today,
        purpose: VRPurpose,
        passengers: output ? output : "N/A",
        place_visited: VRPlace,
        date_arrival: VRDateArrival,
        time_arrival: VRTimeArrival,
        vehicle_type: 'None',
        driver: 'None',
        admin_approval: 5,
        remarks: remarks,
        logs: logs
      })
      .then((response) => { 
        setNototifications("success");   
        setShowPopup(true);
        setPopupMessage(
          <div>
            <p className="popup-title"><strong>Success</strong></p>
            <p className="popup-message">Form submit successfully</p>
          </div>
        );    
        setSubmitLoading(false);
      })
      .catch((error) => {
        console.error(error);
        const responseErrors = error.response.data.errors;
        setInputVechErrors(responseErrors);
      })
      .finally(() => {
        setSubmitLoading(false);
      });
    }else{
      setShowPopup(true);
      setPopupMessage(
        <div>
          <p className="popup-title">Oops..</p>
          <p>You have a input a invalid date</p>
        </div>
      );
      setNototifications("error"); 
      setSubmitLoading(true);
    }

  }

  const closeError = () => {
    setShowPopup(false);
  };

  return (
  <PageComponent title="Request on Vehicle Slip Form">
    {currentUser.image !== "null" ? (
    <div>
      <form onSubmit={SubmitVehicleForm}>
  
        {/* Title */}
        <div>
          <h2 className="text-base font-bold leading-7 text-gray-900"> Fill up the Form </h2>
          <p className="text-xs font-bold leading-7 text-red-500">Please double check the form before submitting</p>
        </div>
  
        {/* Form */}
        <div className="grid grid-cols-2 gap-4">
  
          <div className="col-span-1">
  
            {/* Date of Request */}
            <div className="flex items-center mt-6 font-roboto">
              <div className="w-60">
                <label htmlFor="vr_date" className="block text-base font-medium leading-6 text-gray-900">
                  Date:
                </label> 
              </div>
              <div className="w-1/2">
                <input
                  type="date"
                  name="vr_date"
                  id="vr_date"
                  value= {today}
                  onChange={ev => {
                    setDateArrival(ev.target.value);
                    setVRDate(ev.target.value);
                  }}
                  className="block w-full ppa-form"
                  readOnly
                />
              </div>
            </div>
  
            {/* Purpose */}
            <div className="flex items-center mt-4 font-roboto">
              <div className="w-60">
                <label htmlFor="vr_purpose" className="block text-base font-medium leading-6 text-gray-900">
                  Purpose:
                </label> 
              </div>
              <div className="w-1/2">
                <input
                  type="text"
                  name="vr_purpose"
                  id="vr_purpose"
                  autoComplete="vr_purpose"
                  value={VRPurpose}
                  onChange={ev => setVRPurpose(ev.target.value)}
                  className="block w-full ppa-form"
                />
                {!VRPurpose && inputVechErrors.purpose && (
                  <p className="font-roboto form-validation">You must input the purpose</p>
                )}
              </div>
            </div>
  
            {/* Place */}
            <div className="flex items-center mt-4 font-roboto">
              <div className="w-60">
                <label htmlFor="vr_place" className="block text-base font-medium leading-6 text-gray-900">
                  Place/s To Be Visited:
                </label> 
              </div>
              <div className="w-1/2">
                <input
                  type="text"
                  name="vr_place"
                  id="vr_place"
                  autoComplete="vr_place"
                  value={VRPlace}
                  onChange={ev => setVRPlace(ev.target.value)}
                  className="block w-full ppa-form"
                />
                {!VRPlace && inputVechErrors.place_visited && (
                  <p className="font-roboto form-validation">You must input the place to be visited</p>
                )}
              </div>
            </div>
  
            {/* Date of Arrival */}
            <div className="flex items-center mt-4 font-roboto">
              <div className="w-60">
                <label htmlFor="vr_datearrival" className="block text-base font-medium leading-6 text-gray-900">
                  Date of Arrival:
                </label> 
              </div>
              <div className="w-1/2">
                <input
                  type="date"
                  name="vr_datearrival"
                  id="vr_datearrival"
                  value= {VRDateArrival}
                  onChange={ev => setVRDateArrival(ev.target.value)}
                  min={DateArrival}
                  className="block w-full ppa-form"
                />
                {!VRDateArrival && inputVechErrors.date_arrival && (
                  <p className="font-roboto form-validation">You must input the date of arrival</p>
                )}
              </div>
            </div>
  
            {/* Time of Arrival */}
            <div className="flex items-center mt-4 font-roboto">
              <div className="w-60">
                <label htmlFor="vr_timearrival" className="block text-base font-medium leading-6 text-gray-900">
                  Time of Arrival:
                </label> 
              </div>
              <div className="w-1/2">
                <input
                  type="time"
                  name="vr_timearrival"
                  id="vr_timearrival"
                  value= {VRTimeArrival}
                  onChange={ev => setVRTimeArrival(ev.target.value)}
                  className="block w-full ppa-form"
                />
                {!VRTimeArrival && inputVechErrors.time_arrival && (
                  <p className="font-roboto form-validation">You must input the time of arrival</p>
                )}
              </div>
            </div>
  
          </div>
  
          <div className="col-span-1">
  
            {/* Passengers */}
            <div className="flex mt-6 font-roboto">
              <div className="w-44">
                <label htmlFor="vr_passengers" className="block text-base font-medium leading-6 text-gray-900">
                  Passengers:
                </label>
              </div>
              <div className="w-1/2">
                <textarea
                  id="vr_passengers"
                  name="vr_passengers"
                  rows={7}
                  value={VRPassenger}
                  onChange={ev => setVRPassenger(ev.target.value)}
                  style={{ resize: 'none' }}
                  className="block w-full ppa-form"
                />
                <p className="text-gray-500 text-xs mt-2">Separate name on next line (If no passengers just leave it blank)</p>
                {!VRPassenger && inputVechErrors.passengers && (
                  <p className="font-roboto form-validation">You must input the list of passengers</p>
                )}
              </div>
  
            </div>
  
          </div>
  
        </div>
  
        {/* Submit Button */}
        <div className="mt-10 font-roboto">
          <button
            type="submit"
            className={`px-6 py-2 btn-submit ${ submitLoading && 'btn-submitting'}`}
            disabled={submitLoading}
          >
            {submitLoading ? (
              <div className="flex items-center justify-center">
                <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
                <span className="ml-2">Processing...</span>
              </div>
            ) : (
              'Submit'
            )}
          </button>
        </div>
  
      </form>
    </div>
    ):(
      <div>
        <h2 className="text-xl font-bold leading-7 text-gray-900"> You cannot create a request because you don't have an e-signature. </h2>
        <p className="text-xs text-red-500 font-bold">Please submit your e-signature to the developer so that you can create a request </p>
      </div>
    )}

    {/* Show Popup */}
    {showPopup && (
      <div className="fixed inset-0 flex items-center justify-center z-50">

        {/* Semi-transparent black overlay */}
        <div className="fixed inset-0 bg-black opacity-40"></div>

        {/* Popup content with background blur */}
        <div className="absolute p-6 rounded-lg shadow-md bg-white backdrop-blur-lg animate-fade-down" style={{ width: '400px' }}>

          {/* Notification Icons */}
          <div class="f-modal-alert">

            {/* Error */}
            {notifications == "error" && (
            <div className="f-modal-icon f-modal-error animate">
              <span className="f-modal-x-mark">
                <span className="f-modal-line f-modal-left animateXLeft"></span>
                <span className="f-modal-line f-modal-right animateXRight"></span>
              </span>
            </div>
            )}

            {/* Success */}
            {notifications == "success" && (
            <div class="f-modal-icon f-modal-success animate">
              <span class="f-modal-line f-modal-tip animateSuccessTip"></span>
              <span class="f-modal-line f-modal-long animateSuccessLong"></span>
            </div>
            )}
          
          </div>

          {/* Message */}
          <p className="text-lg text-center">{popupMessage}</p>

          {/* Button */}
          <div className="flex justify-center mt-4">

            {/* Error / Warning*/}
            {notifications == "error" && (
            <>
              <button onClick={() => (closeError())} className="w-full py-2 btn-error">
                Close
              </button>
            </>
            )}

            {/* Success */}
            {notifications == "success" && (
            <button
              onClick={() => {
                window.location.href = `/myrequest/${currentUser.id}`;
              }}
              className="w-full py-2 btn-success"
            >
              View My Request
            </button>
            )}
          </div>

        </div>
      </div>
    )}

  </PageComponent>
  );

}