import {
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    motion
} from "framer-motion";

import {
    useAuth
} from "../context/AuthContext";

import "../styles/auth.css";


function Login() {

    const navigate =
        useNavigate();


    const {
        login,
        logout,
        user,
        authLoading
    } = useAuth();


    const [
        form,
        setForm
    ] = useState({
        username: "",
        password: ""
    });


    const [
        showPassword,
        setShowPassword
    ] = useState(false);


    const [
        loading,
        setLoading
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    // =====================================================
    // FORM
    // =====================================================

    function updateField(
        event
    ) {

        const {
            name,
            value
        } = event.target;


        setForm(
            current => ({
                ...current,
                [name]:
                    value
            })
        );


        setError(
            ""
        );
    }


    async function handleSubmit(
        event
    ) {

        event.preventDefault();


        const username =
            form.username.trim();


        if (!username) {

            setError(
                "Enter your username."
            );

            return;
        }


        if (!form.password) {

            setError(
                "Enter your password."
            );

            return;
        }


        try {

            setLoading(
                true
            );


            setError(
                ""
            );


            await login(
                username,
                form.password
            );


            navigate(
                "/",
                {
                    replace: true
                }
            );


        } catch (err) {

            setError(
                err.message
                ||
                "Unable to sign in."
            );


        } finally {

            setLoading(
                false
            );
        }
    }


    // =====================================================
    // RESTORING SESSION
    // =====================================================

    if (authLoading) {

        return (

            <main className="auth-loading-page">

                <div className="auth-spinner" />

                <span>

                    Restoring your Apsara Trends account...

                </span>

            </main>
        );
    }


    // =====================================================
    // ALREADY LOGGED IN
    // =====================================================

    if (user) {

        return (

            <main className="auth-account-page">

                <motion.div
                    className="auth-account-card"

                    initial={{
                        opacity: 0,
                        y: 20
                    }}

                    animate={{
                        opacity: 1,
                        y: 0
                    }}
                >

                    <span className="auth-kicker">

                        YOUR APSARA TRENDS

                    </span>


                    <div className="auth-account-avatar">

                        {
                            user.name
                                ?.charAt(0)
                                .toUpperCase()
                            ||
                            "V"
                        }

                    </div>


                    <h1>

                        Welcome back,
                        <br />

                        {
                            user.name
                        }

                    </h1>


                    <p>

                        You're signed in as

                        <strong>

                            @
                            {
                                user.username
                            }

                        </strong>

                    </p>


                    <div className="auth-account-actions">

                        <button
                            type="button"

                            className="auth-primary-button"

                            onClick={
                                () =>
                                    navigate(
                                        "/"
                                    )
                            }
                        >

                            CONTINUE SHOPPING

                        </button>


                        <button
                            type="button"

                            className="auth-outline-button"

                            onClick={
                                logout
                            }
                        >

                            SIGN OUT

                        </button>

                    </div>

                </motion.div>

            </main>
        );
    }


    return (

        <main className="auth-page">

            {/* =================================================
                FORM
            ================================================== */}

            <section className="auth-form-side">

                <motion.div
                    className="auth-form-wrap"

                    initial={{
                        opacity: 0,
                        y: 25
                    }}

                    animate={{
                        opacity: 1,
                        y: 0
                    }}

                    transition={{
                        duration: 0.5
                    }}
                >

                    <Link
                        to="/"
                        className="auth-mini-logo"
                    >

                        <img
                            src="/apsara_logo.png"
                            alt="Apsara Trends - Style For Every Woman, Every Age"
                            style={{ height: "46px", objectFit: "contain", display: "block" }}
                        />

                    </Link>


                    <span className="auth-kicker">

                        WELCOME BACK

                    </span>


                    <h1>

                        Sign in to
                        <br />

                        <em>
                            your VESTRA.
                        </em>

                    </h1>


                    <p className="auth-intro">

                        Access your wishlist,
                        bag and account from
                        one place.

                    </p>


                    <form
                        className="auth-form"

                        onSubmit={
                            handleSubmit
                        }
                    >

                        {/* USERNAME */}

                        <label className="auth-field">

                            <span>

                                USERNAME

                            </span>


                            <input
                                type="text"

                                name="username"

                                placeholder=
                                    "Enter your username"

                                value={
                                    form.username
                                }

                                onChange={
                                    updateField
                                }

                                autoComplete=
                                    "username"
                            />

                        </label>


                        {/* PASSWORD */}

                        <label className="auth-field">

                            <span>

                                PASSWORD

                            </span>


                            <div className="auth-password-input">

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }

                                    name="password"

                                    placeholder=
                                        "Enter your password"

                                    value={
                                        form.password
                                    }

                                    onChange={
                                        updateField
                                    }

                                    autoComplete=
                                        "current-password"
                                />


                                <button
                                    type="button"

                                    onClick={
                                        () =>
                                            setShowPassword(
                                                current =>
                                                    !current
                                            )
                                    }
                                >

                                    {
                                        showPassword
                                            ? "HIDE"
                                            : "SHOW"
                                    }

                                </button>

                            </div>

                        </label>


                        {
                            error
                            &&
                            (

                                <div className="auth-error">

                                    <span>
                                        !
                                    </span>

                                    {
                                        error
                                    }

                                </div>

                            )
                        }


                        <button
                            type="submit"

                            className="auth-submit-button"

                            disabled={
                                loading
                            }
                        >

                            <span>

                                {
                                    loading
                                        ? "SIGNING IN..."
                                        : "SIGN IN"
                                }

                            </span>


                            <b>
                                →
                            </b>

                        </button>

                    </form>


                    <div className="auth-switch">

                        <span>

                            New to VESTRA?

                        </span>


                        <Link
                            to="/register"
                        >

                            CREATE AN ACCOUNT

                        </Link>

                    </div>


                    <div className="auth-secure-note">

                        <span>
                            ♢
                        </span>

                        Secure sign-in powered
                        by VESTRA authentication.

                    </div>

                </motion.div>

            </section>


            {/* =================================================
                EDITORIAL
            ================================================== */}

            <section className="auth-editorial-side">

                <div className="auth-editorial-overlay" />


                <img
                    src=
                        "/product-images/floral-midi-dress.jpg"

                    alt=
                        "VESTRA fashion"
                />


                <div className="auth-editorial-content">

                    <span>

                        VESTRA MEMBERS

                    </span>


                    <h2>

                        Your style,
                        <br />

                        remembered.

                    </h2>


                    <p>

                        Sign in once and keep
                        your VESTRA world close.

                    </p>


                    <div className="auth-editorial-points">

                        <div>

                            <b>
                                01
                            </b>

                            <span>
                                Save favourites
                            </span>

                        </div>


                        <div>

                            <b>
                                02
                            </b>

                            <span>
                                Manage your bag
                            </span>

                        </div>


                        <div>

                            <b>
                                03
                            </b>

                            <span>
                                Track your orders
                            </span>

                        </div>

                    </div>

                </div>


                <div className="auth-editorial-mark">

                    V

                </div>

            </section>

        </main>
    );
}


export default Login;