import {
    useMemo,
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import {
    createDirectOrder,
    createPaymentOrder,
    verifyPayment,
} from "../services/api";

import {
    useAuth,
} from "../context/AuthContext";

import "../styles/checkout.css";


const BAG_KEY =
    "vestra_bag";


/* =========================================================
   STORAGE HELPERS
========================================================= */

function readArray(
    key
) {

    try {

        const value =
            JSON.parse(
                localStorage.getItem(
                    key
                )
                ||
                "[]"
            );


        return Array.isArray(
            value
        )
            ? value
            : [];

    } catch {

        return [];
    }
}


function money(
    value
) {

    return `₹${Math.round(
        Number(value) || 0
    ).toLocaleString(
        "en-IN"
    )}`;
}


/* =========================================================
   EMPTY ADDRESS
========================================================= */

const EMPTY_ADDRESS = {

    name: "",

    phone: "",

    pincode: "",

    address_line1: "",

    address_line2: "",

    city: "",

    state: "",

    type: "HOME",

};


/* =========================================================
   CHECKOUT
========================================================= */

function Checkout() {

    const navigate =
        useNavigate();


    const {
        user,
        loading: authLoading,
    } = useAuth();


    /* =====================================================
       USER ADDRESS STORAGE
    ===================================================== */

    const username =
        user?.username
        ||
        user?.email
        ||
        "guest";


    const ADDRESS_KEY =
        `vestra_addresses_${username}`;


    /* =====================================================
       STATE
    ===================================================== */

    const [
        bag,
        setBag
    ] = useState(
        () =>
            readArray(
                BAG_KEY
            )
    );


    const [
        addresses,
        setAddresses
    ] = useState(
        () =>
            readArray(
                ADDRESS_KEY
            )
    );


    const [
        selectedAddressIndex,
        setSelectedAddressIndex
    ] = useState(
        () => {

            const stored =
                readArray(
                    ADDRESS_KEY
                );


            return stored.length > 0
                ? 0
                : null;
        }
    );


    const [
        form,
        setForm
    ] = useState(
        EMPTY_ADDRESS
    );


    const [
        showAddressForm,
        setShowAddressForm
    ] = useState(
        addresses.length === 0
    );


    const [
        processing,
        setProcessing
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    const [
        paymentSuccess,
        setPaymentSuccess
    ] = useState(false);


    const [
        successOrderId,
        setSuccessOrderId
    ] = useState(null);


    const [
        paymentMethod,
        setPaymentMethod
    ] = useState("online");


    /* =====================================================
       TOTAL QUANTITY
    ===================================================== */

    const totalQuantity =
        useMemo(
            () => {

                return bag.reduce(
                    (
                        total,
                        item
                    ) => {

                        return (
                            total
                            +
                            Math.max(
                                1,
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

            },
            [bag]
        );


    /* =====================================================
       TOTAL
    ===================================================== */

    const totalAmount =
        useMemo(
            () => {

                return bag.reduce(
                    (
                        total,
                        item
                    ) => {

                        const price =
                            Number(
                                item.price
                            )
                            ||
                            0;


                        const quantity =
                            Math.max(
                                1,
                                Number(
                                    item.quantity
                                )
                                ||
                                1
                            );


                        return (
                            total
                            +
                            price
                            *
                            quantity
                        );

                    },
                    0
                );

            },
            [bag]
        );


    /* =====================================================
       CURRENT ADDRESS
    ===================================================== */

    const selectedAddress =
        selectedAddressIndex !== null
        &&
        addresses[
            selectedAddressIndex
        ]
            ?
            addresses[
                selectedAddressIndex
            ]
            :
            null;


    /* =====================================================
       FORM CHANGE
    ===================================================== */

    function handleChange(
        event
    ) {

        const {
            name,
            value,
        } =
            event.target;


        setForm(
            current => ({

                ...current,

                [name]:
                    value,

            })
        );
    }


    /* =====================================================
       SAVE ADDRESS
    ===================================================== */

    function saveAddress(
        event
    ) {

        event.preventDefault();


        setError("");


        if (
            !form.name.trim()
            ||
            !form.phone.trim()
            ||
            !form.pincode.trim()
            ||
            !form.address_line1.trim()
            ||
            !form.city.trim()
            ||
            !form.state.trim()
        ) {

            setError(
                "Please fill all required address fields."
            );

            return;
        }


        if (
            !/^[0-9]{10}$/.test(
                form.phone.trim()
            )
        ) {

            setError(
                "Enter a valid 10-digit mobile number."
            );

            return;
        }


        if (
            !/^[0-9]{6}$/.test(
                form.pincode.trim()
            )
        ) {

            setError(
                "Enter a valid 6-digit PIN code."
            );

            return;
        }


        const newAddress = {

            id:
                Date.now(),

            name:
                form.name.trim(),

            phone:
                form.phone.trim(),

            pincode:
                form.pincode.trim(),

            address_line1:
                form.address_line1.trim(),

            address_line2:
                form.address_line2.trim(),

            city:
                form.city.trim(),

            state:
                form.state.trim(),

            type:
                form.type
                ||
                "HOME",

        };


        const next = [

            ...addresses,

            newAddress,

        ];


        setAddresses(
            next
        );


        localStorage.setItem(
            ADDRESS_KEY,
            JSON.stringify(
                next
            )
        );


        setSelectedAddressIndex(
            next.length - 1
        );


        setForm(
            EMPTY_ADDRESS
        );


        setShowAddressForm(
            false
        );


        setError("");
    }


    /* =====================================================
       DELETE ADDRESS
    ===================================================== */

    function deleteAddress(
        index
    ) {

        const next =
            addresses.filter(
                (
                    _,
                    addressIndex
                ) =>
                    addressIndex
                    !==
                    index
            );


        setAddresses(
            next
        );


        localStorage.setItem(
            ADDRESS_KEY,
            JSON.stringify(
                next
            )
        );


        if (
            next.length === 0
        ) {

            setSelectedAddressIndex(
                null
            );


            setShowAddressForm(
                true
            );


            return;
        }


        if (
            selectedAddressIndex
            ===
            index
        ) {

            setSelectedAddressIndex(
                0
            );

        } else if (
            selectedAddressIndex
            >
            index
        ) {

            setSelectedAddressIndex(
                current =>
                    current - 1
            );
        }
    }


    /* =====================================================
       CLEAR CART AFTER SUCCESS
    ===================================================== */

    function clearCart() {

        localStorage.setItem(
            BAG_KEY,
            JSON.stringify([])
        );


        setBag([]);


        window.dispatchEvent(
            new Event(
                "vestra:bag-updated"
            )
        );
    }


    /* =====================================================
       PAYMENT
    ===================================================== */

    async function handlePayment() {

        setError("");


        /*
         * EXTRA AUTHENTICATION SAFETY
         */
        if (
            !user
        ) {

            navigate(
                "/login"
            );

            return;
        }


        if (
            bag.length === 0
        ) {

            setError(
                "Your cart is empty."
            );

            return;
        }


        if (
            !selectedAddress
        ) {

            setError(
                "Please select a delivery address."
            );

            return;
        }


        if (
            !window.Razorpay
        ) {

            setError(
                "Razorpay Checkout could not be loaded. Refresh the page and try again."
            );

            return;
        }


        const razorpayKey =
            import.meta.env
                .VITE_RAZORPAY_KEY_ID;


        if (
            paymentMethod === "online"
            &&
            !razorpayKey
        ) {

            setError(
                "Razorpay key is not configured."
            );

            return;
        }


        try {

            setProcessing(
                true
            );


            /* =============================================
               PAYMENT ITEMS
            ============================================== */

            const paymentItems =
                bag.map(
                    item => ({

                        variant_id:
                            Number(
                                item.variant_id
                            ),

                        quantity:
                            Math.max(
                                1,
                                Math.min(
                                    10,
                                    Number(
                                        item.quantity
                                    )
                                    ||
                                    1
                                )
                            ),

                    })
                );


            const hasInvalidVariant =
                paymentItems.some(
                    item =>
                        !Number.isFinite(
                            item.variant_id
                        )
                        ||
                        item.variant_id
                        <=
                        0
                );


            if (
                hasInvalidVariant
            ) {

                throw new Error(
                    "One or more cart products do not have a valid variant. Remove the affected item and add it again."
                );
            }


            /* =============================================
               SHIPPING ADDRESS
            ============================================== */

            const shippingAddress = {

                name:
                    selectedAddress.name,

                phone:
                    selectedAddress.phone,

                address_line1:
                    selectedAddress.address_line1,

                address_line2:
                    selectedAddress.address_line2
                    ||
                    "",

                city:
                    selectedAddress.city,

                state:
                    selectedAddress.state,

                pincode:
                    selectedAddress.pincode,

                type:
                    selectedAddress.type
                    ||
                    "HOME",

            };


            /* =============================================
               DIRECT / CASH ON DELIVERY ORDER
            ============================================== */

            if (
                paymentMethod === "cod"
            ) {

                const directOrder =
                    await createDirectOrder(
                        paymentItems,
                        shippingAddress,
                        "cod"
                    );

                clearCart();

                setSuccessOrderId(
                    directOrder?.id
                );

                setPaymentSuccess(
                    true
                );

                setError("");

                return;
            }


            /* =============================================
               CREATE RAZORPAY ORDER
            ============================================== */

            const paymentOrder =
                await createPaymentOrder(
                    paymentItems,
                    shippingAddress
                );


            const razorpayOrderId =
                paymentOrder?.order_id
                ||
                paymentOrder?.razorpay_order_id;


            if (
                !razorpayOrderId
            ) {

                throw new Error(
                    "Payment order ID was not returned by the backend."
                );
            }


            const amount =
                Number(
                    paymentOrder?.amount
                );


            if (
                !amount
            ) {

                throw new Error(
                    "Invalid payment amount returned by the backend."
                );
            }


            /* =============================================
               RAZORPAY OPTIONS
            ============================================== */

            const options = {

                key:
                    razorpayKey,

                amount:
                    amount,

                currency:
                    paymentOrder?.currency
                    ||
                    "INR",

                name:
                    "VESTRA",

                description:
                    "VESTRA Fashion Order",

                order_id:
                    razorpayOrderId,


                prefill: {

                    name:
                        selectedAddress.name,

                    contact:
                        selectedAddress.phone,

                    email:
                        user?.email
                        ||
                        "",

                },


                theme: {

                    color:
                        "#ff3f6c",

                },


                handler:
                    async function (
                        response
                    ) {

                        try {

                            setProcessing(
                                true
                            );


                            /* =================================
                               VERIFY PAYMENT
                            ================================== */

                            const verification =
                                await verifyPayment(
                                    response
                                );


                            const orderId =
                                verification?.order_id
                                ||
                                verification?.vestra_order_id
                                ||
                                verification?.id
                                ||
                                null;


                            clearCart();


                            setSuccessOrderId(
                                orderId
                            );


                            setPaymentSuccess(
                                true
                            );


                            setError("");

                        } catch (
                            verificationError
                        ) {

                            console.error(
                                "Payment verification error:",
                                verificationError
                            );


                            setError(
                                verificationError?.message
                                ||
                                "Payment verification failed."
                            );

                        } finally {

                            setProcessing(
                                false
                            );
                        }
                    },


                modal: {

                    ondismiss:
                        function () {

                            setProcessing(
                                false
                            );
                        },

                },

            };


            const razorpay =
                new window.Razorpay(
                    options
                );


            razorpay.on(
                "payment.failed",
                function (
                    response
                ) {

                    console.error(
                        "Razorpay payment failed:",
                        response
                    );


                    setProcessing(
                        false
                    );


                    setError(
                        response?.error?.description
                        ||
                        "Payment failed. Please try again."
                    );
                }
            );


            razorpay.open();


            setProcessing(
                false
            );

        } catch (
            paymentError
        ) {

            console.error(
                "Checkout payment error:",
                paymentError
            );


            setProcessing(
                false
            );


            /*
             * If FastAPI replies 401,
             * send customer to login.
             */
            const message =
                paymentError?.message
                ||
                "Unable to start payment.";


            if (
                message
                    .toLowerCase()
                    .includes(
                        "not authenticated"
                    )
                ||
                message.includes(
                    "401"
                )
            ) {

                setError(
                    "Your login session has expired. Please sign in again."
                );


                return;
            }


            setError(
                message
            );
        }
    }


    /* =====================================================
       AUTH LOADING
    ===================================================== */

    if (
        authLoading
    ) {

        return (

            <main
                className="checkout-page"
            >

                <div
                    className="checkout-empty"
                >

                    <h1>
                        Loading checkout...
                    </h1>

                </div>

            </main>

        );
    }


    /* =====================================================
       NOT LOGGED IN
    ===================================================== */

    if (
        !user
    ) {

        return (

            <main
                className="checkout-page"
            >

                <div
                    className="checkout-login-required"
                >

                    <div
                        className="checkout-login-icon"
                    >
                        V
                    </div>


                    <h1>
                        Login to continue
                    </h1>


                    <p>
                        You need to sign in before placing your VESTRA order.
                    </p>


                    <Link
                        to="/login"
                        className="checkout-login-button"
                    >
                        LOGIN
                    </Link>


                    <Link
                        to="/cart"
                        className="checkout-back-cart"
                    >
                        ← BACK TO CART
                    </Link>

                </div>

            </main>

        );
    }


    /* =====================================================
       SUCCESS
    ===================================================== */

    if (
        paymentSuccess
    ) {

        return (

            <main
                className="checkout-page"
            >

                <div
                    className="checkout-success"
                >

                    <div
                        className="checkout-success-icon"
                    >
                        ✓
                    </div>


                    <h1>
                        Order Confirmed
                    </h1>


                    <p>
                        Your payment has been verified and your VESTRA order has been placed successfully.
                    </p>


                    {
                        successOrderId
                        &&
                        (

                            <span>

                                Order ID:
                                {" "}

                                <strong>
                                    #{
                                        successOrderId
                                    }
                                </strong>

                            </span>

                        )
                    }


                    <div
                        className="checkout-success-actions"
                    >

                        <Link
                            to="/orders"
                        >
                            VIEW ORDERS
                        </Link>


                        <Link
                            to="/products"
                        >
                            CONTINUE SHOPPING
                        </Link>

                    </div>

                </div>

            </main>

        );
    }


    /* =====================================================
       EMPTY CART
    ===================================================== */

    if (
        bag.length === 0
    ) {

        return (

            <main
                className="checkout-page"
            >

                <div
                    className="checkout-empty"
                >

                    <h1>
                        Your cart is empty
                    </h1>


                    <p>
                        Add some products before proceeding to checkout.
                    </p>


                    <Link
                        to="/products"
                    >
                        SHOP NOW
                    </Link>

                </div>

            </main>

        );
    }


    /* =====================================================
       CHECKOUT UI
    ===================================================== */

    return (

        <main
            className="checkout-page"
        >

            {/* =================================================
                PROGRESS
            ================================================== */}

            <div
                className="checkout-progress"
            >

                <span>
                    CART
                </span>


                <b />


                <strong>
                    ADDRESS
                </strong>


                <b />


                <em>
                    PAYMENT
                </em>

            </div>


            <div
                className="checkout-layout"
            >

                {/* =================================================
                    ADDRESS AREA
                ================================================== */}

                <section
                    className="checkout-left"
                >

                    <div
                        className="checkout-address-heading"
                    >

                        <h1>
                            Select Delivery Address
                        </h1>


                        {
                            addresses.length > 0
                            &&
                            (

                                <button
                                    type="button"

                                    onClick={
                                        () => {

                                            setShowAddressForm(
                                                current =>
                                                    !current
                                            );


                                            setError("");
                                        }
                                    }
                                >
                                    + ADD NEW ADDRESS
                                </button>

                            )
                        }

                    </div>


                    {/* =============================================
                        SAVED ADDRESSES
                    ============================================== */}

                    {
                        addresses.length > 0
                        &&
                        (

                            <div
                                className="checkout-saved-addresses"
                            >

                                <h2>
                                    DEFAULT ADDRESS
                                </h2>


                                {
                                    addresses.map(
                                        (
                                            address,
                                            index
                                        ) => {

                                            const active =
                                                selectedAddressIndex
                                                ===
                                                index;


                                            return (

                                                <article
                                                    key={
                                                        address.id
                                                        ||
                                                        index
                                                    }

                                                    className={
                                                        active
                                                            ?
                                                            "checkout-address-card active"
                                                            :
                                                            "checkout-address-card"
                                                    }

                                                    onClick={
                                                        () =>
                                                            setSelectedAddressIndex(
                                                                index
                                                            )
                                                    }
                                                >

                                                    <div
                                                        className="checkout-address-radio"
                                                    >
                                                        <span />
                                                    </div>


                                                    <div
                                                        className="checkout-address-content"
                                                    >

                                                        <div
                                                            className="checkout-address-name"
                                                        >

                                                            <strong>
                                                                {
                                                                    address.name
                                                                }
                                                            </strong>


                                                            <em>
                                                                {
                                                                    address.type
                                                                    ||
                                                                    "HOME"
                                                                }
                                                            </em>

                                                        </div>


                                                        <p>
                                                            {
                                                                address.address_line1
                                                            }

                                                            {
                                                                address.address_line2
                                                                &&
                                                                `, ${address.address_line2}`
                                                            }
                                                        </p>


                                                        <p>

                                                            {
                                                                address.city
                                                            }
                                                            ,
                                                            {" "}
                                                            {
                                                                address.state
                                                            }
                                                            {" - "}
                                                            {
                                                                address.pincode
                                                            }

                                                        </p>


                                                        <p
                                                            className="checkout-phone"
                                                        >

                                                            Mobile:
                                                            {" "}

                                                            <strong>
                                                                {
                                                                    address.phone
                                                                }
                                                            </strong>

                                                        </p>


                                                        <div
                                                            className="checkout-address-delivery"
                                                        >

                                                            <span>
                                                                ✓
                                                            </span>

                                                            Pay online securely with Razorpay

                                                        </div>


                                                        <div
                                                            className="checkout-address-actions"
                                                        >

                                                            <button
                                                                type="button"

                                                                onClick={
                                                                    event => {

                                                                        event.stopPropagation();


                                                                        deleteAddress(
                                                                            index
                                                                        );
                                                                    }
                                                                }
                                                            >
                                                                REMOVE
                                                            </button>

                                                        </div>

                                                    </div>

                                                </article>

                                            );
                                        }
                                    )
                                }

                            </div>

                        )
                    }


                    {/* =============================================
                        ADDRESS FORM
                    ============================================== */}

                    {
                        showAddressForm
                        &&
                        (

                            <form
                                className="checkout-address-form"

                                onSubmit={
                                    saveAddress
                                }
                            >

                                <h2>
                                    CONTACT DETAILS
                                </h2>


                                <div
                                    className="checkout-form-grid"
                                >

                                    <label>

                                        <span>
                                            Name *
                                        </span>


                                        <input
                                            type="text"

                                            name="name"

                                            value={
                                                form.name
                                            }

                                            onChange={
                                                handleChange
                                            }

                                            placeholder="Full name"
                                        />

                                    </label>


                                    <label>

                                        <span>
                                            Mobile No *
                                        </span>


                                        <input
                                            type="tel"

                                            name="phone"

                                            value={
                                                form.phone
                                            }

                                            onChange={
                                                handleChange
                                            }

                                            placeholder="10-digit mobile number"

                                            maxLength={10}
                                        />

                                    </label>

                                </div>


                                <h2>
                                    ADDRESS
                                </h2>


                                <div
                                    className="checkout-form-grid"
                                >

                                    <label>

                                        <span>
                                            PIN Code *
                                        </span>


                                        <input
                                            type="text"

                                            name="pincode"

                                            value={
                                                form.pincode
                                            }

                                            onChange={
                                                handleChange
                                            }

                                            placeholder="6-digit PIN code"

                                            maxLength={6}
                                        />

                                    </label>


                                    <label>

                                        <span>
                                            City *
                                        </span>


                                        <input
                                            type="text"

                                            name="city"

                                            value={
                                                form.city
                                            }

                                            onChange={
                                                handleChange
                                            }

                                            placeholder="City"
                                        />

                                    </label>


                                    <label
                                        className="checkout-full-field"
                                    >

                                        <span>
                                            Address *
                                        </span>


                                        <input
                                            type="text"

                                            name="address_line1"

                                            value={
                                                form.address_line1
                                            }

                                            onChange={
                                                handleChange
                                            }

                                            placeholder="House No, Building, Street, Area"
                                        />

                                    </label>


                                    <label
                                        className="checkout-full-field"
                                    >

                                        <span>
                                            Locality / Landmark
                                        </span>


                                        <input
                                            type="text"

                                            name="address_line2"

                                            value={
                                                form.address_line2
                                            }

                                            onChange={
                                                handleChange
                                            }

                                            placeholder="Locality or landmark"
                                        />

                                    </label>


                                    <label
                                        className="checkout-full-field"
                                    >

                                        <span>
                                            State *
                                        </span>


                                        <input
                                            type="text"

                                            name="state"

                                            value={
                                                form.state
                                            }

                                            onChange={
                                                handleChange
                                            }

                                            placeholder="State"
                                        />

                                    </label>

                                </div>


                                <div
                                    className="checkout-address-type"
                                >

                                    <span>
                                        SAVE ADDRESS AS
                                    </span>


                                    <div>

                                        <button
                                            type="button"

                                            className={
                                                form.type === "HOME"
                                                    ?
                                                    "active"
                                                    :
                                                    ""
                                            }

                                            onClick={
                                                () =>
                                                    setForm(
                                                        current => ({

                                                            ...current,

                                                            type:
                                                                "HOME",

                                                        })
                                                    )
                                            }
                                        >
                                            HOME
                                        </button>


                                        <button
                                            type="button"

                                            className={
                                                form.type === "WORK"
                                                    ?
                                                    "active"
                                                    :
                                                    ""
                                            }

                                            onClick={
                                                () =>
                                                    setForm(
                                                        current => ({

                                                            ...current,

                                                            type:
                                                                "WORK",

                                                        })
                                                    )
                                            }
                                        >
                                            WORK
                                        </button>

                                    </div>

                                </div>


                                <button
                                    type="submit"
                                    className="checkout-save-address"
                                >
                                    SAVE ADDRESS
                                </button>

                            </form>

                        )
                    }


                    {
                        error
                        &&
                        (

                            <div
                                className="checkout-error"
                            >
                                {
                                    error
                                }
                            </div>

                        )
                    }

                </section>


                {/* =================================================
                    PRICE SUMMARY
                ================================================== */}

                <aside
                    className="checkout-summary"
                >

                    <h2>

                        PRICE DETAILS ({
                            totalQuantity
                        } {
                            totalQuantity === 1
                                ?
                                "Item"
                                :
                                "Items"
                        })

                    </h2>


                    <div
                        className="checkout-summary-row"
                    >

                        <span>
                            Total MRP
                        </span>


                        <strong>
                            {
                                money(
                                    totalAmount
                                )
                            }
                        </strong>

                    </div>


                    <div
                        className="checkout-summary-row"
                    >

                        <span>
                            Discount on MRP
                        </span>


                        <strong
                            className="checkout-green"
                        >
                            ₹0
                        </strong>

                    </div>


                    <div
                        className="checkout-summary-row"
                    >

                        <span>
                            Platform Fee
                        </span>


                        <strong
                            className="checkout-green"
                        >
                            FREE
                        </strong>

                    </div>


                    <div
                        className="checkout-summary-row"
                    >

                        <span>
                            Shipping Fee
                        </span>


                        <strong
                            className="checkout-green"
                        >
                            FREE
                        </strong>

                    </div>


                    <div
                        className="checkout-summary-divider"
                    />


                    <div
                        className="checkout-total"
                    >

                        <strong>
                            Total Amount
                        </strong>


                        <strong>
                            {
                                money(
                                    totalAmount
                                )
                            }
                        </strong>

                    </div>


                    {
                        selectedAddress
                        &&
                        (

                            <div
                                className="checkout-selected-summary"
                            >

                                <span>
                                    DELIVERY TO
                                </span>


                                <strong>
                                    {
                                        selectedAddress.name
                                    }
                                </strong>


                                <p>

                                    {
                                        selectedAddress.city
                                    }
                                    ,
                                    {" "}
                                    {
                                        selectedAddress.state
                                    }
                                    {" - "}
                                    {
                                        selectedAddress.pincode
                                    }

                                </p>

                            </div>

                        )
                    }


                    {/* PAYMENT METHOD SELECTOR */}
                    <div style={{ marginTop: "20px", marginBottom: "16px", padding: "16px", background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                        <span style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px" }}>
                            Payment Method
                        </span>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <label
                                onClick={() => setPaymentMethod("online")}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    padding: "12px 14px",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    border: paymentMethod === "online" ? "2px solid #ff3f6c" : "1px solid #e2e8f0",
                                    background: paymentMethod === "online" ? "rgba(255, 63, 108, 0.04)" : "#ffffff",
                                    transition: "all 0.2s ease"
                                }}
                            >
                                <input
                                    type="radio"
                                    name="payment_type"
                                    checked={paymentMethod === "online"}
                                    onChange={() => setPaymentMethod("online")}
                                    style={{ accentColor: "#ff3f6c" }}
                                />
                                <div>
                                    <strong style={{ display: "block", fontSize: "13px", color: "#0f172a" }}>Pay Online (Razorpay)</strong>
                                    <small style={{ color: "#64748b", fontSize: "11px" }}>UPI, Cards, NetBanking, Wallets</small>
                                </div>
                            </label>

                            <label
                                onClick={() => setPaymentMethod("cod")}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    padding: "12px 14px",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    border: paymentMethod === "cod" ? "2px solid #ff3f6c" : "1px solid #e2e8f0",
                                    background: paymentMethod === "cod" ? "rgba(255, 63, 108, 0.04)" : "#ffffff",
                                    transition: "all 0.2s ease"
                                }}
                            >
                                <input
                                    type="radio"
                                    name="payment_type"
                                    checked={paymentMethod === "cod"}
                                    onChange={() => setPaymentMethod("cod")}
                                    style={{ accentColor: "#ff3f6c" }}
                                />
                                <div>
                                    <strong style={{ display: "block", fontSize: "13px", color: "#0f172a" }}>Cash on Delivery</strong>
                                    <small style={{ color: "#64748b", fontSize: "11px" }}>Pay cash at your doorstep upon delivery</small>
                                </div>
                            </label>
                        </div>
                    </div>


                    <button
                        type="button"

                        className="checkout-pay-button"

                        disabled={
                            processing
                            ||
                            !selectedAddress
                        }

                        onClick={
                            handlePayment
                        }
                    >

                        {
                            processing
                                ?
                                "PROCESSING ORDER..."
                                :
                                paymentMethod === "cod"
                                    ?
                                    `PLACE ORDER • ${money(
                                        totalAmount
                                    )} (COD)`
                                    :
                                    `PAY ${money(
                                        totalAmount
                                    )}`
                        }

                    </button>


                    {
                        !selectedAddress
                        &&
                        (

                            <p
                                className="checkout-select-warning"
                            >
                                Select or add a delivery address to continue.
                            </p>

                        )
                    }


                    <div
                        className="checkout-secure"
                    >

                        <strong>
                            🔒 100% SECURE
                        </strong>


                        <span>
                            Payments powered by Razorpay
                        </span>

                    </div>

                </aside>

            </div>

        </main>

    );
}


export default Checkout;