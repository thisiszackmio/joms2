import { useEffect, useState, useRef  } from "react";
import axiosClient from "../../axios";
import PageComponent from "../../components/PageComponent";
import Popup from "../../components/Popup";
import submitAnimation from '/default/ring-loading.gif';
import loadingAnimation from '/default/ppa_logo_animationn_v4.gif';
import { useUserStateContext } from "../../context/ContextProvider";

export default function AllAnnouncements(){

  const { userCode } = useUserStateContext();

  // Loading
  const [loading, setLoading] = useState(true);

  // Popup
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [selectedIdForDelete, setSelectedIdForDelete] = useState(null);
  const textareaRef = useRef(null);

  // Disable the Scroll on Popup
  useEffect(() => {
    
    // Define the classes to be added/removed
    const popupClass = 'popup-show';
    const loadingClass = 'loading-show';

    // Function to add the class to the body
    const addPopupClass = () => document.body.classList.add(popupClass);
    const addLoadingClass = () => document.body.classList.add(loadingClass);

    // Function to remove the class from the body
    const removePopupClass = () => document.body.classList.remove(popupClass);
    const removeLoadingClass = () => document.body.classList.remove(loadingClass);

    // Add or remove the class based on showPopup state
    if (showPopup) {
      addPopupClass();
    } 
    else if(loading) {
      addLoadingClass();
    }
    else {
      removePopupClass();
      removeLoadingClass();
    }

    // Cleanup function to remove the class when the component is unmounted or showPopup changes
    return () => {
      removePopupClass();
      removeLoadingClass();
    };
  }, [showPopup, loading]);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [announceList, setAnnounceList] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editedDetails, setEditedDetails] = useState('');
  const maxCharacters = 1000;

  const handleEditClick = (id, details) => {
    setEditingId(id);
    setEditedDetails(details);
  };

  const handleChange = (ev) => {
    setEditedDetails(ev.target.value);
  };

  const handleCancelClick = () => {
    setEditingId(null);
  };

  // Retrieve Data on DB
  useEffect(()=>{
    axiosClient
    .get('/showannouncements')
    .then((response) => {
      const responseData = response.data;

      const mappedData = responseData.map((dataItem) => {
        const date = new Date(dataItem.created_at);

        // Format date
        const optionsDate = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Manila' };
        const formattedDate = new Intl.DateTimeFormat('en-PH', optionsDate).format(date);

        // Format time
        const optionsTime = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true, timeZone: 'Asia/Manila' };
        const formattedTime = new Intl.DateTimeFormat('en-PH', optionsTime).format(date);

        return{
          id: dataItem.id,
          date_of_request: `${formattedDate} ${formattedTime}`,
          details: dataItem.details,
        }
      });

      setAnnounceList({mappedData});
    })
    .finally(() => {
      setLoading(false);
    });
  },[]);

  // Dev Error Text
  const DevErrorText = (
    <div>
      <p className="popup-title">Something Wrong!</p>
      <p className="popup-message">There was a problem, please contact the developer. (Error 500)</p>
    </div>
  );

  // Update Announcement
  const handleSaveClick = (event, id) => {
    event.preventDefault();
    setSubmitLoading(true);

    axiosClient
    .put(`editannouncements/${id}`,{
      details: editedDetails
    })
    .then(() => {
      setShowPopup(true);
      setPopupContent('success');
      setPopupMessage(
        <div>
          <p className="popup-title">Success</p>
          <p className="popup-message">Announcement updated successfully.</p>
        </div>
      ); 
    })
    .catch((error) => {
      //console.error(error);
      setPopupContent("error");
      setPopupMessage(DevErrorText);
      setShowPopup(true);   
    })
    .finally(() => {
      setSubmitLoading(false);
    });
  };

  // Delete Confirmation
  const handleDeleteConfirmation = (id) => {
    setSelectedIdForDelete(id);
    setShowPopup(true);
    setPopupContent('warning');
    setPopupMessage(
      <div>
        <p className="popup-title">Are you sure?</p>
        <p className="popup-message">If you delete this, it can be undone.</p>
      </div>
    );
  } 

  // Delete Announcement
  const handleDelete = () => {
    if (selectedIdForDelete === null) return;
    
    setSubmitLoading(true);

    axiosClient
    .delete(`/deleteannouncements/${selectedIdForDelete}`)
    .then(() => {
      setShowPopup(true);
      setPopupContent('success');
      setPopupMessage(
        <div>
          <p className="popup-title">Success</p>
          <p className="popup-message">Announcement deleted successfully</p>
        </div>
      );
    })
    .catch(() => {
      setPopupContent('error');
      setPopupMessage(DevErrorText);
      setShowPopup(true);
    })
    .finally(() => {
      setSubmitLoading(false);
    });
  };

  // Popup Button Function
  //Close Popup on Error
  const justClose = () => {
    setShowPopup(false);
  }

  //Close Popup on Success
  const closePopup = () => {
    setSubmitLoading(false);
    setShowPopup(false);
    window.location.reload();
  }

  // Restrictions Condition
  const ucode = userCode;
  const codes = ucode.split(',').map(code => code.trim());
  const Authorize = codes.includes("PM") || codes.includes("AM") || codes.includes("DM") || codes.includes("HACK") || codes.includes("GSO");

  return(
    Authorize ? (
      <PageComponent title="All Announcement">
        {loading ? (
          <div className="fixed top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-center bg-white bg-opacity-100 z-50">
            <img
              className="mx-auto h-44 w-auto"
              src={loadingAnimation}
              alt="Your Company"
            />
            <span className="loading-text loading-animation">
            {Array.from("Loading...").map((char, index) => (
              <span key={index} style={{ animationDelay: `${index * 0.1}s` }}>{char}</span>
            ))}
            </span>
          </div>
        ):(
        <>
          {/* Main Content */}
          <div className="font-roboto ppa-form-box">
            <div className="ppa-form-header"> Announcement List </div>
            <div style={{ padding: '6px 10px 10px 10px' }}>
              {/* Table */}
              <table className="ppa-table w-full mb-10 mt-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-1.5 py-1.5 text-center text-sm font-medium text-gray-600 uppercase">Date</th>
                    <th className="px-1.5 py-1.5 text-center text-sm w-1 font-medium text-gray-600 uppercase">Message</th>
                    <th className="px-1.5 py-1.5 text-center text-sm font-medium text-gray-600 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: '#fff' }}>
                  {announceList?.mappedData?.length > 0 ? (
                    announceList?.mappedData?.map((getData)=>(
                      <tr key={getData.id}>
                        <td className="px-4 py-3 text-center align-top w-1/4 table-font">{getData.date_of_request}</td>
                        <td className="px-4 py-3 text-left table-font">
                          {editingId === getData.id ? (
                          <>
                            <textarea
                              ref={textareaRef}
                              className="w-full ppa-form"
                              style={{ resize: "none",  overflow: "hidden" }}
                              type="text"
                              rows={3}
                              value={editedDetails}
                              onChange={handleChange}
                              maxLength={maxCharacters}
                            />
                            <p className="text-sm text-gray-500"> {maxCharacters - editedDetails.length} characters remaining </p>
                          </>
                          ):(
                            getData.details
                          )}
                        </td>
                        <td className="w-1/4">
                          <div className="flex justify-center">
                            {editingId === getData.id ? (
                            <>
                              {/* Submit */}
                              <button 
                                type="submit"
                                onClick={() => handleSaveClick(event, getData.id)}
                                className={`ml-2 py-2 px-4 ${ submitLoading ? 'process-btn' : 'btn-default' }`}
                                disabled={submitLoading}
                              >
                                {submitLoading ? (
                                  <div className="flex">
                                    <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
                                    <span className="ml-2">Loading</span>
                                  </div>
                                ):(
                                  'Submit'
                                )}
                              </button>
                              {/* Cancel */}
                              {!submitLoading && (
                                <button
                                  className="px-3 py-2 btn-cancel ml-2"
                                  onClick={handleCancelClick}
                                >
                                  Cancel
                                </button>
                              )}
                            </>
                            ):(
                            <>
                              {/* Edit Button */}
                              <button 
                                className="px-3 py-2 btn-default mr-2"
                                onClick={() => handleEditClick(getData.id, getData.details)}
                              >
                                Edit
                              </button>
                              {/* Cancel Button */}
                              <button 
                                className="px-3 py-2 btn-cancel"
                                onClick={() => handleDeleteConfirmation(getData.id)}
                              >
                                Delete
                              </button>
                            </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ):(
                    <tr>
                      <td colSpan={3} className="px-2 py-2 text-center text-sm text-gray-600">
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
        )}
        
        {/* Popup */}
        {showPopup && (
          <Popup
            popupContent={popupContent}
            popupMessage={popupMessage}
            handleDelete={handleDelete}
            justClose={justClose}
            closePopup={closePopup}
            submitLoading={submitLoading}
            submitAnimation={submitAnimation}
          />
        )}
        
      </PageComponent>
    ):(
      (() => { window.location = '/unauthorize'; return null; })()
    )
  );
}