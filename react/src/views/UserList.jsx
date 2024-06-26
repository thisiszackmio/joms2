import axiosClient from "../axios";
import PageComponent from "../components/PageComponent";
import React, { useEffect, useState } from "react";
import { useUserStateContext } from "../context/ContextProvider";
import loadingAnimation from '/public/ppa_logo_animationn_v4.gif';
import ReactPaginate from "react-paginate";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Link } from "react-router-dom";

export default function UserList(){

  const { userRole } = useUserStateContext();

  // Constant Variable
  const [isLoading, setIsLoading] = useState(true);
  const [users , getUsers] = useState([]);

  // Get User Details
  useEffect(()=>{
    axiosClient.get('/users')
    .then(response => {
      const usersData = response.data;

      const getUser = usersData
      ? usersData.map((users) => {
        return {
          id: users.userId,
          name: users.name,
          username: users.username,
          division: users.division,
          position: users.position,
          code: users.code_clearance,
          esig: users.esig
        }
      })
      :null;
      
      getUsers(getUser);
      setIsLoading(false);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    });
  },[]);

  // ---------- For Search Filter ---------- //
  //Search Filter and Pagination
  const itemsPerPage = 25;
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); // Reset page when searching
  };

  const filteredUser = users.filter((user) =>
    user.id.toString().includes(searchTerm.toString()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.division.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.code.toString().includes(searchTerm.toString()) ||
    user.esig.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  const currentUser = filteredUser.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const pageCountUser = Math.ceil(filteredUser.length / itemsPerPage);
  const displayPaginationUser = pageCountUser > 1;

  // Restriction
  const Authorize = userRole == 'h4ck3rZ@1Oppa';

  return isLoading ? (
    <div className="fixed top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-center bg-white bg-opacity-100 z-50">
      <img
        className="mx-auto h-44 w-auto"
        src={loadingAnimation}
        alt="Your Company"
      />
      <span className="ml-2 animate-heartbeat">Loading User List</span>
    </div>
  ):(
  <>
    {Authorize ? (
      <PageComponent title="User List">
        <div className="font-roboto content-here">

          {/* Legend */}
          <div>
            <h2 className="text-left text-sm font-bold leading-9 tracking-tight"> Legends of Code Clearance </h2>
            <td className="px-2 py-1 text-center text-sm border-r border-custom">1 - Admin Division Manager</td>
            <td className="px-2 py-1 text-center text-sm border-r border-custom">2 - Port Manager</td>
            <td className="px-2 py-1 text-center text-sm border-r border-custom">3 - GSO</td>
            <td className="px-2 py-1 text-center text-sm border-r border-custom">4 - Division Manager/Supervisor</td>
            <td className="px-2 py-1 text-center text-sm border-r border-custom">5 - Regular and COS Employee</td>
            <td className="px-2 py-1 text-center text-sm border-r border-custom">6 - Assign Personnel</td>
          </div>

          {/* Search Filter */}
          <div className="mt-10 mb-4 flex">

            {/* Search */}
            <div className="flex-grow">
              <input
                type="text"
                placeholder="Search Here"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-96 p-2 border border-gray-300 rounded text-sm"
              />
            </div>

            {/* Count */}
            <div className="ml-4" style={{ position: "relative", bottom: "-18px" }}>
              <div className="text-right text-sm/[17px]">
              Total of {users.length} user's list
              </div>
            </div>
            
          </div>

          {/* Table */}
          <table className="ppa-table w-full mb-10 mt-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-600 uppercase">Name</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-600 uppercase">Username</th>
                <th className="px-3 py-3 text-center text-sm font-medium text-gray-600 uppercase">User ID</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-600 uppercase">Position</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-600 uppercase">Division</th>
                <th className="px-3 py-3 text-center text-sm font-medium text-gray-600 uppercase">Code CLR</th>
                <th className="px-3 py-3 text-center text-sm font-medium text-gray-600 uppercase">E-sig</th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: '#fff' }}>
            {currentUser.length > 0 ? (
              currentUser.map((UserDet) => (
              <tr key={UserDet.id}>
                <td className="px-1 py-2 align-top w-64 table-font">
                  <Link to={`/ppauserdetails/${UserDet.id}`}>
                      {UserDet.name}
                  </Link>
                </td>
                <td className="px-3 py-2 align-top table-font text-left">{UserDet.username}</td>
                <td className="px-3 py-2 align-top w-12 table-font text-center italic">{UserDet.id}</td>
                <td className="px-3 py-2 align-top table-font text-left">{UserDet.position}</td>
                <td className="px-3 py-2 align-top table-font text-left">{UserDet.division}</td>
                <td className="px-3 py-2 align-top w-12 table-font text-center">{UserDet.code == 10 ? "8" : UserDet.code}</td>
                <td className="px-3 py-2 align-top w-18 table-font text-center">{UserDet.esig == "null" ? ("No Esig"):("Yes")}</td>
              </tr>
              ))
            ):(
              <tr>
                <td colSpan={7} className="px-6 py-2 text-center border-0 border-custom"> No data </td>
              </tr>
            )}
            </tbody>
            {/* Pagination */}
            {displayPaginationUser && (
              <ReactPaginate
                previousLabel={<FontAwesomeIcon icon={faChevronLeft} />}
                nextLabel={<FontAwesomeIcon icon={faChevronRight} />}
                breakLabel="..."
                pageCount={pageCountUser}
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
          </table>

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