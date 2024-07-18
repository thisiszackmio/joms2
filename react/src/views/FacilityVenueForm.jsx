import React from "react";
import PageComponent from "../components/PageComponent";
import { useState, useEffect, useRef } from "react";
import axiosClient from "../axios";
import { useParams, Link } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { useUserStateContext } from "../context/ContextProvider";
import loadingAnimation from '/public/ppa_logo_animationn_v4.gif';
import submitAnimation from '../assets/loading_nobg.gif';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function FacilityFormForm(){

  const {id} = useParams();
  const { currentUser, userRole } = useUserStateContext();

  useEffect(() => {
    // Redirect to dashboard if pwd_change is not 1
    if (currentUser && currentUser.pwd_change === 1) {
      window.location.href = '/newpassword';
      return null;
    }
  }, [currentUser]);

  //Date
  function formatDate(dateString) {
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  //Time
  function formatTime(timeString) {
    if (!timeString) {
      return ''; // or handle the case when timeString is undefined
    }
  
    const [hours, minutes, seconds] = timeString.split(':');
    let amOrPm = 'am';
    let formattedHours = parseInt(hours, 10);
  
    if (formattedHours >= 12) {
      amOrPm = 'pm';
      if (formattedHours > 12) {
        formattedHours -= 12;
      }
    }
  
    const formattedTime = `${formattedHours}:${minutes}${amOrPm}`;
    return formattedTime;
  }

  const [submitLoading, setSubmitLoading] = useState(false);
  const [generatePDFLoad, setGeneratePDFLoad] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [displayRequestFacility, setDisplayRequestFacility] = useState([]);

  // Disapprove
  const [giveAdminReason, setGiveAdminReason] = useState(false);
  const [adminReason, setAdminReason] = useState('');

  //Popup
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('Test');
  const [popupContent, setPopupContent] = useState('');

  //OPR
  const [OprInstruct, setOprInstruct] = useState('');
  const [OprAction, setOprAction] = useState('');

  //OPR Field
  const [enableOprInstruct, setEnableOprInstruct] = useState(false);
  const [enableOprAction, setEnableOprAction] = useState(false);

  const handleOPRInstruct = () => { setEnableOprInstruct(true); }
  const handleOPRAction = () => { setEnableOprAction(true); }

  // Disable OPR Field
  const handleDisableEdit = () => { 
    setEnableOprInstruct(false); 
    setEnableOprAction(false);
  }

  //Show Data List
  const fetchFacilityForm = () => {
    axiosClient
    .get(`/facilityform/${id}`)
    .then((response) => {
        const responseData = response.data;
        const viewFacilityData = responseData.main_form;
        const requestor = responseData.requestor;
        const manager = responseData.manager;

        const maleNamesString = viewFacilityData.name_male;
        const maleNamesArray = maleNamesString.split('\n');

        const femaleNamesString = viewFacilityData.name_female;
        const femaleNamesArray = femaleNamesString.split('\n');

        setDisplayRequestFacility({
          viewFacilityData: viewFacilityData,
          requestor:requestor,
          manager:manager,
          maleNamesArray:maleNamesArray,
          maleNamesString:maleNamesString,
          femaleNamesString:femaleNamesString,
          femaleNamesArray:femaleNamesArray
        });

        setIsLoading(false);
    })
    .catch((error) => {
      setIsLoading(false);
        console.error('Error fetching data:', error);
    });
  }
  
  useEffect(()=>{
    fetchFacilityForm();
  },[id]);

  const oprInstrucValue = OprInstruct === null || OprInstruct.trim() === "" ? "None" : OprInstruct;
  const oprActionValue = OprAction === null || OprAction.trim() === "" ? "None" : OprAction;

  //Popup Notification
  const DevErrorText = (
    <div>
      <p>There is something wrong!</p>
      <p>Please contact the developer</p>
    </div>
  );

  //Submit OPR Action Comment
  const SubmitOPRAction = (event) => {
    event.preventDefault();

    setSubmitLoading(true);

    const logs = `${currentUser.fname} ${currentUser.mname}. ${currentUser.lname} has filled-up the OPR Comments on ${displayRequestFacility?.requestor?.name}'s request for Facility/Venue (Control No: ${displayRequestFacility?.viewFacilityData?.id})`
    
    axiosClient
    .put(`facilityopr/${id}`,{
      obr_comment: oprActionValue,
      logs: logs
    })
    .then((response) => {
      setPopupContent("success");
      setPopupMessage(
        <div>
          <p className="popup-title">Success</p>
          <p className="popup-message">Form submit successfully!</p>
          <p className="popup-message">Thank You {currentUser.gender == "Male" ? "Sir":"Maam"} {currentUser.fname}!</p>
        </div>
      ); 
      setShowPopup(true);   
      setSubmitLoading(false);
    })
    .catch((error) => {
      console.error(error);
      setPopupContent("error");
      setPopupMessage(DevErrorText);
      setShowPopup(true);   
      setSubmitLoading(false);
    })
    .finally(() => {
      setSubmitLoading(false);
    });

  }

  //Submit OPR Instruction
  const SubmitOPRInstruct = (event) => {
    event.preventDefault();

    setSubmitLoading(true);

    const logs = `${currentUser.fname} ${currentUser.mname}. ${currentUser.lname} has filled-up the OPR Instruction on ${displayRequestFacility?.requestor?.name}'s request for Facility/Venue (Control No: ${displayRequestFacility?.viewFacilityData?.id})`; 

    axiosClient
    .put(`facilityopradmin/${id}`,{
      obr_instruct: oprInstrucValue,
      logs: logs
    })
    .then((response) => {
      setPopupContent("success");
      setPopupMessage(
        <div>
          <p className="popup-title">Success</p>
          <p className="popup-message">Form submit successfully!</p>
        </div>
      ); 
      setShowPopup(true);   
      setSubmitLoading(false);
    })
    .catch((error) => {
      console.error(error);
      setPopupContent("error");
      setPopupMessage(DevErrorText);
      setShowPopup(true);   
      setSubmitLoading(false);
    })
    .finally(() => {
      setSubmitLoading(false);
    });
  }

  //Admin Approval confirmation
  function handleAdminApproveConfirmation(){
    setPopupContent("warning");
    setShowPopup(true);
    setPopupMessage(
      <div>
        <p className="popup-title">Approval Request</p>
        <p className="popup-message">
          Do you want to approve {displayRequestFacility?.viewRequestData?.user_id == currentUser.id ? null : (<b>{displayRequestFacility?.requestor?.name + "'s"}</b>)} request?
        </p>
      </div>
    );
  };

  //Admin approval function
  function handleApproveClick(id){

    setSubmitLoading(true);

    const logs = `${currentUser.fname} ${currentUser.mname}. ${currentUser.lname} has approved ${displayRequestFacility?.requestor?.name}'s request on Facility/Venue (Control No: ${displayRequestFacility?.viewFacilityData?.id})`

    axiosClient.put(`/facilityapproval/${id}`,{
      logs: logs
    })
    .then((response) => {
      setPopupContent("success");
      setPopupMessage(
        <div>
          <p className="popup-title">Success</p>
          <p className="popup-message">Form Request Approved!</p>
          <p className="popup-message">Thank You {currentUser.gender == "Male" ? "Sir":"Maam"} {currentUser.fname}!</p>
        </div>
      );
      setShowPopup(true);
    })
    .catch((error) => {
      console.error(error);
      setPopupContent("error");
      setPopupMessage(DevErrorText);
      setShowPopup(true);   
      setSubmitLoading(false);
    });
  };

  //Admin Disapproval Confirmation
  function handleDisapproveConfirmation(){
    setGiveAdminReason(true);
  };

  // Cancel Reason
  const handleCancelReason = () => {
    setGiveAdminReason(false);
    setAdminReason('');
  }

  // Submit Reason
  function submitAdminReason(id){
    setSubmitLoading(true);

    const logs = `${currentUser.fname} ${currentUser.mname}. ${currentUser.lname} has disapproved ${displayRequestFacility?.requestor?.name}'s request on Facility/Venue (Control No: ${displayRequestFacility?.viewFacilityData?.id})`;

    axiosClient
    .put(`/facilitydisapproval/${id}`,{
      adminReason: adminReason,
      logs: logs
    })
    .then((response) => {
      setPopupContent("success");
      setPopupMessage(
        <div>
          <p className="popup-title">Success</p>
          <p className="popup-message">Form Request Disapproved!</p>
        </div>
      );
      setShowPopup(true);
    })
    .catch((error) => {
      console.error(error);
      setPopupContent("error");
      setPopupMessage(DevErrorText);
      setShowPopup(true);   
      setSubmitLoading(false);
    });
  }

  // Close Request
  function handleClosure() {
    setPopupContent("close");
    setShowPopup(true);
    setPopupMessage(
      <div>
        <p className="popup-title">Are you sure</p>
        <p className="popup-message">If you close this request, it cannot be reopen.</p>
      </div>
    );
  }

  //Close the request
  function handleCloseRequest(id){
    setSubmitLoading(true);

    const logs = `${currentUser.fname} ${currentUser.mname}. ${currentUser.lname} has closed the request on Facility/Venue (Control No: ${displayRequestFacility?.viewFacilityData?.id})`
    
    axiosClient.put(`/requestclose/${id}`,{
      logs: logs
    })
    .then((response) => {
      setPopupContent("success");
      setPopupMessage(
        <div>
          <p className="popup-title">Success</p>
          <p className="popup-message">You close the request</p>
        </div>
      );
      setShowPopup(true);
      setSubmitLoading(false);
    })
    .catch((error) => {
      //console.error(error);
      setPopupContent("error");
      setPopupMessage(DevErrorText);
      setShowPopup(true);   
      setSubmitLoading(false);
    });
  }

  const justclose = () => {
    setShowPopup(false);
  };

  const closePopup = () => {
    setIsLoading(true);
    setShowPopup(false);
    fetchFacilityForm();
    handleCancelReason();
    handleDisableEdit();
  };

  //Generate PDF Section
  const componentRef= useRef();

  const generatePDF = useReactToPrint({
    content: ()=>componentRef.current,
    documentTitle: `Facility-Venue-Control-No:${id}`
  });

  //Count down
  const [isVisible, setIsVisible] = useState(false);
  const [seconds, setSeconds] = useState(3);

  const handleButtonClick = () => {
    setIsVisible(true); 
    setSeconds(3);
    setGeneratePDFLoad(true);
    setTimeout(() => {
      generatePDF();
      setGeneratePDFLoad(false);
      setIsVisible(false); 
    }, 1000);
  };

  useEffect(() => {
    let timer;

    if (isVisible && seconds > 0) {
      timer = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [isVisible, seconds]);

  useEffect(() => {
    if (seconds === 0) {
      setIsVisible(false);
      setSubmitLoading(false);
    }
  }, [seconds]);

  //Restrictions
  const UserHere = displayRequestFacility?.viewFacilityData?.user_id === currentUser.id;
  const Authorize = UserHere || (userRole == 'h4ck3rZ@1Oppa' || userRole == '4DmIn@Pp4' || userRole == 'Pm@PP4');
  const Facility_Room = displayRequestFacility?.viewFacilityData?.mph || displayRequestFacility?.viewFacilityData?.conference || displayRequestFacility?.viewFacilityData?.other;
  const Facility_Dorm = displayRequestFacility?.viewFacilityData?.dorm;
  const Authority = userRole === 'h4ck3rZ@1Oppa' || userRole === '4DmIn@Pp4' || userRole === 'Pm@PP4' || userRole === 'P3rs0nn3lz@pPa';
  
  return isLoading ? (
    <div className="fixed top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-center bg-white bg-opacity-100 z-50">
      <img
        className="mx-auto h-44 w-auto"
        src={loadingAnimation}
        alt="Your Company"
      />
      <span className="ml-2 animate-heartbeat">Loading Facility/Venue Form</span>
    </div>
  ):(
  <>
    {Authorize ? (
      <PageComponent title="Facility/Venue Request Form"> 

        {/* Back button */}
        {Authority ? (
          <button className="px-6 py-2 btn-default">
            <Link to="/facilityvenuerequestform">Back to Request List</Link>
          </button>
        ):(
          <button className="px-6 py-2 btn-default">
            <Link to="/">Back to Dashboard</Link>
          </button>
        )}

        {/* Control Number */}
        <div className="flex items-center mb-6 mt-6 font-roboto">
          <div className="w-24">
            <label className="block text-base font-medium leading-6 text-gray-900">
            Control No:
            </label> 
          </div>
          <div className="w-auto px-5 text-center font-bold ppa-form-request">
          {displayRequestFacility?.viewFacilityData?.id}
          </div>
        </div>

        {/* Main Form */}
        <div className="border-b border-black pb-10 font-roboto">

          <div>
            <h2 className="text-base font-bold leading-7 text-gray-900"> Main Form </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">

            <div className="col-span-1">

              {/* Date */}
              <div className="flex items-center mt-6">
                <div className="w-64">
                  <label className="block text-base font-medium leading-6 text-gray-900">
                  Date:
                  </label> 
                </div>
                <div className="w-1/2 ppa-form-request">
                {formatDate(displayRequestFacility?.viewFacilityData?.date_requested)}
                </div>
              </div>

              {/* Request Office */}
              <div className="flex items-center mt-2">
                <div className="w-64">
                  <label className="block text-base font-medium leading-6 text-gray-900">
                  Request Office/Division:
                  </label> 
                </div>
                <div className="w-1/2 ppa-form-request">
                {displayRequestFacility?.viewFacilityData?.request_office}
                </div>
              </div>

              {/* Title/Purpose of Activity */}
              <div className="flex items-center mt-2">
                <div className="w-64">
                  <label className="block text-base font-medium leading-6 text-gray-900">
                  Title/Purpose of Activity:
                  </label> 
                </div>
                <div className="w-1/2 ppa-form-request">
                {displayRequestFacility?.viewFacilityData?.title_of_activity}
                </div>
              </div>

              {/* Date of Activity */}
              <div className="flex items-center mt-2">
                <div className="w-64">
                  <label className="block text-base font-medium leading-6 text-gray-900">
                  Date of Activity:
                  </label> 
                </div>
                <div className="w-1/2 ppa-form-request">
                  {displayRequestFacility?.viewFacilityData?.date_start === displayRequestFacility?.viewFacilityData?.date_end ? (
                  <span> {formatDate(displayRequestFacility?.viewFacilityData?.date_start)} </span>
                  ):(
                  <span> {formatDate(displayRequestFacility?.viewFacilityData?.date_start)} to {formatDate(displayRequestFacility?.viewFacilityData?.date_end)} </span>
                  )}
                </div>
              </div>

              {/* Time of Activity */}
              <div className="flex items-center mt-2">
                <div className="w-64">
                  <label className="block text-base font-medium leading-6 text-gray-900">
                  Time of Activity (START and END):
                  </label> 
                </div>
                <div className="w-1/2 ppa-form-request">
                  {displayRequestFacility?.viewFacilityData?.date_start === displayRequestFacility?.viewFacilityData?.date_end ? (
                  <span> {formatTime(displayRequestFacility?.viewFacilityData?.time_start)} to {formatTime(displayRequestFacility?.viewFacilityData?.time_end)}</span>
                  ):(
                  <span> {formatDate(displayRequestFacility?.viewFacilityData?.date_start)} ({formatTime(displayRequestFacility?.viewFacilityData?.time_start)}) to {formatDate(displayRequestFacility?.viewFacilityData?.date_end)} ({formatTime(displayRequestFacility?.viewFacilityData?.time_end)}) </span>
                  )}
                </div>
              </div>

            </div>

            <div className="col-span-1">

              {/* Type of Facility */}
              <div className="flex items-center mt-6">
                <div className="w-64">
                  <label className="block text-base font-medium leading-6 text-gray-900">
                  Facility/ies Venue being Requested:
                  </label> 
                </div>
              </div>

              {/* Multi-Purpose Hall */}
              <div className="mt-2">
                <div className="flex items-center">
                  <div className="ppa-checklist font-bold"> 
                    {displayRequestFacility?.viewFacilityData?.mph == 1 || 
                    displayRequestFacility?.viewFacilityData?.mph == 2 || 
                    displayRequestFacility?.viewFacilityData?.mph == 3
                    ? 'X' : null} 
                  </div>
                  <span style={{ fontWeight: 'bold' }}>Multi-Purpose Hall (MPH)</span>
                </div>
              </div>

              {/* Conference Room */}
              <div className="mt-2">
                <div className="flex items-center">
                  <div className="ppa-checklist font-bold">
                    {displayRequestFacility?.viewFacilityData?.conference == 1 || 
                    displayRequestFacility?.viewFacilityData?.conference == 2 ||
                    displayRequestFacility?.viewFacilityData?.conference == 3
                    ? 'X' : null}
                  </div>
                  <span style={{ fontWeight: 'bold' }}>Conference Room</span>
                </div>
              </div>

              {/* Dormitory */}
              <div className="mt-2">
                <div className="flex items-center">
                  <div className="ppa-checklist font-bold">
                    {displayRequestFacility?.viewFacilityData?.dorm == 1 || 
                    displayRequestFacility?.viewFacilityData?.dorm == 2 ||
                    displayRequestFacility?.viewFacilityData?.dorm == 3
                    ? 'X' : null}
                  </div>
                  <span style={{ fontWeight: 'bold' }}>Dormitory</span>
                </div>
              </div>

              {/* Others */}
              <div className="mt-2">
                <div className="flex items-center">
                  <div className="ppa-checklist font-bold">
                    {displayRequestFacility?.viewFacilityData?.other == 1 || 
                    displayRequestFacility?.viewFacilityData?.other == 2 ||
                    displayRequestFacility?.viewFacilityData?.other == 3
                    ? 'X' : null}
                  </div>
                  <span style={{ fontWeight: 'bold' }}>Others</span>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* For Facility Room */}
        {Facility_Room ? (
          <div className="mt-4 border-b border-black pb-10 font-roboto">

            <div>
              <h2 className="text-base font-bold leading-7 text-gray-900"> * For the Multi-Purpose Hall / Conference Room / Others  </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">

              <div className="col-span-1">
                
                {/* Table */}
                <div className="mt-4">
                  <div className="flex items-center">
                    <div className="ppa-checklist font-bold">
                    {displayRequestFacility?.viewFacilityData?.table ? 'X':null}
                    </div>
                    <div className="w-12 ml-1 justify-center">
                      <span>Tables</span>
                    </div>
                    <div className="w-30 ml-2">
                    (No.<span className="border-b border-black px-5 font-bold text-center"> 
                      {displayRequestFacility?.viewFacilityData?.no_table ? displayRequestFacility?.viewFacilityData?.no_table:null} 
                    </span>)
                    </div>
                  </div>
                </div>

                {/* Chair */}
                <div className="mt-2">
                  <div className="flex items-center">
                    <div className="ppa-checklist font-bold">
                    {displayRequestFacility?.viewFacilityData?.chair ? 'X':null}
                    </div>
                    <div className="w-12 ml-1">
                      <span>Chair</span>
                    </div>
                    <div className="w-30 ml-2">
                    (No.<span className="border-b border-black px-5 font-bold text-center"> 
                      {displayRequestFacility?.viewFacilityData?.no_chair ? displayRequestFacility?.viewFacilityData?.no_chair:null} 
                    </span>)
                    </div>
                  </div>
                </div>

                {/* Projector */}
                <div className="mt-2">
                  <div className="flex items-center">
                    <div className="ppa-checklist font-bold">
                    {displayRequestFacility?.viewFacilityData?.projector ? 'X':null}
                    </div>
                    <div className="w-16 ml-1">
                      <span>Projector</span>
                    </div>
                  </div>
                </div>

                {/* Projector Screen */}
                <div className="mt-2">
                  <div className="flex items-center">
                    <div className="ppa-checklist font-bold">
                    {displayRequestFacility?.viewFacilityData?.projector_screen ? 'X':null}
                    </div>
                    <div className="w-26 ml-1">
                      <span>Projector Screen</span>
                    </div>
                  </div>
                </div>

                {/* Document Camera */}
                <div className="mt-2">
                  <div className="flex items-center">
                    <div className="ppa-checklist font-bold">
                    {displayRequestFacility?.viewFacilityData?.document_camera ? 'X':null}
                    </div>
                    <div className="w-26 ml-1">
                      <span>Document Camera</span>
                    </div>
                  </div>
                </div>

              </div>

              <div className="col-span-1">

                {/* Laptop */}
                <div className="mt-2">
                  <div className="flex items-center">
                    <div className="ppa-checklist font-bold">
                    {displayRequestFacility?.viewFacilityData?.laptop ? 'X':null}
                    </div>
                    <div className="w-26 ml-1">
                      <span>Laptop</span>
                    </div>
                  </div>
                </div>

                {/* Television */}
                <div className="mt-2">
                  <div className="flex items-center">
                    <div className="ppa-checklist font-bold">
                    {displayRequestFacility?.viewFacilityData?.television ? 'X':null}
                    </div>
                    <div className="w-26 ml-1">
                      <span>Television</span>
                    </div>
                  </div>
                </div>

                {/* Sound System */}
                <div className="mt-2">
                  <div className="flex items-center">
                    <div className="ppa-checklist font-bold">
                    {displayRequestFacility?.viewFacilityData?.sound_system ? 'X':null}
                    </div>
                    <div className="w-26 ml-1">
                      <span>Sound System</span>
                    </div>
                  </div>
                </div>

                {/* Videoke */}
                <div className="mt-2">
                  <div className="flex items-center">
                    <div className="ppa-checklist font-bold">
                    {displayRequestFacility?.viewFacilityData?.videoke ? 'X':null}
                    </div>
                    <div className="w-26 ml-1">
                      <span>Videoke</span>
                    </div>
                  </div>
                </div>

                {/* Microphone */}
                <div className="mt-2">
                  <div className="flex items-center">
                    <div className="ppa-checklist font-bold">
                    {displayRequestFacility?.viewFacilityData?.microphone ? 'X':null}
                    </div>
                    <div className="w-26 ml-1">
                      <span>Microphone</span>
                    </div>
                    <div className="w-30 ml-2">
                    (No.<span className="border-b border-black px-5 font-bold text-center"> 
                      {displayRequestFacility?.viewFacilityData?.no_microphone ? displayRequestFacility?.viewFacilityData?.no_microphone:null} 
                    </span>)
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Others */}
            <div className="mt-2">
              <div className="flex items-center">
                <div className="ppa-checklist font-bold">
                {displayRequestFacility?.viewFacilityData?.others ? 'X':null}
                </div>
                <div className="w-26 ml-1">
                  <span>Others,</span>
                </div>
                <div className="w-28 ml-2">
                please specify
                </div>
                <div className="w-1/2 ppa-form-request h-11"> 
                  {displayRequestFacility?.viewFacilityData?.specify ? displayRequestFacility?.viewFacilityData?.specify:null} 
                </div>
              </div>
            </div>

          </div>
        ):null}

        {/* For Dormitory Room */}
        {Facility_Dorm ? (
          <div className="mt-4 border-b border-black pb-10 font-roboto">

            <div>
              <h2 className="text-base font-bold leading-7 text-gray-900"> * For the Dormitory  </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">

              {/* For Male Guest */}
              <div className="col-span-1">
                
                {/* Male Guest Count */}
                <div className="mt-0 mb-6">
                  <div className="flex items-center">
                    <div className="w-10 ppa-form-request text-center font-bold">
                      <span>
                        {displayRequestFacility?.maleNamesString === "N/A" ? null : (
                          displayRequestFacility?.maleNamesArray?.length
                        )}
                      </span>
                    </div>
                    <div className="ml-2">
                      <strong>No. of Male Guests</strong>
                    </div>
                  </div>
                </div>

                {/* Male Guest List */}
                <div className="mt-6">
                  <div className="mb-4">
                    <label htmlFor="type_of_property" className="block text-base font-medium leading-6 text-gray-900"> <strong>Name of Guests:</strong> </label>
                  </div>
                </div>
                {displayRequestFacility?.maleNamesString === "N/A" ? (
                  <span className="font-meduim">No Male Guest</span>
                ):(
                  displayRequestFacility?.maleNamesArray?.map((maleName, index) => (
                    <div key={index} className="flex items-center">
                      <span className="font-bold">{`${index + 1}.`}</span>
                      <div className="w-1/2 ppa-form-request ml-3 mt-2">{`${maleName.replace(/^\d+\.\s*/, '')}`}</div>
                    </div>
                  ))
                )}

              </div>

              {/* For Female Guest */}
              <div className="col-span-1">
                
                {/* Female Guest Count */}
                <div className="mt-0 mb-6">
                  <div className="flex items-center">
                    <div className="w-10 ppa-form-request text-center font-bold">
                      <span>
                        {displayRequestFacility?.femaleNamesString === "N/A" ? null : (
                          displayRequestFacility?.femaleNamesArray?.length
                        )}
                      </span>
                    </div>
                    <div className="ml-2">
                      <strong>No. of Male Guests</strong>
                    </div>
                  </div>
                </div>

                {/* Female Guest List */}
                <div className="mt-6">
                  <div className="mb-4">
                    <label htmlFor="type_of_property" className="block text-base font-medium leading-6 text-gray-900"> <strong>Name of Guests:</strong> </label>
                  </div>
                </div>
                {displayRequestFacility?.femaleNamesString === "N/A" ? (
                  <span className="font-meduim">No Female Guest</span>
                ):(
                  displayRequestFacility?.femaleNamesArray?.map((femaleName, index) => (
                    <div key={index} className="flex items-center">
                      <span className="font-bold">{`${index + 1}.`}</span>
                      <div className="w-1/2 ppa-form-request ml-3 mt-2">{`${femaleName.replace(/^\d+\.\s*/, '')}`}</div>
                    </div>
                  ))
                )}

              </div>

            </div>

            {/* Other Details */}
            <div className="mt-4">
              <div className="flex">
                <div className="w-28">
                  <span>Other Details:</span>
                </div>
                <div className="w-3/4 border-b border-black text-left pl-2">
                {displayRequestFacility?.viewFacilityData?.other_details}
                </div>
              </div>
            </div>

          </div>
        ):null}

        {/* Footer */}
        <div className="border-b border-black pb-6 font-roboto">

          <div className="grid grid-cols-2 gap-4">

            <div className="col-span-1">

              {/* Requested by */}
              <div className="flex items-center mt-4">
                <div className="w-32">
                  <label className="block text-base font-medium leading-6 text-gray-900">
                  Requested by:
                  </label> 
                </div>
                <div className="w-1/2 ppa-form-request font-bold">
                {displayRequestFacility?.requestor?.name}
                </div>
              </div>

              {/* Approver */}
              <div className="flex items-center mt-2">
                <div className="w-32">
                  <label className="block text-base font-medium leading-6 text-gray-900">
                  Approver:
                  </label> 
                </div>
                <div className="w-1/2 ppa-form-request font-bold">
                {displayRequestFacility?.manager?.name}
                </div>
              </div>

            </div>

            <div className="col-span-1">

              {/* For OPR Instruction */}
              <div className="flex mt-6 items-center">
                <div className="w-80">
                  <label className="block text-base font-medium leading-6 text-gray-900">
                  Instruction for the OPR for Action:
                  </label> 
                </div>

                {currentUser.code_clearance == 1 && (displayRequestFacility?.viewFacilityData?.admin_approval == 4 || displayRequestFacility?.viewFacilityData?.admin_approval == 2) ? (
                <>
                  {displayRequestFacility?.viewFacilityData?.obr_instruct ? (
                  <>
                    {enableOprInstruct ? (
                      <div className="w-96 pl-1">

                        <form id="opr-form-admin" onSubmit={SubmitOPRInstruct}>
      
                          <textarea
                            id="findings"
                            name="findings"
                            rows={3}
                            style={{ resize: "none" }}
                            value= {OprInstruct}
                            placeholder={displayRequestFacility?.viewFacilityData?.obr_instruct}
                            onChange={ev => setOprInstruct(ev.target.value)}
                            className="block w-full ppa-form"
                            required
                          />
      
                        </form>
      
                      </div>
                    ):(
                      <div className="w-1/2 ppa-form-request h-11">
                        {displayRequestFacility?.viewFacilityData?.obr_instruct}
                      </div>
                    )}
                  </>
                  ):(
                  <div className="w-96 pl-1">

                    <form id="opr-form-admin" onSubmit={SubmitOPRInstruct}>

                      <textarea
                        id="findings"
                        name="findings"
                        rows={3}
                        style={{ resize: "none" }}
                        value= {OprInstruct}
                        onChange={ev => setOprInstruct(ev.target.value)}
                        className="block w-full ppa-form"
                        required
                      />

                    </form>

                  </div>
                  )}
                </>
                ):(
                  <div className="w-1/2 ppa-form-request h-11">
                    {displayRequestFacility?.viewFacilityData?.obr_instruct}
                  </div>
                )}

              </div>

              {/* OPR Action */}
              <div className="flex mt-2 items-center">
                <div className="w-80">
                  <label className="block text-base font-medium leading-6 text-gray-900">
                  OPR Action (Comment/Concerns):
                  </label> 
                </div>
                
                {currentUser.code_clearance == 3 ? (
                <> 
                  {(displayRequestFacility?.viewFacilityData?.admin_approval == 4 || displayRequestFacility?.viewFacilityData?.admin_approval == 2) ? (
                  <>
                    {displayRequestFacility?.viewFacilityData?.obr_comment ? (
                    <div className="w-1/2 ppa-form-request h-11">
                      {displayRequestFacility?.viewFacilityData?.obr_comment}
                    </div>
                    ):(
                    <>
                      {displayRequestFacility?.viewFacilityData?.obr_instruct ? (
                        <div className="w-96 pl-1">
                          <form id="opr-form-gso" onSubmit={SubmitOPRAction}>
                            <textarea
                              id="findings"
                              name="findings"
                              rows={3}
                              style={{ resize: "none" }}
                              value={OprAction}
                              onChange={ev => setOprAction(ev.target.value)}
                              className="w-full ppa-form"
                              required
                            />
                          </form>
                        </div>
                      ):(
                        <div className="w-1/2 ppa-form-request h-11">
                          {displayRequestFacility?.viewFacilityData?.obr_comment}
                        </div>
                      )}
                    </>
                    )}
                  </>
                  ):(
                    <div className="w-1/2 ppa-form-request h-11">
                      {displayRequestFacility?.viewFacilityData?.obr_instruct}
                    </div>
                  )}
                </>
                ):(
                <div className="w-1/2 ppa-form-request h-11">
                  {displayRequestFacility?.viewFacilityData?.obr_comment}
                </div>
                )}

              </div>

            </div>

          </div>     

          {/* Status */}
          <div className="flex items-center mt-8">
            <div className="w-16">
              <label className="block text-base font-bold leading-6 text-gray-900">
              Status:
              </label> 
            </div>
            <div className="w-full font-bold ppa-form-request">
            {displayRequestFacility?.viewFacilityData?.admin_approval == 1 && ("Request Closed")}
            {displayRequestFacility?.viewFacilityData?.admin_approval == 2 && ("Approved")}
            {displayRequestFacility?.viewFacilityData?.admin_approval == 3 && (displayRequestFacility?.viewFacilityData?.remarks)}
            {displayRequestFacility?.viewFacilityData?.admin_approval == 4 && ("Pending")}
            </div>
          </div> 

        </div>

        {giveAdminReason ? (
          <div className="flex items-center mt-6">
            <div className="w-44">
              <label htmlFor="supervisor_reason" className="block text-base font-medium leading-6 text-black"> Reason for Disapproval: </label> 
            </div>
            <div className="ml-5">
              <div className="flex items-center">
                <div className="w-96">
                  <textarea
                    name="reason"
                    id="reason"
                    rows={3}
                    style={{ resize: 'none' }}
                    value={adminReason}
                    onChange={ev => setAdminReason(ev.target.value)}
                    className="block w-full ppa-form"
                  />
                </div>
              </div>
            </div>
          </div>
        ):null}

        {/* Buttons */}
        <div className="flex mt-6 font-roboto">

          {/* For Admin */}
          {currentUser.code_clearance == 1 && (displayRequestFacility?.viewFacilityData?.admin_approval == 4 || displayRequestFacility?.viewFacilityData?.admin_approval == 2) && (
          <>
            {giveAdminReason ? (
            <>
              <button type="submit" onClick={() => submitAdminReason(displayRequestFacility?.viewFacilityData?.id)}
                      className={`px-6 py-2 mr-2 btn-submit ${ submitLoading && 'btn-submitting'}`}
                      disabled={submitLoading}
                    >
                      {submitLoading ? (
                        <div className="flex items-center justify-center">
                          <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
                          <span className="ml-2">Processing</span>
                        </div>
                      ) : (
                        'Submit'
                      )}
                    </button>

                  {/* Cancel */}
                  <button onClick={() => handleCancelReason()} className="px-6 py-2 btn-cancel" title="Supervisor Decline">
                    Cancel
                  </button>
            </>
            ):(
            <>
              {displayRequestFacility?.viewFacilityData?.obr_instruct ? (
              <>
                {/* Edit */}
                {enableOprInstruct ? null:(
                  <button onClick={handleOPRInstruct} className="px-6 py-2 mr-2 btn-edit">
                    Edit OPR Instruction
                  </button>
                )}
              </>
              ):(
              <>
                <button form='opr-form-admin' type="submit"
                  className={`px-6 py-2 mr-2 btn-submit ${ submitLoading && 'btn-submitting'}`}
                  style={{ position: 'relative', top: '0px' }}
                  disabled={submitLoading}
                >
                  {submitLoading ? (
                    <div className="flex items-center justify-center">
                      <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
                      <span className="ml-2">Processing...</span>
                    </div>
                  ) : (
                    'Submit OPR'
                  )}
                </button>
              </>
              )}

              {enableOprInstruct && (
              <>
                <button form='opr-form-admin' type="submit"
                  className={`px-6 py-2 mr-2 btn-submit ${ submitLoading && 'btn-submitting'}`}
                  style={{ position: 'relative', top: '0px' }}
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

                {/* Cancel */}
                <button onClick={() => handleDisableEdit()} className="px-6 py-2 btn-cancel" title="Supervisor Decline">
                  Cancel
                </button>
              </>
              )}
              
              {displayRequestFacility?.viewFacilityData?.admin_approval == 4 && (
              <>
                {enableOprInstruct ? null:(
                <>
                  {/* Approve */}
                  <button  onClick={() => handleAdminApproveConfirmation()} className="px-6 py-2 btn-default" title="Admin Approve">
                    Approve
                  </button>

                  {/* Decline */}
                  <button onClick={() => handleDisapproveConfirmation()} className="px-6 py-2 btn-cancel ml-2" title="Admin Decline">
                    Decline
                  </button>
                  </>
                )}
              </>
              )}
            </>
            )}
            
          </>  
          )}

          {/* For GSO */}
          {currentUser.code_clearance == 3 && (
          <>
            {displayRequestFacility?.viewFacilityData?.admin_approval == 4 || displayRequestFacility?.viewFacilityData?.admin_approval == 2 ? (
            <>
              <button onClick={() => handleClosure()} className="px-6 py-2 mr-2 btn-close">
                Close Request
              </button>

              {!displayRequestFacility?.viewFacilityData?.obr_comment && displayRequestFacility?.viewFacilityData?.obr_instruct ? (
              <>
                {!displayRequestFacility?.viewFacilityData?.obr_comment && (
                  <button form="opr-form-gso" type="submit"
                    className={`px-6 py-2 mr-2 btn-submit ${ submitLoading && 'btn-submitting'}`}
                    style={{ position: 'relative', top: '0px' }}
                    disabled={submitLoading}
                  >
                    {submitLoading ? (
                      <div className="flex items-center justify-center">
                        <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
                        <span className="ml-2">Processing...</span>
                      </div>
                    ) : (
                      'Submit OPR'
                    )}
                  </button>
                )}
              </>
              ):null}

            </>
            ):(
            <>
              {displayRequestFacility?.viewFacilityData?.admin_approval != 3 ? (
              <>
                {/* Generate PDF */}
                <button type="button" onClick={handleButtonClick}
                  className={`px-6 py-2 mr-2  btn-pdf ${ generatePDFLoad && 'btn-genpdf'}`}
                  disabled={generatePDFLoad}
                >
                  {generatePDFLoad ? (
                    <div className="flex items-center justify-center">
                      <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
                      <span className="ml-2">Generating</span>
                    </div>
                  ) : (
                    'Get PDF'
                  )}
                </button>
              </>
              ):null}
            </>
            )}
            
          </>
          )}

        </div>

        {/* Show Popup */}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Semi-transparent black overlay */}
          <div
            className="fixed inset-0 bg-black opacity-40" // Close on overlay click
          ></div>
          {/* Popup content with background blur */}
          <div className="absolute p-6 rounded-lg shadow-md bg-white backdrop-blur-lg animate-fade-down" style={{ width: '400px' }}>
            
            {/* Notification Icons */}
            <div class="f-modal-alert">

              {/* Error */}
              {popupContent == "error" && (
              <>
              <div className="f-modal-icon f-modal-error animate">
                <span className="f-modal-x-mark">
                  <span className="f-modal-line f-modal-left animateXLeft"></span>
                  <span className="f-modal-line f-modal-right animateXRight"></span>
                </span>
              </div>
              </>
              )}

              {/* Warning */}
              {(popupContent == "warning" || popupContent == "warningD" || popupContent == "close") && (
              <>
                <div class="f-modal-icon f-modal-warning scaleWarning">
                  <span class="f-modal-body pulseWarningIns"></span>
                  <span class="f-modal-dot pulseWarningIns"></span>
                </div>
              </> 
              )}

              {/* Success */}
              {popupContent == "success" && (
              <>
              <div class="f-modal-icon f-modal-success animate">
                <span class="f-modal-line f-modal-tip animateSuccessTip"></span>
                <span class="f-modal-line f-modal-long animateSuccessLong"></span>
              </div>
              </>
              )}

            </div>
            
            {/* Popup Message */}
            <p className="text-lg text-center font-roboto">
              {popupMessage}
            </p>

            {/* Popup Buttons */}
            <div className="flex justify-center mt-4 font-roboto">
            
            {/* Warning */}
            {popupContent == "warning" && (
            <>
              {currentUser.code_clearance == 1 && (
              <>
                
                {!submitLoading && (
                  <button onClick={() => handleApproveClick(displayRequestFacility?.viewFacilityData?.id)} className="w-1/2 py-2 popup-confirm">
                    <FontAwesomeIcon icon={faCheck} /> Confirm
                  </button>
                )}

                {!submitLoading && (
                  <button onClick={justclose} className="w-1/2 py-2 popup-cancel">
                    <FontAwesomeIcon icon={faTimes} /> Cancel
                  </button>
                )}

                {submitLoading && (
                  <button className="w-full cursor-not-allowed py-2 btn-process">
                    <div className="flex items-center justify-center">
                      <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
                      <span className="ml-2">Loading</span>
                    </div>
                  </button>
                )}

              </>
              )}
            </>
            )}

            {/* Closure */}
            {popupContent == "close" && (
            <>
              {/* Yes */}
              {!submitLoading && (
                <button onClick={() => handleCloseRequest(displayRequestFacility?.viewFacilityData?.id)} className="w-1/2 py-2 popup-confirm">
                  <FontAwesomeIcon icon={faCheck} /> Confirm
                </button>
              )}
              {/* No */}
              {!submitLoading && (
                <button onClick={justclose} className="w-1/2 py-2 popup-cancel">
                  <FontAwesomeIcon icon={faTimes} /> Cancel
                </button>
              )}
              {/* Loading */}
              {submitLoading && (
                <button className="w-full cursor-not-allowed py-2 btn-process">
                  <div className="flex items-center justify-center">
                    <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
                    <span className="ml-2">Please Wait</span>
                  </div>
                </button>
              )}
            </>
            )}

            {/* Success Button */}
            {popupContent == "success" && (
            <>
              <button onClick={closePopup} className="w-full py-2 btn-success">
                Close
              </button>
            </>
            )}

            {/* Error Message */}
            {popupContent == "error" && (
            <>
              <button onClick={justclose} className="w-full py-2 btn-error">
                Close
              </button>
            </>
            )}

            </div> 
          </div>
          </div>
        )}

        {/* Generate PFD */}
        {isVisible && (
        <div>

          <div className="hidden md:none">
            <div ref={componentRef}>
              <div style={{ width: '210mm', height: '297mm', paddingLeft: '30px', paddingRight: '30px', paddingTop: '10px', border: '0px solid' }}>

                {/* Control Number */}
                <div className="title-area font-arial pr-6 text-right">
                  <span>Control No:</span>{" "}
                  <span style={{ textDecoration: "underline", fontWeight: "900" }}>
                    _______
                    {displayRequestFacility?.viewFacilityData?.id}
                    _______
                  </span>
                </div>

                {/* Main Form */}
                <table className="w-full mt-1 border-collapse border border-black">

                  {/* Title and Logo */}
                  <tr>
                    <td className="border border-black w-32 p-2 text-center">
                      <img src="/ppa_logo.png" alt="My Image" className="mx-auto" style={{ width: 'auto', height: '65px' }} />
                    </td>
                    <td className="border text-lg w-3/5 border-black font-arial text-center">
                      <b>REQUEST FOR THE USE OF FACILITY / VENUE</b>
                    </td>
                    <td className="border border-black p-0 font-arial">
                      <div className="border-b text-xs border-black px-3 py-3" style={{ fontWeight: 'bold' }}>RF 03-2018 ver 1</div>
                      <div className="border-black text-xs px-3 py-3" style={{ fontWeight: 'bold' }}>DATE: {formatDate(displayRequestFacility?.viewFacilityData?.date_requested)}</div>
                    </td>
                  </tr>

                  {/* Black */}
                  <tr>
                    <td colSpan={3} className="border border-black p-1 font-arial"></td>
                  </tr>

                  {/* Form */}
                  <tr>
                    <td colSpan={3} className="border border-black pl-2 pr-2 pb-2 font-arial">

                      {/* Request Office/Division */}
                      <div className="mt-2">
                        <div className="flex">
                          <div className="w-60 text-sm">
                            <span>Request Office/Division:</span>
                          </div>
                          <div className="w-96 border-b border-black pl-1 text-sm">
                            <span>{displayRequestFacility?.viewFacilityData?.request_office}</span>
                          </div>
                        </div>
                      </div>

                      {/* Title/Purpose of Activity */}
                      <div className="mt-1">
                        <div className="flex">
                          <div className="w-60 text-sm">
                            <span>Title/Purpose of Activity:</span>
                          </div>
                          <div className="w-96 border-b border-black pl-1 text-sm">
                            <span> {displayRequestFacility?.viewFacilityData?.title_of_activity} </span>
                          </div>
                        </div>
                      </div>

                      {/* Date of Activity */}
                      <div className="mt-1">
                        <div className="flex">
                          <div className="w-60 text-sm">
                            <span>Date of Activity:</span>
                          </div>
                          <div className="w-96 border-b border-black pl-1 text-sm">
                          {displayRequestFacility?.viewFacilityData?.date_start === displayRequestFacility?.viewFacilityData?.date_end ? (
                          <span> {formatDate(displayRequestFacility?.viewFacilityData?.date_start)} </span>
                          ):(
                          <span> {formatDate(displayRequestFacility?.viewFacilityData?.date_start)} to {formatDate(displayRequestFacility?.viewFacilityData?.date_end)} </span>
                          )}
                          </div>
                        </div>
                      </div>

                      {/* Time of Activity */}
                      <div className="mt-1">
                        <div className="flex">
                          <div className="w-60 text-sm">
                            <span>Time of Activity (START and END):</span>
                          </div>
                          <div className="w-96 border-b border-black pl-1 text-sm">
                          {displayRequestFacility?.viewFacilityData?.date_start === displayRequestFacility?.viewFacilityData?.date_end ? (
                          <span> {formatTime(displayRequestFacility?.viewFacilityData?.time_start)} to {formatTime(displayRequestFacility?.viewFacilityData?.time_end)}</span>
                          ):(
                          <span> {formatDate(displayRequestFacility?.viewFacilityData?.date_start)} ({formatTime(displayRequestFacility?.viewFacilityData?.time_start)}) to {formatDate(displayRequestFacility?.viewFacilityData?.date_end)} ({formatTime(displayRequestFacility?.viewFacilityData?.time_end)}) </span>
                          )}
                          </div>
                        </div>
                      </div>

                      {/* Type of Facility */}
                      <div className="mt-1">
                        <div className="flex">
                          <div className="w-full text-sm">
                            <span>Facility/ies Venue being Requested:</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* 4 Facilities */}
                      <div className="mt-4">
                        <div className="w-full">
                          <div className="grid grid-cols-4 gap-1">

                            {/* MPH */}
                            <div className="col-span-1">
                              <div className="flex items-start text-sm">
                                <div className="w-5 h-5 border border-black mr-2 flex items-start justify-center text-black"> 
                                  {displayRequestFacility?.viewFacilityData?.mph == 1 ? 'X' : null} 
                                </div>
                                <span style={{ fontWeight: 'bold' }}>Multi-Purpose Hall (MPH)</span>
                              </div>
                            </div>

                            {/* Conference */}
                            <div className="col-span-1">
                              <div className="flex items-center text-sm">
                                <div className="w-5 h-5 border border-black mr-2 flex items-center justify-center text-black">
                                  {displayRequestFacility?.viewFacilityData?.conference == 1 ? 'X' : null}
                                </div>
                                <span style={{ fontWeight: 'bold' }}>Conference Room</span>
                              </div>
                            </div>

                            {/* Dorm */}
                            <div className="col-span-1">
                              <div className="flex items-center text-sm">
                                <div className="w-5 h-5 border border-black mr-2 flex items-center justify-center text-black">
                                  {displayRequestFacility?.viewFacilityData?.dorm == 1 ? 'X' : null}
                                </div>
                                <span style={{ fontWeight: 'bold' }}>Dormitory</span>
                              </div>
                            </div>

                            {/* Other */}
                            <div className="col-span-1">
                              <div className="flex items-center text-sm">
                                <div className="w-5 h-5 border border-black mr-2 flex items-center justify-center text-black">
                                  {displayRequestFacility?.viewFacilityData?.other == 1 ? 'X' : null}
                                </div>
                                <span style={{ fontWeight: 'bold' }}>Others</span>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>

                    </td>
                  </tr>

                </table>

                {/* For Facility Room */}
                <table className="w-full border-collapse border border-black mt-1">
                  <tr>
                    <td colSpan={3} className="text-base w-full border-black font-arial text-left pl-2">

                      <div className="text-sm mt-1">
                        <span>* For the Multi-Purpose Hall / Conference Room / Others: </span>
                      </div>

                      <div className="mt-4 mb-4">
                        <div className="w-full">

                          <div className="grid grid-cols-2 gap-4">
                            
                            <div className="col-span-1 ml-36">

                              {/* Table */}
                              <div className="mt-0">
                                <div className="flex">
                                  <div className="w-12 border-b border-black pl-1 text-center text-xs h-4">
                                    {displayRequestFacility?.viewFacilityData?.table === 1 ? 'X':null}
                                  </div>
                                  <div className="w-10 text-sm mr-1 ml-1">
                                    <span>Tables</span>
                                  </div>
                                  <div className="w-30 text-sm">
                                  (No.<span className="border-b border-black px-2 text-center mr-1"> {displayRequestFacility?.viewFacilityData?.no_table ? displayRequestFacility?.viewFacilityData?.no_table:null} </span> )
                                  </div>
                                </div>
                              </div>

                              {/* Chair */}
                              <div className="mt-1">
                                <div className="flex">
                                  <div className="w-12 border-b border-black text-xs pl-1 text-center h-4">
                                    {displayRequestFacility?.viewFacilityData?.chair === 1 ? 'X':null}
                                  </div>
                                  <div className="w-10 text-sm mr-1 ml-1">
                                    <span>Chairs</span>
                                  </div>
                                  <div className="w-30 text-sm">
                                  (No.<span className="border-b border-black px-2 text-center mr-1"> {displayRequestFacility?.viewFacilityData?.no_chair ? displayRequestFacility?.viewFacilityData?.no_chair:null} </span>)
                                  </div>
                                </div>
                              </div>

                              {/* Projector */}
                              <div className="mt-1">
                                <div className="flex">
                                  <div className="w-12 border-b border-black pl-1 text-xs text-center h-4">
                                    {displayRequestFacility?.viewFacilityData?.projector === 1 ? 'X':null}
                                  </div>
                                  <div className="w-10 text-sm mr-1 ml-1">
                                    <span>Projector</span>
                                  </div>
                                </div>
                              </div>

                              {/* Projector Screen */}
                              <div className="mt-1">
                                <div className="flex">
                                  <div className="w-12 border-b border-black text-xs text-center h-4">
                                    {displayRequestFacility?.viewFacilityData?.projector === 1 ? 'X':null}
                                  </div>
                                  <div className="w-22 text-sm mr-1 ml-1">
                                    <span>Projector Screen</span>
                                  </div>
                                </div>
                              </div>

                              {/* Document Camera */}
                              <div className="mt-1">
                                <div className="flex">
                                  <div className="w-12 border-b border-black text-xs text-center h-4">
                                    {displayRequestFacility?.viewFacilityData?.document_camera === 1 ? 'X':null}
                                  </div>
                                  <div className="w-22 text-sm mr-1 ml-1">
                                    <span>Document Camera</span>
                                  </div>
                                </div>
                              </div>

                            </div>

                            <div className="col-span-1">

                              {/* Laptop */}
                              <div className="mt-0">
                                <div className="flex">
                                  <div className="w-12 border-b border-black pl-1 text-center text-xs h-4">
                                    {displayRequestFacility?.viewFacilityData?.laptop === 1 ? 'X':null}
                                  </div>
                                  <div className="w-12 text-sm mr-1 ml-1">
                                    <span>Laptop</span>
                                  </div>
                                </div>
                              </div>

                              {/* Television */}
                              <div className="mt-1">
                                <div className="flex">
                                  <div className="w-12 border-b border-black pl-1 text-center text-xs h-4">
                                    {displayRequestFacility?.viewFacilityData?.television === 1 ? 'X':null}
                                  </div>
                                  <div className="w-12 text-sm mr-1 ml-1">
                                    <span>Television</span>
                                  </div>
                                </div>
                              </div>

                              {/* Sound System */}
                              <div className="mt-1">
                                <div className="flex">
                                  <div className="w-12 border-b border-black pl-1 text-center text-xs h-4">
                                    {displayRequestFacility?.viewFacilityData?.sound_system === 1 ? 'X':null}
                                  </div>
                                  <div className="w-22 text-sm mr-1 ml-1">
                                    <span>Sound System</span>
                                  </div>
                                </div>
                              </div>

                              {/* Videoke */}
                              <div className="mt-1">
                                <div className="flex">
                                  <div className="w-12 border-b border-black pl-1 text-center text-xs h-4">
                                    {displayRequestFacility?.viewFacilityData?.videoke === 1 ? 'X':null}
                                  </div>
                                  <div className="w-32 text-sm mr-1 ml-1">
                                    <span>Videoke</span>
                                  </div>
                                </div>
                              </div>

                              {/* Microphone */}
                              <div className="mt-1">
                                <div className="flex">
                                  <div className="w-12 border-b border-black pl-1 text-center text-xs h-4">
                                    {displayRequestFacility?.viewFacilityData?.microphone === 1 ? 'X':null}
                                  </div>
                                  <div className="w-22 text-sm mr-1 ml-1">
                                    <span>Microphone</span>
                                  </div>
                                  <div className="w-30 text-sm">
                                  (No.<span className="border-b border-black px-2 mr-1 text-center"> {displayRequestFacility?.viewFacilityData?.no_microphone ? displayRequestFacility?.viewFacilityData?.no_microphone:null} </span>)
                                  </div>
                                </div>
                              </div>

                            </div>

                          </div>

                          {/* Others */}
                          <div className="mt-2">
                            <div className="w-full">

                            <div className="mt-1 ml-36">
                              <div className="flex">
                                <div className="w-12 border-b border-black pl-1 text-center text-xs h-4">
                                  {displayRequestFacility?.viewFacilityData?.others === 1 ? 'X':null}
                                </div>
                                <div className="w-22 text-sm mr-1 ml-1">
                                  <span>Others</span>, please specify
                                </div>
                                <div className="w-1/2 border-b p-0 pl-2 border-black text-sm text-left ml-1">
                                <span className=""> {displayRequestFacility?.viewFacilityData?.specify ? displayRequestFacility?.viewFacilityData?.specify:null} </span>
                                </div>
                              </div>
                            </div>

                            </div>
                          </div>

                        </div>
                      </div>

                    </td>
                  </tr>
                </table>

                {/* For Dormitory */}
                <table className="w-full border-collapse border border-black mt-1">
                  <tr>
                    <td colSpan={3} className="text-base w-full border-black font-arial text-left pl-2 pb-6">

                      <div className="text-sm mt-1">
                        <span>* For the Dormitory</span>
                      </div>

                      <div className="grid grid-cols-2 gap-6 mt-4">

                        {/* Male Guest */}
                        <div className="col-span-1 ml-16">

                          {/* Male Count */}
                          <div>
                            <div className="flex">
                              <div className="w-10 border-b border-black font-normal text-center text-sm">
                                <span>
                                {displayRequestFacility?.maleNamesString === "N/A" ? null:(
                                  displayRequestFacility?.maleNamesArray?.length
                                )}
                                </span>
                              </div>
                              <div className="w-full ml-2 text-sm">
                                <span>No. of Male Guests</span>
                              </div>
                            </div>
                          </div>

                          {/* Male List */}
                          <div className="mt-2">
                            <div>
                              <label htmlFor="type_of_property" className="block text-base font-normal leading-6 text-sm"> <span>Name of Guests:</span> </label>
                            </div>
                          </div>
                          {displayRequestFacility?.maleNamesString === "N/A" ? (
                            <div>
                            {[...Array(6)].map((_, index) => (
                              <div key={index} className="flex mt-1">
                                <span className="font-normal text-sm">{`${index + 1}.`}</span>
                                <div className="w-full text-sm border-b border-black pl-1 text-left ml-1 pl-2"></div>
                              </div>
                            ))}
                          </div>
                          ):(
                            displayRequestFacility?.maleNamesArray?.map((maleName, index) => (
                              <div key={index} className="flex mt-1">
                                <span className="font-normal text-sm">{`${index + 1}.`}</span>
                                <div className="w-full text-sm border-b border-black pl-1 text-left ml-1 pl-2">{`${maleName.replace(/^\d+\.\s*/, '')}`}</div>
                              </div>
                            ))
                          )}

                        </div>

                        {/* Female Guest */}
                        <div className="col-span-1">

                          {/* Female Count */}
                          <div>
                            <div className="flex">
                              <div className="w-10 border-b border-black font-normal text-center text-sm">
                                <span>
                                {displayRequestFacility?.femaleNamesString === "N/A" ? null:(
                                  displayRequestFacility?.femaleNamesArray?.length
                                )}
                                </span>
                              </div>
                              <div className="w-full ml-2 text-sm">
                                <span>No. of Female Guests</span>
                              </div>
                            </div>
                          </div>

                          {/* Female List */}
                          <div className="mt-2">
                              <div>
                                <label htmlFor="type_of_property" className="block text-base font-normal leading-6 text-sm"> <span>Name of Guests:</span> </label>
                              </div>
                          </div>
                          {displayRequestFacility?.femaleNamesString === "N/A" ? (
                            <div>
                              {[...Array(6)].map((_, index) => (
                              <div key={index} className="flex mt-1 pr-10">
                                <span className="font-normal text-sm">{`${index + 1}.`}</span>
                                <div className="w-full text-sm border-b border-black pl-1 text-left ml-1 pl-2"></div>
                              </div>
                            ))}
                            </div>
                          ):(
                            displayRequestFacility?.femaleNamesArray?.map((femaleName, index) => (
                              <div key={index} className="flex mt-1">
                                <span className="font-normal text-sm">{`${index + 1}.`}</span>
                                <div className="w-3/4 text-sm border-b border-black pl-1 text-left ml-1 pl-2">{`${femaleName.replace(/^\d+\.\s*/, '')}`}</div>
                              </div>
                            ))
                          )}
                            
                        </div>

                      </div>

                      
                      {/* Other Details */}
                      <div className="mt-4 ml-16">
                        <div className="flex">
                          <div className="w-24 text-sm">
                            <span>Other Details:</span>
                          </div>
                          <div className="w-3/4 border-b border-black font-regular text-sm text-left pl-2">
                          {displayRequestFacility?.viewFacilityData?.other_details}
                          </div>
                        </div>
                      </div>

                    </td>
                  </tr>
                </table>

                {/* Footer */}
                <table className="w-full border-collapse border border-black mt-2">
                  <tr>
                    {/* Requestor */}
                    <td className="border border-black w-1/2 p-2">
                        <div className="text-sm font-arial">
                          Requested by:
                        </div>
                        <div className="relative">
                          <img
                            src={displayRequestFacility?.requestor?.signature}
                            alt="Signature"
                            className="ppa-esig-user-fvf"
                          />
                        </div>
                        <div className="text-center font-bold text-base relative mt-5">
                          {displayRequestFacility?.requestor?.name}
                        </div>
                      </td>

                      {/* Admin Manager */}
                      <td className="border w-1/2 border-black">
                        <div className="text-sm font-arial ml-6">
                        {displayRequestFacility?.viewFacilityData?.admin_approval === 1 ? 'Approved' 
                        : displayRequestFacility?.viewFacilityData?.admin_approval === 2 ? 'Approved'
                        : displayRequestFacility?.viewFacilityData?.admin_approval === 3 ? 'Disapproved'
                        : 'Approved / Disapproved by:' }
                        </div>
                        {displayRequestFacility?.viewFacilityData?.admin_approval === 1 || displayRequestFacility.viewFacilityData.admin_approval === 2  ? (
                          <div className="relative">
                            <img
                              src={displayRequestFacility?.manager?.signature}
                              className="ppa-esig-admin-fvf"
                              alt="Signature"
                            />
                          </div>
                        ):null}
                        
                      <div className="text-center font-bold text-base relative mt-5">
                          {displayRequestFacility?.manager?.name}
                      </div>
                      </td>
                  </tr>
                  <tr>
                    <td className="border border-black w-1/2 text-center text-sm">{displayRequestFacility?.requestor?.position}</td>
                    <td className="border border-black w-1/2 text-center text-sm">Admin. Division Manager</td>
                  </tr>
                  <tr>
                      <td className="border text-base border-black w-1/2 text-center text-sm"><b>DATE: </b> {formatDate(displayRequestFacility?.viewFacilityData?.date_requested)}</td>
                      <td className="border text-base border-black w-1/2 text-center text-sm"><b>DATE: </b> 
                        {displayRequestFacility?.viewFacilityData?.date_approve ? formatDate(displayRequestFacility?.viewFacilityData?.date_approve) : null}
                      </td>
                    </tr>
                </table>

                {/* OPR */}
                <table className="w-full border-collapse border border-black mt-1">
                  <tr>

                    {/* For OPR Instruction */}
                    <td className="border border-black w-1/2 p-2" style={{ verticalAlign: 'top' }}>
                      <div className="font-bold font-arial text-sm">
                        Instruction for the OPR for Action
                      </div>

                      <div className="px-5 font-arial mt-2 text-sm">
                        {displayRequestFacility?.viewFacilityData?.obr_instruct == 'N/A' ? (
                          displayRequestFacility?.viewFacilityData?.obr_instruct
                        ):(
                          <span className="underline-text">{displayRequestFacility?.viewFacilityData?.obr_instruct}</span>
                        )}
                      </div>  
                    </td>

                    {/* For OPR Action */}
                    <td className="border border-black w-1/2 p-2 " style={{ verticalAlign: 'top' }}>
                      <div className="font-bold font-arial text-sm">
                        OPR Action (Comments / Concerns)
                      </div>

                      <div className="px-5 font-arial">
                        
                        <div className="px-5 font-arial mt-2 text-sm">
                        {displayRequestFacility.viewFacilityData.obr_comment == 'N/A' ? (
                          displayRequestFacility.viewFacilityData.obr_comment
                        ):(
                          <span className="underline-text">{displayRequestFacility.viewFacilityData.obr_comment}</span>
                        )}
                        </div>
                    
                      </div>
                    </td>

                  </tr>
                </table>

              </div>
            </div>
          </div>

        </div>
        )}
      
      </PageComponent>
    ):(
      (() => {
        window.location = '/forbidden';
        return null; // Return null to avoid any unexpected rendering
      })()
    )}
  </>
  );
}