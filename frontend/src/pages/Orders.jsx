import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import {
    API_URL,
    TOKEN_KEY,
    getOrderTracking,
} from "../services/api";

import {
    useAuth,
} from "../context/AuthContext";

import "../styles/orders.css";


const CART_KEY =
    "vestra_bag";


/* =========================================================
   HELPERS
========================================================= */

function money(
    value
) {

    return `₹${Math.round(
        Number(value) || 0
    ).toLocaleString(
        "en-IN"
    )}`;
}


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


function extractOrders(
    response
) {

    if (
        Array.isArray(
            response
        )
    ) {

        return response;
    }


    if (
        Array.isArray(
            response?.items
        )
    ) {

        return response.items;
    }


    if (
        Array.isArray(
            response?.orders
        )
    ) {

        return response.orders;
    }


    if (
        Array.isArray(
            response?.data
        )
    ) {

        return response.data;
    }


    return [];
}


function formatDate(
    value
) {

    if (
        !value
    ) {

        return "Date unavailable";
    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            value
        );
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}


function statusClass(
    value
) {

    const status =
        String(
            value || ""
        )
            .trim()
            .toLowerCase();


    if (
        [
            "confirmed",
            "paid",
            "delivered",
            "completed",
        ].includes(
            status
        )
    ) {

        return "success";
    }


    if (
        [
            "cancelled",
            "failed",
            "refunded",
        ].includes(
            status
        )
    ) {

        return "danger";
    }


    return "pending";
}


function readableStatus(
    value
) {

    if (
        !value
    ) {

        return "Processing";
    }


    return String(
        value
    )
        .replace(
            /_/g,
            " "
        )
        .replace(
            /\b\w/g,
            character =>
                character.toUpperCase()
        );
}


/* =========================================================
   ICONS
========================================================= */

function PackageIcon() {

    return (

        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >

            <path
                d="
                    M4 7
                    l8-4
                    l8 4
                    v10
                    l-8 4
                    l-8-4
                    V7z
                "
            />

            <path
                d="
                    M4 7
                    l8 4
                    l8-4
                "
            />

            <path
                d="
                    M12 11
                    v10
                "
            />

        </svg>

    );
}


function ArrowIcon() {

    return (

        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >

            <path
                d="M5 12h14"
            />

            <path
                d="M14 7l5 5-5 5"
            />

        </svg>

    );
}


/* =========================================================
   ORDERS PAGE
========================================================= */

function Orders() {

    const {
        user,
        loading: authLoading,
    } = useAuth();


    const [
        orders,
        setOrders
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");


    const [
        cartMessage,
        setCartMessage
    ] = useState("");

    const [trackingOrderId, setTrackingOrderId] = useState(null);
    const [trackingData, setTrackingData] = useState(null);
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [trackingError, setTrackingError] = useState("");
    const [copiedAwb, setCopiedAwb] = useState(false);
    const [lastSyncedTime, setLastSyncedTime] = useState("");

    const fetchTracking = async (orderId, isSilent = false) => {
        if (!orderId) return;
        try {
            if (!isSilent) setTrackingLoading(true);
            setTrackingError("");
            const data = await getOrderTracking(orderId);
            setTrackingData(data);
            const now = new Date();
            setLastSyncedTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        } catch (err) {
            if (!isSilent) setTrackingError(err.message || "Failed to retrieve real-time tracking telemetry.");
        } finally {
            if (!isSilent) setTrackingLoading(false);
        }
    };

    useEffect(() => {
        if (!trackingOrderId) {
            setTrackingData(null);
            setTrackingError("");
            return;
        }

        fetchTracking(trackingOrderId, false);

        // Real-time polling every 5 seconds while tracking modal is open
        const interval = setInterval(() => {
            fetchTracking(trackingOrderId, true);
        }, 5000);

        return () => clearInterval(interval);
    }, [trackingOrderId]);

    const copyAwb = (awb) => {
        if (!awb) return;
        navigator.clipboard.writeText(awb);
        setCopiedAwb(true);
        setTimeout(() => setCopiedAwb(false), 2000);
    };


    /* =====================================================
       LOAD ORDERS
    ===================================================== */

    useEffect(
        () => {

            if (
                authLoading
            ) {

                return;
            }


            if (
                !user
            ) {

                setLoading(
                    false
                );

                return;
            }


            const controller =
                new AbortController();


            async function loadOrders() {

                try {

                    setLoading(
                        true
                    );

                    setError("");


                    const token =
                        localStorage.getItem(
                            TOKEN_KEY
                        );


                    if (
                        !token
                    ) {

                        throw new Error(
                            "Your login session has expired."
                        );
                    }


                    const response =
                        await fetch(
                            `${API_URL}/orders/my`,
                            {

                                method:
                                    "GET",

                                headers: {

                                    Accept:
                                        "application/json",

                                    Authorization:
                                        `Bearer ${token}`,

                                },

                                signal:
                                    controller.signal,

                            }
                        );


                    if (
                        response.status === 401
                    ) {

                        throw new Error(
                            "Your login session has expired. Please sign in again."
                        );
                    }


                    if (
                        !response.ok
                    ) {

                        const detail =
                            await response.text();


                        throw new Error(
                            detail
                            ||
                            `Unable to load orders (${response.status}).`
                        );
                    }


                    const data =
                        await response.json();


                    const loadedOrders =
                        extractOrders(
                            data
                        );


                    setOrders(
                        loadedOrders
                    );

                } catch (
                    requestError
                ) {

                    if (
                        requestError?.name
                        ===
                        "AbortError"
                    ) {

                        return;
                    }


                    console.error(
                        "Orders request failed:",
                        requestError
                    );


                    setOrders([]);


                    setError(
                        requestError?.message
                        ||
                        "Unable to load your orders."
                    );

                } finally {

                    if (
                        !controller.signal.aborted
                    ) {

                        setLoading(
                            false
                        );
                    }
                }
            }


            loadOrders();


            return () => {

                controller.abort();
            };

        },
        [
            user,
            authLoading,
        ]
    );


    /* =====================================================
       SORT ORDERS
    ===================================================== */

    const sortedOrders =
        useMemo(
            () => {

                return [
                    ...orders
                ].sort(
                    (
                        first,
                        second
                    ) => {

                        const firstDate =
                            new Date(
                                first?.created_at
                                ||
                                0
                            ).getTime();


                        const secondDate =
                            new Date(
                                second?.created_at
                                ||
                                0
                            ).getTime();


                        return (
                            secondDate
                            -
                            firstDate
                        );
                    }
                );

            },
            [orders]
        );


    /* =====================================================
       BUY AGAIN
    ===================================================== */

    function buyAgain(
        order
    ) {

        const orderItems =
            Array.isArray(
                order?.items
            )
                ? order.items
                : [];


        const purchasable =
            orderItems.filter(
                item =>
                    Number(
                        item?.variant_id
                    ) > 0
            );


        if (
            purchasable.length === 0
        ) {

            setCartMessage(
                "These order items cannot be added to the cart again."
            );

            return;
        }


        const cart =
            readArray(
                CART_KEY
            );


        const nextCart = [
            ...cart
        ];


        purchasable.forEach(
            item => {

                const productId =
                    Number(
                        item?.product_id
                    )
                    ||
                    null;


                const variantId =
                    Number(
                        item?.variant_id
                    );


                const existingIndex =
                    nextCart.findIndex(
                        cartItem =>
                            Number(
                                cartItem?.variant_id
                            )
                            ===
                            variantId
                    );


                const quantity =
                    Math.max(
                        1,
                        Math.min(
                            10,
                            Number(
                                item?.quantity
                            )
                            ||
                            1
                        )
                    );


                if (
                    existingIndex >= 0
                ) {

                    const current =
                        Number(
                            nextCart[
                                existingIndex
                            ]?.quantity
                        )
                        ||
                        1;


                    nextCart[
                        existingIndex
                    ] = {

                        ...nextCart[
                            existingIndex
                        ],

                        quantity:
                            Math.min(
                                10,
                                current
                                +
                                quantity
                            ),

                    };


                    return;
                }


                nextCart.push({

                    product_id:
                        productId,

                    variant_id:
                        variantId,

                    name:
                        item?.product_name
                        ||
                        item?.name
                        ||
                        "VESTRA Product",

                    brand:
                        item?.brand
                        ||
                        "VESTRA",

                    image:
                        item?.image_url
                        ||
                        item?.image
                        ||
                        "/product-placeholder.png",

                    size:
                        item?.size
                        ||
                        "",

                    color:
                        item?.color
                        ||
                        "",

                    price:
                        Number(
                            item?.unit_price
                        )
                        ||
                        Number(
                            item?.price
                        )
                        ||
                        0,

                    quantity:
                        quantity,

                });

            }
        );


        localStorage.setItem(
            CART_KEY,
            JSON.stringify(
                nextCart
            )
        );


        window.dispatchEvent(
            new Event(
                "vestra:bag-updated"
            )
        );


        setCartMessage(
            "Items added to your cart."
        );


        window.setTimeout(
            () => {

                setCartMessage("");

            },
            2200
        );
    }


    /* =====================================================
       AUTH LOADING
    ===================================================== */

    if (
        authLoading
    ) {

        return (

            <main
                className="orders-page"
            >

                <div
                    className="orders-loading-state"
                >

                    <div
                        className="orders-loader"
                    />

                    <p>
                        Loading your account...
                    </p>

                </div>

            </main>

        );
    }


    /* =====================================================
       LOGIN REQUIRED
    ===================================================== */

    if (
        !user
    ) {

        return (

            <main
                className="orders-page"
            >

                <section
                    className="orders-login-state"
                >

                    <div
                        className="orders-empty-icon"
                    >
                        <PackageIcon />
                    </div>


                    <h1>
                        Login to view your orders
                    </h1>


                    <p>
                        Sign in to see your Apsara Trends purchases, payment status and order history.
                    </p>


                    <Link
                        to="/login"
                        className="orders-primary-button"
                    >
                        LOGIN
                    </Link>

                </section>

            </main>

        );
    }


    /* =====================================================
       LOADING
    ===================================================== */

    if (
        loading
    ) {

        return (

            <main
                className="orders-page"
            >

                <div
                    className="orders-shell"
                >

                    <div
                        className="orders-page-heading"
                    >

                        <h1>
                            My Orders
                        </h1>

                        <p>
                            Track and manage your purchases
                        </p>

                    </div>


                    <div
                        className="orders-skeleton-list"
                    >

                        {
                            Array.from({
                                length: 3,
                            }).map(
                                (
                                    _,
                                    index
                                ) => (

                                    <div
                                        className="orders-skeleton"
                                        key={
                                            index
                                        }
                                    />

                                )
                            )
                        }

                    </div>

                </div>

            </main>

        );
    }


    /* =====================================================
       ERROR
    ===================================================== */

    if (
        error
    ) {

        return (

            <main
                className="orders-page"
            >

                <section
                    className="orders-error-state"
                >

                    <div
                        className="orders-empty-icon"
                    >
                        <PackageIcon />
                    </div>


                    <h1>
                        Couldn&apos;t load your orders
                    </h1>


                    <p>
                        {
                            error
                        }
                    </p>


                    <Link
                        to="/products"
                        className="orders-primary-button"
                    >
                        CONTINUE SHOPPING
                    </Link>

                </section>

            </main>

        );
    }


    /* =====================================================
       EMPTY
    ===================================================== */

    if (
        sortedOrders.length === 0
    ) {

        return (

            <main
                className="orders-page"
            >

                <section
                    className="orders-empty-state"
                >

                    <div
                        className="orders-empty-icon"
                    >
                        <PackageIcon />
                    </div>


                    <h1>
                        You haven&apos;t placed any orders yet
                    </h1>


                    <p>
                        Once you complete a purchase, your order details will appear here.
                    </p>


                    <Link
                        to="/products"
                        className="orders-primary-button"
                    >
                        START SHOPPING
                    </Link>

                </section>

            </main>

        );
    }


    /* =====================================================
       ORDERS
    ===================================================== */

    return (

        <main
            className="orders-page"
        >

            <div
                className="orders-shell"
            >

                {/* =================================================
                    HEADER
                ================================================== */}

                <div
                    className="orders-page-heading"
                >

                    <div>

                        <h1>
                            My Orders
                        </h1>


                        <p>
                            Track, view and shop your previous purchases
                        </p>

                    </div>


                    <span>
                        {
                            sortedOrders.length
                        }
                        {" "}
                        {
                            sortedOrders.length === 1
                                ?
                                "order"
                                :
                                "orders"
                        }
                    </span>

                </div>


                {
                    cartMessage
                    &&
                    (

                        <div
                            className="orders-cart-message"
                        >

                            <span>
                                ✓
                            </span>

                            {
                                cartMessage
                            }

                            <Link
                                to="/cart"
                            >
                                VIEW CART
                            </Link>

                        </div>

                    )
                }


                {/* =================================================
                    ORDER LIST
                ================================================== */}

                <div
                    className="orders-list"
                >

                    {
                        sortedOrders.map(
                            order => {

                                const orderItems =
                                    Array.isArray(
                                        order?.items
                                    )
                                        ? order.items
                                        : [];


                                const orderStatus =
                                    order?.status
                                    ||
                                    "confirmed";


                                const paymentStatus =
                                    order?.payment_status
                                    ||
                                    "paid";


                                return (

                                    <article
                                        className="order-card"
                                        key={
                                            order.id
                                        }
                                    >

                                        {/* =================================
                                            ORDER HEADER
                                        ================================== */}

                                        <div
                                            className="order-card-header"
                                        >

                                            <div
                                                className="order-header-main"
                                            >

                                                <div
                                                    className="order-package-icon"
                                                >
                                                    <PackageIcon />
                                                </div>


                                                <div>

                                                    <span>
                                                        ORDER
                                                        {" "}
                                                        #{
                                                            order.id
                                                        }
                                                    </span>


                                                    <strong>
                                                        {
                                                            formatDate(
                                                                order.created_at
                                                            )
                                                        }
                                                    </strong>

                                                </div>

                                            </div>


                                            <div
                                                className="order-statuses"
                                            >

                                                <span
                                                    className={
                                                        `order-status ${
                                                            statusClass(
                                                                orderStatus
                                                            )
                                                        }`
                                                    }
                                                >
                                                    {
                                                        readableStatus(
                                                            orderStatus
                                                        )
                                                    }
                                                </span>


                                                <span
                                                    className={
                                                        `order-payment-status ${
                                                            statusClass(
                                                                paymentStatus
                                                            )
                                                        }`
                                                    }
                                                >
                                                    PAYMENT:
                                                    {" "}
                                                    {
                                                        readableStatus(
                                                            paymentStatus
                                                        )
                                                    }
                                                </span>

                                            </div>

                                        </div>


                                        {/* =================================
                                            PRODUCTS
                                        ================================== */}

                                        <div
                                            className="order-products"
                                        >

                                            {
                                                orderItems.length > 0
                                                    ?
                                                    orderItems.map(
                                                        (
                                                            item,
                                                            index
                                                        ) => {

                                                            const productId =
                                                                Number(
                                                                    item?.product_id
                                                                );


                                                            const productLink =
                                                                productId > 0
                                                                    ?
                                                                    `/products/${productId}`
                                                                    :
                                                                    null;


                                                            const content = (

                                                                <>

                                                                    <div
                                                                        className="order-product-image"
                                                                    >

                                                                        <img
                                                                            src={
                                                                                item?.image_url
                                                                                ||
                                                                                item?.image
                                                                                ||
                                                                                "/product-placeholder.png"
                                                                            }
                                                                            alt={
                                                                                item?.product_name
                                                                                ||
                                                                                item?.name
                                                                                ||
                                                                                "Ordered product"
                                                                            }
                                                                        />

                                                                    </div>


                                                                    <div
                                                                        className="order-product-info"
                                                                    >

                                                                        <strong>
                                                                            {
                                                                                item?.brand
                                                                                ||
                                                                                "Apsara Trends"
                                                                            }
                                                                        </strong>


                                                                        <p>
                                                                            {
                                                                                item?.product_name
                                                                                ||
                                                                                item?.name
                                                                                ||
                                                                                "Apsara Trends Product"
                                                                            }
                                                                        </p>


                                                                        <div
                                                                            className="order-product-meta"
                                                                        >

                                                                            {
                                                                                item?.size
                                                                                &&
                                                                                (
                                                                                    <span>
                                                                                        Size:
                                                                                        {" "}
                                                                                        {
                                                                                            item.size
                                                                                        }
                                                                                    </span>
                                                                                )
                                                                            }


                                                                            {
                                                                                item?.color
                                                                                &&
                                                                                (
                                                                                    <span>
                                                                                        Colour:
                                                                                        {" "}
                                                                                        {
                                                                                            item.color
                                                                                        }
                                                                                    </span>
                                                                                )
                                                                            }


                                                                            <span>
                                                                                Qty:
                                                                                {" "}
                                                                                {
                                                                                    item?.quantity
                                                                                    ||
                                                                                    1
                                                                                }
                                                                            </span>

                                                                        </div>


                                                                        <div
                                                                            className="order-product-price"
                                                                        >
                                                                            {
                                                                                money(
                                                                                    (
                                                                                        Number(
                                                                                            item?.unit_price
                                                                                        )
                                                                                        ||
                                                                                        Number(
                                                                                            item?.price
                                                                                        )
                                                                                        ||
                                                                                        0
                                                                                    )
                                                                                )
                                                                            }
                                                                        </div>

                                                                    </div>

                                                                </>

                                                            );


                                                            if (
                                                                productLink
                                                            ) {

                                                                return (

                                                                    <Link
                                                                        to={
                                                                            productLink
                                                                        }
                                                                        className="order-product"
                                                                        key={
                                                                            item?.id
                                                                            ||
                                                                            `${order.id}-${index}`
                                                                        }
                                                                    >
                                                                        {
                                                                            content
                                                                        }
                                                                    </Link>

                                                                );
                                                            }


                                                            return (

                                                                <div
                                                                    className="order-product"
                                                                    key={
                                                                        item?.id
                                                                        ||
                                                                        `${order.id}-${index}`
                                                                    }
                                                                >
                                                                    {
                                                                        content
                                                                    }
                                                                </div>

                                                            );
                                                        }
                                                    )
                                                    :
                                                    (

                                                        <div
                                                            className="order-no-items"
                                                        >
                                                            Product details unavailable
                                                        </div>

                                                    )
                                            }

                                        </div>


                                        {/* =================================
                                            FOOTER
                                        ================================== */}

                                        <div
                                            className="order-card-footer"
                                        >

                                            <div
                                                className="order-total"
                                            >

                                                <span>
                                                    Total Amount
                                                </span>


                                                <strong>
                                                    {
                                                        money(
                                                            order?.total_amount
                                                        )
                                                    }
                                                </strong>

                                            </div>


                                            <div
                                                className="order-footer-actions"
                                            >

                                                <button
                                                    type="button"
                                                    className="order-track-btn"
                                                    onClick={
                                                        () =>
                                                            setTrackingOrderId(
                                                                order.id
                                                            )
                                                    }
                                                >
                                                    <span className="order-track-pulse-dot" />
                                                    TRACK LIVE
                                                </button>


                                                <button
                                                    type="button"
                                                    onClick={
                                                        () =>
                                                            buyAgain(
                                                                order
                                                            )
                                                    }
                                                >
                                                    BUY AGAIN
                                                </button>


                                                <Link
                                                    to="/products"
                                                >
                                                    SHOP MORE

                                                    <ArrowIcon />
                                                </Link>

                                            </div>

                                        </div>

                                    </article>

                                );
                            }
                        )
                    }

                </div>

            </div>

            {/* =================================================
                REAL-TIME LIVE ORDER TRACKING MODAL
            ================================================== */}
            {trackingOrderId && (
                <div
                    className="tracking-modal-overlay"
                    onClick={() => setTrackingOrderId(null)}
                >
                    <div
                        className="tracking-modal-card"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="tracking-modal-header">
                            <div className="tracking-header-title">
                                <h3>
                                    Shipment Intelligence & Live Telemetry
                                    <span className="tracking-live-pill">
                                        <span className="order-track-pulse-dot" style={{ width: "6px", height: "6px" }} />
                                        Live Telemetry
                                    </span>
                                </h3>
                                <div className="tracking-header-meta">
                                    <span>Order #{trackingOrderId}</span>
                                    {trackingData?.tracking_number && <span>AWB: {trackingData.tracking_number}</span>}
                                    {trackingData?.courier_name && <span>Courier: {trackingData.courier_name}</span>}
                                </div>
                            </div>
                            <button
                                type="button"
                                className="tracking-modal-close"
                                onClick={() => setTrackingOrderId(null)}
                                aria-label="Close tracking modal"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Body */}
                        <div className="tracking-modal-body">
                            {trackingLoading && !trackingData ? (
                                <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
                                    <p style={{ margin: 0, fontWeight: "600", fontSize: "14px" }}>Connecting to Apsara Express Telemetry Hub...</p>
                                </div>
                            ) : trackingError ? (
                                <div style={{ padding: "20px", background: "#fef2f2", color: "#b91c1c", borderRadius: "10px", fontSize: "13px" }}>
                                    {trackingError}
                                </div>
                            ) : trackingData ? (
                                <>
                                    {/* Progress Stepper */}
                                    <div className="tracking-stepper-wrapper">
                                        <div className="tracking-stepper-progress-bar">
                                            <div
                                                className="tracking-stepper-progress-fill"
                                                style={{
                                                    width: `${trackingData.is_cancelled ? 0 : trackingData.progress_percent}%`,
                                                    background: trackingData.is_cancelled ? "#ef4444" : undefined
                                                }}
                                            />
                                        </div>
                                        <div className="tracking-stepper-nodes">
                                            {(trackingData.milestones || []).map((m, idx) => {
                                                const isReached = m.reached;
                                                const isActive = trackingData.milestone_index === idx && !trackingData.is_cancelled;
                                                return (
                                                    <div
                                                        key={m.key}
                                                        className={`tracking-step-node ${isReached ? "completed" : ""} ${isActive ? "active" : ""}`}
                                                    >
                                                        <div className="tracking-step-icon-circle">
                                                            {isReached ? "✓" : idx + 1}
                                                        </div>
                                                        <span className="tracking-step-label">{m.title}</span>
                                                        <span className="tracking-step-desc">{m.desc}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Telemetry Metrics Grid */}
                                    <div className="tracking-telemetry-grid">
                                        <div className="tracking-telemetry-card">
                                            <span className="tracking-telemetry-title">
                                                ✈ Courier Partner & AWB
                                            </span>
                                            <div className="tracking-telemetry-value">
                                                <span style={{ fontSize: "13px" }}>{trackingData.courier_name}</span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
                                                <code style={{ fontSize: "12px", color: "#0f172a", background: "#f8fafc", padding: "2px 6px", borderRadius: "4px" }}>
                                                    {trackingData.tracking_number}
                                                </code>
                                                <button
                                                    type="button"
                                                    className="tracking-awb-copy-btn"
                                                    onClick={() => copyAwb(trackingData.tracking_number)}
                                                >
                                                    {copiedAwb ? "Copied!" : "Copy AWB"}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="tracking-telemetry-card">
                                            <span className="tracking-telemetry-title">
                                                📍 Current Location Hub
                                            </span>
                                            <div className="tracking-telemetry-value">
                                                <span style={{ fontSize: "13px", color: "#0f172a" }}>
                                                    {trackingData.current_location || "En Route to Destination Hub"}
                                                </span>
                                            </div>
                                            <span className="tracking-telemetry-sub">
                                                Status: <strong style={{ textTransform: "uppercase", color: "#047857" }}>{trackingData.status}</strong>
                                            </span>
                                        </div>

                                        <div className="tracking-telemetry-card">
                                            <span className="tracking-telemetry-title">
                                                ⏱ Estimated Delivery
                                            </span>
                                            <div className="tracking-telemetry-value">
                                                <span style={{ fontSize: "14px", color: "#1e1b4b" }}>
                                                    {trackingData.estimated_delivery}
                                                </span>
                                            </div>
                                            <span className="tracking-telemetry-sub">
                                                Handled by Apsara Express Logistics
                                            </span>
                                        </div>
                                    </div>

                                    {/* Timeline Checkpoints */}
                                    <div className="tracking-timeline-box">
                                        <h4>
                                            <span>Detailed Milestone & Checkpoint Logs</span>
                                            <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748b" }}>
                                                {trackingData.events?.length || 0} Checkpoints Logged
                                            </span>
                                        </h4>
                                        <div className="tracking-timeline-list">
                                            {(trackingData.events || []).map((ev, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`tracking-timeline-item ${idx === 0 ? "latest" : ""}`}
                                                >
                                                    <div className="tracking-timeline-dot" />
                                                    <div className="tracking-timeline-header-row">
                                                        <span className="tracking-timeline-title">
                                                            {ev.title}
                                                            {idx === 0 && (
                                                                <span style={{ marginLeft: "8px", fontSize: "10px", background: "#dcfce7", color: "#15803d", padding: "1px 6px", borderRadius: "4px", fontWeight: "700" }}>
                                                                    LATEST
                                                                </span>
                                                            )}
                                                        </span>
                                                        <span className="tracking-timeline-time">
                                                            {ev.timestamp ? new Date(ev.timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Recent"}
                                                        </span>
                                                    </div>
                                                    <div className="tracking-timeline-desc">
                                                        {ev.description}
                                                    </div>
                                                    {ev.location && (
                                                        <div className="tracking-timeline-loc">
                                                            📍 {ev.location}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Destination Shipping Address */}
                                    {trackingData.shipping_address && (
                                        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px 18px", fontSize: "12px", color: "#475569" }}>
                                            <strong style={{ display: "block", color: "#0f172a", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                                Destination Delivery Address
                                            </strong>
                                            <p style={{ margin: "2px 0", fontWeight: "600", color: "#1e293b" }}>
                                                {trackingData.shipping_address.name} • {trackingData.shipping_address.phone}
                                            </p>
                                            <p style={{ margin: "2px 0" }}>
                                                {trackingData.shipping_address.address_line1}
                                                {trackingData.shipping_address.address_line2 ? `, ${trackingData.shipping_address.address_line2}` : ""}
                                            </p>
                                            <p style={{ margin: "2px 0" }}>
                                                {trackingData.shipping_address.city}, {trackingData.shipping_address.state} - {trackingData.shipping_address.pincode}
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : null}
                        </div>

                        {/* Footer */}
                        <div className="tracking-modal-footer">
                            <div className="tracking-sync-status">
                                <span className="order-track-pulse-dot" />
                                <span>Live Auto-Sync Active {lastSyncedTime ? `• Synced at ${lastSyncedTime}` : ""}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <button
                                    type="button"
                                    className="tracking-refresh-btn"
                                    onClick={() => fetchTracking(trackingOrderId, false)}
                                >
                                    ↻ Refresh Telemetry
                                </button>
                                <button
                                    type="button"
                                    style={{ background: "#0f172a", color: "#ffffff", border: "none", padding: "7px 16px", borderRadius: "6px", fontWeight: "700", cursor: "pointer", fontSize: "12px" }}
                                    onClick={() => setTrackingOrderId(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>

    );
}


export default Orders;