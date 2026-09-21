import {
    useEffect,
    useState,
} from "react";

import {
    Link,
    NavLink,
    useNavigate,
} from "react-router-dom";

import {
    useAuth
} from "../context/AuthContext";

import "../styles/navbar.css";


const menus = [

    {
        name: "WOMEN",
        link: "/products?department=Women",
        accent: "#ff3f6c",

        columns: [

            {
                title: "Indian & Fusion Wear",

                items: [
                    "Kurtas & Kurta Sets",
                    "Dresses",
                    "Tops",
                    "Jeans",
                    "Footwear",
                ],
            },

            {
                title: "Western Wear",

                items: [
                    "Dresses",
                    "Tops",
                    "Denim",
                    "Casual Wear",
                    "Sneakers",
                ],
            },

            {
                title: "Shop By Collection",

                items: [
                    "Festive Edit",
                    "New Arrivals",
                    "Trending Now",
                    "Best Sellers",
                    "Top Rated",
                ],
            },

        ],
    },

    {
        name: "KIDS",
        link: "/products?department=Kids",
        accent: "#f26a10",

        columns: [

            {
                title: "Boys Clothing",

                items: [
                    "T-Shirts",
                    "Shirts",
                    "Sets",
                    "Casual Wear",
                    "Party Wear",
                ],
            },

            {
                title: "Girls Clothing",

                items: [
                    "Dresses",
                    "Tops",
                    "Sets",
                    "Party Wear",
                    "Everyday Wear",
                ],
            },

            {
                title: "Kids Essentials",

                items: [
                    "Baby",
                    "Footwear",
                    "Sneakers",
                    "New Arrivals",
                    "Best Sellers",
                ],
            },

        ],
    },

    {
        name: "BEAUTY",
        link: "/products?department=Beauty",
        accent: "#0db7af",

        columns: [

            {
                title: "Makeup",

                items: [
                    "Lipstick",
                    "Face",
                    "Eyes",
                    "Beauty Essentials",
                    "New Arrivals",
                ],
            },

            {
                title: "Skincare",

                items: [
                    "Serums",
                    "Moisturisers",
                    "Face Care",
                    "Daily Essentials",
                    "Top Rated",
                ],
            },

            {
                title: "Fragrances",

                items: [
                    "Perfumes",
                    "Eau De Parfum",
                    "Signature Scents",
                    "Best Sellers",
                    "Gift Picks",
                ],
            },

        ],
    },

    {
        name: "JEWELLERY",
        link: "/products?department=Jewellery",
        accent: "#c59b37",

        columns: [

            {
                title: "Jewellery",

                items: [
                    "Necklaces",
                    "Earrings",
                    "Rings",
                    "Traditional Jewellery",
                    "Everyday Jewellery",
                ],
            },

            {
                title: "Collections",

                items: [
                    "Kundan",
                    "Gold Tone",
                    "Silver Tone",
                    "Festive Edit",
                    "Statement Pieces",
                ],
            },

            {
                title: "Discover",

                items: [
                    "New Arrivals",
                    "Best Sellers",
                    "Trending Now",
                    "Top Rated",
                    "Special Offers",
                ],
            },

        ],
    },

];


function readArray(
    key
) {

    try {

        const stored =
            JSON.parse(
                localStorage.getItem(
                    key
                )
                ||
                "[]"
            );


        return Array.isArray(
            stored
        )
            ? stored
            : [];

    } catch {

        return [];
    }
}


function SearchIcon() {

    return (

        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <circle
                cx="11"
                cy="11"
                r="6.5"
            />

            <path
                d="M16 16L21 21"
            />
        </svg>

    );
}


function UserIcon() {

    return (

        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <circle
                cx="12"
                cy="8"
                r="4"
            />

            <path
                d="M4.8 21c.5-4.2 3-6.4 7.2-6.4s6.7 2.2 7.2 6.4"
            />
        </svg>

    );
}


function HeartIcon() {

    return (

        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                d="
                    M20.8 4.7
                    c-2.1-2.1-5.4-2.1-7.5 0
                    L12 6
                    l-1.3-1.3
                    c-2.1-2.1-5.4-2.1-7.5 0
                    s-2.1 5.4 0 7.5
                    L12 21
                    l8.8-8.8
                    c2.1-2.1 2.1-5.4 0-7.5z
                "
            />
        </svg>

    );
}


function BagIcon() {

    return (

        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                d="
                    M5 8h14
                    l1 13H4
                    L5 8z
                "
            />

            <path
                d="
                    M9 8
                    V6
                    a3 3 0 0 1 6 0
                    v2
                "
            />
        </svg>

    );
}


function MenuIcon() {

    return (

        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
        </svg>

    );
}


function CloseIcon() {

    return (

        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="M6 6l12 12" />
            <path d="M18 6L6 18" />
        </svg>

    );
}


function Navbar() {

    const navigate =
        useNavigate();

    const {
        isAdmin
    } = useAuth();


    const [
        search,
        setSearch
    ] = useState("");


    const [
        activeMenu,
        setActiveMenu
    ] = useState(null);


    const [
        mobileOpen,
        setMobileOpen
    ] = useState(false);


    const [
        wishlistCount,
        setWishlistCount
    ] = useState(0);


    const [
        bagCount,
        setBagCount
    ] = useState(0);


    function refreshCounts() {

        const wishlist =
            readArray(
                "vestra_wishlist"
            );


        const bag =
            readArray(
                "vestra_bag"
            );


        setWishlistCount(
            wishlist.length
        );


        const quantity =
            bag.reduce(
                (
                    total,
                    item
                ) =>
                    total
                    +
                    Math.max(
                        1,
                        Number(
                            item.quantity
                        )
                        ||
                        1
                    ),
                0
            );


        setBagCount(
            quantity
        );
    }


    useEffect(
        () => {

            refreshCounts();


            const handleStorage =
                () => {
                    refreshCounts();
                };


            window.addEventListener(
                "storage",
                handleStorage
            );


            window.addEventListener(
                "focus",
                handleStorage
            );


            window.addEventListener(
                "vestra:wishlist-updated",
                handleStorage
            );


            window.addEventListener(
                "vestra:bag-updated",
                handleStorage
            );


            return () => {

                window.removeEventListener(
                    "storage",
                    handleStorage
                );


                window.removeEventListener(
                    "focus",
                    handleStorage
                );


                window.removeEventListener(
                    "vestra:wishlist-updated",
                    handleStorage
                );


                window.removeEventListener(
                    "vestra:bag-updated",
                    handleStorage
                );
            };

        },
        []
    );


    function handleSearch(
        event
    ) {

        event.preventDefault();


        const term =
            search.trim();


        if (
            !term
        ) {
            return;
        }


        navigate(
            `/products?search=${
                encodeURIComponent(
                    term
                )
            }`
        );


        setMobileOpen(
            false
        );
    }


    function handleCategoryClick(
        department,
        item
    ) {

        setActiveMenu(
            null
        );


        navigate(
            `/products?department=${
                encodeURIComponent(
                    department
                )
            }&search=${
                encodeURIComponent(
                    item
                )
            }`
        );
    }


    return (

        <>

            <header
                className="vestra-navbar"
                onMouseLeave={
                    () =>
                        setActiveMenu(
                            null
                        )
                }
            >

                <div
                    className="vestra-navbar-inner"
                >

                    {/* LOGO */}

                    <Link
                        to="/"
                        className="vestra-navbar-logo"
                        onClick={
                            () => {
                                setMobileOpen(
                                    false
                                );
                            }
                        }
                    >

                        <img
                            src="/apsara_logo.png"
                            alt="Apsara Trends - Style For Every Woman, Every Age"
                            className="apsara-nav-logo-img"
                        />

                    </Link>


                    {/* DESKTOP NAVIGATION */}

                    <nav
                        className="vestra-main-nav"
                    >

                        {
                            menus.map(
                                menu => (

                                    <div
                                        className="vestra-nav-item"
                                        key={
                                            menu.name
                                        }
                                        onMouseEnter={
                                            () =>
                                                setActiveMenu(
                                                    menu.name
                                                )
                                        }
                                    >

                                        <NavLink
                                            to={
                                                menu.link
                                            }
                                            className="vestra-nav-link"
                                            style={{
                                                "--menu-accent":
                                                    menu.accent,
                                            }}
                                        >
                                            {
                                                menu.name
                                            }
                                        </NavLink>


                                        {
                                            activeMenu
                                            ===
                                            menu.name
                                            &&
                                            (

                                                <div
                                                    className="vestra-mega-menu"
                                                >

                                                    <div
                                                        className="vestra-mega-inner"
                                                    >

                                                        {
                                                            menu.columns.map(
                                                                (
                                                                    column,
                                                                    index
                                                                ) => (

                                                                    <div
                                                                        className={
                                                                            index
                                                                            %
                                                                            2
                                                                            ===
                                                                            1
                                                                                ?
                                                                                "vestra-mega-column alt"
                                                                                :
                                                                                "vestra-mega-column"
                                                                        }
                                                                        key={
                                                                            column.title
                                                                        }
                                                                    >

                                                                        <h3
                                                                            style={{
                                                                                color:
                                                                                    menu.accent,
                                                                            }}
                                                                        >
                                                                            {
                                                                                column.title
                                                                            }
                                                                        </h3>


                                                                        {
                                                                            column.items.map(
                                                                                item => (

                                                                                    <button
                                                                                        type="button"
                                                                                        key={
                                                                                            item
                                                                                        }
                                                                                        onClick={
                                                                                            () =>
                                                                                                handleCategoryClick(
                                                                                                    menu.name,
                                                                                                    item
                                                                                                )
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            item
                                                                                        }
                                                                                    </button>

                                                                                )
                                                                            )
                                                                        }

                                                                    </div>

                                                                )
                                                            )
                                                        }


                                                        <div
                                                            className="vestra-mega-feature"
                                                        >

                                                            <span>
                                                                VESTRA EDIT
                                                            </span>

                                                            <strong>
                                                                New styles.
                                                                <br />
                                                                New season.
                                                            </strong>

                                                            <Link
                                                                to={
                                                                    menu.link
                                                                }
                                                                onClick={
                                                                    () =>
                                                                        setActiveMenu(
                                                                            null
                                                                        )
                                                                }
                                                            >
                                                                SHOP NOW →
                                                            </Link>

                                                        </div>

                                                    </div>

                                                </div>

                                            )
                                        }

                                    </div>

                                )
                            )
                        }

                    </nav>


                    {/* SEARCH */}

                    <form
                        className="vestra-navbar-search"
                        onSubmit={
                            handleSearch
                        }
                    >

                        <button
                            type="submit"
                            aria-label="Search"
                        >
                            <SearchIcon />
                        </button>


                        <input
                            type="search"
                            value={
                                search
                            }
                            onChange={
                                event =>
                                    setSearch(
                                        event.target.value
                                    )
                            }
                            placeholder="Search for products, brands and more"
                        />

                    </form>


                    {/* ACTIONS */}

                    <div
                        className="vestra-navbar-actions"
                    >

                        {
                            isAdmin
                            &&
                            (

                                <Link
                                    to="/admin"
                                    className="vestra-navbar-action"
                                    style={{
                                        color: "#ff3f6c"
                                    }}
                                >

                                    <span
                                        className="vestra-action-icon"
                                        style={{
                                            fontSize: "14px",
                                            display: "grid",
                                            placeItems: "center"
                                        }}
                                    >
                                        ⚙
                                    </span>

                                    <strong>
                                        Admin
                                    </strong>

                                </Link>

                            )
                        }


                        <Link
                            to="/profile"
                            className="vestra-navbar-action vestra-action-profile"
                        >

                            <span
                                className="vestra-action-icon"
                            >
                                <UserIcon />
                            </span>

                            <strong>
                                Profile
                            </strong>

                        </Link>


                        <Link
                            to="/wishlist"
                            className="vestra-navbar-action"
                        >

                            <span
                                className="vestra-action-icon"
                            >
                                <HeartIcon />

                                {
                                    wishlistCount
                                    >
                                    0
                                    &&
                                    (
                                        <em>
                                            {
                                                wishlistCount
                                            }
                                        </em>
                                    )
                                }

                            </span>

                            <strong>
                                Wishlist
                            </strong>

                        </Link>


                        <Link
                            to="/bag"
                            className="vestra-navbar-action"
                        >

                            <span
                                className="vestra-action-icon"
                            >
                                <BagIcon />

                                {
                                    bagCount
                                    >
                                    0
                                    &&
                                    (
                                        <em>
                                            {
                                                bagCount
                                            }
                                        </em>
                                    )
                                }

                            </span>

                            <strong>
                                Bag
                            </strong>

                        </Link>

                    </div>


                    {/* MOBILE BUTTON */}

                    <button
                        type="button"
                        className="vestra-mobile-toggle"
                        aria-label="Toggle menu"
                        onClick={
                            () =>
                                setMobileOpen(
                                    current =>
                                        !current
                                )
                        }
                    >

                        {
                            mobileOpen
                                ?
                                <CloseIcon />
                                :
                                <MenuIcon />
                        }

                    </button>

                </div>


                {/* MOBILE NAV */}

                {
                    mobileOpen
                    &&
                    (

                        <div
                            className="vestra-mobile-menu"
                        >

                            <form
                                className="vestra-mobile-search"
                                onSubmit={
                                    handleSearch
                                }
                            >

                                <SearchIcon />

                                <input
                                    value={
                                        search
                                    }
                                    onChange={
                                        event =>
                                            setSearch(
                                                event.target.value
                                            )
                                    }
                                    placeholder="Search products"
                                />

                            </form>


                            <div
                                className="vestra-mobile-links"
                            >

                                {
                                    menus.map(
                                        menu => (

                                            <Link
                                                to={
                                                    menu.link
                                                }
                                                key={
                                                    menu.name
                                                }
                                                onClick={
                                                    () =>
                                                        setMobileOpen(
                                                            false
                                                        )
                                                }
                                            >
                                                {
                                                    menu.name
                                                }

                                                <span>
                                                    →
                                                </span>
                                            </Link>

                                        )
                                    )
                                }

                            </div>


                            <div
                                className="vestra-mobile-actions"
                            >

                                <Link
                                    to="/profile"
                                    onClick={
                                        () =>
                                            setMobileOpen(
                                                false
                                            )
                                    }
                                >
                                    Profile
                                </Link>

                                <Link
                                    to="/wishlist"
                                    onClick={
                                        () =>
                                            setMobileOpen(
                                                false
                                            )
                                    }
                                >
                                    Wishlist ({
                                        wishlistCount
                                    })
                                </Link>

                                <Link
                                    to="/bag"
                                    onClick={
                                        () =>
                                            setMobileOpen(
                                                false
                                            )
                                    }
                                >
                                    Bag ({
                                        bagCount
                                    })
                                </Link>

                            </div>

                        </div>

                    )
                }

            </header>


            {
                activeMenu
                &&
                (
                    <div
                        className="vestra-menu-backdrop"
                    />
                )
            }

        </>

    );
}


export default Navbar;