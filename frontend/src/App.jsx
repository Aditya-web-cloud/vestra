import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
    useLocation,
} from "react-router-dom";


import Navbar
    from "./components/Navbar";

import Footer
    from "./components/Footer";

import RoleRoute
    from "./components/RoleRoute";

import {
    useAuth
} from "./context/AuthContext";


import Home
    from "./pages/Home";

import Products
    from "./pages/Products";

import ProductDetails
    from "./pages/ProductDetails";

import Cart
    from "./pages/Cart";

import Login
    from "./pages/Login";

import Register
    from "./pages/Register";

import Profile
    from "./pages/Profile";

import Wishlist
    from "./pages/Wishlist";

import Addresses
    from "./pages/Adresses";

import Checkout
    from "./pages/Checkout";

import Orders
    from "./pages/Orders";

import NotFound
    from "./pages/NotFound";


import AdminDashboard
    from "./admin/AdminDashboard";


/* =========================================================
   SITE CONTENT
========================================================= */

function SiteContent() {

    const location =
        useLocation();

    const {
        user
    } = useAuth();


    /* =====================================================
       STAFF ROUTES
    ===================================================== */

    const isStaffRoute =
        location.pathname.startsWith(
            "/admin"
        );


    /* =====================================================
       FOOTER VISIBILITY
    ===================================================== */

    const hideFooterRoutes = [

        "/login",

        "/register",

        "/checkout",

        "/cart",

        "/bag",

    ];


    const hideFooter =
        Boolean(user)
        ||
        hideFooterRoutes.includes(
            location.pathname
        )
        ||
        isStaffRoute;


    return (

        <>

            {/* =================================================
                NAVBAR
            ================================================== */}

            {
                !isStaffRoute
                &&
                <Navbar />
            }


            {/* =================================================
                ROUTES
            ================================================== */}

            <Routes>

                {/* HOME */}

                <Route
                    path="/"
                    element={
                        <Home />
                    }
                />


                {/* PRODUCTS */}

                <Route
                    path="/products"
                    element={
                        <Products />
                    }
                />


                <Route
                    path="/products/:id"
                    element={
                        <ProductDetails />
                    }
                />


                {/* =================================================
                    CART
                ================================================== */}

                <Route
                    path="/cart"
                    element={
                        <Cart />
                    }
                />


                {/* OLD BAG URL SUPPORT */}

                <Route
                    path="/bag"
                    element={

                        <Navigate
                            to="/cart"
                            replace
                        />

                    }
                />


                {/* =================================================
                    AUTH
                ================================================== */}

                <Route
                    path="/login"
                    element={
                        <Login />
                    }
                />


                <Route
                    path="/register"
                    element={
                        <Register />
                    }
                />


                {/* =================================================
                    CUSTOMER ACCOUNT
                ================================================== */}

                <Route
                    path="/profile"
                    element={
                        <Profile />
                    }
                />


                <Route
                    path="/wishlist"
                    element={
                        <Wishlist />
                    }
                />


                <Route
                    path="/addresses"
                    element={
                        <Addresses />
                    }
                />


                <Route
                    path="/orders"
                    element={
                        <Orders />
                    }
                />


                {/* =================================================
                    CHECKOUT
                ================================================== */}

                <Route
                    path="/checkout"
                    element={
                        <Checkout />
                    }
                />


                {/* =================================================
                    ADMIN
                ================================================== */}

                <Route
                    path="/admin"
                    element={

                        <RoleRoute
                            allowedRoles={[
                                "admin",
                            ]}
                        >

                            <AdminDashboard />

                        </RoleRoute>

                    }
                />


                {/* =================================================
                    NOT FOUND
                ================================================== */}

                <Route
                    path="*"
                    element={
                        <NotFound />
                    }
                />

            </Routes>


            {/* =================================================
                FOOTER
            ================================================== */}

            {
                !hideFooter
                &&
                <Footer />
            }

        </>

    );
}


/* =========================================================
   APP
========================================================= */

function App() {

    return (

        <BrowserRouter>

            <SiteContent />

        </BrowserRouter>

    );
}


export default App;