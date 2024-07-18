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

export default function PrePostRepairForm(){

  //Get the ID
  const {id} = useParams();

  const { currentUser, userRole } = useUserStateContext();
  const today = new Date().toISOString().split('T')[0];
  const currentDate = new Date().toISOString().split('T')[0];

  //Date Format 
  function formatDate(dateString) {
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  //Functions
  const [isLoading, setIsLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [InspectionData, setInspectionData] = useState([]);
  const [inputErrors, setInputErrors] = useState({});
  const [fieldMissing, setFieldMissing] = useState(false);
  
  // Part B
  const [enablePartC, setEnablePartC] = useState(false);
  const [enablePartD, setEnablePartD] = useState(false);

  //Popup
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupContent, setPopupContent] = useState('');

  // Variable Functions
  const [giveSupReason, setGiveSupReason] = useState(false);
  const [giveAdminReason, setGiveAdminReason] = useState(false);

  // Get Values
  // For Supervisor Disapprove 
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');

  // For Admin Disapprove
  const [adminReason, setAdminReason] = useState('');

  // Part B, C, and D
  const [lastfilledDate, setLastFilledDate] = useState('');
  const [natureRepair, setNatureRepair] = useState('');
  const [pointPersonnel, setPointPersonnel] = useState('');
  const [finding, setFinding] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [remarks, setRemarks] = useState('');

  // Edit Part A
  const [editPartA, setEditPartA] = useState(false); // for Activate Part A Edit Button
  const [propertyNo, setPropertyNo] = useState('');
  const [acquisitionDate, setAcquisitionDate] = useState('');
  const [acquisitionCost, setAcquisitionCost] = useState('');
  const [BrandModel, setBrandModel] = useState('');
  const [SerialEngineNo, setSerialEngineNo] = useState('');

  // Edit Part B
  const [enablePartB, setEnablePartB] = useState(false); // Enable Part B Input Details
  const [editPartB, setEditPartB] = useState(false); // Enable Edit Part B
  const [updateLastfilledDate, setUpdateLastfilledDate] = useState('');
  const [updateNatureRepair, setUpdateNatureRepair] = useState('');
  const [updatePointPersonnel, setUpdatePointPersonnel] = useState('');

  // Edit Part C
  const [updateFinding, setUpdateFinding] = useState('');
  const [updateRecommendation, setUpdateRecommendation] = useState('');

  // Edit Part D
  const [updateRemark, setUpdateRemark] = useState('');

  // Get All the Data
  const fetchData = async () => {
    try {
      const response = await axiosClient.get(`/inspectionform/${id}`);
      const responseData = response.data;

      const getAssignPersonnel = responseData.assign_personnel;
      const getPartA = responseData.partA;
      const getPartB = responseData.partB;
      const getPartCD = responseData.partCD;
      const personnel = responseData.personnel;
      const requestor = responseData.requestor;
      const supervisor = responseData.supervisor;
      const gso = responseData.gso;
      const manager = responseData.manager;

      const getPersonnelData = getAssignPersonnel.map((Personnel) => {
        const { ap_id, ap_name, ap_type } = Personnel;
        return {
          id: ap_id,
          name: ap_name,
          type: ap_type,
        };
      });
      
      //console.log(requestor)
      setInspectionData({
        getPersonnelData,
        getPartA,
        getPartB,
        getPartCD,
        personnel,
        requestor,
        supervisor,
        gso,
        manager,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {  
    fetchData();
  }, [currentUser, id]);

  // Buttons Functions
  // Enable Edit Part A
  const handleEditADetails = () => { setEditPartA(true); }
  // Filled up Part B
  const handleFillupBDetails = () => { setEnablePartB(true); }
  // Enable Edit Part B
  const handleEditBDetails = () => { setEditPartB(true); }
  // Enable Edit Part C
  const handleEditCDetails = () => { setEnablePartC(true); }
  // Part D
  const handleEditDDetails = () => { setEnablePartD(true); }

  // Disable Edit
  const handleDisableEdit = () => {
    setFieldMissing(false);
    // Part A
    setEditPartA(false);
    setPropertyNo('');
    setAcquisitionDate('');
    setAcquisitionCost('');
    setBrandModel('');
    setSerialEngineNo('');
    // Part B
    setEnablePartB(false);
    setLastFilledDate('');
    setPointPersonnel('');
    setNatureRepair('');
    setEditPartB(false);
    setUpdateLastfilledDate('');
    setUpdateNatureRepair('');
    setUpdatePointPersonnel('');
    // Part C
    setEnablePartC(false);
    setUpdateFinding('');
    setUpdateRecommendation('');
    // Part D
    setEnablePartD(false);
    setUpdateRemark('');
  }

  // Update Part A
  const SubmitPartADetails  = (event) => {
    event.preventDefault();

    const filledVariablesCount = [propertyNo, acquisitionDate, acquisitionCost, BrandModel, SerialEngineNo].filter(Boolean).length;
    const logs = `${currentUser.fname} ${currentUser.mname}. ${currentUser.lname} has updated ${InspectionData?.requestor?.r_name}'s request for Repair Inspection Part A (Control No: ${InspectionData?.getPartA?.id})`

    if(filledVariablesCount == 0){
      setPopupContent('error');
      setShowPopup(true);
      setPopupMessage(
        <div>
          <p className="popup-title">Invalid</p>
          <p>Please fill exactly one field</p>
        </div>
      );
    }else{
      setSubmitLoading(true);

      axiosClient
      .put(`updateparta/${id}`,{
        property_number: propertyNo ? propertyNo:InspectionData?.getPartA?.property_number,
        acq_date: acquisitionDate ? acquisitionDate:InspectionData?.getPartA?.acq_date,
        acq_cost: acquisitionCost ? acquisitionCost:InspectionData?.getPartA?.acq_cost,
        brand_model: BrandModel ? BrandModel:InspectionData?.getPartA?.brand_model,
        serial_engine_no: SerialEngineNo ? SerialEngineNo:InspectionData?.getPartA?.serial_engine_no,
        logs: logs
      })
      .then(() => {
        setPopupContent('success');
        setPopupMessage(
          <div>
            <p className="popup-title">Success</p>
            <p className="popup-message">Form update successfully</p>
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

  }

  // Update Part B
  const SubmitPartBDetails = (event) => {
    event.preventDefault();

    const logs = `${currentUser.fname} ${currentUser.mname}. ${currentUser.lname} has updated ${InspectionData?.requestor?.r_name}'s request for Repair Inspection Part B (Control No: ${InspectionData?.getPartA?.id})`

    const filledVariablesCountB = [updateLastfilledDate, updateNatureRepair, updatePointPersonnel].filter(Boolean).length;

    if(filledVariablesCountB < 1){
      setPopupContent('error');
      setShowPopup(true);
      setPopupMessage(
        <div>
          <p className="popup-title">Invalid</p>
          <p>Please fill exactly one field</p>
        </div>
      );
    }else{
      setSubmitLoading(true);

      axiosClient
      .put(`updatepartb/${id}`,{
        date_of_last_repair: updateLastfilledDate ? updateLastfilledDate:InspectionData?.getPartB?.date_of_last_repair,
        nature_of_last_repair: updateNatureRepair ? updateNatureRepair:InspectionData?.getPartB?.nature_of_last_repair,
        assign_personnel: updatePointPersonnel ? updatePointPersonnel:InspectionData?.personnel?.p_id,
        logs: logs
      })
      .then(() => {
        setPopupContent('success');
        setPopupMessage(
          <div>
            <p className="popup-title">Success</p>
            <p className="popup-message">Form update successfully</p>
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
    
  }

  // Update Part C
  const handleUpdatePartC = (event) => {
    event.preventDefault();

    const logs = `${currentUser.fname} ${currentUser.mname}. ${currentUser.lname} has updated ${InspectionData?.requestor?.r_name}'s request for Repair Inspection Part C (Control No: ${InspectionData?.getPartA?.id})`;
    const filledVariablesCountC = [updateFinding, updateRecommendation].filter(Boolean).length;
    
    const formData = {
      findings: updateFinding ? updateFinding:InspectionData?.getPartCD?.findings,
      recommendations: updateRecommendation ? updateRecommendation:InspectionData?.getPartCD?.recommendations,
      logs: logs
    };

    if(filledVariablesCountC !== 1){
      setPopupContent('error');
      setShowPopup(true);
      setPopupMessage(
        <div>
          <p className="popup-title">Invalid</p>
          <p className="popup-message">Please fill exactly one field</p>
        </div>
      );
    }
    else{
      setSubmitLoading(true);

      axiosClient
      .put(`updatepartc/${id}`, formData)
      .then(() => {
        setPopupContent('success');
        setPopupMessage(
          <div>
            <p className="popup-title">Success</p>
            <p className="popup-message">Form update successfully</p>
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

  }

  // Update Part D
  const handleUpdatePartD = (event) => {
    event.preventDefault();

    const logs = `${currentUser.fname} ${currentUser.mname}. ${currentUser.lname} has updated ${InspectionData?.requestor?.r_name}'s request for Repair Inspection Part D (Control No: ${InspectionData?.getPartA?.id})`;

    const formData = {
      remarks: updateRemark,
      logs: logs
    };
    
    if(updateRemark == ''){
      setFieldMissing(true);
    } else {
      setSubmitLoading(true);
      axiosClient
      .put(`updatepartd/${id}`, formData)
      .then(() => {
        setPopupContent('success');
        setPopupMessage(
          <div>
            <p className="popup-title">Success</p>
            <p className="popup-message">Form update successfully</p>
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

  }

  // Approval Request for Supervisor
  function handleApprovalRequestSup(){
    setPopupContent('warning');
    setShowPopup(true);
    setPopupMessage(
      <div>
        <p className="popup-title">Approval Request</p>
        <p className="popup-message">Do you want to approve <strong>{InspectionData?.requestor?.r_name}'s</strong> request?</p>
      </div>
    );
  }

  // Approval Request for Admin Manager
  function handleApprovalRequestAdmin(){
    setPopupContent('warning');
    setShowPopup(true);
    setPopupMessage(
      <div>
        <p className="popup-title">Approval Request</p>
        <p className="popup-message">Do you want to approve <strong>{InspectionData?.requestor?.r_name}'s</strong> request?</p>
      </div>
    );
  }

  // Approval Request for Admin
  function handleApprovalAdminRequest(){
    setSubmitLoading(true);

      const logs = `${currentUser.fname} ${currentUser.mname}. ${currentUser.lname} has approved ${InspectionData?.requestor?.r_name}'s request on Pre/Post Repair Inspection (Control No: ${InspectionData?.getPartA?.id})`

      axiosClient.put(`/admin_approve/${id}`,{
        logs:logs
      })
      .then(() => {
        setSubmitLoading(false);
        setPopupContent("success");
        setPopupMessage(
          <div>
            <p className="popup-title">Success</p>
            <p className="popup-message">Thank you for approving the request</p>
          </div>
        );
        setShowPopup(true);
      })
      .catch(() => {
        setPopupContent("error");
        setPopupMessage(DevErrorText);
        setShowPopup(true);   
        setSubmitLoading(false);
      });
  }

  // Disapprove Reason Request showing
  function handleDisapproveReason(){ setGiveSupReason(true); } // For Supervisor
  function handleAdminReason(){ setGiveAdminReason(true); }

  // Cancel Reason Request
  function handleCancelReason() { 
    setGiveSupReason(false); 
    setGiveAdminReason(false);
    setReason('');
    setOtherReason('');
  }

  // Close Popup
  const closePopup = () => {
    setIsLoading(true)
    setShowPopup(false);
    setSubmitLoading(false);
    fetchData();
    handleDisableEdit();
    handleCancelReason();
  };

  // Just CLose the Popup
  const justclose = () => {
    setShowPopup(false);
  };

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

  // Popup Dev Message
  const DevErrorText = (
    <div>
      <p className="popup-title">Something Wrong!</p>
      <p className="popup-message">There was a problem submitting the form. Please contact the developer.</p>
    </div>
  );

  // Supervisor Approval
  function handleSupervisorApproval(id){
    setSubmitLoading(true);

    const logs = `${currentUser.fname} ${currentUser.mname}. ${currentUser.lname} has approved ${InspectionData?.requestor?.r_name}'s request for Pre/Post Repair Inspection (Control No: ${InspectionData?.getPartA?.id})`

    axiosClient
    .put(`/approve/${id}`,{
        logs:logs
    })
    .then(() => {
      setSubmitLoading(false);
      setPopupContent("success");
      setPopupMessage(
        <div>
          <p className="popup-title">Success</p>
          <p className="popup-message">Thank you for approving the request</p>
        </div>
      );
      setShowPopup(true);
    })
    .catch(() => {
      setPopupContent("error");
      setPopupMessage(DevErrorText);
      setShowPopup(true);   
      setSubmitLoading(false);
    });
  }

  // -- Submit Area -- //
  // Submit Disapproval Reason 
  function submitReason(id){
    setSubmitLoading(true);

    const logs = `${currentUser.fname} ${currentUser.mname}. ${currentUser.lname} has disapproved ${InspectionData?.requestor?.r_name}'s request on Pre/Post Repair Inspection (Control No: ${InspectionData?.getPartA?.id})`
  
    axiosClient
    .put(`/disapprove/${id}`,{
      reason: reason,
      other_reason: otherReason,
      logs:logs
    })
    .then(() => {
      setPopupContent("success");
      setPopupMessage(
        <div>
          <p className="popup-title">Success!</p>
          <p className="popup-message">You disapprove the request</p>
        </div>
      );
      setShowPopup(true);
      setSubmitLoading(false);
    })
    .catch(() => {
      setPopupContent("error");
      setPopupMessage(DevErrorText);
      setShowPopup(true);   
      setSubmitLoading(false);
    });
  }

  // Submit Admin Disapproval Reason
  function submitAdminReason(id){
    setSubmitLoading(true);

      const logs = `${currentUser.fname} ${currentUser.mname}. ${currentUser.lname} has disapproved ${InspectionData?.requestor?.r_name}'s request on Pre/Post Repair Inspection (Control No: ${InspectionData?.getPartA?.id})`

      axiosClient.put(`/admin_disapprove/${id}`,{
        adminReason: adminReason,
        logs: logs
      })
      .then(() => {
        setPopupContent("success");
        setPopupMessage(
          <div>
            <p className="popup-title">Success</p>
            <p className="popup-message">You disapprove the request</p>
          </div>
        );
        setShowPopup(true);
        setSubmitLoading(false);
      })
      .catch(() => {
        setPopupContent("error");
        setPopupMessage(DevErrorText);
        setShowPopup(true);   
        setSubmitLoading(false);
      });
  }

  // Submit Part B
  const SubmitInspectionFormTo = (event, id) => {
    event.preventDefault();
    setSubmitLoading(true);

    const logs = `${currentUser.fname} ${currentUser.mname}. ${currentUser.lname} has processed Part B of ${InspectionData?.requestor?.r_name}'s request for Pre/Post Repair Inspection (Control No: ${InspectionData?.getPartA?.id})`

    axiosClient.post(`/inspectionformrequesttwo/${id}`,{
      date_of_filling: today,
      date_of_last_repair: lastfilledDate,
      nature_of_last_repair: natureRepair,
      assign_personnel: pointPersonnel,
      logs: logs,
    })
    .then((response) => {
      setPopupContent('success');
      setPopupMessage(
        <div>
          <p className="popup-title">Success</p>
          <p className="popup-message">Part B Form submit successfully</p>
        </div>
      ); 
      setShowPopup(true);   
      setSubmitLoading(false);
    })
    .catch((error) => {
      //console.error(error);
      const responseErrors = error.response.data.errors;
      setInputErrors(responseErrors);
    })
    .finally(() => {
      setSubmitLoading(false);
    });
  }

  // Submit Part C
  const SubmitPartC = (event) => {
    event.preventDefault();

    setSubmitLoading(true);

    const logs = `${currentUser.fname} ${currentUser.mname}. ${currentUser.lname} has completed Part C of ${InspectionData?.requestor?.r_name}'s request for Pre/Post Repair Inspection (Control No: ${InspectionData?.getPartA?.id})`

    axiosClient
    .put(`inspector/${id}`, {
      before_repair_date: today,
      findings: finding,
      recommendations: recommendation,
      logs: logs
    })
    .then(() => { 
      setPopupContent('success');
      setPopupMessage(
        <div>
          <p className="popup-title">Success</p>
          <p className="popup-message">Part C Form submit successfully</p>
        </div>
      ); 
      setShowPopup(true);   
      setSubmitLoading(false);
    })
    .catch((error) => {
      const responseErrors = error.response.data.errors;
      setInputErrors(responseErrors);
    })
    .finally(() => {
      setSubmitLoading(false);
    });

  };

  //Submit Part D
  const SubmitPartD = (event) => {
    event.preventDefault();

    setSubmitLoading(true);

    const logs = `${currentUser.fname} ${currentUser.mname}. ${currentUser.lname} has completed Part D of ${InspectionData?.requestor?.r_name}'s request for Pre/Post Repair Inspection (Control No: ${InspectionData?.getPartA?.id})`

    axiosClient
    .put(`inspectorpartb/${id}`, {
      after_reapir_date: today,
      remarks: remarks,
      logs: logs
    })
    .then((response) => { 
      setPopupContent('success');
      setPopupMessage(
        <div>
          <p className="popup-title">Success</p>
          <p className="popup-message">Part D Form submit successfully</p>
        </div>
      ); 
      setShowPopup(true);   
      setSubmitLoading(false);
    })
    .catch((error) => {
      const responseErrors = error.response.data.errors;
      setInputErrors(responseErrors);
    })
    .finally(() => {
      setSubmitLoading(false);
    });

  };

  //Close the request
  function handleCloseRequest(id){

    setSubmitLoading(true);

    const logs = `${currentUser.fname} ${currentUser.mname}. ${currentUser.lname} has closed the request on Pre/Post Repair Inspection (Control No: ${InspectionData?.getPartA?.id})`
    
    axiosClient.put(`/insprequestclose/${id}`,{
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
      setPopupContent("error");
      setPopupMessage(DevErrorText);
      setShowPopup(true);   
      setSubmitLoading(false);
    });

  }

   //Generate PDF
   const [isVisible, setIsVisible] = useState(false);
   const [seconds, setSeconds] = useState(3);
 
   const componentRef= useRef();
   
   const generatePDF = useReactToPrint({
     content: ()=>componentRef.current,
     documentTitle: `Inspection-Control-No:${id}`
   });
 
   const handleButtonClick = () => {
     setIsVisible(true); 
     setSeconds(3);
     setSubmitLoading(true);
     setTimeout(() => {
       generatePDF();
       setSubmitLoading(false);
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

  // Restrictions
  //(userRole == 'h4ck3rZ@1Oppa' || userRole == '4DmIn@Pp4' || userRole == 'Pm@PP4' || userRole == 'P3rs0nn3lz@pPa')
  const UserHere = InspectionData?.getPartA?.user_id == currentUser?.id;
  const Authorize = (
    UserHere || (userRole === 'h4ck3rZ@1Oppa' || userRole === '4DmIn@Pp4' || userRole === 'Pm@PP4' || userRole === 'P3rs0nn3lz@pPa')
  );
  const Authority = userRole === 'h4ck3rZ@1Oppa' || userRole === '4DmIn@Pp4' || userRole === 'Pm@PP4' || userRole === 'P3rs0nn3lz@pPa';

  return isLoading ? (
    <div className="fixed top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-center bg-white bg-opacity-100 z-50">
      <img
        className="mx-auto h-44 w-auto"
        src={loadingAnimation}
        alt="Your Company"
      />
      <span className="ml-2 animate-heartbeat">Loading Pre-Repair/Post Repair Inspection Form</span>
    </div>
  ):(
  <>
    {Authorize ? (
    <PageComponent title="Pre-Repair/Post Repair Inspection Request Form">

      {/* Back button */}
      {Authority ? (
        <button className="px-6 py-2 btn-default">
          <Link to="/repairrequestform">Back to Request List</Link>
        </button>
      ):(
        <button className="px-6 py-2 btn-default">
          <Link to="/">Back to Dashboard</Link>
        </button>
      )}

      {/* Part A */}
      <div className="border-b border-gray-300 pb-6 font-roboto">

        {/* Control No */}
        <div className="flex items-center mt-6 mb-10">
          <div className="w-24">
            <label className="block text-base font-medium leading-6 text-gray-900">
            Control No:
            </label> 
          </div>
          <div className="w-auto px-5 text-center font-bold ppa-form-request">
          {InspectionData?.getPartA?.id}
          </div>
        </div>

        {/* Caption */}
        <div className="flex">
          <div>
            <h2 className="text-base font-bold leading-7 text-gray-900"> Part A: To be filled-up by Requesting Party </h2>
            {editPartA && (
              <p className="text-xs text-red-500">Kindly double-check the form before submitting </p>
            )}
          </div>
        </div>

        {/* Part A Fields */}
        <div className="grid grid-cols-2 gap-4">

          {/* Part A left side */}
          <div className="col-span-1">

            {/* Date */}
            <div className="flex items-center mt-6">
              <div className="w-40">
                <label className="block text-base font-medium leading-6 text-gray-900">
                Date:
                </label> 
              </div>
              <div className="w-1/2 ppa-form-request">
              {formatDate(InspectionData?.getPartA?.date_of_request)}
              </div>
            </div>

            {/* Property No */}
            <div className="flex items-center mt-2">
              <div className="w-40">
                <label className="block text-base font-medium leading-6 text-gray-900"> Property No: </label> 
              </div>
              {/* Field */}
              {editPartA ? (
                <div className="w-1/2">
                  <input
                    type="text"
                    name="rep_property_no"
                    id="rep_property_no"
                    autoComplete="rep_property_no"
                    value={propertyNo}
                    onChange={ev => setPropertyNo(ev.target.value)}
                    className="block w-full ppa-form"
                    placeholder={InspectionData?.getPartA?.property_number}
                  />
                  {(fieldMissing && !propertyNo) && ( <p className="font-roboto form-validation">Input Text Missing</p> )}
                </div>
              ):(
                <div className="w-1/2 ppa-form-request"> {InspectionData?.getPartA?.property_number} </div>
              )}
            </div>

            {/* Acquisition Date */}
            <div className="flex items-center mt-2">
              <div className="w-40">
                <label className="block text-base font-medium leading-6 text-gray-900"> Acquisition Date: </label> 
              </div>
              {/* Field */}
              {editPartA ? (
                <div className="w-1/2">
                  <input
                    type="date"
                    name="rep_acquisition_date"
                    id="rep_acquisition_date"
                    value={acquisitionDate}
                    onChange={ev => setAcquisitionDate(ev.target.value)}
                    max={currentDate}
                    className="block w-full ppa-form"
                    defaultValue={InspectionData?.getPartA?.acq_date}
                  />
                  {(fieldMissing && !acquisitionDate) && ( <p className="font-roboto form-validation">Input Text Missing</p> )}
                </div>
              ):(
                <div className="w-1/2 ppa-form-request"> {formatDate(InspectionData?.getPartA?.acq_date)} </div>
              )}
            </div>

            {/* Acquisition Cost */}
            <div className="flex items-center mt-2">
              <div className="w-40">
                <label className="block text-base font-medium leading-6 text-gray-900"> Acquisition Cost: </label> 
              </div>
              {/* Field */}
              {editPartA ? (
                <div className="w-1/2">
                  <div className="relative flex items-center">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-600">₱</span>
                    <input
                      type="text"
                      name="rep_acquisition_cost"
                      id="rep_acquisition_cost"
                      autoComplete="rep_acquisition_cost"
                      value={acquisitionCost}
                      onChange={ev => {
                        const inputVal = ev.target.value;
                        if (/^\d*(\.\d{0,2})?$/.test(inputVal.replace(/,/g, ''))) {
                          setAcquisitionCost(inputVal.replace(/,/g, ''));
                        }
                      }}
                      className="block w-full ppa-form-cost"
                      placeholder={InspectionData?.getPartA?.acq_cost}
                    />
                  </div>
                  {(fieldMissing && !acquisitionCost) && ( <p className="font-roboto form-validation">Input Text Missing</p> )}
                </div>
              ):(
                <div className="w-1/2 ppa-form-request">
                {InspectionData?.getPartA?.acq_cost && (
                  new Intl.NumberFormat('en-PH', {
                    style: 'currency',
                    currency: 'PHP'
                  }).format(InspectionData?.getPartA?.acq_cost)
                )}
                </div>
              )}
            </div>

            {/* Brand/Model */}
            <div className="flex items-center mt-2">
              <div className="w-40">
                <label className="block text-base font-medium leading-6 text-gray-900"> Brand/Model: </label> 
              </div>
              {/* Field */}
              {editPartA ? (
                <div className="w-1/2">
                  <input
                    type="text"
                    name="brand_mrep_brand_modelodel"
                    id="rep_brand_model"
                    autoComplete="rep_brand_model"
                    value={BrandModel}
                    onChange={ev => setBrandModel(ev.target.value)}
                    className="block w-full ppa-form"
                    placeholder={InspectionData?.getPartA?.brand_model}
                  />
                  {(fieldMissing && !BrandModel) && ( <p className="font-roboto form-validation">Input Text Missing</p> )}
                </div>
              ):(
                <div className="w-1/2 ppa-form-request"> {InspectionData?.getPartA?.brand_model} </div>
              )}
            </div>

            {/* Serial/Engine No */}
            <div className="flex items-center mt-2">
              <div className="w-40">
                <label className="block text-base font-medium leading-6 text-gray-900"> Serial/Engine No: </label> 
              </div>
              {/* Field */}
              {editPartA ? (
                <div className="w-1/2">
                  <input
                    type="text"
                    name="rep_serial_engine_no"
                    id="rep_serial_engine_no"
                    autoComplete="rep_serial_engine_no"
                    value={SerialEngineNo}
                    onChange={ev => setSerialEngineNo(ev.target.value)}
                    className="block w-full ppa-form"
                    placeholder={InspectionData?.getPartA?.serial_engine_no}
                  />
                  {(fieldMissing && !SerialEngineNo) && ( <p className="font-roboto form-validation">Input Text Missing</p> )}
                </div>
              ):(
                <div className="w-1/2 ppa-form-request"> {InspectionData?.getPartA?.serial_engine_no} </div>
              )}
            </div>

          </div>

          {/* Part A right side */}
          <div className="col-span-1">

            {/* Type of Property */}
            <div className="flex items-center mt-6">
              <div className="w-40">
                <label className="block text-base font-medium leading-6 text-gray-900"> Type of Property: </label> 
              </div>
              <div className="w-1/2 ppa-form-request">
                {InspectionData?.getPartA?.type_of_property}
              </div>
            </div>

            {/* Description */}
            <div className="flex items-center mt-2">
              <div className="w-40">
                <label className="block text-base font-medium leading-6 text-gray-900"> Description: </label> 
              </div>
              <div className="w-1/2 ppa-form-request">
                {InspectionData?.getPartA?.property_description}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center mt-2">
              <div className="w-40">
                <label className="block text-base font-medium leading-6 text-gray-900"> Location: </label> 
              </div>
              <div className="w-1/2 ppa-form-request">
                {InspectionData?.getPartA?.location}
              </div>
            </div>

            {/* Requested By */}
            <div className="flex items-center mt-2">
              <div className="w-40">
                <label className="block text-base font-medium leading-6 text-gray-900"> Requested By: </label> 
              </div>
              <div className="w-1/2 font-bold ppa-form-request">
                {InspectionData?.requestor?.r_name}
              </div>
            </div>

            {/* Noted By */}
            <div className="flex items-center mt-2">
              <div className="w-40">
                <label className="block text-base font-medium leading-6 text-gray-900"> Noted By: </label> 
              </div>
              <div className="w-1/2 font-bold ppa-form-request">
                {InspectionData?.supervisor?.supName}
              </div>
            </div>

          </div>

        </div>

        {/* Complain */}
        <div className="flex items-center mt-2">
          <div className="w-40">
            <label className="block text-base font-medium leading-6 text-gray-900">
            Complain:
            </label> 
          </div>
          <div className="w-3/4 ppa-form-request">
          {InspectionData?.getPartA?.complain}
          </div>
        </div>

        {/* Supervisor Reason */}
        {giveSupReason && (
        <>
          {/* Reason */}
          <div className="flex items-center mt-6">
            <div className="w-44">
              <label htmlFor="supervisor_reason" className="block text-base font-medium leading-6 text-black"> Reason for Disapproval: </label> 
            </div>
            <div className="w-72">
              <select 
                name="supervisor_reason" 
                id="supervisor_reason" 
                autoComplete="supervisor_reason"
                value={reason}
                onChange={ev => {
                  setReason(ev.target.value);
                }}
                className="block w-full ppa-form"
              >
                <option value="" disabled>Select an option</option>
                <option value="Wrong Supervisor">Wrong Supervisor</option>
                <option value="Lack of Information">Lack of Information</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div className="ml-5">
            {reason === 'Others' && (
              <div className="flex items-center">
                <div className="w-28">
                  <label htmlFor="reason" className="block text-base font-medium leading-6 text-black">Other Reason:</label> 
                </div>
                <div className="w-96">
                  <input
                    type="text"
                    name="reason"
                    id="reason"
                    value={otherReason}
                    onChange={ev => setOtherReason(ev.target.value)}
                    className="block w-full ppa-form"
                  />
                </div>
              </div>
            )}
            </div>
          </div>
        </>  
        )}

        {/* Button Area for Supervisor */}
        {(InspectionData?.getPartA?.supervisor_name == currentUser.id && InspectionData?.getPartA?.supervisor_approval == 0) && 
        (
          <div className="flex mt-6">

            {/* Enable Reason buttons */}
            {giveSupReason ? (
            <>
              {/* Approve */}
              {reason && (reason != 'Others' || otherReason) && (
                <button type="submit" onClick={() => submitReason(InspectionData?.getPartA?.id)}
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
              )}
              {/* Cancel */}
              <button onClick={() => handleCancelReason()} className="px-6 py-2 btn-cancel" title="Supervisor Decline">
                Cancel
              </button>
            </>
            ):(
            <>
              {/* Approve */}
              <button onClick={() => handleApprovalRequestSup()} className="px-6 py-2 btn-submit" title="Supervisor Approve">
                Approve
              </button>

              {/* Disapprove */}
              <button onClick={() => handleDisapproveReason()} className="px-6 py-2 btn-cancel ml-2" title="Supervisor Decline">
                Disapprove
              </button>
            </>  
            )}

          </div>
        )}

        {/* Buttons for GSO (Edit Form) */}
        {InspectionData?.getPartA?.form_status != 1 ? (
          currentUser.code_clearance == 3 && (
          <>
            {editPartA ? (
              <div className="flex mt-6">
                {/* Submit */}
                <button type="button"
                  onClick={SubmitPartADetails}
                  className={`px-6 py-2 mr-2 btn-submit ${ submitLoading && 'btn-submitting'}`}
                  disabled={submitLoading}
                >
                  {submitLoading ? (
                    <div className="flex items-center justify-center">
                      <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
                      <span className="ml-2">Submitting</span>
                    </div>
                  ) : (
                    'Submit'
                  )}
                </button>
                {/* Cancel Edit */}
                <button onClick={handleDisableEdit} className="px-6 py-2 btn-cancel">
                  Cancel
                </button>
                
              </div>
            ):(
              <div className="flex mt-6">
                <button onClick={handleEditADetails} className="px-6 py-2 btn-edit">
                  Edit Part A
                </button>
              </div>
            )}
          </>
          )
        ):null}

      </div>
      {/* End of Part A */}
      
      {/* Part B */}
      <div className="mt-4 border-b border-gray-300 pb-6 font-roboto">

        {/* Caption */}
        <div>
          <h2 className="text-base font-bold leading-7 text-gray-900"> Part B: To be filled-up by Administrative Division </h2>
        </div>

        {enablePartB ? (
        <>
          <form id='partB' onSubmit={event => SubmitInspectionFormTo(event, InspectionData?.getPartA?.id)}>

            {/* Date */}
            <div className="flex items-center mt-6">
              <div className="w-40">
                <label className="block text-base font-medium leading-6 text-gray-900">
                  Date:
                </label> 
              </div>
              <div className="w-1/4">
                <input
                  type="date"
                  name="date_filled"
                  id="date_filled"
                  className="block w-full ppa-form"
                  defaultValue={today}
                  readOnly
                />
              </div>
            </div>

            {/* Date of Last Repair */}
            <div className="flex items-center mt-2">
              <div className="w-40">
                <label className="block text-base font-medium leading-6 text-gray-900">
                Date of Last Repair:
                </label> 
              </div>
              <div className="w-1/4">
                <input
                  type="date"
                  name="last_date_filled"
                  id="last_date_filled"
                  value={lastfilledDate}
                  onChange={ev => setLastFilledDate(ev.target.value)}
                  max={currentDate}
                  className="block w-full ppa-form"
                />
              </div>
            </div>
            <p className="text-gray-400 text-xs mt-1" style={{ marginLeft:'160px' }}>Leave it blank if "N/A"</p>

            {/* Nature of Repair */}
            <div className="flex items-center mt-2">
              <div className="w-40">
                <label className="block text-base font-medium leading-6 text-gray-900">
                Nature of Repair:
                </label> 
              </div>
              <div className="w-1/4">
                <textarea
                  id="nature_repair"
                  name="nature_repair"
                  rows={3}
                  value={natureRepair}
                  onChange={ev => setNatureRepair(ev.target.value)}
                  style={{ resize: "none" }}  
                  className="block w-full ppa-form"
                />
              </div>
            </div>
            <p className="text-gray-400 text-xs mt-1" style={{ marginLeft:'160px' }}>Leave it blank if "N/A"</p>

            {/* Assign Personnel */}
            <div className="flex items-center mt-2">
              <div className="w-40">
                <label className="block text-base font-medium leading-6 text-gray-900">
                Assign Personnel:
                </label> 
              </div>
              <div className="w-1/4">
              <select 
                name="plate_number" 
                id="plate_number" 
                autoComplete="request-name"
                value={pointPersonnel}
                onChange={ev => setPointPersonnel(ev.target.value)}
                className="block w-full ppa-form"
              > 
                <option value="" disabled>Select an option</option>
                {InspectionData?.getPersonnelData?.map(user => (
                <option key={user.id} value={user.id}> {user.name} </option>
                ))}
              </select>
              </div>
            </div>
            {!pointPersonnel && inputErrors.assign_personnel && (
              <p className="font-roboto form-validation" style={{ marginLeft: '155px' }}>Assign Personnel is required</p>
            )}

          </form>
        </>
        ):(
        <>
          {/* Part B Fields */}
          <div className="grid grid-cols-2 gap-4">

            {/* Part B leftside */}
            <div className="col-span-1">

              {/* Date */}
              <div className="flex items-center mt-6">
                <div className="w-40">
                  <label className="block text-base font-medium leading-6 text-gray-900">
                  Date:
                  </label> 
                </div>
                {InspectionData?.getPartB?.date_of_filling ? 
                <div className="w-1/2 ppa-form-request">{formatDate(InspectionData?.getPartB?.date_of_filling)}</div>:
                <div className="w-1/2 ppa-form-request h-11"></div>}
              </div>

              {/* Date of Last Repair */}
              <div className="flex items-center mt-2">
                <div className="w-40">
                  <label className="block text-base font-medium leading-6 text-gray-900">
                  Date of Last Repair:
                  </label> 
                </div>
                {editPartB ? (
                  <div className="w-1/2">
                    <input
                      type="date"
                      name="last_date_filled"
                      id="last_date_filled"
                      value={updateLastfilledDate}
                      onChange={ev => setUpdateLastfilledDate(ev.target.value)}
                      max={currentDate}
                      className="block w-full ppa-form"
                      defaultValue={InspectionData?.getPartB?.date_of_last_repair}
                    />
                  </div>
                ):(
                  InspectionData?.personnel?.p_name ? 
                  <div className="w-1/2 ppa-form-request">{InspectionData?.getPartB?.date_of_last_repair ? (formatDate(InspectionData?.getPartB?.date_of_last_repair)):("N/A")}</div>:
                  <div className="w-1/2 ppa-form-request h-11"></div>
                )}
              </div>

              {/* Assigned Personnel: */}
              <div className="flex items-center mt-2">
                <div className="w-40">
                  <label className="block text-base font-medium leading-6 text-gray-900">
                  Assigned Personnel:
                  </label> 
                </div>
                {editPartB ? (
                  <div className="w-1/2">
                    <select 
                      name="plate_number" 
                      id="plate_number" 
                      autoComplete="request-name"
                      value={updatePointPersonnel}
                      onChange={ev => setUpdatePointPersonnel(ev.target.value)}
                      className="block w-full ppa-form"
                    > 
                      <option value="" disabled>Select an option</option>
                      {InspectionData?.getPersonnelData?.map(user => (
                      <option key={user.id} value={user.id}> {user.name} </option>
                      ))}
                    </select>
                  </div>
                ):(
                  InspectionData?.personnel?.p_name ?
                  <div className="w-1/2 ppa-form-request font-bold">{InspectionData?.personnel?.p_name}</div>:
                  <div className="w-1/2 ppa-form-request h-11"></div>
                )}
              </div>

            </div>

            {/* Part B rightside */}
            <div className="col-span-1">

              {/* Requested By */}
              <div className="flex items-center mt-6">
                <div className="w-40">
                  <label className="block text-base font-medium leading-6 text-gray-900">
                  Requested By:
                  </label> 
                </div>           
                {InspectionData?.getPartA?.admin_approval == 3 || InspectionData?.getPartA?.admin_approval == 1 ? (
                <>
                  <div className="w-1/2 font-bold ppa-form-request">
                  {InspectionData?.gso?.gsoName}
                  </div>
                </>  
                ):(
                  <div className="w-1/2 font-bold ppa-form-request h-11"></div>
                ) }
              </div>

              {/* Noted By */}
              <div className="flex items-center mt-2">
                <div className="w-40">
                  <label className="block text-base font-medium leading-6 text-gray-900">
                  Noted By:
                  </label> 
                </div>
                {InspectionData?.getPartA?.admin_approval == 3 || InspectionData?.getPartA?.admin_approval == 1 ? (
                <>
                  <div className="w-1/2 font-bold ppa-form-request h-11">
                    {InspectionData?.manager?.ad_name}
                  </div>
                </>  
                ):(
                  <div className="w-1/2 font-bold ppa-form-request pl-1 h-11"> </div>
                )}
              </div>

            </div>

          </div>

          {/* Nature of Repair */}
          <div className="flex items-center mt-2">
            <div className="w-40">
              <label className="block text-base font-medium leading-6 text-gray-900">
              Nature of Repair:
              </label> 
            </div>
            {editPartB ? (
              <div className="w-1/4">
                <textarea
                  id="nature_repair"
                  name="nature_repair"
                  rows={3}
                  value={updateNatureRepair}
                  onChange={ev => setUpdateNatureRepair(ev.target.value)}
                  style={{ resize: "none" }}  
                  className="block w-full ppa-form"
                />
              </div>
            ):(
              InspectionData?.personnel?.p_name ? 
              <div className="w-3/4 ppa-form-request">{InspectionData?.getPartB?.nature_of_last_repair ? (InspectionData?.getPartB?.nature_of_last_repair):("N/A")}</div>:
              <div className="w-3/4 ppa-form-request pl-1 h-11"></div>
            )}
          </div>

          {/* Admin Reason */}
          {giveAdminReason && (
          <>
            {/* Reason */}
            <div className="flex items-center mt-6">
              <div className="w-44">
                <label htmlFor="supervisor_reason" className="block text-base font-medium leading-6 text-black"> Reason for Disapproval: </label> 
              </div>
              <div className="ml-5">
                <div className="flex items-center">
                  <div className="w-72">
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
          </>  
          )}
        </>
        )}

        {/* Button for GSO */}
        {currentUser.code_clearance == 3 && InspectionData?.getPartA?.form_status == 0 && (
        <>

          {/* Fillup Part B */}
          {enablePartB ? (
            <div className="flex mt-6">
              {/* Submit */}
              <button form='partB' type="submit"
                className={`px-6 py-2 btn-submit mr-2 ${ submitLoading && 'btn-submitting'}`}
                style={{ position: 'relative', top: '0px' }}
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <div className="flex items-center justify-center">
                    <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
                    <span className="ml-2">Submitting</span>
                  </div>
                ) : (
                  'Submit'
                )}
              </button>
              {/* Cancel */}
              <button onClick={handleDisableEdit} className="px-6 py-2 btn-cancel">
                Cancel
              </button>
            </div>
          ):(
          <>
            {(currentUser.code_clearance == 3 && InspectionData?.getPartA?.admin_approval == 4) && (
              <div className="flex mt-6">
                <button onClick={handleFillupBDetails} className="px-6 py-2 btn-edit">
                  Fill-up Part B
                </button>
              </div>
            )}
          </>
          )}

          {/* Edit Part B */}
          {/* editPartB */}
          {InspectionData?.getPartA?.admin_approval == 3 || InspectionData?.getPartA?.admin_approval == 1 ? (
            editPartB ? (
              <div className="flex mt-6">
                {/* Validate */}
                <button type="button"
                  onClick={SubmitPartBDetails}
                  className={`px-6 py-2 mr-2 btn-submit ${ submitLoading && 'btn-submitting'}`}
                  disabled={submitLoading}
                >
                  {submitLoading ? (
                    <div className="flex items-center justify-center">
                      <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
                      <span className="ml-2">Submitting</span>
                    </div>
                  ) : (
                    'Submit'
                  )}
                </button>
                {/* Cancel */}
                <button onClick={handleDisableEdit} className="px-6 py-2 btn-cancel">
                  Cancel
                </button>
              </div>
            ):(
              <div className="flex mt-6">
                <button onClick={handleEditBDetails} className="px-6 py-2 btn-edit">
                  Edit Part B
                </button>
              </div>
            )
          ):null}
        
        </>  
        )}

        {/* For Admin Button */}
        {currentUser.code_clearance == 1 && InspectionData?.getPartA?.admin_approval == 3 && (
        <>
          <div className="mt-6">
            <button onClick={() => handleApprovalRequestAdmin()} className="px-6 py-2 btn-submit" title="Admin Approve">
              Approve
            </button>
          </div>
          
          {/* Hidden Disapprove Button */}
          <div className="hidden md:none">
          {giveAdminReason ? (
          <>
            <div className="flex mt-6">
              {/* Admin Submit Reason */}
              {adminReason && (
                <button type="submit" onClick={() => submitAdminReason(InspectionData?.getPartA?.id)}
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
              )}
              {/* Cancel */}
              <button onClick={() => handleCancelReason()} className="px-6 py-2 btn-cancel" title="Supervisor Decline">
                Cancel
              </button>
            </div>
          </>
          ):(
          <>
            <div className="flex mt-6">
              {/* Approve */}
              
              {/* Disapprove */}
              <button onClick={() => handleAdminReason()} className="px-6 py-2 ml-2 btn-cancel" title="Admin Decline">
                Disapprove
              </button>
            </div>
          </>
          )}
          </div>
    
        </>
        )}

      </div>
      {/* End of Part B */}

      {/* Part C */}
      <div className="mt-4 border-b border-gray-300 pb-6 font-roboto">

        {/* Caption */}
        <div>
          <h2 className="text-base font-bold leading-7 text-gray-900"> Part C: To be filled-up by the DESIGNATED INSPECTOR before repair job. </h2>
          {enablePartC && (<p className="text-xs text-red-500">Kindly double-check the form before submitting </p>)}
        </div>

        {InspectionData?.getPartB?.assign_personnel == currentUser.id && InspectionData?.getPartCD?.findings == 'no data' ? (
        <>
          {/* Form */}
          <form id="partC" onSubmit={SubmitPartC}>

            {/* Date */}
            <div className="flex items-center mt-6">
              <div className="w-40">
                <label className="block text-base font-medium leading-6 text-gray-900">
                  Date Inspected:
                </label> 
              </div>
              <div className="w-1/4">
                <input
                  type="date"
                  name="date_filled"
                  id="date_filled"
                  className="block w-full ppa-form"
                  defaultValue={today}
                  readOnly
                />
              </div>
            </div>

            {/* Findings */}
            <div className="flex items-center mt-2">
              <div className="w-40">
                <label className="block text-base font-medium leading-6 text-gray-900">
                Findings:
                </label> 
              </div>
              <div className="w-1/4">
                <textarea
                  id="findings"
                  name="findings"
                  rows={3}
                  style={{ resize: "none" }}
                  value= {finding}
                  onChange={ev => setFinding(ev.target.value)}
                  className="block w-full ppa-form"
                />
              </div>
            </div>
            {!finding && inputErrors.findings && (
              <p className="form-validation" style={{ marginLeft:'160px' }}>You must input the Fidings</p>
            )}

            {/* Recomendations */}
            <div className="flex items-center mt-2">
              <div className="w-40">
                <label className="block text-base font-medium leading-6 text-gray-900">
                Recomendations:
                </label> 
              </div>
              <div className="w-1/4">
                <textarea
                  id="recomendations"
                  name="recomendations"
                  rows={3}
                  style={{ resize: "none" }}
                  value= {recommendation}
                  onChange={ev => setRecommendation(ev.target.value)}
                  className="block w-full ppa-form"
                />
              </div>
            </div>
            {!recommendation && inputErrors.recommendations && (
              <p className="form-validation" style={{ marginLeft:'160px' }}>You must input the Recommendations</p>
            )}

          </form>
        </>
        ):(
        <>
          {/* Display Part C */}

          {/* Date Inspected */}
          <div className="flex items-center mt-6">
            <div className="w-40">
              <label className="block text-base font-medium leading-6 text-gray-900">
              Date Inspected:
              </label> 
            </div>
            {InspectionData?.getPartCD?.findings == 'no data' || InspectionData?.getPartCD?.findings == null ? 
              <div className="w-1/4 ppa-form-request h-11"></div>:
              <div className="w-1/4 ppa-form-request">{formatDate(InspectionData?.getPartCD?.before_repair_date)}</div>
            }
          </div>

          {enablePartC ? (
            <>
              {/* Edit Part C */}

              {/* Findings */}
              <div className="flex items-center mt-2">
                <div className="w-40">
                  <label className="block text-base font-medium leading-6 text-gray-900">
                    Findings:
                  </label>
                </div>
                <div className="w-1/4">
                  <textarea
                    id="findings"
                    name="findings"
                    rows={3}
                    style={{ resize: "none" }}
                    value={updateFinding}
                    onChange={ev => setUpdateFinding(ev.target.value)}
                    placeholder={InspectionData?.getPartCD?.findings}
                    className="block w-full ppa-form"
                  />
                  {(fieldMissing && !updateFinding) && ( <p className="font-roboto form-validation">Input Text Missing</p> )}
                </div>
              </div>

              {/* Recommendations */}
              <div className="flex items-center mt-2">
                <div className="w-40">
                  <label className="block text-base font-medium leading-6 text-gray-900">
                    Recommendations:
                  </label>
                </div>
                <div className="w-1/4">
                  <textarea
                    id="recommendations"
                    name="recommendations"
                    rows={3}
                    style={{ resize: "none" }}
                    value={updateRecommendation}
                    onChange={ev => setUpdateRecommendation(ev.target.value)}
                    placeholder={InspectionData?.getPartCD?.recommendations}
                    className="block w-full ppa-form"
                  />
                  {(fieldMissing && !updateRecommendation) && ( <p className="font-roboto form-validation">Input Text Missing</p> )}
                </div>
              </div>

            </> 
          ):(
          <>
            {/* Display */}
            {/* Findings */}
            <div className="flex items-center mt-2">
              <div className="w-40">
                <label className="block text-base font-medium leading-6 text-gray-900">
                Findings:
                </label> 
              </div>
              {InspectionData?.getPartCD?.findings == 'no data' || InspectionData?.getPartCD?.findings == null ? 
              <div className="w-3/4 ppa-form-request h-11"></div>:
              <div className="w-3/4 ppa-form-request">{InspectionData?.getPartCD?.findings}</div>
              }
            </div>

            {/* Recomendations */}
            <div className="flex items-center mt-2">
              <div className="w-40">
                <label className="block text-base font-medium leading-6 text-gray-900">
                Recomendations:
                </label> 
              </div>
              {InspectionData?.getPartCD?.findings == 'no data' || InspectionData?.getPartCD?.findings == null ? 
              <div className="w-3/4 ppa-form-request h-11"></div>:
              <div className="w-3/4 ppa-form-request">{InspectionData?.getPartCD?.recommendations}</div>}
            </div>

            {/* Noted By */}
            <div className="flex items-center mt-2">
              <div className="w-40">
                <label className="block text-base font-medium leading-6 text-gray-900">
                Noted By:
                </label> 
              </div>
              {InspectionData?.getPartCD?.findings == 'no data' || InspectionData?.getPartCD?.findings == null ? 
              <div className="w-1/4 ppa-form-request h-11"></div>:
              <div className="w-1/4 ppa-form-request font-bold">{InspectionData?.personnel?.p_name}</div>}
            </div>
          </>  
          )}
        </>
        )}

        {/* Buttons */}
        {(InspectionData?.getPartB?.assign_personnel == currentUser.id && InspectionData?.getPartA?.inspector_status == 3) && (
          <>
            {/* Submit the data */}
            <div className="flex mt-6">
              <button form='partC' type="submit"
                className={`px-6 py-2 btn-submit ${ submitLoading && 'btn-submitting'}`}
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <div className="flex items-center justify-center">
                    <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
                    <span className="ml-2">Submitting</span>
                  </div>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </>  
        )}

        {/* Enable Button */}
        {(InspectionData?.getPartB?.assign_personnel == currentUser.id && InspectionData?.getPartCD?.findings != 'no data') && (InspectionData?.getPartA?.form_status == 0) && (
        <>
          {enablePartC ? (
            <div className="flex mt-6">
              {/* Update Part C */}
              <button type="button"
                onClick={handleUpdatePartC}
                className={`px-6 py-2 mr-2 btn-submit ${ submitLoading && 'btn-submitting'}`}
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <div className="flex items-center justify-center">
                    <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
                    <span className="ml-2">Submitting</span>
                  </div>
                ) : (
                  'Submit'
                )}
              </button>
              {/* Cancel the Edit */}
              <button onClick={handleDisableEdit} className="px-6 py-2 btn-cancel">
                Cancel
              </button>
            </div>
          ):(
            <div className="flex mt-6">
              {/* Edit Part C */}
              <button onClick={handleEditCDetails} className="px-6 py-2 btn-edit">
                Edit Part C
              </button>
            </div> 
          )}
        </>
        )}

      </div>
      {/* End of Part C */}

      {/* Part D */}
      <div className="mt-4 border-b border-gray-300 pb-6 font-roboto">

        {/* Caption */}
        <div>
          <h2 className="text-base font-bold leading-7 text-gray-900"> Part D: To be filled-up by the DESIGNATED INSPECTOR after the completion of the repair job. </h2>
          {enablePartD && (<p className="text-xs text-red-500">Kindly double-check the form before submitting </p>)}
        </div>

        {InspectionData?.getPartA?.inspector_status == 2 && InspectionData?.getPartB?.assign_personnel == currentUser.id ? (
        <>
          <form id="partD" onSubmit={SubmitPartD}>

            {/* Date */}
            <div className="flex items-center mt-6">
              <div className="w-40">
                <label className="block text-base font-medium leading-6 text-gray-900">
                  Date Inspected:
                </label> 
              </div>
              <div className="w-1/4">
                <input
                  type="date"
                  name="date_filled"
                  id="date_filled"
                  className="block w-full ppa-form"
                  defaultValue={today}
                  readOnly
                />
              </div>
            </div>

            {/* Remarks */}
            <div className="flex items-center mt-2">
              <div className="w-40">
                <label className="block text-base font-medium leading-6 text-gray-900">
                Remarks:
                </label> 
              </div>
              <div className="w-1/4">
                <textarea
                  id="remarks"
                  name="remarks"
                  rows={3}
                  style={{ resize: "none" }}
                  value= {remarks}
                  onChange={ev => setRemarks(ev.target.value)}
                  className="block w-full ppa-form"
              />
              </div>
            </div>
            {!remarks && inputErrors.remarks && (
              <p className="form-validation" style={{ marginLeft:'160px' }}>You must input the Remarks</p>
            )}

          </form>
        </>
        ):(
        <>
          {/* Display Part D */}

          {/* Date Inspected */}
          <div className="flex items-center mt-6">
            <div className="w-40">
              <label className="block text-base font-medium leading-6 text-gray-900">
              Date Inspected:
              </label> 
            </div>
            {InspectionData?.getPartCD?.after_reapir_date != null ? 
            <div className="w-1/4 ppa-form-request">{formatDate(InspectionData?.getPartCD?.after_reapir_date)}</div>:
            <div className="w-1/4 ppa-form-request h-11"></div>}
          </div>

          {/* Remarks */}
          {enablePartD ? (
          <div className="flex items-center mt-2">
            <div className="w-40">
              <label className="block text-base font-medium leading-6 text-gray-900">
              Remarks:
              </label> 
            </div>
            <div className="w-1/4">
              <textarea
                id="remarks"
                name="remarks"
                rows={3}
                style={{ resize: "none" }}
                value= {updateRemark}
                onChange={ev => setUpdateRemark(ev.target.value)}
                className="block w-full ppa-form"
                placeholder={InspectionData?.getPartCD?.remarks}
              />
              {(fieldMissing && !updateRemark) && ( <p className="font-roboto form-validation">Input Text Missing</p> )}
            </div>
          </div>
          ):(
          <div className="flex items-center mt-2">
            <div className="w-40">
              <label className="block text-base font-medium leading-6 text-gray-900">
              Remarks:
              </label> 
            </div>
            {InspectionData?.getPartCD?.remarks != null ? 
            <div className="w-3/4 ppa-form-request">{InspectionData?.getPartCD?.remarks}</div>:
            <div className="w-3/4 ppa-form-request h-11"></div>}
          </div>
          )}

          {/* Noted By */}
          <div className="flex items-center mt-2">
            <div className="w-40">
              <label className="block text-base font-medium leading-6 text-gray-900">
              Noted By:
              </label> 
            </div>
            {InspectionData?.getPartCD?.remarks ? 
            <div className="w-1/4 ppa-form-request font-bold">{InspectionData?.personnel?.p_name}</div>:
            <div className="w-1/4 ppa-form-request h-11"></div>}
          </div>

        </>
        )}

        {/* Button */}
        {(InspectionData?.getPartB?.assign_personnel == currentUser.id && InspectionData?.getPartA?.inspector_status == 2) && (
        <>
          <div className="flex mt-6">
            <button form="partD" type="submit"
              className={`px-6 py-2 btn-submit ${ submitLoading && 'btn-submitting'}`}
              disabled={submitLoading}
            >
              {submitLoading ? (
                <div className="flex items-center justify-center">
                  <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
                  <span className="ml-2">Submitting</span>
                </div>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </>
        )}

        {/* Enable Button */}
        {(InspectionData?.getPartB?.assign_personnel == currentUser.id) && (InspectionData?.getPartA?.inspector_status == 1) && (InspectionData?.getPartA?.form_status == 0) && (
        <>
          {enablePartD ? (
            <div className="flex mt-6">
              {/* Update Part D */}
              <button type="button"
                onClick={handleUpdatePartD}
                className={`px-6 py-2 mr-2 btn-submit ${ submitLoading && 'btn-submitting'}`}
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <div className="flex items-center justify-center">
                    <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
                    <span className="ml-2">Submitting</span>
                  </div>
                ) : (
                  'Submit'
                )}
              </button>
              {/* Cancel the Edit */}
              <button onClick={handleDisableEdit} className="px-6 py-2 btn-cancel">
                Cancel
              </button>
            </div>
          ):(
            <div className="flex mt-6">
              {/* Edit Part D */}
              <button onClick={handleEditDDetails} className="px-6 py-2 btn-edit">
                Edit Part D
              </button>
            </div> 
          )}
        </>
        )}

      </div>
      {/* End of Part D */}

      {/* Status */}
      <div className="flex items-center mt-8">
        <div className="w-16">
          <label className="block text-base font-bold leading-6 text-gray-900">
          Status:
          </label> 
        </div>
        <div className="w-full font-bold ppa-form-request">
        {InspectionData?.getPartA?.remarks}
        </div>
      </div>

      {/* Close Request Button */}
      {currentUser.code_clearance == 3 && (InspectionData?.getPartA?.form_status == 0) && (
      <>
        <div className="flex mt-6">
          <button onClick={() => handleClosure()} className="px-6 py-2 btn-close">
            Close Request
          </button>
        </div>
      </>
      )}

      {/* Generate PDF Button */}
      {InspectionData?.getPartA?.supervisor_approval == 1 && (currentUser.code_clearance == 3 || currentUser.code_clearance == 10) && (InspectionData?.getPartA?.form_status == 1) && (
        <div className="flex mt-6">
          <button type="button" onClick={handleButtonClick}
            className={`px-6 py-2 btn-pdf ${ submitLoading && 'btn-genpdf'}`}
            disabled={submitLoading}
          >
            {submitLoading ? (
              <div className="flex items-center justify-center">
                <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
                <span className="ml-2">Generating</span>
              </div>
            ) : (
              'Get PDF'
            )}
          </button>
        </div>
      )}

      {/* PopUp */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Semi-transparent black overlay */}
          <div className="fixed inset-0 bg-black opacity-40"></div>
          {/* Popup content with background blur */}
          <div className="absolute p-6 rounded-lg shadow-md bg-white backdrop-blur-lg animate-fade-down" style={{ width: '350px' }}>
            {/* Notification Icons */}
            <div class="f-modal-alert">
              {/* Error */}
              {popupContent == "error" && (
                <div className="f-modal-icon f-modal-error animate">
                  <span className="f-modal-x-mark">
                    <span className="f-modal-line f-modal-left animateXLeft"></span>
                    <span className="f-modal-line f-modal-right animateXRight"></span>
                  </span>
                </div>
              )}
              {/* Warning */}
              {(popupContent == "warning") && (
                <div class="f-modal-icon f-modal-warning scaleWarning">
                  <span class="f-modal-body pulseWarningIns"></span>
                  <span class="f-modal-dot pulseWarningIns"></span>
                </div>
              )}
              {/* Closure */}
              {popupContent == "close" && (
                <div class="f-modal-icon f-modal-warning scaleWarning">
                  <span class="f-modal-body pulseWarningIns"></span>
                  <span class="f-modal-dot pulseWarningIns"></span>
                </div>
              )}
              {/* Success */}
              {popupContent == "success" && (
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
              {/* Default Buttons */}
              {(popupContent == "success") && (
                <button onClick={closePopup} className="w-full py-2 btn-success">
                  Close
                </button>
              )}
              {/* Approval Button */}
              {popupContent == "warning" && (
              <>
                {/* For Supervisor */}
                {currentUser.code_clearance == 4 && (
                <>
                  {/* Affirmative */}
                  {!submitLoading && (
                    <button onClick={() => handleSupervisorApproval(InspectionData?.getPartA?.id)} className="w-1/2 py-2 popup-confirm">
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

                {/* For Admin */}
                {currentUser.code_clearance == 1 && (
                <>
                  {/* Affirmative */}
                  {!submitLoading && (
                    <button onClick={() => handleApprovalAdminRequest(InspectionData?.getPartA?.id)} className="w-1/2 py-2 popup-confirm">
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
              </>
              )}
              {/* Closure */}
              {popupContent == "close" && (
              <>
                {/* Yes */}
                {!submitLoading && (
                  <button onClick={() => handleCloseRequest(InspectionData?.getPartA?.id)} className="w-1/2 py-2 popup-confirm">
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
              {/* Error */}
              {popupContent == "error" && (
                <button onClick={justclose} className="w-full py-2 btn-error">
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* End of Popup */}

      {/* Generate PDF */}
      {isVisible && (
      <div>
        <div className="hidden md:none">
          <div ref={componentRef}>
            <div style={{ width: '210mm', height: '297mm', paddingLeft: '25px', paddingRight: '25px', paddingTop: '10px', border: '0px solid' }}>

              {/* Control Number */}
              <div className="title-area font-arial pr-6 text-right pb-4 pt-2">
                <span>Control No:</span>{" "}
                <span style={{ textDecoration: "underline", fontWeight: "900" }}>    
                ___   
                  {InspectionData?.getPartA?.id}
                ___
                </span>
              </div>

              <table className="w-full border-collapse border border-black">
                <tbody>
                  {/* Title and Logo */}
                  <tr>
                    <td className="border border-black p-1 text-center" style={{ width: '100px' }}>
                      <img src="/ppa_logo.png" alt="My Image" className="mx-auto" style={{ width: 'auto', height: '65px' }} />
                    </td>
                    <td className="border text-lg w-7/12 border-black font-arial text-center">
                      <b>PRE-REPAIR/POST REPAIR INSPECTION FORM</b>
                    </td>
                    <td className="border border-black p-0 font-arial">
                      <div className="border-b text-xs border-black p-1">Form No.: PM:VEC:LNI:WEN:FM:03</div>
                      <div className="border-b text-xs border-black p-1">Revision No.: 01</div>
                      <div className="text-xs p-1">Date of Effectivity: {formatDate(InspectionData?.getPartA?.date_of_request)}</div>
                    </td>
                  </tr>

                  {/* Blank */}
                  <tr>
                    <td colSpan={3} className="border border-black p-1.5 font-arial"></td>
                  </tr>

                  {/* Part A Label */}
                  <tr>
                    <td colSpan={3} className="border border-black pl-1 pt-0 font-arial">
                      <h3 className="text-sm font-normal">PART A: To be filled-up by Requesting Party</h3>
                    </td>
                  </tr>

                  {/* Part A Details */}
                  <tr>
                    <td colSpan={3} className="border border-black pl-1 pr-2 pb-4 font-arial">

                      {/* Date Requested */}
                      <div className="mt-4">
                        <div className="flex">
                          <div className="w-28 text-pdf">
                            <span>Date</span>
                          </div>
                          <div className="w-64 border-b border-black pl-1 text-pdf">
                            <span>{formatDate(InspectionData?.getPartA?.date_of_request)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">

                        {/* Part A Left */}
                        <div className="col-span-1">

                          {/* Property Number */}
                          <div className="mt-6">
                            <div className="flex">
                              <div className="w-28 text-pdf">
                                <span>Property No</span> 
                              </div>
                              <div className="w-64 border-b border-black pl-1 text-pdf">
                                <span>{InspectionData?.getPartA?.property_number}</span>
                              </div>
                            </div>
                          </div>

                          {/* Acquisition Date */}
                          <div className="mt-1">
                            <div className="flex">
                              <div className="w-28 text-pdf">
                                <span>Acquisition Date</span>
                              </div>
                              <div className="w-64 border-b border-black pl-1 text-pdf">
                                <span>{formatDate(InspectionData?.getPartA?.acq_date)}</span>
                              </div> 
                            </div>
                          </div>

                          {/* Acquisition Cost */}
                          <div className="mt-1">
                            <div className="flex">
                              <div className="w-28 text-pdf">
                                <span>Acquisition Cost</span> 
                              </div>
                              <div className="w-64 border-b border-black pl-1 text-pdf">
                                <span>₱{(InspectionData?.getPartA?.acq_cost)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Brand/Model */}
                          <div className="mt-1">
                            <div className="flex">
                              <div className="w-28 text-pdf">
                                <span>Brand/Model</span> 
                              </div>
                              <div className="w-64 border-b border-black pl-1 text-pdf">
                                <span>{InspectionData?.getPartA?.brand_model}</span>
                              </div>
                            </div>
                          </div>

                          {/* Serial/Engine No. */}
                          <div className="mt-1">
                            <div className="flex">
                              <div className="w-28 text-pdf">
                                <span>Serial/Engine No.</span> 
                              </div>
                              <div className="w-64 border-b border-black pl-1 text-pdf">
                                <span>{InspectionData?.getPartA?.serial_engine_no}</span>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Part A Right */}
                        <div className="col-span-1">

                          {/* Type of Property */}
                          <div className="mt-6">
                            <div className="flex">
                              <div className="w-28 text-pdf">
                                <span>Type of Property</span> 
                              </div>
                              <div className="w-68">
                                {/* Vehicle */}
                                <div className="flex items-center text-pdf">
                                  <div className="w-8 h-5 border border-black mr-2 border-b-0 flex items-center justify-center text-black font-bold">{InspectionData?.getPartA?.type_of_property === 'Vehicle Supplies & Materials' ? "X":null}</div>
                                  <span>Vehicle Supplies & Materials</span>
                                </div>
                                {/* IT */}
                                <div className="flex items-center text-pdf">
                                <div className="w-8 h-5 border border-black mr-2 flex items-center justify-center text-black font-bold">{InspectionData?.getPartA?.type_of_property === 'IT Equipment & Related Materials' ? "X":null}</div>
                                  <span>IT Equipment & Related Materials</span>
                                </div>
                                {/* Other */}
                                <div className="flex items-center text-pdf">
                                  <div className="w-8 h-5 border border-black mr-2 border-t-0 flex items-center justify-center text-black font-bold">{InspectionData?.getPartA?.type_of_property === 'Others' ? "X":null}</div>
                                  <div>
                                    <span  className="mr-1 text-pdf">Others:</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          <div className="mt-1">
                            <div className="flex">
                              <div className="w-28 text-pdf">
                                <span>Description</span> 
                              </div>
                              <div className="w-64 border-b border-black pl-1 text-pdf">
                                <span>{InspectionData?.getPartA?.property_description}</span>
                              </div>
                            </div>
                          </div>

                          {/* Location */}
                          <div className="mt-1">
                            <div className="flex">
                              <div className="w-56 text-pdf">
                                <span>Location (Div/Section/Unit)</span> 
                              </div>
                              <div className="w-64 border-b border-black pl-4 text-pdf">
                                <span>{InspectionData?.getPartA?.location}</span>
                              </div>
                            </div>
                          </div>

                        </div>

                      </div>

                      {/* Complain */}
                      <div className="mt-1">
                        <div className="flex">
                          <div className="w-32 text-pdf">
                            <span>Complain/Defect</span>
                          </div>
                          <div className="w-full border-b border-black pl-1 text-pdf">
                            <span>{InspectionData?.getPartA?.complain}</span>
                          </div>
                        </div>
                      </div>

                      {/* For Signature */}
                      <div className="mt-4">
                        <div className="grid grid-cols-2 gap-4">

                          {/* For Requestor Signature */}
                          <div className="col-span-1">
                            <label htmlFor="type_of_property" className="block text-sm font-normal leading-6"> REQUESTED BY:</label>
                            <div className="mt-4">
                              <div className="w-64 mx-auto border-b text-center border-black pl-1" style={{ position: 'relative' }}>
                                <div>
                                <img 
                                  src={InspectionData?.requestor?.r_sign} 
                                  alt="User Signature" 
                                  className="ppa-esignature-prf" 
                                />
                                </div>
                                <span className="text-base font-bold">{InspectionData?.requestor?.r_name}</span>
                              </div>
                              <label htmlFor="type_of_property" className="block text-xs text-center font-medium italic"> End-User </label>
                            </div>
                          </div>

                          {/* For Supervisor Signature */}
                          <div className="col-span-1">
                            <label htmlFor="type_of_property" className="block text-sm font-normal leading-6"> NOTED: </label>
                            <div className="mt-4">
                              <div className="w-64 mx-auto border-b text-center border-black pl-1" style={{ position: 'relative' }}>
                                <div>
                                  <img
                                    src={InspectionData?.supervisor?.supSign}
                                    alt="User Signature"
                                    className="ppa-esig-sup-prf"
                                  />
                                  <span className="text-base font-bold">{InspectionData?.supervisor?.supName}</span>
                                </div>
                              </div>
                              <label htmlFor="type_of_property" className="block text-xs text-center font-medium italic"> Immediate Supervisor</label>
                            </div>
                          </div>

                        </div>
                      </div>

                    </td>
                  </tr>

                  {/* Part B Label */}
                  <tr>
                    <td colSpan={3} className="border border-black pl-1 font-arial">
                    <h3 className="text-sm font-normal">PART B: To be filled-up by Administrative Division</h3>
                    </td>
                  </tr>

                  {/* Part B Forms */}
                  <tr>
                    <td colSpan={3} className="border border-black pl-1 pr-2 pb-4 font-arial">

                      {/* Date */}
                      <div className="mt-4">
                        <div className="flex">
                          <div className="w-28 text-pdf">
                            <span>Date</span> 
                          </div>
                          <div className="w-64 border-b border-black pl-1 text-pdf">
                            <span>{formatDate(InspectionData?.getPartB?.date_of_filling)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Date of Last Repair */}
                      <div className="mt-1">
                        <div className="flex">
                          <div className="w-36 text-pdf">
                            <span>Date of Last Repair</span> 
                          </div>
                          <div className="w-64 border-b border-black pl-1 text-pdf">
                            <span>{InspectionData?.getPartB?.date_of_last_repair ? (formatDate(InspectionData?.getPartB?.date_of_last_repair)):("N/A")}</span>
                          </div>
                        </div>
                      </div>

                      {/* Nature of Repair */}
                      <div className="mt-1">
                        <div className="flex">
                          <div className="w-44 text-pdf">
                            <span>Nature of Last Repair</span>
                          </div>
                          <div className="w-full border-b border-black pl-1 text-pdf">
                            <span>{InspectionData?.getPartB?.nature_of_last_repair ? (InspectionData?.getPartB?.nature_of_last_repair):("N/A")}</span>
                          </div>
                        </div>
                      </div>

                      {/* Signature */}
                      <div className="mt-4">
                        <div className="grid grid-cols-2 gap-4">

                          {/* For GSO Signature */}
                          <div className="col-span-1">
                            <label htmlFor="type_of_property" className="block font-normal leading-6 text-sm">REQUESTED BY: </label>
                            <div className="mt-4">
                              <div className="w-64 mx-auto border-b text-center border-black pl-1" style={{ position: 'relative' }}>
                                <div>
                                <img 
                                  src={InspectionData?.gso?.gsoSign} 
                                  alt="User Signature" 
                                  className="ppa-esig-gso-prf"
                                />
                                </div>
                                <span className="font-bold text-base">{InspectionData?.gso?.gsoName}</span>
                              </div>
                              <label htmlFor="type_of_property" className="block text-center font-normal italic text-xs"> General Service Officer </label>
                            </div>
                          </div>

                          {/* For Admin Division Manager */}
                          <div className="col-span-1">
                            <label htmlFor="type_of_property" className="block font-normal leading-6 text-sm"> NOTED:</label>
                            <div className="mt-4">
                              <div className="w-64 mx-auto border-b text-center border-black pl-1" style={{ position: 'relative' }}>
                                <div>
                                  <img
                                    src={InspectionData?.manager?.ad_sign}
                                    alt="User Signature"
                                    className="ppa-esig-admin-prf"
                                  />
                                  <span className="font-bold text-base">{InspectionData?.manager?.ad_name}</span>
                                </div>
                              </div>
                              <label htmlFor="type_of_property" className="block text-center font-normal italic text-xs"> Admin Division Manager </label>
                            </div>
                          </div>

                        </div>
                      </div>

                    </td>
                  </tr>

                  {/* Part C Label */}
                  <tr>
                    <td colSpan={3} className="border border-black pl-1 font-arial">
                    <h3 className="text-sm font-normal">PART C: To be filled-up by the DESIGNATED INSPECTOR before repair job.</h3>
                    </td>
                  </tr>

                  {/* Part C Form */}
                  <tr>
                    <td colSpan={3} className="border border-black pl-1 pr-2 pb-4 font-arial">

                      {/* Finding */}
                      <div className="mt-4">
                        <div className="flex">
                          <div className="w-44 text-pdf">
                            <span>Finding/s</span>
                          </div>
                          <div className="w-full border-b border-black pl-1 text-pdf">
                            <span>{InspectionData?.getPartCD?.findings}</span>
                          </div>
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="mt-1">
                        <div className="flex">
                          <div className="w-44 text-pdf">
                            <span>Recommendation/s</span>
                          </div>
                          <div className="w-full border-b border-black pl-1 text-pdf">
                            <span>{InspectionData?.getPartCD?.recommendations}</span>
                          </div>
                        </div>
                      </div>

                      {/* Signature */}
                      <div className="mt-4">
                        <div className="grid grid-cols-2 gap-4">

                        {/* Date */}
                        <div className="col-span-1">
                          <label htmlFor="type_of_property" className="block text-sm font-medium leading-6">
                            <span>DATE INSPECTED</span>
                          </label>
                          <div className="mt-2">
                            <div className="w-64 mx-auto border-b text-center border-black pl-1" style={{ position: 'relative' }}>
                              <span className="text-base">{formatDate(InspectionData?.getPartCD?.before_repair_date)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Inspector */}
                        <div className="col-span-1">
                          <label htmlFor="type_of_property" className="block text-sm font-medium leading-6">
                            <span>NOTED:</span>
                          </label>
                          <div className="mt-2">
                            <div className="w-64 mx-auto border-b text-center border-black pl-1" style={{ position: 'relative' }}>
                              <div>
                                  <div className="personnel-container">
                                    <img
                                      src={InspectionData?.personnel?.p_sign}
                                      alt="User Signature"
                                      className="ppa-esig-inspector-prf"
                                    />
                                    <span className="text-base font-bold">{InspectionData?.personnel?.p_name}</span>
                                  </div>
                              </div>
                            </div>
                            <label htmlFor="type_of_property" className="block text-center font-medium italic text-xs">
                              Property Inspector
                            </label>
                          </div>
                        </div>

                        </div>
                      </div>

                    </td>
                  </tr>

                  {/* Part D Label */}
                  <tr>
                    <td colSpan={3} className="border border-black pl-1 font-arial">
                    <h3 className="text-sm font-normal">PART D: To be filled-up by the DESIGNATED INSPECTOR after the completion of the repair job.</h3>
                    </td>
                  </tr>

                  {/* Part D Form */}
                  <tr>
                    <td colSpan={3} className="border border-black pl-1 pr-2 pb-4 font-arial">

                      {/* Remarks */}
                      <div className="mt-4">
                        <div className="flex">
                          <div className="w-44 text-pdf">
                            <span>Recommendation/s</span>
                          </div>
                          <div className="w-full border-b border-black pl-1 text-pdf">
                            <span>{InspectionData?.getPartCD?.remarks}</span>
                          </div>
                        </div>
                      </div>

                      {/* Signature */}
                      <div className="mt-4">
                        <div className="grid grid-cols-2 gap-4">

                        {/* Date */}
                        <div className="col-span-1">
                          <label htmlFor="type_of_property" className="block text-sm font-medium leading-6">
                            <span>DATE INSPECTED</span>
                          </label>
                          <div className="mt-2">
                            <div className="w-64 mx-auto border-b text-center border-black pl-1" style={{ position: 'relative' }}>
                              <span className="text-base">{formatDate(InspectionData?.getPartCD?.after_reapir_date)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Inspector */}
                        <div className="col-span-1">
                          <label htmlFor="type_of_property" className="block text-sm font-medium leading-6">
                            <span>NOTED:</span>
                          </label>
                          <div className="mt-2">
                            <div className="w-64 mx-auto border-b text-center border-black pl-1" style={{ position: 'relative' }}>
                              <div>
                                  <div className="personnel-container">
                                    <img
                                      src={InspectionData?.personnel?.p_sign}
                                      alt="User Signature"
                                      className="ppa-esig-inspector-prf"
                                    />
                                    <span className="text-base font-bold">{InspectionData?.personnel?.p_name}</span>
                                  </div>
                              </div>
                            </div>
                            <label htmlFor="type_of_property" className="block text-center font-medium italic text-xs">
                              Property Inspector
                            </label>
                          </div>
                        </div>

                        </div>
                      </div>

                    </td>
                  </tr>
                </tbody>
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
  )

};