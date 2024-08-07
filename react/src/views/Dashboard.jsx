import React, { useEffect, useState } from "react";
import PageComponent from "../components/PageComponent";
import axiosClient from "../axios";
import { useUserStateContext } from "../context/ContextProvider";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from '@fortawesome/free-solid-svg-icons';

// To refrain return null on reloading the page
const storedUserData = JSON.parse(localStorage.getItem('USER'));

export default function Dashboard()
{
  const [isLoading , setLoading] = useState(true);
  const [isStatus, setStatus] = useState([]);
  const [isLogs, setLogs] = useState([]);
  const [isPendingTask, setPendingTask] = useState([]);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const currentMonthName = monthNames[currentMonth];

  const { currentUser } = useUserStateContext();

  useEffect(() => {
    // Redirect to dashboard if pwd_change is not 1
    if (currentUser && currentUser.pwd_change === 1) {
      window.location.href = '/newpassword';
      return null;
    }
  }, [currentUser]);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Good Morning';
    } else if (hour >= 12 && hour < 18) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  };

  // Query
  const fetchCountRequest = () => {
    axiosClient
    .get('/getcount')
    .then((response) => {
      const responseData = response.data;

      const totalInspectionReq = responseData.inspection_count;
      const totalFacilityReq = responseData.facility_count;
      const totalVehicleReq = responseData.vehicle_count;

      setStatus({
        totalInspectionReq,
        totalFacilityReq,
        totalVehicleReq,
      });
    })
    .catch((error) => {
      console.error('Error fetching Supervisor Notification data:', error);
      setLoading(false);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  // Pending Request
  const fetchPendingRequest = () => {
    axiosClient
    .get(`/getpending/${currentUser.id}`)
    .then((response) => {
      const responseData = response.data;

      const InspectionData = responseData.Inspection;
      const FacilityData = responseData.Facility;
      const VehicleData = responseData.Vehicle;

      const InspendingRequest = InspectionData 
      ? InspectionData.map((pending) => {
        return {
          id: pending.repair_id,
          remarks: pending.repair_remarks
        };
      })
      :null

      const FacPendingRequest = FacilityData
      ? FacilityData.map((facPending) => {
        return {
          id: facPending.facility_id,
          remarks: facPending.facility_remarks
        }
      })
      :null

      const VehPendingRequest = VehicleData
      ? VehicleData.map((vehpending) => {
        return {
          id: vehpending.vehicle_id,
          remarks: vehpending.vehicle_remarks
        }
      })
      :null

      //console.log(InspendingRequest);
      setPendingTask({
        InspendingRequest,
        FacPendingRequest,
        VehPendingRequest
      });
    })
    .catch((error) => {
      console.error('Error fetching Supervisor Notification data:', error);
      setLoading(false);
    })
    .finally(() => {
      setLoading(false);
    });
  }

  // Logs
  const fetchLogs = () => {
    axiosClient
    .get('/getlogs')
    .then((response) => {
      const getlogs = response.data;

      const authLogs = getlogs
      ? getlogs.map((logs) => {

        const createdAtDate = new Date(logs.created_at);
        const formattedDate = createdAtDate.toLocaleString('en-US', {
          month: 'short', 
          day: 'numeric',
          year: 'numeric', 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true, 
        });

        return {
          id: logs.id,
          remarks: logs.remarks,
          createdAt: formattedDate
        }
      })
      :null;

      setLogs(authLogs);
    })
    .catch((error) => {
      console.error('Error fetching Supervisor Notification data:', error);
      setLoading(false);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    if (currentUser && currentUser.id) {
    fetchCountRequest();
    fetchLogs();
    fetchPendingRequest();
    }
  },[currentUser]);

  return(
     <PageComponent title="Dashboard">
    {isLoading ? (
    <div className="fixed top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-center bg-white bg-opacity-100 z-50">
      <img
        className="mx-auto h-44 w-auto"
        src="ppa_logo_animationn_v4.gif"
        alt="Your Company"
      />
      <span className="ml-2 animate-heartbeat">Loading Dashboard</span>
    </div>
    ):(
    <div className="font-roboto">

      <div className="title">
      {getTimeOfDay()}! {currentUser.gender === 'Male' ? 'Sir' : 'Maam'} {currentUser.fname}
      </div>  
      
      {/* Form Count */}
      <div className="grid grid-cols-5 gap-4 mt-10">

        {/* For Inspection */}
        <div className="col-span-1 ppa-widget">
          <div className="joms-dashboard-title"> Pre/Post Repair Inspection Form </div>
          <div className="joms-count">{isStatus.totalInspectionReq}</div>
          <div className="joms-word-count">Total Count</div> 
          <Link to="/requestinspectionform">
            <div className="ppa-system-link">
              Request Form
            </div> 
          </Link> 
        </div>

        {/* For Facility */}
        <div className="col-span-1 ppa-widget">
          <div className="joms-dashboard-title"> Facility / Venue Form </div>
          <div className="joms-count">{isStatus.totalFacilityReq}</div>
          <div className="joms-word-count">Total Count</div>
          <Link to="/facilityrequestform">
            <div className="ppa-system-link">
              Request Form
            </div> 
          </Link> 
        </div>

        {/* For Vehicle */}
        <div className="col-span-1 ppa-widget">
          <div className="joms-dashboard-title"> Vehicle Slip </div>
          <div className="joms-count">{isStatus.totalVehicleReq}</div>
          <div className="joms-word-count">Total Count</div>
          <Link to="/vehiclesliprequestform">
            <div className="ppa-system-link">
              Request Form
            </div>  
          </Link>  
        </div>

        {/* For Equipment */}
        <div className="col-span-1 ppa-widget">
          <div className="joms-dashboard-title"> Equipment Form </div>
          <div className="joms-count">0</div>
          <div className="joms-word-count">Total Count</div>
          <div className="ppa-system-link"> (Coming Soon) </div>
        </div>

        {/* For Other */}
        <div className="col-span-1 ppa-widget">
          <div className="joms-dashboard-title"> Other Form Request </div>
          <div className="joms-count">0</div>
          <div className="joms-word-count">Total Count</div>
          <div className="ppa-system-link"> (Coming Soon) </div>
        </div>

      </div>

      <div className="grid grid-cols-2 gap-4 mt-10">

      {/* Pending Request */}
      <div className="col-span-1 ppa-widget" style={{ minHeight: '500px', maxHeight: '500px', overflowY: 'auto' }}>

        <div className="ppa-widget-title">Pending Request</div>

        <div className="pending-request">
        {isPendingTask?.InspendingRequest?.length > 0 || isPendingTask?.FacPendingRequest?.length > 0 || isPendingTask?.VehPendingRequest?.length > 0 ?
        (
        <>
          <table className="pending-request" style={{ width: '100%' }}>
            <tbody>

              {/* Inspection */}
              {isPendingTask?.InspendingRequest?.length > 0 && (
              <>
                <tr>
                  <td colSpan="3" className="pending-title pb-3"> Repair Inspection Request </td>
                </tr>
                {isPendingTask?.InspendingRequest?.map((InspPending) => (
                  <tr key={InspPending.id} className="border-t border-gray-300">
                    <td className="p-2">Control No. {InspPending.id}</td>
                    <td className="p-2">{InspPending.remarks}</td>
                    <td className="p-2 text-center">
                      <Link to={`/repairinspectionform/${InspPending.id}`}>
                        <button className="text-green-600 font-bold" title="View Request">
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </>
              )}

              {/* Facility */}
              {isPendingTask?.FacPendingRequest?.length > 0 && (
              <>
                <tr>
                  <td colSpan="3" className="pending-title pb-3"> Facility / Venue Request </td>
                </tr>
                {isPendingTask?.FacPendingRequest?.map((FacPending) => (
                <tr key={FacPending.id} className="border-t border-gray-300">
                  <td className="p-2">Control No. {FacPending.id}</td>
                  <td className="p-2">{FacPending.remarks}</td>
                  <td  className="p-2 text-center">
                    <Link to={`/facilityvenueform/${FacPending.id}`}>
                      <button className="text-green-600 font-bold" title="View Request">
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </Link>
                  </td>
                </tr>
                ))}
              </>
              )}

              {/* Vehicle */}
              {isPendingTask?.VehPendingRequest?.length > 0 && (
              <>
                <tr>
                  <td colSpan="3" className="pending-title pb-3"> Vehicle Slip Request </td>
                </tr>
                {isPendingTask?.VehPendingRequest?.map((VehPending) => (
                <tr key={VehPending.id} className="border-t border-gray-300">
                  <td className="p-2">Control No. {VehPending.id}</td>
                  <td className="p-2">{VehPending.remarks}</td>
                  <td className="text-center p-2">
                    <Link to={`/vehicleslipform/${VehPending.id}`}>
                      <button className="text-green-600 font-bold" title="View Request">
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </Link>
                  </td>
                </tr>
                ))}
              </>
              )}

            </tbody>
          </table>
        </>  
        ):(
          <div className="pending-title pt-3">
            No Pending Request
          </div>
        )}
        </div>

      </div>

      {/* Logs */}
      <div className="col-span-1 ppa-widget" style={{ minHeight: '500px', maxHeight: '500px', overflowY: 'auto' }}>

        <div className="ppa-widget-title">Logs (Month of {currentMonthName}) </div>

        <table className="ppa-table w-full mb-4">
          <tbody>
            {isLogs.length > 0 ? (
              isLogs.map((Logs) => (
                <tr key={Logs.id}>
                  <td className="px-1 py-2 align-top table-font text-center">{Logs.createdAt}</td>
                  <td className="px-1 py-2 align-top table-font w-9/12 pl-3">{Logs.remarks}</td>
                </tr>
              ))
            ):(
              <tr>
                <td colSpan={6} className="px-6 py-2 text-center border-0 border-custom"> No data </td>
              </tr>
            )}
          </tbody>
        </table>

      </div>

      </div>

    </div>
    )}
    
    </PageComponent>
  )
}