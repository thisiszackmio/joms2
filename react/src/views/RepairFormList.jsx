import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageComponent from "../components/PageComponent";
import axiosClient from "../axios";
import { useUserStateContext } from "../context/ContextProvider";
import loadingAnimation from '/public/ppa_logo_animationn_v4.gif';
import ReactPaginate from "react-paginate";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';

export default function RepairRequestList(){

  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  const { currentUser, userRole } = useUserStateContext();

  const [loading, setLoading] = useState(true);

  const [prePostRepair, setPrePostRepair] = useState([]);

  useEffect(() => {
    // Redirect to dashboard if pwd_change is not 1
    if (currentUser && currentUser.pwd_change === 1) {
      window.location.href = '/newpassword';
      return null;
    }
  }, [currentUser]);

  // Get All the data
  const fetchTableData = () => {
    setLoading(true); // Set loading state to true when fetching data
    axiosClient
      .get('/requestrepair')
      .then((response) => {
        const responseData = response.data;
        const getRepair = Array.isArray(responseData) ? responseData : responseData.data;

        // Map the data and set it to your state
        const mappedData = getRepair.map((dataItem) => {
          // Extract inspection form and user details from each dataItem
          const { inspection_form, user_details } = dataItem;

          // Extract user details properties
          const { fname, mname, lname } = user_details;

          // Create a mapped data object
          return {
            id: inspection_form.id,
            date: formatDate(inspection_form.date_of_request),
            property_number: inspection_form.property_number,
            type_of_property: inspection_form.type_of_property,
            property_other_specific: inspection_form.property_other_specific,
            name: fname +' ' + mname+'. ' + lname,
            complain: inspection_form.complain,
            supervisorname: inspection_form.supervisor_name,
            supervisor_approval: inspection_form.supervisor_approval,
            admin_approval: inspection_form.admin_approval,
            inspector_status: inspection_form.inspector_status,
            remarks: inspection_form.remarks
          };
        });

        // Set the mapped data to your state using setPrePostRepair
        setPrePostRepair(mappedData);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => { 
    fetchTableData(); 
  }, []);

  //Search Filter and Pagination
  const itemsPerPage = 50;
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const filteredRepairs = prePostRepair.filter((repair) =>
    repair.property_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repair.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repair.type_of_property.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repair.date.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  const currentRepair = filteredRepairs.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const pageCountRepair = Math.ceil(filteredRepairs.length / itemsPerPage);

  const displayPaginationRepair = pageCountRepair > 1;

  //Restrictions
  const Authorize = userRole == 'h4ck3rZ@1Oppa' || userRole == '4DmIn@Pp4' || userRole == 'Pm@PP4' || userRole == 'P3rs0nn3lz@pPa';

  return loading ? (
    <div className="fixed top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-center bg-white bg-opacity-100 z-50">
      <img
        className="mx-auto h-44 w-auto"
        src={loadingAnimation}
        alt="Your Company"
      />
      <span className="ml-2 animate-heartbeat">Loading Request List</span>
    </div>
  ):(
  <>
    {Authorize ? (
    <PageComponent title="Pre/Post Repair Inspection Form Request List">

      {/* Top Layer */}
      <div className="flex justify-end mb-3">
        <div className="align-right">
          {/* For Search Field */}
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearchChange}
            className="mb-4 p-2 border border-gray-300 rounded"
          />
          {/* Count for List */}
          <div className="text-right text-sm/[17px]">
            {prePostRepair.length > 0 ? (
            <i>Total of <b> {prePostRepair.length} </b> Facility/Venue Request </i>
            ):null}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="ppa-table font-roboto" style={{ width: '100%' }}>
          <thead>    
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase w-1">No</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Property No</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Type of Property</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Complain</th>   
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Requestor</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Remarks</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Action</th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: '#fff' }}>
          {currentRepair.length > 0 ? (
          currentRepair.map((repair) => (
          <tr key={repair.id}>
            <td className="px-3 py-3 text-center align-top w-1 font-bold table-font">{repair.id}</td>
            <td className="px-3 py-3 align-top table-font">{repair.date}</td>
            <td className="px-3 py-3 align-top table-font">{repair.property_number}</td>
              {repair.type_of_property === "Others" ? (
            <td className="px-3 py-3 align-top table-font">Others: <i>{repair.property_other_specific}</i></td>
            ):(
            <td className="px-3 py-3 align-top table-font">{repair.type_of_property}</td>
            )}
            <td className="px-3 py-3 align-top table-font">{repair.complain}</td>
            <td className="px-3 py-3 align-top table-font">{repair.name}</td>
            <td className="px-3 py-3 align-top table-font">
              {repair.remarks}
            </td>
            <td className="px-3 py-3 text-center w-1">
              <div className="flex justify-center">
                <Link to={`/repairinspectionform/${repair.id}`}>
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
            <td colSpan={8} className="px-6 py-4 text-center border-0 border-custom"> No data </td>
          </tr>
          )}
          </tbody>
        </table>
      </div>
      {displayPaginationRepair && (
        <ReactPaginate
          previousLabel="Previous"
          nextLabel="Next"
          breakLabel="..."
          pageCount={pageCountRepair}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageChange}
          containerClassName="pagination"
          subContainerClassName="pages pagination"
          activeClassName="active"
          pageClassName="page-item"
          pageLinkClassName="page-link"
          breakClassName="page-item"
          breakLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
        />
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