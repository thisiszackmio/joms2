import { Navigate, Outlet } from "react-router-dom";
import { userStateContext } from "../context/ContextProvider";

export default function GuestLayout(){

    const { userToken } = userStateContext();

    if(userToken){
        return <Navigate to='/' />
    }

    return(
        <div>
            <Outlet />
        </div>
    )

}