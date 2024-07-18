import React, { useEffect, useState } from "react";
import PageComponent from "../components/PageComponent";
import axiosClient from "../axios";
import { useParams } from "react-router-dom";
import loadingAnimation from '/public/ppa_logo_animationn_v4.gif';
import { useUserStateContext } from "../context/ContextProvider";

export default function MyRequest(){

  const {id} = useParams();
  const { currentUser, userRole } = useUserStateContext();

  useEffect(() => {
    // Redirect to dashboard if pwd_change is not 1
    if (currentUser && currentUser.pwd_change === 1) {
      window.location.href = '/newpassword';
      return null;
    }
  }, [currentUser]);

   //Date Format
   function formatDate(dateString) {
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  //Time Format
  function formatTime(timeString) {
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

  const [loading, setLoading] = useState(true);
  const [displayRequest, setDisplayRequest] = useState([]);
  const [displayFacRequest, setDisplayFacRequest] = useState([]);
  const [displayRequestVehicle, setDisplayRequestVehicle] = useState([]);

  //Get all the Request on the Inspection
  const fetchInspectForm = () => {
    axiosClient
    .get(`/myinspecreq/${id}`)
    .then((response) => {
        const responseData = response.data;

        const mappedData = responseData.map((dataItem) => {
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
            supervisor_name: dataItem.supervisor_name,
            remarks: dataItem.remarks
          }
        });

        setDisplayRequest({ mappedData });
        setLoading(false);
    })
    .catch((error) => {
      setLoading(false);
        console.error('Error fetching data:', error);
    })
    .finally(() => {
      setLoading(false);
    });
  }

  // Get all the Request on the Facility
  const fetchFacilityForm = () => {
    axiosClient
    .get(`/myfacilityformrequest/${id}`)
    .then((response) => {
      const responseData = response.data;
      const viewFacilityData = responseData.view_facility;

      const mappedData = viewFacilityData.map((dataItem) => {

        const facilities = [];

        if (dataItem.mph == 1) {
          facilities.push("MPH");
        }
    
        if (dataItem.conference == 1) {
          facilities.push("Conference Room");
        }
    
        if (dataItem.dorm == 1) {
          facilities.push("Dormitory");
        }
    
        if (dataItem.other == 1) {
          facilities.push("Other");
        }

        const result = facilities.join(', ');

        return{
          id: dataItem.id,
          date_requested: dataItem.date_requested,
          request_office: dataItem.request_office,
          title_of_activity: dataItem.title_of_activity,
          date_start: dataItem.date_start,
          time_start: dataItem.time_start,
          date_end: dataItem.date_end,
          time_end: dataItem.time_end,
          facility: result,
          admin_approval: dataItem.admin_approval,
          remarks: dataItem.remarks
        }
      });

      setDisplayFacRequest({
        mappedData: mappedData
      });
      setLoading(false);
    })
    .catch((error) => {
      setLoading(false);
        console.error('Error fetching data:', error);
    });
  }

  // Get all the Request on the Vehicle Slip
  const fetchVehicleSlipForm = () => {
    axiosClient
    .get(`/myvehicleformrequest/${id}`)
    .then((response) => {
      const responseData = response.data;
      const viewVehicleSlipData = responseData.view_vehicle;
      const countPassengers = responseData.passenger_count;

      const mappedData = viewVehicleSlipData.map((dataItem, index) => {
        return{
          id: dataItem.id,
          date_requested: dataItem.date_of_request,
          purpose: dataItem.purpose,
          passenger: dataItem.passengers,
          passengerCount: countPassengers[index].passengers_count,
          place_visit: dataItem.place_visited,
          date_arrival: dataItem.date_arrival,
          time_arrival: dataItem.time_arrival,
          vehicle_type: dataItem.vehicle_type,
          driver: dataItem.driver,
          remarks: dataItem.remarks
        }
      });

      setDisplayRequestVehicle({mappedData:mappedData});
      setLoading(false);
    })
    .catch((error) => {
      setLoading(false);
        console.error('Error fetching data:', error);
    });
  }

  useEffect(()=>{
    fetchInspectForm();
    fetchFacilityForm();
    fetchVehicleSlipForm();
  },[id]);

  // Restrictions
  const UserHere = id == currentUser?.id;
  // const Authorize = (
  //   UserHere || (userRole === 'h4ck3rZ@1Oppa' || userRole === '4DmIn@Pp4' || userRole === 'Pm@PP4' || userRole === 'P3rs0nn3lz@pPa')
  // );

  return loading ? (
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
    {UserHere ? (
    <PageComponent title="My Request">

      {/* For Pre/Post Repair Inspection Form */}
      <div>
        <h2 className="text-xl font-bold leading-7 text-gray-900"> Pre/Post Repair Inspection Form </h2>
      </div>

      {/* Display Table */}
      <div className="mt-4" style={{ maxHeight: '400px', overflowY: 'auto'}}>
      {displayRequest?.mappedData?.length > 0 ? (
        <table className="ppa-table font-roboto" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">No.</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Property No</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Acquisition Date</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Acquisition Cost</th> 
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Brand/Model</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Serial/Engine No</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Type of Property</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Description </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Location </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Complain/Defect</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Approver</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Remarks</th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: '#fff' }}>
          {displayRequest?.mappedData?.map((getData) => (
            <tr key={getData.id}>
              <td className="px-3 py-2 text-center align-top font-bold w-1 table-font">{getData.id}</td>
              <td className="px-3 py-2 align-top table-font">{formatDate(getData.date_of_request)}</td>
              <td className="px-3 py-2 align-top table-font">{getData.property_number}</td>
              <td className="px-3 py-2 align-top table-font">{formatDate(getData.acq_date)}</td>
              <td className="px-3 py-2 align-top table-font">₱{getData.acq_cost}</td>
              <td className="px-3 py-2 align-top table-font">{getData.brand_model}</td>
              <td className="px-3 py-2 align-top table-font">{getData.serial_engine_no}</td>
              <td className="px-3 py-2 align-top table-font">{getData.type_of_property}</td>
              <td className="px-3 py-2 align-top table-font">{getData.property_description}</td>
              <td className="px-3 py-2 align-top text-center table-font">{getData.location}</td>
              <td className="px-3 py-2 align-top table-font">{getData.complain}</td>
              <td className="px-3 py-2 align-top table-font">{getData.supervisor_name}</td>
              <td className="px-3 py-2 align-top table-font">{getData.remarks}</td>
            </tr>
          ))}
          </tbody>
        </table>
      ):(
        <div className="px-6 py-6 text-center font-bold whitespace-nowrap border">No Request Yet</div>
      )}
      </div>
      <div className="text-right mt-2 text-sm/[17px]">
        {displayRequest?.mappedData?.length > 0 ? (
          <i>Total of <b> {displayRequest.mappedData.length} </b> Pre/Post Repair Request</i>
        ) : null}
      </div>

      {/* ------------------------------------------------------------------------------------- */}

      {/* For Facility / Venue Request Form */}
      <div className="mt-10">
        <h2 className="text-xl font-bold leading-7 text-gray-900"> Facility / Venue Form </h2>
      </div>

      {/* Display table */}
      <div className="mt-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
      {displayFacRequest?.mappedData?.length > 0 ? (
        <table className="ppa-table font-roboto" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">No.</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Title/Purpose of Activity</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date and Time of Activity (Start to End)</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Type of Facility/Venue</th>  
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Remarks</th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: '#fff' }}>
          {displayFacRequest.mappedData.map((getData) => (
            <tr key={getData.id}>
              <td className="px-3 py-2 text-center align-top font-bold border-custom w-1 table-font">{getData.id}</td>
              <td className="px-3 py-2 align-top table-font">{formatDate(getData.date_requested)}</td>
              <td className="px-3 py-2 align-top table-font">{getData.title_of_activity}</td>
              <td className="px-3 py-2 align-top w-1/4 table-font">
              {getData.date_start === getData.date_end ? (
                `${formatDate(getData.date_start)} @ ${formatTime(getData.time_start)} to ${formatTime(getData.time_end)}`
              ) : (
                `${formatDate(getData.date_start)} @ ${formatTime(getData.time_start)} to ${formatDate(getData.date_end)} @ ${formatTime(getData.time_end)}`
              )}
            </td>
            <td className="px-3 py-2 w-10 align-top w-1/5 table-font"> {getData.facility} </td>
            <td className="px-3 py-2 align-top w-1/5 table-font"> {getData.remarks} </td>
            </tr>
          ))}
          </tbody>
        </table>   
      ):(
        <div className="px-6 py-6 text-center font-bold whitespace-nowrap border">No Request Yet</div>
      )}
      </div>
      <div className="text-right mt-2 text-sm/[17px]">
        {displayFacRequest?.mappedData?.length > 0 ? (
        <i>Total of <b> {displayFacRequest?.mappedData?.length} </b> Facility / Venue Request</i>
        ):null}
      </div>

      {/* ------------------------------------------------------------------------------------- */}

      {/* For vehicle Slip Request */}
      <div className="mt-10">
        <h2 className="text-xl font-bold leading-7 text-gray-900"> Vehicle Slip Form </h2>
      </div>

      {/* Display table */}
      <div className="mt-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
      {displayRequestVehicle?.mappedData?.length > 0 ? (
        <table className="ppa-table font-roboto" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">No</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Purpose</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Visited Place</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date/Time of Arrival</th>   
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Vehicle</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Driver</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">No of Passengers</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Remarks</th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: '#fff' }}>
          {displayRequestVehicle?.mappedData?.map((getData) => (
            <tr key={getData.id}>
              <td className="px-3 py-2 align-top text-center font-bold text-base w-1 table-font">{getData.id}</td>
              <td className="px-3 py-2 align-top text-base table-font">{formatDate(getData.date_requested)}</td>
              <td className="px-3 py-2 align-top text-base table-font">{getData.purpose}</td>
              <td className="px-3 py-2 align-top text-base table-font">{getData.place_visit}</td>
              <td className="px-3 py-2 align-top text-base table-font">{formatDate(getData.date_arrival)} @ {formatTime(getData.time_arrival)}</td>
              <td className="px-3 py-2 align-top text-base table-font">
                <span dangerouslySetInnerHTML={{
                  __html: getData.vehicle_type === 'None' 
                    ? getData.vehicle_type 
                    : `<b>${getData.vehicle_type.split('=')?.[0]}</b>${getData.vehicle_type.split('=')?.[1]}`
                }} />
              </td>
              <td className="px-3 py-2 align-top w-56 text-base table-font"> {getData.driver} </td>
              <td className="px-3 py-2 align-top text-left w-20 text-base table-font">
                {getData.passenger == 'N/A' ? (getData.passenger):(getData.passengerCount)}
              </td>
              <td className="px-3 py-2 align-top w-auto text-base table-font">
                {getData.remarks}
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      ):(
        <div className="px-6 py-6 text-center font-bold whitespace-nowrap border">No Request Yet</div>
      )}
      </div>
      <div className="text-right mt-2 text-sm/[17px]">
        {displayRequestVehicle?.mappedData?.length > 0 ? (
          <i>Total of <b> {displayRequestVehicle?.mappedData?.length} </b> Vehicle Slip Request</i>
        ) : null}
      </div>

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