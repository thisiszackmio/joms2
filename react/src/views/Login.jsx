import axiosClient from "../axios";
import submitAnimation from '../assets/loading_nobg.gif';
import { useState } from "react"
import { useUserStateContext  } from "../context/ContextProvider";

export default function Login() {

  const { setCurrentUser, setUserToken, setUserRole } = useUserStateContext ();
  const [inputErrors, setInputErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState("");

  // Submit the login
  const onSubmit = (ev) => {
    ev.preventDefault();
    
    setInputErrors({});

    setSubmitLoading(true);

    axiosClient.post("/login", {
      username: username,
      password: password
    })
    .then((response) => {
      setCurrentUser(response.data.user);
      setUserToken(response.data.token);
      setUserRole(response.data.role);

      if(data.user.pwd_change){
        //alert('New Password');
        window.location.href = '/newpassword';
      }else{
        //alert('Dashboard');
        window.location.href = '/dashboard';
      }; 

      setSubmitLoading(false);
    })
    .catch((error) => {
      const responseErrors = error.response.data;
      setInputErrors(responseErrors);
      setSubmitLoading(false);
    })
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col lg:flex-row ppa-cover" style={{ backgroundImage: "url('ppa_bg_2.png')" }}>
      <div className="lg:w-3/4 order-2 lg:order-1"></div>

      <div className="lg:w-1/4 order-1 lg:order-2 bg-white px-6 py-12 lg:px-8 ppa-col">

        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img className="mx-auto h-40 w-auto" src="ppa_logo.png" alt="Your Company" />
          <h2 className="mt-2 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Job Order Management System
          </h2>
            {inputErrors.message && (
              <div className="mt-10 bg-red-500 rounded py-2 px-3 text-center text-white">
                {inputErrors.message}
              </div>
            )}
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={onSubmit} className="space-y-6" action="#" method="POST">

            {/* Input Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
              Username
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(ev) => setUsername(ev.target.value)}
                  className="block w-full ppa-form"
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                  Password
                </label>
                <div className="text-sm">
                  <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  className="block w-full ppa-form"
                />
              </div>
            </div>

            {/* Login Button */}
            <div>
              <button type="submit" className={`px-6 py-2 w-full btn-submit ${ submitLoading && 'btn-submitting'}`} disabled={submitLoading}>
                {submitLoading ? (
                  <div className="flex w-full items-center justify-center">
                    <img src={submitAnimation} alt="Submit" className="h-5 w-5" />
                    <span className="ml-2">Processing</span>
                  </div>
                ) : (
                  'Login'
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}