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

import {
    orderStorageKey,
    readStorageArray
} from "../utils/accountStorage";

import "../styles/profile.css";


function readArray(
    key
) {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(
                    key
                )
                ||
                "[]"
            );


        return Array.isArray(data)
            ? data
            : [];

    } catch {

        return [];
    }
}


function Profile() {

    const navigate =
        useNavigate();


    const {
        user,
        logout,
        authLoading,
        isAdmin
    } = useAuth();


    const bag =
        readArray(
            "vestra_bag"
        );


    const wishlist =
        readArray(
            "vestra_wishlist"
        );


    const orders =
        user
            ? readStorageArray(
                orderStorageKey(
                    user
                )
            )
            : [];


    const bagCount =
        bag.reduce(
            (
                total,
                item
            ) => {

                return (
                    total
                    +
                    (
                        Number(
                            item.quantity
                        )
                        ||
                        1
                    )
                );

            },
            0
        );


    function handleLogout() {

        logout();


        navigate(
            "/",
            {
                replace: true
            }
        );
    }


    // =====================================================
    // LOADING
    // =====================================================

    if (authLoading) {

        return (

            <main className="profile-loading">

                <div className="profile-spinner" />

                <span>

                    Loading your VESTRA...

                </span>

            </main>
        );
    }


    // =====================================================
    // NOT SIGNED IN
    // =====================================================

    if (!user) {

        return (

            <main className="profile-guest-page">

                <motion.div
                    className="profile-guest-card"

                    initial={{
                        opacity: 0,
                        y: 20
                    }}

                    animate={{
                        opacity: 1,
                        y: 0
                    }}
                >

                    <span className="profile-eyebrow">

                        MY VESTRA

                    </span>


                    <div className="profile-guest-icon">

                        V

                    </div>


                    <h1>

                        Your VESTRA
                        <br />

                        starts here.

                    </h1>


                    <p>

                        Sign in to see your profile,
                        wishlist, addresses and
                        orders in one place.

                    </p>


                    <div className="profile-guest-actions">

                        <Link
                            to="/login"
                            className="profile-dark-button"
                        >

                            SIGN IN

                        </Link>


                        <Link
                            to="/register"
                            className="profile-light-button"
                        >

                            CREATE ACCOUNT

                        </Link>

                    </div>

                </motion.div>

            </main>
        );
    }


    const firstName =
        user.name
            ?.trim()
            .split(" ")[0]
        ||
        "VESTRA";


    const initial =
        user.name
            ?.charAt(0)
            .toUpperCase()
        ||
        "V";


    return (

        <main className="profile-page">

            {/* =================================================
                HERO
            ================================================== */}

            <section className="profile-hero">

                <div className="profile-hero-inner">

                    <motion.div
                        className="profile-hero-person"

                        initial={{
                            opacity: 0,
                            y: 20
                        }}

                        animate={{
                            opacity: 1,
                            y: 0
                        }}
                    >

                        <div className="profile-avatar">

                            {
                                initial
                            }

                        </div>


                        <div>

                            <span className="profile-eyebrow">

                                MY VESTRA

                            </span>


                            <h1>

                                Hello,
                                <br />

                                <em>

                                    {
                                        firstName
                                    }.

                                </em>

                            </h1>


                            <p>

                                Everything you love,
                                saved in one place.

                            </p>

                        </div>

                    </motion.div>


                    <div className="profile-hero-mark">

                        V

                    </div>

                </div>

            </section>


            {/* =================================================
                MAIN
            ================================================== */}

            <section className="profile-content">

                <div className="profile-stat-grid">

                    <Link
                        to="/wishlist"
                        className="profile-stat-card"
                    >

                        <span>
                            ♡
                        </span>


                        <strong>

                            {
                                wishlist.length
                            }

                        </strong>


                        <small>

                            SAVED ITEMS

                        </small>

                    </Link>


                    <Link
                        to="/cart"
                        className="profile-stat-card"
                    >

                        <span>
                            ♢
                        </span>


                        <strong>

                            {
                                bagCount
                            }

                        </strong>


                        <small>

                            IN YOUR BAG

                        </small>

                    </Link>


                    <Link
                        to="/orders"
                        className="profile-stat-card"
                    >

                        <span>
                            □
                        </span>


                        <strong>

                            {
                                orders.length
                            }

                        </strong>


                        <small>

                            ORDERS

                        </small>

                    </Link>


                    <Link
                        to="/addresses"
                        className="profile-stat-card"
                    >

                        <span>
                            ⌖
                        </span>


                        <strong>

                            +

                        </strong>


                        <small>

                            ADDRESSES

                        </small>

                    </Link>

                </div>


                <div className="profile-main-grid">

                    <motion.section
                        className="profile-panel"

                        initial={{
                            opacity: 0,
                            y: 20
                        }}

                        whileInView={{
                            opacity: 1,
                            y: 0
                        }}

                        viewport={{
                            once: true
                        }}
                    >

                        <div className="profile-panel-heading">

                            <div>

                                <span>

                                    ACCOUNT

                                </span>


                                <h2>

                                    Personal details

                                </h2>

                            </div>


                            <div className="profile-account-status">

                                <i />

                                ACTIVE

                            </div>

                        </div>


                        <div className="profile-detail-list">

                            <div>

                                <span>

                                    FULL NAME

                                </span>


                                <strong>

                                    {
                                        user.name
                                    }

                                </strong>

                            </div>


                            <div>

                                <span>

                                    USERNAME

                                </span>


                                <strong>

                                    @
                                    {
                                        user.username
                                    }

                                </strong>

                            </div>


                            <div>

                                <span>

                                    EMAIL

                                </span>


                                <strong>

                                    {
                                        user.email
                                    }

                                </strong>

                            </div>


                            <div>

                                <span>

                                    ACCOUNT TYPE

                                </span>


                                <strong>

                                    {
                                        user.is_admin
                                            ? "Administrator"
                                            : "VESTRA Member"
                                    }

                                </strong>

                            </div>

                        </div>


                        <p className="profile-details-note">

                            Profile editing will be
                            connected when we add the
                            account settings API.

                        </p>

                    </motion.section>


                    <motion.section
                        className="profile-panel profile-navigation-panel"

                        initial={{
                            opacity: 0,
                            y: 20
                        }}

                        whileInView={{
                            opacity: 1,
                            y: 0
                        }}

                        viewport={{
                            once: true
                        }}

                        transition={{
                            delay: 0.08
                        }}
                    >

                        <div className="profile-panel-heading">

                            <div>

                                <span>

                                    YOUR ACCOUNT

                                </span>


                                <h2>

                                    Explore

                                </h2>

                            </div>

                        </div>


                        <nav className="profile-navigation">

                            {
                                (user?.is_admin || isAdmin)
                                &&
                                (

                                    <Link
                                        to="/admin"
                                        style={{
                                            background: "#fff5f7",
                                            border: "1px solid #ffccd7"
                                        }}
                                    >

                                        <div>

                                            <span style={{ color: "#ff3f6c" }}>
                                                ⚙
                                            </span>


                                            <div>

                                                <strong style={{ color: "#ff3f6c" }}>
                                                    Admin Dashboard
                                                </strong>


                                                <small>
                                                    Manage catalogue, stock, variants and roles
                                                </small>

                                            </div>

                                        </div>


                                        <b style={{ color: "#ff3f6c" }}>
                                            →
                                        </b>

                                    </Link>

                                )
                            }


                            <Link to="/orders">

                                <div>

                                    <span>
                                        □
                                    </span>


                                    <div>

                                        <strong>

                                            Your Orders

                                        </strong>


                                        <small>

                                            Track and review
                                            purchases

                                        </small>

                                    </div>

                                </div>


                                <b>
                                    →
                                </b>

                            </Link>


                            <Link to="/wishlist">

                                <div>

                                    <span>
                                        ♡
                                    </span>


                                    <div>

                                        <strong>

                                            Wishlist

                                        </strong>


                                        <small>

                                            Your saved
                                            favourites

                                        </small>

                                    </div>

                                </div>


                                <b>
                                    →
                                </b>

                            </Link>


                            <Link to="/addresses">

                                <div>

                                    <span>
                                        ⌖
                                    </span>


                                    <div>

                                        <strong>

                                            Addresses

                                        </strong>


                                        <small>

                                            Manage delivery
                                            locations

                                        </small>

                                    </div>

                                </div>


                                <b>
                                    →
                                </b>

                            </Link>


                            <Link to="/cart">

                                <div>

                                    <span>
                                        ♢
                                    </span>


                                    <div>

                                        <strong>

                                            Shopping Bag

                                        </strong>


                                        <small>

                                            Continue your
                                            selection

                                        </small>

                                    </div>

                                </div>


                                <b>
                                    →
                                </b>

                            </Link>

                        </nav>

                    </motion.section>

                </div>


                <section className="profile-membership">

                    <div>

                        <span>

                            VESTRA MEMBER

                        </span>


                        <h2>

                            Your style.
                            <br />

                            Your space.

                        </h2>


                        <p>

                            Save what you love,
                            manage your account and
                            keep your VESTRA journey
                            together.

                        </p>

                    </div>


                    <div className="profile-membership-mark">

                        V

                    </div>

                </section>


                <div className="profile-signout">

                    <div>

                        <strong>

                            Finished for now?

                        </strong>


                        <span>

                            You can securely sign
                            out of your VESTRA
                            account.

                        </span>

                    </div>


                    <button
                        type="button"

                        onClick={
                            handleLogout
                        }
                    >

                        SIGN OUT

                    </button>

                </div>

            </section>

        </main>
    );
}


export default Profile;