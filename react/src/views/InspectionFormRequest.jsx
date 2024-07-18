import React, { useEffect, useState } from "react";
import submitAnimation from '../assets/loading_nobg.gif';
import PageComponent from "../components/PageComponent";
import axiosClient from "../axios";
import { useUserStateContext } from "../context/ContextProvider";

export default function RepairRequestForm(){

  const { currentUser } = useUserStateContext();

  //Popup
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState("");
  const [popupMessage, setPopupMessage] = useState("");

  // Date
  const today = new Date().toISOString().split('T')[0];
  const currentDate = new Date().toISOString().split('T')[0];

  const [inputErrors, setInputErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Values
  const [propertyNo, setPropertyNo] = useState('');
  const [acquisitionDate, setAcquisitionDate] = useState('');
  const [acquisitionCost, setAcquisitionCost] = useState('');
  const [BrandModel, setBrandModel] = useState('');
  const [SerialEngineNo, setSerialEngineNo] = useState('');
  const [typeOfProperty, setTypeOfProperty] = useState('');
  const [propertyDescription, setPropertyDescription] = useState('');
  const [propertyLocation, setPropertyLocation] = useState('');
  const [ComplainDefect, setComplainDefect] = useState('');
  const [getSupervisor, setGetSupervisor] = useState('');

  const [supervisor, setSupervisor] = useState([]);

  // Get Supervisor ID
  useEffect(()=>{ 
    axiosClient
    .get(`/getsupervisor`)
    .then((response) => {
      const responseData = response.data;

      const supervisorData = responseData.map((dataItem) => {
        return {
          id: dataItem.id,
          name: dataItem.fullname,
        }
      })

      setSupervisor({supervisorData:supervisorData});
      //console.log(supervisorData);
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
  },[]);

  // Set a condition depends of the user
  let adminManager;
  let supervisorUser;
  let remarks;

  if(currentUser.code_clearance == 4 || currentUser.code_clearance == 1){ // For Supervisor Request
    adminManager = 4;
    supervisorUser = 1;
    remarks = "Waiting for GSO to filled up the form";
  } else {
    adminManager = 0;
    supervisorUser = 0;
    remarks = "Waiting for supervisor's approval";
  }

  // Submit the Form
  const SubmitInspectionForm = (event) => {
    event.preventDefault();

    setSubmitLoading(true);

    const logs = `${currentUser.fname} ${currentUser.mname}. ${currentUser.lname} has submit a request on Pre/Post Repair Inspection`;
    //const message = `There is a request for ${currentUser.gender === 'Male' ? 'sir' : 'maam'} ${currentUser.fname} ${currentUser.lname}, and it requires your approval`;

    const FormData = {
      date_of_request: today,
      property_number: propertyNo,
      acq_date: acquisitionDate,
      acq_cost: acquisitionCost,
      brand_model: BrandModel,
      serial_engine_no: SerialEngineNo,
      type_of_property: typeOfProperty,
      property_description: propertyDescription,
      location: propertyLocation,
      complain: ComplainDefect,
      supervisor_name: currentUser.code_clearance == 1 || currentUser.code_clearance == 4 ? currentUser.id : getSupervisor,
      supervisor_approval: supervisorUser,
      admin_approval: adminManager,
      inspector_status: 0,
      form_status: 0,
      remarks: remarks,
      // Logs
      logs: logs,
      // For Notifications
      // message: message
    }

    axiosClient
      .post("/submitrepairformrequest", FormData)
      .then(() => { 
        setShowPopup(true);
        setPopupContent('success');
        setPopupMessage(
          <div>
            <p className="popup-title">Success</p>
            <p className="popup-message">Form submit successfully</p>
          </div>
        );
        fetchNotification();    
      })
      .catch((error) => {
        if (error.response.status === 500) {
          setShowPopup(true);
          setPopupContent('error');
          setPopupMessage(
            <div>
              <p className="popup-title">There is something wrong</p>
              <p className="popup-message">Please contact the developer on the issue (Error 500)</p>
            </div>
          );
        }
        else {
          const responseErrors = error.response.data.errors;
          setInputErrors(responseErrors);
        }
      })
      .finally(() => {
        setSubmitLoading(false);
      });

  };

  //Close Popup on Error
  const justclose = () => {
    setShowPopup(false);
  }

  //Close Popup on Success
  const closePopup = () => {
    setSubmitLoading(false);
    setShowPopup(false);
    window.location.href = `/myrequest/${currentUser.id}`;
  }

  return (
  <PageComponent title="Request on Pre/Post Repair Inspection Form">
    {/* Check if the user has a signature */}
    {currentUser.image !== "null" ? (
      <div className="font-roboto">

        <form onSubmit={SubmitInspectionForm}>

          {/* Part A */}
          <div>
            <h2 className="text-base font-bold leading-7 text-gray-900"> Part A: To be filled-up by Requesting Party </h2>
            <p className="text-xs text-red-500 font-bold">Please double check the form before submitting </p>
          </div>

          {/* Form */}
          <div className="grid grid-cols-2 gap-4">

            {/* 1st Column */}
            <div className="col-span-1">

              {/* Date */}
              <div className="flex items-center mt-6 ">
                <div className="w-40">
                  <label htmlFor="rep_date" className="block text-base leading-6 text-black"> 
                    Date: 
                  </label> 
                </div>
                <div className="w-1/2">
                  <input 
                    type="date" 
                    name="rep_date" 
                    id="rep_date" 
                    defaultValue={today} 
                    onChange={ev => setInspectionDate(ev.target.value)}
                    className="block w-full ppa-form"
                    readOnly
                  />
                </div>
              </div>

              {/* Property Number */}
              <div className="flex items-center mt-4 ">
                <div className="w-40">
                  <label htmlFor="rep_property_no" className="block text-base font-medium leading-6 text-black"> Property No.: </label> 
                </div>
                <div className="w-1/2">
                  <input
                    type="text"
                    name="rep_property_no"
                    id="rep_property_no"
                    autoComplete="rep_property_no"
                    value={propertyNo}
                    onChange={ev => setPropertyNo(ev.target.value)}
                    className="block w-full ppa-form"
                  />
                  {!propertyNo && inputErrors.property_number && (
                    <p className="form-validation">You must input the Property Number</p>
                  )}
                </div>
              </div>

              {/* Acquisition Date */}
              <div className="flex items-center mt-4">
                <div className="w-40">
                  <label htmlFor="rep_acquisition_date" className="block text-base font-medium leading-6 text-black">    
                    Acquisition Date:
                  </label> 
                </div>
                <div className="w-1/2">
                  <input
                    type="date"
                    name="rep_acquisition_date"
                    id="rep_acquisition_date"
                    value={acquisitionDate}
                    onChange={ev => setAcquisitionDate(ev.target.value)}
                    max={currentDate}
                    className="block w-full ppa-form"
                  />
                  {!acquisitionDate && inputErrors.acq_date && (
                    <p className="form-validation">You must input the Acquisition Date</p>
                  )}
                </div>
              </div>

              {/* Acquisition Cost */}
              <div className="flex items-center mt-4">
                <div className="w-40">
                  <label htmlFor="rep_acquisition_cost" className="block text-base font-medium leading-6 text-black">
                    Acquisition Cost:
                  </label> 
                </div>
                <div className="w-1/2">
                  <div className="relative flex items-center">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-600">
                      ₱
                    </span>
                    <input
                      type="text"
                      name="rep_acquisition_cost"
                      id="rep_acquisition_cost"
                      autoComplete="rep_acquisition_cost"
                      value={acquisitionCost}
                      onChange={ev => {
                        const inputVal = ev.target.value;
                        // Allow only numeric input
                        if (/^\d*(\.\d{0,2})?$/.test(inputVal.replace(/,/g, ''))) {
                          setAcquisitionCost(inputVal.replace(/,/g, ''));
                        }
                      }}
                      className="block w-full ppa-form cost"
                    />
                  </div>
                  {!acquisitionCost && inputErrors.acq_cost && (
                    <p className="form-validation">You must input the Acquisition Cost</p>
                  )}
                </div>
              </div>

              {/* Brand/Model */}
              <div className="flex items-center mt-4">
                <div className="w-40">
                  <label htmlFor="rep_brand_model" className="block text-base font-medium leading-6 text-black">
                    Brand/Model:
                  </label> 
                </div>
                <div className="w-1/2">
                  <input
                    type="text"
                    name="brand_mrep_brand_modelodel"
                    id="rep_brand_model"
                    autoComplete="rep_brand_model"
                    value={BrandModel}
                    onChange={ev => setBrandModel(ev.target.value)}
                    className="block w-full ppa-form"
                  />
                  {!BrandModel && inputErrors.brand_model && (
                    <p className="form-validation">You must input the Brand/Model</p>
                  )}
                </div>
              </div>

              {/* Serial/Engine No */}
              <div className="flex items-center mt-4">
                <div className="w-40">
                  <label htmlFor="rep_serial_engine_no" className="block text-base font-medium leading-6 text-black">                  
                    Serial/Engine No.:
                  </label> 
                </div>
                <div className="w-1/2">
                  <input
                    type="text"
                    name="rep_serial_engine_no"
                    id="rep_serial_engine_no"
                    autoComplete="rep_serial_engine_no"
                    value={SerialEngineNo}
                    onChange={ev => setSerialEngineNo(ev.target.value)}
                    className="block w-full ppa-form"
                  />
                  {!SerialEngineNo && inputErrors.serial_engine_no && (
                    <p className="form-validation">You must input the Serial/Engine No.</p>
                  )}
                </div>
              </div>

            </div>

            {/* 2nd Column */}
            <div className="col-span-1">

              {/* Type of Property */}
              <div className="flex items-center mt-6">
                <div className="w-60">
                  <label htmlFor="rep_type_of_property" className="block text-base font-medium leading-6 text-black">
                    Type of Property:
                  </label> 
                </div>
                <div className="w-1/2">
                  <select 
                  name="rep_type_of_property" 
                  id="rep_type_of_property" 
                  autoComplete="rep_type_of_property"
                  value={typeOfProperty}
                  onChange={ev => {
                    setTypeOfProperty(ev.target.value);
                  }}
                  className="block w-full ppa-form"
                  >
                    <option value="" disabled>Select an option</option>
                    <option value="Vehicle Supplies & Materials">Vehicle Supplies & Materials</option>
                    <option value="IT Equipment & Related Materials">IT Equipment & Related Materials</option>
                    <option value="Others">Others</option>
                  </select>
                  {!typeOfProperty && inputErrors.type_of_property && (
                    <p className="form-validation">You must input the Type of Property</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="flex items-center mt-4">
                <div className="w-60">
                  <label htmlFor="rep_description" className="block text-base font-medium leading-6 text-black">
                    Description:
                  </label> 
                </div>
                <div className="w-1/2">
                  <input
                    type="text"
                    name="rep_description"
                    id="rep_description"
                    value={propertyDescription}
                    onChange={ev => setPropertyDescription(ev.target.value)}
                    className="block w-full ppa-form"
                  />
                  {!propertyDescription && inputErrors.property_description && (
                    <p className="form-validation">You must input the Description</p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center mt-4">
                <div className="w-60">
                  <label htmlFor="rep_location" className="block text-base font-medium leading-6 text-black">
                    Location (Div/Section/Unit):
                  </label> 
                </div>
                <div className="w-1/2">
                  <input
                    type="text"
                    name="rep_location"
                    id="rep_location"
                    value={propertyLocation}
                    onChange={ev => setPropertyLocation(ev.target.value)}
                    className="block w-full ppa-form"
                  />
                  {!propertyLocation && inputErrors.location && (
                    <p className="form-validation">You must input the Location</p>
                  )}
                </div>
              </div>

              {/* Complain / Defect */}
              <div className="flex items-center mt-4">
                <div className="w-60">
                  <label htmlFor="rep_complain" className="block text-base font-medium leading-6 text-black">
                    Complain/Defect:
                  </label> 
                </div>
                <div className="w-1/2">
                <textarea
                  id="rep_complain"
                  name="rep_complain"
                  rows={2}
                  value={ComplainDefect}
                  style={{ resize: 'none' }}
                  onChange={ev => setComplainDefect(ev.target.value)}
                  className="block w-full ppa-form"
                />
                {!ComplainDefect && inputErrors.complain && (
                  <p className="form-validation">You must input the Complain/Defect</p>
                )}
                </div>
              </div>

              {/* Supervisor */}
              {(currentUser.code_clearance == 4 || currentUser.code_clearance == 1) ? null:(
                <div className="flex items-center mt-4">
                  <div className="w-60">
                    <label htmlFor="rep_type_of_property" className="block text-base font-medium leading-6 text-black">
                      Immediate Supervisor:
                    </label> 
                  </div>
                  <div className="w-1/2">
                    <select 
                    name="rep_type_of_property" 
                    id="rep_type_of_property" 
                    autoComplete="rep_type_of_property"
                    value={getSupervisor}
                    onChange={ev => { setGetSupervisor(ev.target.value)}}
                    className="block w-full ppa-form"
                    >
                      <option value="" disabled>Select your supervisor</option>
                      {supervisor?.supervisorData?.map((Data) => (
                        <option key={Data.id} value={Data.id}>
                          {Data.name}
                        </option>
                      ))}
                    </select>
                    {!getSupervisor && inputErrors.supervisor_name && (
                      <p className="form-validation">You must input your supervisor</p>
                    )}
                  </div>
                </div>
              )}  

            </div>

          </div>

          {/* Submit Button */}
          <div className="mt-10">
            <button type="submit" className={`px-6 py-2 btn-submit ${ submitLoading && 'btn-submitting'}`} disabled={submitLoading}>
              {submitLoading ? (
                <div className="flex items-center justify-center">
                  <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
                  <span className="ml-2">Processing</span>
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
        <div className="fixed inset-0 bg-black opacity-40 backdrop-blur"></div>
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
            {/* Success */}
            {popupContent == 'success' && (
              <button onClick={closePopup} className="w-full py-2 btn-success">
                View My Request
              </button>
            )}
          </div>
        </div>
      </div>
    )}
    {/* End Show Popup */}
  </PageComponent>
  );

}
