import axiosClient from "../axios";
import PageComponent from "../components/PageComponent";
import React, { useEffect, useState } from "react";
import { useUserStateContext } from "../context/ContextProvider";
import submitAnimation from '../assets/loading_nobg.gif';
import { Link, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function RequestFormFacility(){

  const { currentUser } = useUserStateContext();

  const today = new Date().toISOString().split('T')[0];
  const currentDate = new Date();

  useEffect(() => {
    // Redirect to dashboard if pwd_change is not 1
    if (currentUser && currentUser.pwd_change === 1) {
      window.location.href = '/newpassword';
      return null;
    }
  }, [currentUser]);

  function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Add leading zero if needed
    const day = date.getDate().toString().padStart(2, '0'); // Add leading zero if needed
    const hours = date.getHours().toString().padStart(2, '0'); // Add leading zero if needed
    const minutes = date.getMinutes().toString().padStart(2, '0'); // Add leading zero if needed
    const seconds = date.getSeconds().toString().padStart(2, '0'); // Add leading zero if needed
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  
  const currentDateFormatted = formatDate(currentDate);

  const [fieldMissing, setFieldMissing] = useState(false);

  const [DateEndMin, setDateEndMin] = useState(today);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [inputFacErrors, setInputFacErrors] = useState({});

  // Popup
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [notifications, setNototifications] = useState('');

  //Main Form
  const [reqOffice, setRegOffice] = useState('');
  const [titleReq, setTitleReq] = useState('');
  const [DateStart, setDateStart] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [DateEnd, setDateEnd] = useState('');
  const [timeEnd, setTimeEnd] = useState('');

  const [mphCheck, setMphCheck] = useState(false);
  const [confCheck, setConfCheck] = useState(false);
  const [dormCheck, setDormCheck] = useState(false);
  const [otherCheck, setOtherCheck] = useState(false);

  // For checkbox
  const handleCheckboxChange = (setStateFunction, isChecked, ...otherStateFunctions) => {
    setStateFunction(isChecked);

    if (isChecked) {
      // Uncheck other checkboxes if "Other" is checked
      otherStateFunctions.forEach((otherStateFunction) => {
        if (otherStateFunction !== null) {
          otherStateFunction(0);
        }
      });
    } else {
      // Enable MPH and Conference Hall if "Other" is unchecked
      setMphCheck(0);
      setConfCheck(0);
    }

  };

  //Facility Room
  const [checkTable, setCheckTable] = useState(false);
  const [checkChairs, setCheckChairs] = useState(false);
  const [checkProjector, setCheckProjector] = useState(false);
  const [checkProjectorScreen, setCheckProjectorScreen] = useState(false);
  const [checkDocumentCamera, setCheckDocumentCamera] = useState(false);
  const [checkLaptop, setCheckLaptop] = useState(false);
  const [checkTelevision, setCheckTelevision] = useState(false);
  const [checkSoundSystem, setCheckSoundSystem] = useState(false);
  const [checkVideoke, setCheckVideoke] = useState(false);
  const [checkMicrphone, setCheckMicrphone] = useState(false);
  const [checkOther, setCheckOther] = useState(false);
  const [NoOfTable, setNoOfTable] = useState('');
  const [NoOfChairs, setNoOfChairs] = useState('');
  const [NoOfMicrophone, setNoOfMicrophone] = useState('');
  const [OtherField, setOtherField] = useState('');

 //Count checked table
 const [checkedCount, setCheckedCount] = useState(0);

 useEffect(()=>{
   const totalChecked = [
     checkTable, 
     checkChairs,
     checkProjector,
     checkProjectorScreen,
     checkDocumentCamera,
     checkLaptop,
     checkTelevision,
     checkSoundSystem,
     checkVideoke,
     checkMicrphone,
     checkOther
   ].filter(Boolean).length;
   setCheckedCount(totalChecked);
 },[checkTable, 
   checkChairs,
   checkProjector,
   checkProjectorScreen,
   checkDocumentCamera,
   checkLaptop,
   checkTelevision,
   checkSoundSystem,
   checkVideoke,
   checkMicrphone,
   checkOther]);

  const handleInputTableChange = (event) => {
    // Extract the input value and convert it to a number
    let inputValue = parseInt(event.target.value, 10);

    // If the input value is below 0, set it to 0
    if (inputValue < 0 || isNaN(inputValue)) {
      inputValue = 0;
    }

    // Update the state with the sanitized input value
    setNoOfTable(inputValue);
  };

  const handleInputChairChange = (event) => {
    // Extract the input value and convert it to a number
    let inputValue = parseInt(event.target.value, 10);

    // If the input value is below 0, set it to 0
    if (inputValue < 0 || isNaN(inputValue)) {
      inputValue = 0;
    }

    // Update the state with the sanitized input value
    setNoOfChairs(inputValue);
  };

  const handleInputMicrophoneChange = (event) => {
    // Extract the input value and convert it to a number
    let inputValue = parseInt(event.target.value, 10);

    // If the input value is below 0, set it to 0
    if (inputValue < 0 || isNaN(inputValue)) {
      inputValue = 0;
    }

    // Update the state with the sanitized input value
    setNoOfMicrophone(inputValue);
  };
  

  //OPR Instruction (For Admin Manager Only)
  const [OprInstruct, setOprInstruct] = useState('');

  const oprInstrucValue = currentUser.code_clearance === 1
    ? OprInstruct === null || OprInstruct.trim() === "" 
      ? "None" 
      : OprInstruct
    : "";

  //For Dorm
  const [maleList, setMaleList] = useState('');
  const [getMaleList, setGetMaleList] = useState('');
  const [femaleList, setFemaleList] = useState('');
  const [getFemaleList, setGetFemaleList] = useState('');

  const [DormOtherField, setDormOtherField]= useState('');

  // Other variables
  const [checkAvailabilityBtn, setCheckAvailabilityBtn] = useState(true);
  const [activateFacility, setActivateFacility] = useState(false);
  const [activateDorm, setActivateDorm] = useState(false);

  //Count Male Guest
  const generateNumberedText = (lines) => {
    return lines.map((line, index) => `${index + 1}. ${line}`).join('\n');
  };

  const countMaleList = (text) => {
    const lines = text.split('\n');
    setGetMaleList(generateNumberedText(lines));
  };

  const handleMaleTextChange = (e) => {
    const newText = e.target.value;
    setMaleList(newText);
    countMaleList(newText);

    if (newText.trim() === '') {
      setGetMaleList('');
    }
  };

  //Count Female Guest
  const countFemaleList = (text) => {
    const lines = text.split('\n');
    setGetFemaleList(generateNumberedText(lines));
  };

  const handleFemaleTextChange = (e) => {
    const newText = e.target.value;
    setFemaleList(newText);
    countFemaleList(newText);

    if (newText.trim() === '') {
      setGetFemaleList('');
    }
  };

  // Auto Approval for Supervisors and Manager
  let output;
  let date_request;

  if (currentUser.code_clearance === 1 ) {
    output = 2;
    date_request = today;
  } else {
    output = 4;
    date_request = null;
  }

  function handleClarification(){

    setShowPopup(true);
      setPopupMessage(
        <div>
          <p className="popup-title">Warning</p>
          <p>Do you want to proceed if there is no OPR instruction?</p>
        </div>
      );
      setNototifications("warning"); 
  }

  const handleCancelForm = () => {
    setCheckTable(false);
    setNoOfTable('');
    setCheckChairs(false);
    setNoOfChairs('');
    setCheckProjector(false);
    setCheckProjectorScreen(false);
    setCheckDocumentCamera(false);
    setCheckLaptop(false);
    setCheckTelevision(false);
    setCheckSoundSystem(false);
    setCheckVideoke(false);
    setCheckMicrphone(false);
    setNoOfMicrophone('');
    setInputFacErrors(null);

    setActivateFacility(false);
    setActivateDorm(false);
    setCheckAvailabilityBtn(true);
  }

  // Check Availability
  const checkAvailability = (event) => {
    event.preventDefault();

    setSubmitLoading(true);

    const checkRequest = {
      date_start: DateStart,
      time_start: timeStart +':00',
      date_end: DateEnd,
      time_end: timeEnd +':00',
      mph: mphCheck,
      conference: confCheck,
      dorm: dormCheck,
      other: otherCheck,
    };

    if(!reqOffice || !titleReq || !DateStart || !timeStart || !DateEnd || !timeEnd || (!mphCheck && !confCheck && !dormCheck && !otherCheck)){
      setFieldMissing(true);
      setSubmitLoading(false);
    }else{
      
      axiosClient
      .get(`/checkavailability`, { params: checkRequest })
      .then((response) => {
        const responseData = response.data;

        console.log(responseData);
        if (responseData.message === 'Wrong Date') {
          setShowPopup(true);
          setPopupMessage(
            <div>
              <p className="popup-title">Invalid Date</p>
              <p className="popup-message">Please input the correct date and time of activity</p>
            </div>
          );
          setNototifications("error"); 
        }
        else if(responseData.message === 'EOD'){
          setShowPopup(true);
          setPopupMessage(
            <div>
              <p className="popup-title">Invalid Date</p>
              <p className="popup-message">Please check the Date and Time of Activity</p>
            </div>
          );
          setNototifications("error");
        }
        else if(responseData.message === 'Not Vacant'){
          setShowPopup(true);
          setPopupMessage(
            <div>
              <p className="popup-title">Not Vacant</p>
              <p className="popup-message">This facility is not available at your selected date and time.</p>
            </div>
          );
          setNototifications("error");
        }
        else if(responseData.message === 'Vacant'){
          if(mphCheck || confCheck || otherCheck){
            setActivateFacility(true);
            setCheckAvailabilityBtn(false);
          }
          else if(dormCheck){
            setActivateDorm(true);
            setCheckAvailabilityBtn(false);
          }
        }
      })
      .catch((error) => {
        setLoading(false);
          console.error('Error fetching data:', error);
      })
      .finally(() => {
        setSubmitLoading(false);
      });

    }
  }

  const none = 'N/A';

  //Submit the Form
  const SubmitFacilityForm = (event) => {
    event.preventDefault();

    setSubmitLoading(true);

    const logs = `${currentUser.fname} ${currentUser.mname}. ${currentUser.lname} has submit a request on Facility/Venue`;
    const adminMessage = "The request has been received by the GSO";

    const requestData = {
      date_requested: today,
      request_office: reqOffice,
      title_of_activity: titleReq,
      date_start: DateStart,
      time_start: timeStart,
      date_end: DateEnd,
      time_end: timeEnd,
      mph: mphCheck,
      conference: confCheck,
      dorm: dormCheck,
      other: otherCheck,
      table: checkTable,
      no_table: NoOfTable,
      chair: checkChairs,
      no_chair: NoOfChairs,
      microphone: checkMicrphone,
      no_microphone: NoOfMicrophone,
      others: checkOther,
      specify: OtherField,
      projector: checkProjector,
      projector_screen: checkProjectorScreen,
      document_camera: checkDocumentCamera,
      laptop: checkLaptop,
      television: checkTelevision,
      sound_system: checkSoundSystem,
      videoke: checkVideoke,
      name_male: getMaleList ? getMaleList : "N/A",
      name_female: getFemaleList ? getFemaleList : "N/A",
      other_details: DormOtherField ? DormOtherField : "N/A",
      obr_instruct: oprInstrucValue,
      admin_approval: output,
      date_approve: date_request,
      remarks: currentUser.code_clearance == 1 ? adminMessage : "Waiting for the admin manager's approval",
      logs: logs
    };

    axiosClient
    .post("facilityformrequest", requestData)
    .then((response) => {
      setShowPopup(true);
      setPopupMessage(
        <div>
          <p className="popup-title">Success</p>
          <p>Form submit successfully</p>
        </div>
      );
      setNototifications("success");
      setSubmitLoading(false);
      setCheckValidation(null);
    })
    .catch((error) => {
      console.error(error);
      const responseErrors = error.response.data.errors;
      setInputFacErrors(responseErrors);
      setSubmitLoading(false);
      setShowPopup(false);
    })
    .finally(() => {
      setSubmitLoading(false);
    });
    
  }

  const closeError = () => {
    setShowPopup(false);
  };

  const closePopup = () => {
    setShowPopup(false);
    window.location.href = `/myrequest/${currentUser.id}`;
  };
  

  return (
  <PageComponent title="Request for use of Facility / Venue Form">

    {currentUser.image !== "null" ? (
    <>
      <form id="fac-submit" onSubmit={SubmitFacilityForm}>

      {/* Title */}
      <div>
        <h2 className="text-base font-bold leading-7 text-gray-900"> Fill up the Form </h2>
        <p className="text-xs font-bold text-red-500">Please double check the form before submitting</p>
      </div>

      {/* Main form */}
      <div className="grid grid-cols-2 gap-4">

        {/* Form */}
        <div className="col-span-1">

          {/* Date */}
          <div className="flex items-center mt-6 font-roboto">
            <div className="w-60">
              <label htmlFor="rep_date" className="block text-base leading-6 text-black">
                Date:
              </label> 
            </div>
            <div className="w-1/2">
              <input
                type="date"
                name="rep_date"
                id="rep_date"
                defaultValue= {today}
                className="block w-full ppa-form"
                readOnly
              />
            </div>
          </div>

          {/* Requesting Office/Division */}
          <div className="flex items-center mt-4 font-roboto">
            <div className="w-60">
              <label htmlFor="rf_request" className="block text-base leading-6 text-black">
                Requesting Office/Division:
              </label>
            </div>
            <div className="w-1/2">
              <input
                type="text"
                name="rf_request"
                id="rf_request"
                autoComplete="rf_request"
                value={reqOffice}
                onChange={ev => setRegOffice(ev.target.value)}
                className="block w-full ppa-form"
                readOnly={activateFacility}
              />
              {(!reqOffice && fieldMissing) && (
                <p className="font-roboto form-validation">You must input the Office/Division here</p>
              )}
            </div>
          </div>

          {/* Title/Purpose of Activity */}
          <div className="flex items-center mt-4 font-roboto">
            <div className="w-60">
              <label htmlFor="rep_date" className="block text-base leading-6 text-black">
              Title/Purpose of Activity:
              </label> 
            </div>
            <div className="w-1/2">
              <input
                type="text"
                name="purpose"
                id="purpose"
                autoComplete="purpose"
                value={titleReq}
                onChange={ev => setTitleReq(ev.target.value)}
                className="block w-full ppa-form"
                readOnly={activateFacility}
              />
              {(!titleReq && fieldMissing) && (
                <p className="font-roboto form-validation">You must input the Title/Purpose of Activity</p>
              )}
            </div>
          </div>

          {/* Date Start */}
          <div className="flex items-center mt-4 font-roboto">
            <div className="w-60">
              <label htmlFor="rep_date" className="block text-base leading-6 text-black">
                Date of Activity (Start):
              </label> 
            </div>
            <div className="w-1/2">
              <input
                type="date"
                name="date_start"
                id="date_start"
                value={DateStart}
                onChange={ev => {
                  setDateStart(ev.target.value);
                  setDateEndMin(ev.target.value);
                }}
                min={today}
                className="block w-full ppa-form"
                readOnly={activateFacility}
              />
              {(!DateStart && fieldMissing) && (
                <p className="font-roboto form-validation">You must input the Start Date of Activity</p>
              )}
            </div>
          </div>

          {/* Time Start */}
          <div className="flex items-center mt-4 font-roboto">
            <div className="w-60">
              <label htmlFor="rep_date" className="block text-base leading-6 text-black">
                Time of Activity (Start):
              </label> 
            </div>
            <div className="w-1/2">
              <input
                type="time"
                name="time_start"
                id="time_start"
                value={timeStart}
                onChange={ev => setTimeStart(ev.target.value)}
                className="block w-full ppa-form"
                readOnly={activateFacility}
              />
              {(!timeStart && fieldMissing) && (
                <p className="font-roboto form-validation">You must input the Start Time of Activity</p>
              )}
            </div>
          </div>

          {/* Date End */}
          <div className="flex items-center mt-4 font-roboto">
            <div className="w-60">
              <label htmlFor="rep_date" className="block text-base leading-6 text-black">
                Date of Activity (End):
              </label> 
            </div>
            <div className="w-1/2">
              <input
                type="date"
                name="date_end"
                id="date_end"
                value={DateEnd}
                onChange={ev => {
                  setDateEnd(ev.target.value);
                  if (ev.target.value < DateStart) {
                    // If DateEnd is before DateStart, set DateEnd to DateStart
                    setDateEnd(DateStart);
                  }
                }}
                min={DateEndMin}
                className="block w-full ppa-form"
                readOnly={activateFacility}
              />
              {(!DateEnd && fieldMissing) && (
                <p className="font-roboto form-validation">You must input the End Date of Activity</p>
              )}
            </div>
          </div>

          {/* Time End */}
          <div className="flex items-center mt-4 font-roboto">
            <div className="w-60">
              <label htmlFor="rep_date" className="block text-base leading-6 text-black">
                Time of Activity (End):
              </label> 
            </div>
            <div className="w-1/2">
              <input
                type="time"
                name="time_end"
                id="time_end"
                value={timeEnd}
                onChange={ev => setTimeEnd(ev.target.value)}
                className="block w-full ppa-form"
                readOnly={activateFacility}
              />
              {(!timeEnd && fieldMissing) && (
                <p className="font-roboto form-validation">You must input the End Time of Activity</p>
              )}
            </div>
          </div>

        </div>
        
        {/* Checkbox */}
        <div className="col-span-1">

          <div className="mt-6 font-roboto">
            <label htmlFor="rf_request" className="block text-base leading-6 text-black">
              Facilities / Venue being Requested :
            </label> 
          </div>

          <div class="space-y-4 mt-6">

            {/* For MPH */}
            <div class="relative flex items-center font-roboto">
              <div class="flex items-center h-5">
                <input
                  id="mph-checkbox"
                  type="checkbox"
                  checked={mphCheck}
                  onChange={(ev) => {
                    const isChecked = ev.target.checked ? 1 : 0;
                    handleCheckboxChange(setMphCheck, ev.target.checked, setConfCheck, setOtherCheck, setDormCheck);
                    if (!ev.target.checked) {
                      setCheckTable(false);
                      setNoOfTable(null);
                      setCheckChairs(false);
                      setNoOfChairs(null);
                      setCheckOther(false);
                      setOtherField(null);
                      setCheckMicrphone(false);
                      setNoOfMicrophone(null);
                      setCheckVideoke(false);
                      setCheckSoundSystem(false);
                      setCheckTelevision(false);
                      setCheckLaptop(false);
                      setCheckDocumentCamera(false);
                      setCheckProjectorScreen(false);
                      setCheckProjector(false);
                    }
                    setMphCheck(isChecked);
                  }}
                  class={`focus:ring-gray-400 h-6 w-6 ${mphCheck ? 'text-gray-400' : 'text-indigo-600'} border-black-500 rounded`}
                  disabled={activateFacility}
                />
              </div>
              <div class="ml-3">
                <label htmlFor="rf_request" className="block text-base font-medium leading-6 text-gray-900">
                  Multi-Purpose Hall (MPH)
                </label> 
              </div>
            </div>

            {/* Conference Hall */}
            <div class="relative flex items-center font-roboto">
              <div class="flex items-center h-5">
                <input
                  id="conference-checkbox"
                  type="checkbox"
                  checked={confCheck}
                  onChange={(ev) => {
                    const isChecked = ev.target.checked ? 1 : 0;
                    handleCheckboxChange(setConfCheck, ev.target.checked, setOtherCheck, setDormCheck, setMphCheck);
                    if (!ev.target.checked) {
                      setCheckTable(false);
                      setNoOfTable(null);
                      setCheckChairs(false);
                      setNoOfChairs(null);
                      setCheckOther(false);
                      setOtherField(null);
                      setCheckMicrphone(false);
                      setNoOfMicrophone(null);
                      setCheckVideoke(false);
                      setCheckSoundSystem(false);
                      setCheckTelevision(false);
                      setCheckLaptop(false);
                      setCheckDocumentCamera(false);
                      setCheckProjectorScreen(false);
                      setCheckProjector(false);
                    }
                    setConfCheck(isChecked);
                  }}
                  class={`focus:ring-gray-400 h-6 w-6 ${confCheck ? 'text-gray-400' : 'text-indigo-600'} border-black-500 rounded`}
                  disabled={activateFacility}
                />
              </div>
              <div class="ml-3">
                <label htmlFor="rf_request" className="block text-base font-medium leading-6 text-gray-900">
                  Conference Hall
                </label> 
              </div>
            </div>

            {/* Dormitory */}
            <div class="relative flex items-center font-roboto">
              <div class="flex items-center h-5">
                <input
                  id="dormitory-checkbox"
                  type="checkbox"
                  checked={dormCheck}
                  onChange={(ev) => {
                    const isChecked = ev.target.checked ? 1 : 0;
                    handleCheckboxChange(setDormCheck, ev.target.checked, setOtherCheck, setMphCheck, setConfCheck);
                    setDormCheck(isChecked);
                  }}
                  class={`focus:ring-gray-400 h-6 w-6 ${dormCheck ? 'text-gray-400' : 'text-indigo-600'} border-black-500 rounded`}
                  disabled={activateFacility}
                />
              </div>
              <div class="ml-3">
                <label htmlFor="rf_request" className="block text-base font-medium leading-6 text-gray-900">
                  Dormitory
                </label> 
              </div>
            </div>

            {/* Other */}
            <div class="relative flex items-center font-roboto">
              <div class="flex items-center h-5">
                <input
                  id="other-checkbox"
                  type="checkbox"
                  checked={otherCheck}
                  onChange={(ev) => {
                    const isChecked = ev.target.checked ? 1 : 0;
                    handleCheckboxChange(setOtherCheck, ev.target.checked, setMphCheck, setConfCheck, setDormCheck);
                    if (!ev.target.checked) {
                      setCheckTable(false);
                      setNoOfTable(null);
                      setCheckChairs(false);
                      setNoOfChairs(null);
                      setCheckOther(false);
                      setOtherField(null);
                      setCheckMicrphone(false);
                      setNoOfMicrophone(null);
                      setCheckVideoke(false);
                      setCheckSoundSystem(false);
                      setCheckTelevision(false);
                      setCheckLaptop(false);
                      setCheckDocumentCamera(false);
                      setCheckProjectorScreen(false);
                      setCheckProjector(false);
                    }
                    setOtherCheck(isChecked);
                  }}
                  class={`focus:ring-gray-400 h-6 w-6 ${otherCheck ? 'text-gray-400' : 'text-indigo-600'} border-black-500 rounded`}
                  disabled={activateFacility}
                />
              </div>
              <div class="ml-3">
                <label htmlFor="rf_request" className="block text-base font-medium leading-6 text-gray-900">
                  Other
                </label> 
              </div>
            </div>

            {(!mphCheck && !confCheck && !dormCheck && !otherCheck && fieldMissing) && (
              <p className="font-roboto form-validation">You must input the End Time of Activity</p>
            )}

          </div>

        </div>

      </div>

      {/* Activate Facility */}
      {activateFacility && (
        <div className="mt-8 border-t border-black font-roboto">

          {/* Caption */}
          <div>
            <h2 className="pt-4 text-base font-bold leading-7 text-gray-900"> * For the Multi-Purpose Hall / Conference Room / Others </h2>
          </div>

          {/* Check Boxes */}
          <div className="grid grid-cols-2 gap-4">

            {/* 1st Column */}
            <div className="col-span-1">

              {/* Table */}
              <div class="relative flex items-center mt-4">
                <div class="flex items-center h-5">
                  <input
                    id="mph-checktable"
                    name="mph-checktable"
                    type="checkbox"
                    checked={checkTable}
                    onChange={() => {
                      setCheckTable(!checkTable);
                      setInputFacErrors(null);
                    }}
                    class={`focus:ring-gray-400 h-6 w-6 ${checkTable ? 'text-gray-400' : 'text-indigo-600'} border-black-500 rounded`}
                  />
                </div>
                <div class="ml-3">
                  <label htmlFor="rf_request" className="block text-base leading-6 text-black">
                    Tables
                  </label> 
                </div>
                {checkTable && (
                  <div className="flex items-center w-32 ml-2">
                    <label htmlFor="rf_request" className="block text-base font-medium leading-6 text-gray-900">
                      (No. 
                    </label> 
                    <input
                      type="number"
                      name="no-of-table"
                      id="no-of-table"
                      value={NoOfTable}
                      onChange={handleInputTableChange}
                      className="block w-full border-l-0 border-t-0 border-r-0 ml-1 py-0 text-gray-900 sm:max-w-xs sm:text-sm sm:leading-6"
                    />
                    <label htmlFor="rf_request" className="block text-base font-medium leading-6 text-gray-900 ml-1">
                      ) 
                    </label>
                  </div>
                )}
              </div>
              {!NoOfTable && inputFacErrors?.no_table && (
                <p className="form-validation">No. of table is required</p>
              )}

              {/* Chair */}
              <div class="relative flex items-center mt-3">
                <div class="flex items-center h-5">
                  <input
                    id="mph-checkchair"
                    name="mph-checkchair"
                    type="checkbox"
                    checked={checkChairs}
                    onChange={() => {
                      setCheckChairs(!checkChairs);
                      setInputFacErrors(null);
                    }}
                    class={`focus:ring-gray-400 h-6 w-6 ${checkChairs ? 'text-gray-400' : 'text-indigo-600'} border-black-500 rounded`}
                  />
                </div>
                <div class="ml-3">
                  <label htmlFor="rf_request" className="block text-base leading-6 text-black">
                    Chair
                  </label> 
                </div>
                {checkChairs && (
                  <div className="flex items-center w-32 ml-2">
                    <label htmlFor="rf_request" className="block text-base font-medium leading-6 text-gray-900">
                      (No. 
                    </label> 
                    <input
                      type="number"
                      name="no-of-chair"
                      id="no-of-chair"
                      value={NoOfChairs}
                      onChange={handleInputChairChange}
                      className="block w-full border-l-0 border-t-0 border-r-0 ml-1 py-0 text-gray-900 sm:max-w-xs sm:text-sm sm:leading-6"
                    />
                    <label htmlFor="rf_request" className="block text-base font-medium leading-6 text-gray-900 ml-1">
                      ) 
                    </label>
                  </div>
                )}
              </div>
              {!NoOfChairs && inputFacErrors?.no_chair && (
                <p className="form-validation">No. of chair is required</p>
              )}

              {/* Projector */}
              <div class="relative flex items-center mt-3">
                <div class="flex items-center h-5">
                  <input
                    id="other-checkbox"
                    type="checkbox"
                    checked={checkProjector}
                    onChange={ev => setCheckProjector(!checkProjector)}
                    class={`focus:ring-gray-400 h-6 w-6 ${checkProjector ? 'text-gray-400' : 'text-indigo-600'} border-black-500 rounded`}
                  />
                </div>
                <div class="ml-3">
                  <label htmlFor="rf_request" className="block text-base leading-6 text-black">
                  Projector
                  </label> 
                </div>
              </div>

              {/* Projector Screen */}
              <div class="relative flex items-center mt-3">
                <div class="flex items-center h-5">
                  <input
                    id="other-checkbox"
                    type="checkbox"
                    checked={checkProjectorScreen}
                    onChange={ev => setCheckProjectorScreen(!checkProjectorScreen)}
                    class={`focus:ring-gray-400 h-6 w-6 ${checkProjectorScreen ? 'text-gray-400' : 'text-indigo-600'} border-black-500 rounded`}
                  />
                </div>
                <div class="ml-3">
                  <label htmlFor="rf_request" className="block text-base leading-6 text-black">
                  Projector Screen
                  </label> 
                </div>
              </div>

              {/* Document Camera */}
              <div class="relative flex items-center mt-3">
                <div class="flex items-center h-5">
                  <input
                    id="other-checkbox"
                    type="checkbox"
                    checked={checkDocumentCamera}
                    onChange={ev => setCheckDocumentCamera(!checkDocumentCamera)}
                    class={`focus:ring-gray-400 h-6 w-6 ${checkDocumentCamera ? 'text-gray-400' : 'text-indigo-600'} border-black-500 rounded`}
                  />
                </div>
                <div class="ml-3">
                  <label htmlFor="rf_request" className="block text-base leading-6 text-black">
                  Document Camera
                  </label> 
                </div>
              </div>

            </div>

            {/* 2nd Column */}
            <div className="col-span-1">

              {/* Laptop */}
              <div class="relative flex items-center mt-4">
                <div class="flex items-center h-5">
                  <input
                    id="other-checkbox"
                    type="checkbox"
                    checked={checkLaptop}
                    onChange={ev => setCheckLaptop(!checkLaptop)}
                    class={`focus:ring-gray-400 h-6 w-6 ${checkLaptop ? 'text-gray-400' : 'text-indigo-600'} border-black-500 rounded`}
                  />
                </div>
                <div class="ml-3">
                  <label htmlFor="rf_request" className="block text-base leading-6 text-black">
                  Laptop
                  </label> 
                </div>
              </div>

              {/* Television */}
              <div class="relative flex items-center mt-3">
                <div class="flex items-center h-5">
                  <input
                    id="other-checkbox"
                    type="checkbox"
                    checked={checkTelevision}
                    onChange={ev => setCheckTelevision(!checkTelevision)}
                    class={`focus:ring-gray-400 h-6 w-6 ${checkTelevision ? 'text-gray-400' : 'text-indigo-600'} border-black-500 rounded`}
                  />
                </div>
                <div class="ml-3">
                  <label htmlFor="rf_request" className="block text-base leading-6 text-black">
                  Television
                  </label> 
                </div>
              </div>

              {/* Sound System */}
              <div class="relative flex items-center mt-3">
                <div class="flex items-center h-5">
                  <input
                    id="other-checkbox"
                    type="checkbox"
                    checked={checkSoundSystem}
                    onChange={ev => setCheckSoundSystem(!checkSoundSystem)}
                    class={`focus:ring-gray-400 h-6 w-6 ${checkSoundSystem ? 'text-gray-400' : 'text-indigo-600'} border-black-500 rounded`}
                  />
                </div>
                <div class="ml-3">
                  <label htmlFor="rf_request" className="block text-base leading-6 text-black">
                  Sound System
                  </label> 
                </div>
              </div>

              {/* Videoke */}
              <div class="relative flex items-center mt-3">
                <div class="flex items-center h-5">
                  <input
                    id="other-checkbox"
                    type="checkbox"
                    checked={checkVideoke}
                    onChange={ev => setCheckVideoke(!checkVideoke)}
                    class={`focus:ring-gray-400 h-6 w-6 ${checkVideoke ? 'text-gray-400' : 'text-indigo-600'} border-black-500 rounded`}
                  />
                </div>
                <div class="ml-3">
                  <label htmlFor="rf_request" className="block text-base leading-6 text-black">
                  Videoke
                  </label> 
                </div>
              </div>

              {/* Microphone */}
              <div class="relative flex items-center mt-3">
                <div class="flex items-center h-5">
                  <input
                    id="mph-checkmicrophone"
                    name="mph-checkmicrophone"
                    type="checkbox"
                    checked={checkMicrphone}
                    onChange={() => {
                      setCheckMicrphone(!checkMicrphone);
                      setInputFacErrors(null);
                    }}
                    class={`focus:ring-gray-400 h-6 w-6 ${checkMicrphone ? 'text-gray-400' : 'text-indigo-600'} border-black-500 rounded`}
                  />
                </div>
                <div class="ml-3">
                  <label htmlFor="rf_request" className="block text-base leading-6 text-black">
                  Microphone
                  </label> 
                </div>
                {checkMicrphone && (
                  <div className="flex items-center w-32 ml-2">
                    <label htmlFor="rf_request" className="block text-base font-medium leading-6 text-gray-900">
                      (No. 
                    </label> 
                    <input
                      type="number"
                      name="no-of-microphone"
                      id="no-of-microphone"
                      value={NoOfMicrophone}
                      onChange={handleInputMicrophoneChange}
                      className="block w-full border-l-0 border-t-0 border-r-0 ml-1 py-0 text-gray-900 sm:max-w-xs sm:text-sm sm:leading-6"
                    />
                    <label htmlFor="rf_request" className="block text-base font-medium leading-6 text-gray-900 ml-1">
                      ) 
                    </label>
                  </div>
                )}
              </div>
              {!NoOfMicrophone && inputFacErrors?.no_microphone && (
                <p className="form-validation">No. of microphone is required</p>
              )}

            </div>

          </div>

          {/* Other */}
          <div class="relative flex items-center mt-3">
            <div class="flex items-center h-5">
              <input
                id="mph-checkmicrophone"
                name="mph-checkmicrophone"
                type="checkbox"
                checked={checkOther}
                onChange={() => {
                  setCheckOther(!checkOther);
                  setInputFacErrors(null);
                }}
                class={`focus:ring-gray-400 h-6 w-6 ${checkOther ? 'text-gray-400' : 'text-indigo-600'} border-black-500 rounded`}
              />
            </div>
            <div class="ml-3">
              <label htmlFor="rf_request" className="block text-base leading-6 text-black">
              Others
              </label> 
            </div>
            {checkOther && (
              <div className="flex items-center w-full ml-2">
                <input
                  type="text"
                  name="other-specfic"
                  id="other-specfic"
                  placeholder="Please Specify"
                  value={OtherField}
                  onChange={ev => setOtherField(ev.target.value)}
                  className="block w-full border-l-0 border-t-0 border-r-0 ml-1 py-0 text-gray-900 sm:max-w-xs sm:text-sm sm:leading-6"
                />
                <label htmlFor="rf_request" className="block text-base font-medium leading-6 text-gray-900 ml-1">
                </label>
              </div>
            )}
          </div>
          {!OtherField && inputFacErrors?.specify && (
            <p className="form-validation">This form is required</p>
          )}

          {/* For OPR Instruction on Admin Manager */}
          {!dormCheck ? (
          <div>

            {currentUser.code_clearance == 1 && (
            <>
              <div>
                <h2 className="pt-4 text-base font-bold leading-7 text-gray-900 border-t border-black mt-9"> * For OPR Instruction (Admin Manager Only) </h2>
              </div>

              <div className="flex mt-6">
                <div className="w-56">
                  <label className="block text-base font-medium leading-6 text-gray-900">
                  Instruction for the OPR for Action:
                  </label> 
                </div>
                <div className="w-96 pl-1">
                  <textarea
                    id="findings"
                    name="findings"
                    rows={3}
                    style={{ resize: "none" }}
                    value= {OprInstruct}
                    onChange={ev => setOprInstruct(ev.target.value)}
                    className="w-full rounded-md ppa-form"
                  />
                  <p className="text-gray-500 text-xs mt-0 mb-2">If you have no instructions, please submit the form</p>

                </div>
              </div>
            </>
            )}

          </div>
          ):null} 

        </div> 
      )}

      {/* Activate Dormitory */}
      {activateDorm && (
        <div className="mt-8 border-t border-black font-roboto">

          <div>
            <h2 className="pt-4 text-base font-bold leading-7 text-gray-900"> * For the Dormitory </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">

            {/* Male */}
            <div className="col-span-1">

              <div className="mt-6">

                <div className="mb-4">
                  <label htmlFor="type_of_property" className="block text-base font-medium leading-6 text-gray-900"> <strong>Input name of male guests:</strong> </label>
                </div>

                <textarea
                  id="dorm-male-list"
                  name="dorm-male-list"
                  rows={5}
                  value={maleList}
                  onChange={handleMaleTextChange}
                  style={{ resize: 'none' }}
                  className="block w-10/12 ppa-form"
                />
                <p className="text-red-500 text-xs mt-1">Separate name on next line</p>

                {/* For displaying the number of guest */}
                <div>
                  <textarea
                    id="output-male-list"
                    name="output-male-list"
                    rows={5}
                    value={getMaleList}
                    style={{ resize: 'none', display: 'none' }}
                  />
                </div>

              </div>

            </div>

            {/* Female */}
            <div className="col-span-1">

              <div className="mt-6">

                <div className="mb-4">
                  <label htmlFor="type_of_property" className="block text-base font-medium leading-6 text-gray-900"> <strong>Input name of female guests:</strong> </label>
                </div>

                <textarea
                  id="dorm-female-list"
                  name="dorm-female-list"
                  rows={5}
                  value={femaleList}
                  onChange={handleFemaleTextChange}
                  style={{ resize: 'none' }}
                  className="block w-10/12 ppa-form"
                />
                <p className="text-red-500 text-xs mt-1">Separate name on next line</p>

                {/* For displaying the number of guest */}
                <div>
                  <textarea
                    id="output-female-list"
                    name="output-female-list"
                    rows={5}
                    value={getFemaleList}
                    style={{ resize: 'none', display: 'none' }}
                  />
                </div>

              </div>

            </div>

          </div>

          {/* For Other */}
          <div className="flex mt-10 ml-40">
            <div className="w-40">
              <label htmlFor="recomendations" className="block text-base font-bold leading-6 text-gray-900">
                Other Details :
              </label>
            </div>
            <div className="w-1/2">
              <textarea
                id="recomendations"
                name="recomendations"
                rows={3}
                style={{ resize: "none" }}
                value={DormOtherField}
                onChange={(ev) => setDormOtherField(ev.target.value)}
                className="block w-full ppa-form"
              />
              <p className="text-red-500 text-xs mt-2">Leave blank if none</p>
            </div>  
          </div>

          {currentUser.code_clearance == 1 && (
          <>
            <div>
              <h2 className="pt-4 text-base font-bold leading-7 text-gray-900 border-t border-black mt-9"> * For OPR Instruction (Admin Manager Only) </h2>
            </div>

            <div className="flex mt-6">
              <div className="w-56">
                <label className="block text-base font-medium leading-6 text-gray-900">
                Instruction for the OPR for Action:
                </label> 
              </div>
              <div className="w-96 pl-1">

                <textarea
                  id="findings"
                  name="findings"
                  rows={3}
                  style={{ resize: "none" }}
                  value= {OprInstruct}
                  onChange={ev => setOprInstruct(ev.target.value)}
                  className="w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-black focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                <p className="text-gray-500 text-xs mt-0 mb-2">If you have no instructions, please submit the form</p>

              </div>
            </div>
          </> 
          )}
          
        </div>
      )}

      </form>
          
      {/* Button Validation */}

      {/* Check Availbility Button */}
      {checkAvailabilityBtn ? (
      <div className="mt-10 font-roboto">
        <button type="submit" onClick={checkAvailability}
          className={`px-6 py-2 btn-submit ${ submitLoading && 'btn-submitting'}`}
          disabled={submitLoading}
        >
          {submitLoading ? (
            <div className="flex items-center justify-center">
              <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
              <span className="ml-2">Checking</span>
            </div>
          ) : (
            'Check Availability'
          )}
        </button>
      </div>
      ):null}

      {/* Activate Facility */}
      {(activateFacility && !activateDorm) && (
        <div className="mt-10 font-roboto flex">
          {checkedCount ? (
          <>
            {currentUser.code_clearance == 1 ? (
            <>
              {OprInstruct ? (
                <button form="fac-submit" type="submit"
                  className={`px-6 py-2 btn-submit mr-2 ${ submitLoading && 'btn-submitting'}`}
                  disabled={submitLoading}
                >
                  {submitLoading ? (
                    <div className="flex items-center justify-center">
                      <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
                      <span className="ml-2">Processing...</span>
                    </div>
                  ) : 'Submit'}
                </button>
              ):(
                <button onClick={() => handleClarification()}
                  className={`px-6 py-2 btn-submit mr-2 ${ submitLoading && 'btn-submitting'}`}
                  disabled={submitLoading}
                >
                  {submitLoading ? (
                    <div className="flex items-center justify-center">
                      <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
                      <span className="ml-2">Processing...</span>
                    </div>
                  ) : 'Submit'}
                </button>
              )}
            </> 
            ):(
              <button form="fac-submit" type="submit"
                className={`px-6 py-2 btn-submit mr-2 ${ submitLoading && 'btn-submitting'}`}
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <div className="flex items-center justify-center">
                    <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
                    <span className="ml-2">Processing...</span>
                  </div>
                ) : 'Submit'}
              </button>
            )}
          </>    
          ):null}
          {/* Cancel */}
          <button onClick={() => handleCancelForm()} className="px-6 py-2 btn-cancel" title="Supervisor Decline">
            Cancel
          </button>
        </div>
      )}

      {/* Activate Dorm */}
      {(!activateFacility && activateDorm) && (
        <div className="mt-10 font-roboto flex">
          {maleList || femaleList ? (
          <>
            {currentUser.code_clearance == 1 ? (
            <>
              {OprInstruct ? (
                <button form="fac-submit" type="submit"
                  className={`px-6 py-2 btn-submit mr-2 ${ submitLoading && 'btn-submitting'}`}
                  disabled={submitLoading}
                >
                  {submitLoading ? (
                    <div className="flex items-center justify-center">
                      <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
                      <span className="ml-2">Processing...</span>
                    </div>
                  ) : 'Submit'}
                </button>
              ):(
                <button onClick={() => handleClarification()}
                  className={`px-6 py-2 btn-submit mr-2 ${ submitLoading && 'btn-submitting'}`}
                  disabled={submitLoading}
                >
                  {submitLoading ? (
                    <div className="flex items-center justify-center">
                      <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
                      <span className="ml-2">Processing...</span>
                    </div>
                  ) : 'Submit'}
                </button>
              )}
            </> 
            ):(
              <button form="fac-submit" type="submit"
                className={`px-6 py-2 btn-submit mr-2 ${ submitLoading && 'btn-submitting'}`}
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <div className="flex items-center justify-center">
                    <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
                    <span className="ml-2">Processing...</span>
                  </div>
                ) : 'Submit'}
              </button>
            )}
          </>
          ):null}
          <button onClick={() => handleCancelForm()} className="px-6 py-2 btn-cancel" title="Supervisor Decline">
            Cancel
          </button>
        </div>
      )}
    </>
    ):(
      <div>
        <h2 className="text-xl font-bold leading-7 text-gray-900"> You cannot create a request because you don't have an e-signature. </h2>
        <p className="text-xs text-red-500 font-bold">Please submit your e-signature to the developer so that you can create a request </p>
      </div>
    )}

    {/* Popup */}
    {showPopup && (
    <>
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

          {/* Warning */}
          {(notifications == "warning" || notifications == "warningD" || notifications == "check") && (
          <div class="f-modal-icon f-modal-warning scaleWarning">
            <span class="f-modal-body pulseWarningIns"></span>
            <span class="f-modal-dot pulseWarningIns"></span>
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
      
        <p className="text-lg text-center font-roboto">{popupMessage}</p>

        <div className="flex justify-center mt-4 font-roboto">

        {/* Notice / Warning */}
        {notifications == "warning" && (
        <>
          {!submitLoading && (
            <button form="fac-submit" type="submit" className="w-1/2 py-2 popup-confirm">
              <FontAwesomeIcon icon={faCheck} /> Confirm
            </button>
          )}

          {!submitLoading && (
            <button onClick={closeError} className="w-1/2 py-2 popup-cancel">
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

        {/* Error / Warning*/}
        {(notifications == "warningnull" || 
        notifications == "error") && (
        <>
          <button onClick={() => (closeError())} className="w-full py-2 btn-error">
            Close
          </button>
        </>
        )}

        {/* Success */}
        {notifications == "success" && (
          <button onClick={() => (closePopup())} className="w-full py-2 btn-success">
            View my request
          </button>
        )}

        {/* Validation */}
        {notifications == "check" && (
          <button onClick={() => (closeError())} className="w-full py-2 btn-error">
            Close
          </button>
        )}

        </div>

      </div>

      </div>
    </>  
    )}

  </PageComponent>
  );
}