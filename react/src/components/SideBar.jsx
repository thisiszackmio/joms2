import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import loadingAnimation from '/public/ppa_logo_animationn_v4.gif';
import ppaLogo from '/ppa_logo.png';
import { Outlet } from 'react-router';
import { useUserStateContext } from '../context/ContextProvider';
import axiosClient from '../axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faBars, faTachometerAlt, faList, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const Sidebar = () => {
  const { currentUser, setCurrentUser, setUserToken } = useUserStateContext();
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const fetchUserDetails = () => {
    axiosClient.get(`/userdetail/${currentUser.id}`)
    .then(response => {
      setIsLoading(false)
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
  }

  useEffect(()=>{
    fetchUserDetails();
  },[currentUser.id]);
  
  const handleToggle = (index) => {
    setActiveAccordion(index === activeAccordion ? null : index);
  };

  useEffect(() => {
    if (isSidebarMinimized) {
      setActiveAccordion(null);
    }
  }, [isSidebarMinimized, setActiveAccordion]);

  const navigate = useNavigate();

  const logout = () => {
    // Perform the logout logic
    axiosClient.post('/logout').then((response) => {
      setCurrentUser({});
      setUserToken(null);

      // Redirect to the login page using the navigate function
      navigate('/login');
    });
  };

  const restrictions = currentUser.code_clearance == '1' || currentUser.code_clearance == '3' || currentUser.code_clearance == '4' || currentUser.code_clearance == '10' ;
  const onlyNerd = currentUser.code_clearance == '10' ;

  return (
  <>
    {currentUser.id ? (
      <div className="w-full h-full font-roboto">
        <div>
          {/* Side Bar */}
          <div style={{ maxHeight: '100vh', position: 'fixed', overflowY: 'auto', overflowX: 'hidden'}} className={`w-72 bg-ppa-themecolor ppa-sidebar shadow flex transition-width duration-300 ${isSidebarMinimized ? 'sidebar-close' : 'sidebar-open'}`}>
            {/* <div className="px-8"> */}
            <div className={`transition-width duration-300 ${isSidebarMinimized ? 'minimized' : 'not-minimized'}`}>        
              {/* Logo */}
              <div className="flex justify-center items-center py-4">
                <img src={ppaLogo} alt="PPA PMO/LNI" className={`transition-width duration-300 ${isSidebarMinimized ? 'w-10' : 'w-4/5 items-center'}`} />
              </div>

              {!isSidebarMinimized ? (
                <div className="text-title mb-10">
                  <span className="first-letter">J</span>ob <span className="first-letter">O</span>rder <br />
                  <span className="first-letter">M</span>anagement <br />
                  <span className="first-letter">S</span>ystem
                </div>
              ) : (
                <div className="text-title mb-10 vertical-text">
                  <span className="block first-letter text-center">J</span>
                  <span className="block first-letter text-center">O</span>
                  <span className="block first-letter text-center">M</span>
                  <span className="block first-letter text-center">S</span>
                </div>
              )}

              {/* Nav */}
              {currentUser.pwd_change != 1 && (
              <>
                <ul className={`mt-10 ppa-accordion ${isSidebarMinimized ? 'nav-min':''}`}>

                  {/* Dashboard */}
                  <li className="w-full justify-between text-white cursor-pointer items-center mb-6">
                    <div className={`${isSidebarMinimized ? 'flex justify-center items-center h-full':''}`}>
                      <Link to="/" className="flex items-center">
                        <FontAwesomeIcon icon={faTachometerAlt} />
                        {!isSidebarMinimized && <p className="ml-4 text-lg">Dashboard</p>}
                      </Link>
                    </div>
                  </li>

                  {/* My Request */}
                  <li className="w-full justify-between text-white cursor-pointer items-center mb-6 mt-6">
                    <div className={`${isSidebarMinimized ? 'flex justify-center items-center h-full':''}`}>
                      <Link to={`/myrequest/${currentUser.id}`} className="flex items-center">
                        <FontAwesomeIcon icon={faList} />
                        {!isSidebarMinimized && <p className="ml-4 text-lg">My Request</p>}
                      </Link>
                    </div>
                  </li>

                  {/* Request Forms */}
                  <li className="w-full justify-between text-white cursor-pointer items-center mb-6 mt-6"> 
                    
                    <FontAwesomeIcon icon={faList} />
                    {!isSidebarMinimized && 
                    <>
                      <input id="toggle1" type="checkbox" className="accordion-toggle" name="toggle" checked={activeAccordion === 1} onChange={() => handleToggle(1)} />
                      <label htmlFor="toggle1" className="w-full justify-between text-white cursor-pointer items-center text-lg">
                        <span className="ml-4">Request Forms</span>
                        <span className="absolute right-9 icon-arrow"><FontAwesomeIcon className="icon-arrow" icon={faChevronRight} /></span>
                      </label>
                    </>
                    }
                    
                    {(activeAccordion === 1 || !isSidebarMinimized) && (
                      <section>
                        <ul id="menu1" className="pl-3 mt-4">
                          <li className="flex w-full justify-between text-white cursor-pointer items-center mb-4">
                            <Link to="/requestinspectionform">Pre/Post Repair Inspection Form</Link>
                          </li>
                          <li className="flex w-full justify-between text-white cursor-pointer items-center mb-4">
                            <Link to="/facilityrequestform">Facility / Venue Request Form</Link>
                          </li>
                          <li className="flex w-full justify-between text-white cursor-pointer items-center">
                            <Link to="/vehiclesliprequestform">Vehicle Slip Form</Link>
                          </li>
                        </ul>
                      </section>
                    )}
                  </li>

                  {restrictions && (
                  <>
                    {/* Request List */}
                    <li className="w-full justify-between text-white cursor-pointer items-center mb-6">
                      
                      <FontAwesomeIcon icon={faList} />
                      {!isSidebarMinimized && 
                      <>
                        <input id="toggle2" type="checkbox" className="accordion-toggle" name="toggle" checked={activeAccordion === 2} onChange={() => handleToggle(2)}/>
                        <label htmlFor="toggle2" className="w-full justify-between text-white cursor-pointer items-center fle text-lg">
                          <span className="ml-4">Request List</span>
                          <span className="absolute right-9 icon-arrow"><FontAwesomeIcon className="icon-arrow" icon={faChevronRight} /></span>
                        </label>
                      </>
                      }
                      
                      {(activeAccordion === 2 || !isSidebarMinimized) && (
                          <section>
                            <ul id="menu2" className="pl-3 mt-4">
                              <li className="flex w-full justify-between text-white cursor-pointer items-center mb-4">
                                <Link to="/repairrequestform">Pre/Post Repair Inspection Form</Link>
                              </li>
                              <li className="flex w-full justify-between text-white cursor-pointer items-center mb-4">
                                <Link to="/facilityvenuerequestform">Facility / Venue Request Form</Link>
                              </li>
                              <li className="flex w-full justify-between text-white cursor-pointer items-center">
                                <Link to="/vehiclesliprequestformlist">Vehicle Slip Form</Link>
                              </li>
                            </ul>
                          </section>
                        )}
                    </li>
                  </>
                  )}

                  {onlyNerd && (
                  <>
                    <li className="w-full justify-between text-white cursor-pointer items-center mb-6 mt-6">
                      
                      <FontAwesomeIcon icon={faList} />
                      {!isSidebarMinimized && 
                      <>
                        <input id="toggle3" type="checkbox" className="accordion-toggle" name="toggle" checked={activeAccordion === 3} onChange={() => handleToggle(3)} />
                        <label htmlFor="toggle3" className="w-full justify-between text-white cursor-pointer items-center fle text-lg"><span className="ml-4">Personnel</span>
                        <span className="absolute right-9 icon-arrow"><FontAwesomeIcon className="icon-arrow" icon={faChevronRight} /></span>
                        </label>
                      </>
                      }

                      {(activeAccordion === 3 || !isSidebarMinimized) && (
                          <section>
                            <ul id="menu3" className="pl-3 mt-4">
                              <li className="flex w-full justify-between text-white cursor-pointer items-center mb-4">
                                <Link to="/ppauserlist">User List</Link>
                              </li>
                              <li className="flex w-full justify-between text-white cursor-pointer items-center mb-4">
                                <Link to="/ppauserassign">Assign Personnel</Link>
                              </li>
                              <li className="flex w-full justify-between text-white cursor-pointer items-center">
                                <Link to="/pparegistration">User Registration</Link>
                              </li>
                            </ul>
                          </section>
                        )}
                    </li>
                  </>
                  )}

                </ul>
              </>
              )}

              <ul className={`buttom-nav ${currentUser.pwd_change == 1 && 'pt-8'}`}>
                <li className="w-full justify-between text-white cursor-pointer items-center mb-4">
                  <div className={`${isSidebarMinimized ? 'flex justify-center items-center h-full':''}`}>
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    {!isSidebarMinimized && <a onClick={logout} className="text-base  ml-4 leading-4 text-lg">Logout</a>}
                  </div>
                </li>
                <li className="flex w-full justify-between text-white cursor-pointer items-center mb-6">
                  <div className="flex items-center">
                  {!isSidebarMinimized ? 
                    <p className="text-base leading-4 text-sm">User:  
                      <Link to={`/ppauserdetails/${currentUser.id}`}> {currentUser.fname} {currentUser.mname}. {currentUser.lname} </Link>
                    </p> 
                  : null }  
                  </div>
                </li>
              </ul>
              
            </div>
          </div>

          {/* Main Content */}
          <div className={`ppa-content transition-width duration-300 ${isSidebarMinimized ? 'adjust-content' : ''}`}>
            <div className="ppa-hamburger">
              <button onClick={() => setIsSidebarMinimized(!isSidebarMinimized)} className="text-white">
                <FontAwesomeIcon icon={faBars} className="ham-haha" />
              </button>
            </div>
            <div style={{ minHeight: '100vh'}} className="w-full h-full content-here">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    ):(
      <div className="fixed top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-center bg-white bg-opacity-100 z-50">
        <img
          className="mx-auto h-44 w-auto"
          src={loadingAnimation}
          alt="Your Company"
        />
        <span className="ml-2 animate-heartbeat">Loading</span>
      </div>
    )}
  </>
  );
  
  
};

export default Sidebar;
