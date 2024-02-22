import React, { useEffect, useState } from "react";
import PageComponent from "../components/PageComponent";
import axiosClient from "../axios";
import ForbiddenComponent from "../components/403";
import { Link, useNavigate, useParams } from "react-router-dom";
import loadingAnimation from '/public/ppa_logo_animationn_v4.gif';
import { useUserStateContext } from "../context/ContextProvider";

export default function MyRequestForRepairInspection(){

  const { currentUser, userRole } = useUserStateContext();
  const {id} = useParams();

  //Date Format
  function formatDate(dateString) {
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  const [loading, setLoading] = useState(true);
  const [supervisor, setSupervisor] = useState([]);
  const[displayRequest, setDisplayRequest] = useState([]);

  const fetchSupervisor = () => {
    axiosClient
    .get(`/getsupervisor/${id}`)
    .then((response) => {
      const responseData = response.data;
      const supDet = responseData.personnel_details;

      setSupervisor(supDet);

      setLoading(false);
    })
    .catch((error) => {
      setLoading(false);
        console.error('Error fetching data:', error);
    });
  }

  //Get all the Request on the Inspection
  const fetchInspectForm = () => {
    axiosClient
    .get(`/myinspecreq/${id}`)
    .then((response) => {
        const responseData = response.data;
        const viewRequestData = responseData.view_request;

        const mappedData = viewRequestData.map((dataItem) => {
          return{
            id: dataItem.id,
            date_of_request: dataItem.date_of_request,
            property_number: dataItem.property_number,
            acq_date: dataItem.acq_date,
            acq_cost: dataItem.acq_cost,
            brand_model: dataItem.brand_model,
            serial_engine_no: dataItem.serial_engine_no,
            type_of_property: dataItem.type_of_property,
            property_other_specific: dataItem.property_other_specific,
            property_description: dataItem.property_description,
            location: dataItem.location,
            complain: dataItem.complain,
            supervisor_approval: dataItem.supervisor_approval,
            admin_approval: dataItem.admin_approval,
            inspector_status: dataItem.inspector_status,
          }
        });

        setDisplayRequest({mappedData});

    })
    .catch((error) => {
      setLoading(false);
        console.error('Error fetching data:', error);
    })
    .finally(() => {
      setLoading(false);
    });
  }

  useEffect(()=>{
    fetchInspectForm();
    fetchSupervisor();
  },[id]);

  //Restrict
  const Users = currentUser.id == id || currentUser.code_clearance == 10;

  return Users ? (
  <PageComponent title="Pre/Post Repair Inspection Form">
  {loading ? (
  <div className="fixed top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-center bg-white bg-opacity-100 z-50">
    <img
      className="mx-auto h-44 w-auto"
      src={loadingAnimation}
      alt="Your Company"
    />
    <span className="ml-2 animate-heartbeat">Loading My Request List</span>
  </div>
  ):(
  <>
    {/* Supervisor */}
    <div className="flex">
      <p className="text-sm leading-7 text-black w-20" style={{ paddingTop: '10px', paddingBottom: '10px' }}>Approver: </p>
      <span style={{ backgroundColor: '#f2f2f2', padding: '10px', fontFamily: 'Rockwell, serif' }}>
        {(() => {
          switch (true) {
            case currentUser.code_clearance === 1 || currentUser.code_clearance === 2 || currentUser.code_clearance === 4:
              return `${currentUser.fname} ${currentUser.mname}. ${currentUser.lname}`;
            case currentUser.division === 'Administrative Division' || currentUser.division === 'Finance Division' || currentUser.division === 'Office of the Port Manager' || currentUser.division === 'Port Service Division' || currentUser.division === 'Port Police Division' || currentUser.division === 'Engineering Service Division' || currentUser.division === 'Terminal Management Office - Tubod':
              return supervisor.name;
            default:
              return null;
          }
        })()}
      </span>
    </div>

    {/* Display Table */}
    <div className="mt-4 overflow-x-auto">
      {displayRequest?.mappedData?.length > 0 ? (
        <table className="border-collapse" style={{ width: '2500px' }}>
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase border border-custom">Date</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase border border-custom">Property No</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase border border-custom">Acquisition Date</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase border border-custom">Acquisition Cost</th> 
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase border border-custom">Brand/Model</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase border border-custom">Serial/Engine No</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase border border-custom">Type of Property</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase border border-custom">Description </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase border border-custom">Location </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase border border-custom">Complain/Defect</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase border border-custom">Status</th>
            </tr>
          </thead>
          <tbody>
            {displayRequest?.mappedData?.map((getData) => (
              <tr key={getData.id}>
                <td className="px-2 py-1 text-center border border-custom w-40">{formatDate(getData.date_of_request)}</td>
                <td className="px-2 py-1 text-center border border-custom w-80">{getData.property_number}</td>
                <td className="px-2 py-1 text-center border border-custom w-40">{formatDate(getData.acq_date)}</td>
                <td className="px-2 py-1 text-center border border-custom w-40">₱{getData.acq_cost}</td>
                <td className="px-2 py-1 text-center border border-custom w-56">{getData.brand_model}</td>
                <td className="px-2 py-1 text-center border border-custom w-56">{getData.serial_engine_no}</td>
                {getData.type_of_property === "Others" ? (
                <td className="px-2 py-1 text-center border border-custom w-80">Others: <i>{getData.property_other_specific}</i></td>
                ):(
                <td className="px-2 py-1 text-center border border-custom w-80">{getData.type_of_property}</td>
                )}
                <td className="px-1 py-1 text-center border border-custom w-56">{getData.property_description}</td>
                <td className="px-1 py-1 text-center border border-custom">{getData.location}</td>
                <td className="px-1 py-1 text-center border border-custom w-96">{getData.complain}</td>
                <td className="px-1 py-4 text-center border border-custom w-60">
                {getData.supervisor_approval == 0 && getData.admin_approval == 0 && (<span className="pending-status">Pending</span>)}
                {getData.supervisor_approval == 2 && getData.admin_approval == 0 && (<span className="disapproved-status">Disapproved by the Supervisor</span>)}
                {getData.supervisor_approval == 1 && getData.admin_approval == 4 && (<span className="approved-status">Approved by the Supervisor</span>)}
                {getData.supervisor_approval === 1 && getData.admin_approval == 3 && (<span className="pending-status">Pending on Admin's Approval</span>)} 
                {getData.supervisor_approval === 1 && getData.admin_approval == 2 && getData.inspector_status == 3 && (<span className="disapproved-status">Disapproved by the Admin</span>)}
                {getData.supervisor_approval === 1 && getData.admin_approval == 1 && getData.inspector_status == 3 && (<span className="approved-status">Approved by the Admin</span>)}
                {getData.admin_approval === 1 && getData.inspector_status == 2 && (<span className="checking-status">Checking</span>)}
                {getData.admin_approval === 1 && getData.inspector_status == 1 && (<span className="finish-status">Done</span>)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="px-6 py-6 text-center font-bold whitespace-nowrap">No Request for you Yet</div>
      )}
    </div>
    <div className="text-right text-sm/[17px]">
      {displayRequest?.mappedData?.length > 0 ? (
        <i>Total of <b> {displayRequest.mappedData.length} </b> Pre/Post Repair Request</i>
      ) : null}
    </div>
  </>
  )}
  </PageComponent>
  ):(
    (() => {
      window.location = '/forbidden';
      return null; // Return null to avoid any unexpected rendering
    })()
  );
}