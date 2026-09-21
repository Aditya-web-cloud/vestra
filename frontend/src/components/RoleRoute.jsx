import {
    Navigate,
    useLocation
} from "react-router-dom";

import {
    useAuth
} from "../context/AuthContext";

import "../styles/staff.css";


function RoleRoute({
    allowedRoles,
    children
}) {

    const {
        user,
        access,
        loading
    } = useAuth();


    const location =
        useLocation();


    if (loading) {

        return (

            <div className="staff-auth-loading">

                <div className="staff-auth-spinner" />

                <p>
                    Loading VESTRA...
                </p>

            </div>
        );
    }


    if (!user) {

        return (

            <Navigate
                to="/login"
                replace

                state={{
                    from:
                        location.pathname
                }}
            />
        );
    }


    const role =
        access?.role ||
        "customer";


    if (
        !allowedRoles.includes(
            role
        )
    ) {

        return (

            <Navigate
                to="/"
                replace
            />
        );
    }


    return children;
}


export default RoleRoute;                                                    