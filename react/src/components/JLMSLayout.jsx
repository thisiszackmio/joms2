import { useEffect, useState } from "react";
import axiosClient from '../axios';
import { Link, Outlet } from "react-router-dom";
import ppaLogo from '/default/ppa_logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faBars, faSignOutAlt, faFileLines, faUserPlus, faChevronRight, faScroll } from '@fortawesome/free-solid-svg-icons';
import Footer from "./Footer";
import { useUserStateContext } from "../context/ContextProvider";
import { useNavigate } from 'react-router-dom';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function JLMSLayout() {
  const { currentUserId, setCurrentId, setUserToken, userCode, setUserCode } = useUserStateContext();

  const [activeAccordion, setActiveAccordion] = useState(null);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  const navigate = useNavigate();

  const handleToggle = (index) => {
    setActiveAccordion(index === activeAccordion ? null : index);
  };

  useEffect(() => {
    if (isSidebarMinimized) {
      setActiveAccordion(null);
    }
  }, [isSidebarMinimized, setActiveAccordion]);

  // Logout Area
  const logout = () => {
    // Perform the logout logic
    const logMessage = `${currentUserId.name} has logged out of the system.`;

    axiosClient.post('/logout', { logMessage }).then(() => {
      localStorage.removeItem('USER_ID');
      localStorage.removeItem('TOKEN');
      localStorage.removeItem('USER_CODE');
      localStorage.removeItem('loglevel');
      localStorage.removeItem('LAST_ACTIVITY');
      setUserToken(null);

      // Redirect to the login page
      navigate('/login');
    });
  };

  // Restrictions Condition
  const ucode = userCode;
  const codes = ucode.split(',').map(code => code.trim());
  const SuperAdmin = codes.includes("HACK");
  const GSOOnly = codes.includes("GSO");
  const Authorize = codes.includes("PM") || codes.includes("AM") || codes.includes("DM") || codes.includes("HACK") || codes.includes("GSO");
  const ITOnly = codes.includes("HACK");

  return (
  <>
    {/* Main Screen */}
    <div className="w-full h-full font-roboto">
      {/* Side Bar */}
      <div style={{ maxHeight: '100vh', position: 'fixed', overflowY: 'auto', overflowX: 'hidden'}} className={`w-72 bg-ppa-themecolor ppa-sidebar shadow flex transition-width duration-300 ${isSidebarMinimized ? 'sidebar-close' : 'sidebar-open'}`}>
        <div className={`transition-width duration-300 ${isSidebarMinimized ? 'minimized' : 'not-minimized'}`}>
          {/* Logo */}
          <div className="flex justify-center items-center py-4">
            <img src={ppaLogo} alt="PPA PMO/LNI" className={`transition-width duration-300 ${isSidebarMinimized ? 'w-10' : 'w-4/5 items-center'}`} />
          </div>
          {/* Title Text */}
          {!isSidebarMinimized ? (
              <div className="text-title mb-10">
                <span className="first-letter">J</span>oint <span className="first-letter">L</span>ocal <br />
                <span className="first-letter">M</span>anagement <br />
                <span className="first-letter">S</span>ystem
              </div>
          ) : (
            <div className="text-title mb-10 vertical-text">
              <span className="block first-letter text-center">J</span>
              <span className="block first-letter text-center">L</span>
              <span className="block first-letter text-center">M</span>
              <span className="block first-letter text-center">S</span>
            </div>
          )}

          {/* Nav */}
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

            {/* Report Issue */}
            {/* <li className="w-full justify-between text-white cursor-pointer items-center mb-6">
              <div className={`${isSidebarMinimized ? 'flex justify-center items-center h-full':''}`}>
                <Link className="flex items-center">
                  <FontAwesomeIcon icon={faFlag} />
                  {!isSidebarMinimized && <p className="ml-5 text-lg">Report Issue</p>}
                </Link>
              </div>
            </li> */}

            {/* Employee Details */}
            {(SuperAdmin || GSOOnly || Authorize) && (
              <li className="w-full justify-between text-white cursor-pointer items-center mb-6">
                <FontAwesomeIcon icon={faUserPlus} className={`${isSidebarMinimized ? 'flex justify-center items-center h-full icon-mini':''}`}/>
                {!isSidebarMinimized && 
                  <>
                    <input id="toggle1" type="checkbox" className="accordion-toggle" name="toggle" checked={activeAccordion === 1} onChange={() => handleToggle(1)} />
                    <label htmlFor="toggle1" className="w-full justify-between text-white cursor-pointer items-center text-lg">
                      <span className="ml-4">Employees</span>
                      <span className="absolute right-9 icon-arrow"><FontAwesomeIcon className="icon-arrow" icon={faChevronRight} /></span>
                    </label>
                  </>
                }

                {(activeAccordion === 1 || !isSidebarMinimized) && (
                  <section>
                    <ul id="menu1" className="pl-3 mt-4">
                      <li className="flex w-full justify-between text-white cursor-pointer items-center mb-4">
                        <Link to="/userlist">All Employee Lists</Link>
                      </li>
                      {SuperAdmin && (
                        <li className="flex w-full justify-between text-white cursor-pointer items-center mb-4">
                          <Link to="/addemployee">Add Employee Data</Link>
                        </li>
                      )}
                    </ul>
                  </section>
                )}
                
              </li>
            )}

            {/* Announcements */}
            {Authorize && (
              <li className="w-full justify-between text-white cursor-pointer items-center mb-6">
                <FontAwesomeIcon icon={faScroll} className={`${isSidebarMinimized ? 'flex justify-center items-center h-full icon-mini':''}`} />
                {!isSidebarMinimized && 
                  <>
                    <input id="toggle2" type="checkbox" className="accordion-toggle" name="toggle" checked={activeAccordion === 2} onChange={() => handleToggle(2)} />
                    <label htmlFor="toggle2" className="w-full justify-between text-white cursor-pointer items-center text-lg">
                      <span className="ml-4">Announcements</span>
                      <span className="absolute right-9 icon-arrow"><FontAwesomeIcon className="icon-arrow" icon={faChevronRight} /></span>
                    </label>
                  </>
                }

                {(activeAccordion === 2 || !isSidebarMinimized) && (
                  <section>
                    <ul id="menu1" className="pl-3 mt-4">
                      <li className="flex w-full justify-between text-white cursor-pointer items-center mb-4">
                        <Link to="/allannouncement">All Announcements Lists</Link>
                      </li>
                      <li className="flex w-full justify-between text-white cursor-pointer items-center mb-4">
                        <Link to="/addannouncement">Add Announcements Data</Link>
                      </li>
                    </ul>
                  </section>
                )}
                
              </li>
            )}

            {/* Logs */}
            {ITOnly && (
              <li className="w-full justify-between text-white cursor-pointer items-center mb-6">
                <div className={`${isSidebarMinimized ? 'flex justify-center items-center h-full':''}`}>
                  <Link to="/logs" className="flex items-center">
                    <FontAwesomeIcon icon={faFileLines} />
                    {!isSidebarMinimized && <p className="ml-4 text-lg">Logs</p>}
                  </Link>
                </div>
              </li>
            )}

          </ul>

          {/* Logout Area */}
          <ul className="logout-position">
            {/* Logout */}
            <li className={`w-full justify-between text-white cursor-pointer items-center mb-3 mt-3`}>
              <div className={`${isSidebarMinimized ? 'flex justify-center items-center h-full':''}`}>
                <FontAwesomeIcon icon={faSignOutAlt} />
                {!isSidebarMinimized && <a onClick={logout} className="text-base  ml-4 leading-4 text-lg">Logout</a>}
              </div>
            </li>
            {/* Account */}
            <li className={`w-full justify-between text-white cursor-pointer items-center mb-3 ${isSidebarMinimized ? 'mt-5':'mt-3'}`}>
              <div className="flex items-center">
              <img src={currentUserId?.avatar} className="ppa-display-picture" alt="" />
              {!isSidebarMinimized ? 
                <p className="text-base leading-4 text-sm">
                  <Link to="/user">{currentUserId?.name}</Link>
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

      {/* Footer */}
      <Footer />
    </div>
  </>
  );
}