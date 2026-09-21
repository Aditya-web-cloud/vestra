import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import {
    getCurrentUser,
    getMyAccess,
    loginUser,
    registerUser,
    TOKEN_KEY
} from "../services/api";


const AuthContext =
    createContext(null);


export function AuthProvider({
    children
}) {

    const [
        user,
        setUser
    ] = useState(null);


    const [
        access,
        setAccess
    ] = useState(null);


    const [
        loading,
        setLoading
    ] = useState(true);


    // =====================================================
    // LOAD SESSION
    // =====================================================

    async function loadSession(
        token
    ) {

        try {

            const [
                currentUser,
                currentAccess
            ] = await Promise.all([
                getCurrentUser(token),
                getMyAccess(token)
            ]);


            setUser(
                currentUser
            );


            setAccess(
                currentAccess
            );


            return {
                user: currentUser,
                access: currentAccess
            };


        } catch (error) {

            localStorage.removeItem(
                TOKEN_KEY
            );


            setUser(null);
            setAccess(null);


            throw error;
        }
    }


    // =====================================================
    // INITIAL RESTORE
    // =====================================================

    useEffect(
        () => {

            async function restore() {

                const token =
                    localStorage.getItem(
                        TOKEN_KEY
                    );


                if (!token) {

                    setLoading(false);

                    return;
                }


                try {

                    await loadSession(
                        token
                    );

                } catch {

                    // Invalid/expired token
                } finally {

                    setLoading(false);
                }
            }


            restore();

        },
        []
    );


    // =====================================================
    // LOGIN
    // =====================================================

    async function login(
        username,
        password
    ) {

        const response =
            await loginUser(
                username,
                password
            );


        const token =
            response.access_token;


        if (!token) {

            throw new Error(
                "Login succeeded but no access token was returned."
            );
        }


        localStorage.setItem(
            TOKEN_KEY,
            token
        );


        const session =
            await loadSession(
                token
            );


        return session;
    }


    // =====================================================
    // REGISTER
    // =====================================================

    async function register(
        payload
    ) {

        await registerUser(
            payload
        );


        return login(
            payload.username,
            payload.password
        );
    }


    // =====================================================
    // LOGOUT
    // =====================================================

    function logout() {

        localStorage.removeItem(
            TOKEN_KEY
        );


        setUser(null);
        setAccess(null);
    }


    // =====================================================
    // REFRESH ACCESS
    // =====================================================

    async function refreshAccess() {

        const token =
            localStorage.getItem(
                TOKEN_KEY
            );


        if (!token) {

            setAccess(null);

            return null;
        }


        const nextAccess =
            await getMyAccess(
                token
            );


        setAccess(
            nextAccess
        );


        return nextAccess;
    }


    return (

        <AuthContext.Provider
            value={{
                user,
                access,
                loading,

                login,
                register,
                logout,

                refreshAccess,

                isAdmin:
                    access?.role ===
                    "admin",

                isCustomer:
                    access?.role !==
                    "admin"
            }}
        >

            {children}

        </AuthContext.Provider>
    );
}


export function useAuth() {

    const context =
        useContext(
            AuthContext
        );


    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider."
        );
    }


    return context;
}