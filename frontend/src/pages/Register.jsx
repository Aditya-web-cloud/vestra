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


function isStrongPassword(
    password
) {

    return (
        password.length >= 8
        &&
        /[a-z]/.test(
            password
        )
        &&
        /[A-Z]/.test(
            password
        )
        &&
        /\d/.test(
            password
        )
        &&
        /[^A-Za-z0-9]/.test(
            password
        )
    );
}


function Register() {

    const navigate =
        useNavigate();


    const {
        register,
        user,
        authLoading
    } = useAuth();


    const [
        form,
        setForm
    ] = useState({

        name: "",

        username: "",

        email: "",

        password: "",

        confirmPassword: ""
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
    // UPDATE FORM
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


    // =====================================================
    // SUBMIT
    // =====================================================

    async function handleSubmit(
        event
    ) {

        event.preventDefault();


        const name =
            form.name.trim();


        const username =
            form.username
                .trim()
                .toLowerCase();


        const email =
            form.email
                .trim()
                .toLowerCase();


        if (
            name.length < 2
        ) {

            setError(
                "Enter your full name."
            );

            return;
        }


        if (
            !/^[A-Za-z0-9_]{3,30}$/.test(
                username
            )
        ) {

            setError(
                "Username must be 3–30 characters using letters, numbers or underscores."
            );

            return;
        }


        if (
            !email
            ||
            !email.includes(
                "@"
            )
        ) {

            setError(
                "Enter a valid email address."
            );

            return;
        }


        if (
            !isStrongPassword(
                form.password
            )
        ) {

            setError(
                "Password needs at least 8 characters, uppercase, lowercase, number and special character."
            );

            return;
        }


        if (
            form.password
            !==
            form.confirmPassword
        ) {

            setError(
                "Your passwords do not match."
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


            await register({
                name,
                username,
                email,
                password:
                    form.password
            });


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
                "Unable to create your account."
            );


        } finally {

            setLoading(
                false
            );
        }
    }


    // =====================================================
    // SESSION LOADING
    // =====================================================

    if (authLoading) {

        return (

            <main className="auth-loading-page">

                <div className="auth-spinner" />

                <span>

                    Loading VESTRA...

                </span>

            </main>
        );
    }


    // =====================================================
    // ALREADY SIGNED IN
    // =====================================================

    if (user) {

        return (

            <main className="auth-account-page">

                <div className="auth-account-card">

                    <span className="auth-kicker">

                        ACCOUNT READY

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

                        You're already
                        <br />

                        signed in.

                    </h1>


                    <p>

                        Welcome back,

                        <strong>

                            {
                                user.name
                            }

                        </strong>

                    </p>


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

                </div>

            </main>
        );
    }


    return (

        <main className="auth-page auth-register-page">

            {/* =================================================
                EDITORIAL
            ================================================== */}

            <section className="auth-editorial-side auth-register-editorial">

                <div className="auth-editorial-overlay" />


                <img
                    src=
                        "/product-images/embroidered-kurta-set.jpg"

                    alt=
                        "VESTRA collection"
                />


                <div className="auth-editorial-content">

                    <span>

                        JOIN APSARA TRENDS

                    </span>


                    <h2>

                        Make Apsara Trends
                        <br />

                        yours.

                    </h2>


                    <p>

                        Create an account and
                        build a shopping experience
                        around your style.

                    </p>


                    <div className="auth-editorial-points">

                        <div>

                            <b>
                                01
                            </b>

                            <span>
                                Build your wishlist
                            </span>

                        </div>


                        <div>

                            <b>
                                02
                            </b>

                            <span>
                                Save your addresses
                            </span>

                        </div>


                        <div>

                            <b>
                                03
                            </b>

                            <span>
                                Follow every order
                            </span>

                        </div>

                    </div>

                </div>


                <div className="auth-editorial-mark">

                    V

                </div>

            </section>


            {/* =================================================
                FORM
            ================================================== */}

            <section className="auth-form-side">

                <motion.div
                    className="auth-form-wrap auth-register-form"

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

                        CREATE YOUR ACCOUNT

                    </span>


                    <h1>

                        Find your
                        <br />

                        <em>
                            VESTRA.
                        </em>

                    </h1>


                    <p className="auth-intro">

                        One account for your
                        favourites, orders,
                        addresses and more.

                    </p>


                    <form
                        className="auth-form"

                        onSubmit={
                            handleSubmit
                        }
                    >

                        <div className="auth-field-grid">

                            {/* NAME */}

                            <label className="auth-field">

                                <span>

                                    FULL NAME

                                </span>


                                <input
                                    type="text"

                                    name="name"

                                    placeholder=
                                        "Your name"

                                    value={
                                        form.name
                                    }

                                    onChange={
                                        updateField
                                    }

                                    autoComplete=
                                        "name"
                                />

                            </label>


                            {/* USERNAME */}

                            <label className="auth-field">

                                <span>

                                    USERNAME

                                </span>


                                <input
                                    type="text"

                                    name="username"

                                    placeholder=
                                        "Choose a username"

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

                        </div>


                        {/* EMAIL */}

                        <label className="auth-field">

                            <span>

                                EMAIL

                            </span>


                            <input
                                type="email"

                                name="email"

                                placeholder=
                                    "you@example.com"

                                value={
                                    form.email
                                }

                                onChange={
                                    updateField
                                }

                                autoComplete=
                                    "email"
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
                                        "Create a strong password"

                                    value={
                                        form.password
                                    }

                                    onChange={
                                        updateField
                                    }

                                    autoComplete=
                                        "new-password"
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


                        <div className="auth-password-rules">

                            <span>

                                {
                                    form.password.length >= 8
                                        ? "✓"
                                        : "○"
                                }

                                8+ characters

                            </span>


                            <span>

                                {
                                    /[A-Z]/.test(
                                        form.password
                                    )
                                        ? "✓"
                                        : "○"
                                }

                                Uppercase

                            </span>


                            <span>

                                {
                                    /\d/.test(
                                        form.password
                                    )
                                        ? "✓"
                                        : "○"
                                }

                                Number

                            </span>


                            <span>

                                {
                                    /[^A-Za-z0-9]/.test(
                                        form.password
                                    )
                                        ? "✓"
                                        : "○"
                                }

                                Special character

                            </span>

                        </div>


                        {/* CONFIRM */}

                        <label className="auth-field">

                            <span>

                                CONFIRM PASSWORD

                            </span>


                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }

                                name="confirmPassword"

                                placeholder=
                                    "Repeat your password"

                                value={
                                    form.confirmPassword
                                }

                                onChange={
                                    updateField
                                }

                                autoComplete=
                                    "new-password"
                            />

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
                                        ? "CREATING ACCOUNT..."
                                        : "CREATE ACCOUNT"
                                }

                            </span>


                            <b>
                                →
                            </b>

                        </button>

                    </form>


                    <div className="auth-switch">

                        <span>

                            Already have an account?

                        </span>


                        <Link
                            to="/login"
                        >

                            SIGN IN

                        </Link>

                    </div>

                </motion.div>

            </section>

        </main>
    );
}


export default Register;