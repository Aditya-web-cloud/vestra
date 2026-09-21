import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import "../styles/cart.css";


const CART_KEY =
    "vestra_bag";

const WISHLIST_KEY =
    "vestra_wishlist";


/* =========================================================
   HELPERS
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
   ICONS
========================================================= */

function CartIcon() {

    return (

        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                d="
                    M3 4h2
                    l2 11h10
                    l2-7H7
                "
            />

            <circle
                cx="9"
                cy="19"
                r="1.5"
            />

            <circle
                cx="17"
                cy="19"
                r="1.5"
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


/* =========================================================
   CART
========================================================= */

function Cart() {

    const [
        items,
        setItems
    ] = useState(
        () =>
            readArray(
                CART_KEY
            )
    );


    const [
        message,
        setMessage
    ] = useState("");


    /* =====================================================
       SYNC CART
    ===================================================== */

    useEffect(
        () => {

            function refreshCart() {

                setItems(
                    readArray(
                        CART_KEY
                    )
                );
            }


            window.addEventListener(
                "storage",
                refreshCart
            );


            window.addEventListener(
                "vestra:bag-updated",
                refreshCart
            );


            return () => {

                window.removeEventListener(
                    "storage",
                    refreshCart
                );


                window.removeEventListener(
                    "vestra:bag-updated",
                    refreshCart
                );
            };

        },
        []
    );


    /* =====================================================
       SAVE CART
    ===================================================== */

    function saveCart(
        next
    ) {

        setItems(
            next
        );


        localStorage.setItem(
            CART_KEY,
            JSON.stringify(
                next
            )
        );


        window.dispatchEvent(
            new Event(
                "vestra:bag-updated"
            )
        );
    }


    /* =====================================================
       REMOVE
    ===================================================== */

    function removeItem(
        index
    ) {

        const next =
            items.filter(
                (
                    _,
                    itemIndex
                ) =>
                    itemIndex
                    !==
                    index
            );


        saveCart(
            next
        );


        setMessage(
            "Item removed from cart."
        );


        window.setTimeout(
            () => {

                setMessage("");

            },
            1800
        );
    }


    /* =====================================================
       QUANTITY
    ===================================================== */

    function changeQuantity(
        index,
        amount
    ) {

        const next =
            items.map(
                (
                    item,
                    itemIndex
                ) => {

                    if (
                        index
                        !==
                        itemIndex
                    ) {

                        return item;
                    }


                    const current =
                        Math.max(
                            1,
                            Number(
                                item.quantity
                            )
                            ||
                            1
                        );


                    const nextQuantity =
                        Math.min(
                            10,
                            Math.max(
                                1,
                                current
                                +
                                amount
                            )
                        );


                    return {

                        ...item,

                        quantity:
                            nextQuantity,

                    };
                }
            );


        saveCart(
            next
        );
    }


    /* =====================================================
       MOVE TO WISHLIST
    ===================================================== */

    function moveToWishlist(
        item,
        index
    ) {

        const wishlist =
            readArray(
                WISHLIST_KEY
            );


        const productId =
            Number(
                item.product_id
            );


        const alreadyExists =
            wishlist.some(
                wishlistItem =>
                    Number(
                        typeof wishlistItem
                        ===
                        "object"
                            ?
                            wishlistItem?.id
                            :
                            wishlistItem
                    )
                    ===
                    productId
            );


        if (
            !alreadyExists
        ) {

            wishlist.push({

                id:
                    productId,

                name:
                    item.name,

                brand:
                    item.brand,

                image_url:
                    item.image,

                base_price:
                    item.price,

                discount_percentage:
                    0,

            });


            localStorage.setItem(
                WISHLIST_KEY,
                JSON.stringify(
                    wishlist
                )
            );


            window.dispatchEvent(
                new Event(
                    "vestra:wishlist-updated"
                )
            );
        }


        removeItem(
            index
        );


        setMessage(
            "Moved to wishlist."
        );
    }


    /* =====================================================
       ITEM COUNT
    ===================================================== */

    const totalItems =
        useMemo(
            () => {

                return items.reduce(
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

            },
            [items]
        );


    /* =====================================================
       SUBTOTAL
    ===================================================== */

    const subtotal =
        useMemo(
            () => {

                return items.reduce(
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
            [items]
        );


    const platformFee =
        0;


    const deliveryFee =
        0;


    const discount =
        0;


    const total =
        subtotal
        +
        platformFee
        +
        deliveryFee
        -
        discount;


    /* =====================================================
       EMPTY CART
    ===================================================== */

    if (
        items.length === 0
    ) {

        return (

            <main
                className="cart-page"
            >

                <div
                    className="cart-empty"
                >

                    <div
                        className="cart-empty-icon"
                    >
                        <CartIcon />
                    </div>


                    <h1>
                        YOUR CART IS EMPTY
                    </h1>


                    <p>
                        Looks like you haven&apos;t added anything to your cart yet.
                    </p>


                    <Link
                        to="/products"
                    >
                        START SHOPPING
                    </Link>


                    <Link
                        to="/wishlist"
                        className="cart-empty-wishlist"
                    >
                        VIEW WISHLIST
                    </Link>

                </div>

            </main>

        );
    }


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <main
            className="cart-page"
        >

            {/* =================================================
                TOP CHECKOUT STEPS
            ================================================== */}

            <div
                className="cart-progress"
            >

                <strong>
                    CART
                </strong>


                <span />


                <em>
                    ADDRESS
                </em>


                <span />


                <em>
                    PAYMENT
                </em>

            </div>


            {/* =================================================
                PAGE
            ================================================== */}

            <div
                className="cart-shell"
            >

                {/* =============================================
                    LEFT SIDE
                ============================================== */}

                <section
                    className="cart-products"
                >

                    {/* ADDRESS PROMPT */}

                    <div
                        className="cart-address-box"
                    >

                        <div>

                            <span>
                                Deliver to
                            </span>


                            <strong>
                                Select delivery address at checkout
                            </strong>

                        </div>


                        <Link
                            to="/checkout"
                        >
                            ADD ADDRESS
                        </Link>

                    </div>


                    {/* OFFER BOX */}

                    <div
                        className="cart-offer-box"
                    >

                        <div
                            className="cart-offer-icon"
                        >
                            %
                        </div>


                        <div>

                            <strong>
                                Available Offers
                            </strong>


                            <p>
                                Shop more and discover the latest VESTRA fashion offers.
                            </p>

                        </div>

                    </div>


                    {/* HEADER */}

                    <div
                        className="cart-products-heading"
                    >

                        <strong>
                            {
                                totalItems
                            }
                            {" "}
                            {
                                totalItems
                                ===
                                1
                                    ?
                                    "ITEM"
                                    :
                                    "ITEMS"
                            }
                            {" "}
                            IN YOUR CART
                        </strong>


                        <button
                            type="button"
                            onClick={
                                () => {

                                    saveCart([]);

                                }
                            }
                        >
                            REMOVE ALL
                        </button>

                    </div>


                    {
                        message
                        &&
                        (

                            <div
                                className="cart-message"
                            >
                                {
                                    message
                                }
                            </div>

                        )
                    }


                    {/* PRODUCT LIST */}

                    <div
                        className="cart-list"
                    >

                        {
                            items.map(
                                (
                                    item,
                                    index
                                ) => {

                                    const quantity =
                                        Math.max(
                                            1,
                                            Number(
                                                item.quantity
                                            )
                                            ||
                                            1
                                        );


                                    const lineTotal =
                                        (
                                            Number(
                                                item.price
                                            )
                                            ||
                                            0
                                        )
                                        *
                                        quantity;


                                    return (

                                        <article
                                            className="cart-item"
                                            key={
                                                `${
                                                    item.product_id
                                                }-${
                                                    item.variant_id
                                                }-${index}`
                                            }
                                        >

                                            {/* IMAGE */}

                                            <Link
                                                to={
                                                    `/products/${
                                                        item.product_id
                                                    }`
                                                }
                                                className="cart-item-image"
                                            >

                                                <img
                                                    src={
                                                        item.image
                                                        ||
                                                        "/product-placeholder.png"
                                                    }
                                                    alt={
                                                        item.name
                                                        ||
                                                        "VESTRA product"
                                                    }
                                                />

                                            </Link>


                                            {/* INFO */}

                                            <div
                                                className="cart-item-info"
                                            >

                                                <Link
                                                    to={
                                                        `/products/${
                                                            item.product_id
                                                        }`
                                                    }
                                                    className="cart-item-brand"
                                                >
                                                    {
                                                        item.brand
                                                        ||
                                                        "VESTRA"
                                                    }
                                                </Link>


                                                <p
                                                    className="cart-item-name"
                                                >
                                                    {
                                                        item.name
                                                    }
                                                </p>


                                                <p
                                                    className="cart-sold-by"
                                                >
                                                    Sold by:
                                                    {" "}
                                                    VESTRA Retail
                                                </p>


                                                {/* VARIANTS */}

                                                <div
                                                    className="cart-item-options"
                                                >

                                                    {
                                                        item.size
                                                        &&
                                                        (

                                                            <span>

                                                                Size:

                                                                <strong>
                                                                    {
                                                                        item.size
                                                                    }
                                                                </strong>

                                                            </span>

                                                        )
                                                    }


                                                    {
                                                        item.color
                                                        &&
                                                        (

                                                            <span>

                                                                Colour:

                                                                <strong>
                                                                    {
                                                                        item.color
                                                                    }
                                                                </strong>

                                                            </span>

                                                        )
                                                    }

                                                </div>


                                                {/* PRICE */}

                                                <div
                                                    className="cart-item-price"
                                                >

                                                    <strong>
                                                        {
                                                            money(
                                                                item.price
                                                            )
                                                        }
                                                    </strong>


                                                    {
                                                        quantity > 1
                                                        &&
                                                        (

                                                            <span>
                                                                Total:
                                                                {" "}
                                                                {
                                                                    money(
                                                                        lineTotal
                                                                    )
                                                                }
                                                            </span>

                                                        )
                                                    }

                                                </div>


                                                {/* QUANTITY */}

                                                <div
                                                    className="cart-quantity-row"
                                                >

                                                    <span>
                                                        Qty
                                                    </span>


                                                    <div
                                                        className="cart-quantity-control"
                                                    >

                                                        <button
                                                            type="button"

                                                            disabled={
                                                                quantity <= 1
                                                            }

                                                            onClick={
                                                                () =>
                                                                    changeQuantity(
                                                                        index,
                                                                        -1
                                                                    )
                                                            }
                                                        >
                                                            −
                                                        </button>


                                                        <strong>
                                                            {
                                                                quantity
                                                            }
                                                        </strong>


                                                        <button
                                                            type="button"

                                                            disabled={
                                                                quantity >= 10
                                                            }

                                                            onClick={
                                                                () =>
                                                                    changeQuantity(
                                                                        index,
                                                                        1
                                                                    )
                                                            }
                                                        >
                                                            +
                                                        </button>

                                                    </div>

                                                </div>


                                                {/* ACTIONS */}

                                                <div
                                                    className="cart-item-actions"
                                                >

                                                    <button
                                                        type="button"

                                                        onClick={
                                                            () =>
                                                                removeItem(
                                                                    index
                                                                )
                                                        }
                                                    >
                                                        REMOVE
                                                    </button>


                                                    <button
                                                        type="button"

                                                        onClick={
                                                            () =>
                                                                moveToWishlist(
                                                                    item,
                                                                    index
                                                                )
                                                        }
                                                    >

                                                        <HeartIcon />

                                                        MOVE TO WISHLIST

                                                    </button>

                                                </div>

                                            </div>

                                        </article>

                                    );
                                }
                            )
                        }

                    </div>


                    {/* WISHLIST LINK */}

                    <Link
                        to="/wishlist"
                        className="cart-wishlist-link"
                    >

                        <HeartIcon />

                        Add More From Wishlist

                        <span>
                            →
                        </span>

                    </Link>

                </section>


                {/* =============================================
                    PRICE SUMMARY
                ============================================== */}

                <aside
                    className="cart-summary"
                >

                    <div
                        className="cart-coupon"
                    >

                        <span>
                            COUPONS
                        </span>


                        <div>

                            <strong>
                                Apply Coupons
                            </strong>


                            <button
                                type="button"
                            >
                                APPLY
                            </button>

                        </div>

                    </div>


                    <div
                        className="cart-summary-divider"
                    />


                    <h2>
                        PRICE DETAILS ({
                            totalItems
                        } {
                            totalItems
                            ===
                            1
                                ?
                                "Item"
                                :
                                "Items"
                        })
                    </h2>


                    <div
                        className="cart-summary-row"
                    >

                        <span>
                            Total MRP
                        </span>


                        <strong>
                            {
                                money(
                                    subtotal
                                )
                            }
                        </strong>

                    </div>


                    <div
                        className="cart-summary-row"
                    >

                        <span>
                            Discount on MRP
                        </span>


                        <strong
                            className="cart-green"
                        >
                            {
                                discount > 0
                                    ?
                                    `-${money(
                                        discount
                                    )}`
                                    :
                                    "₹0"
                            }
                        </strong>

                    </div>


                    <div
                        className="cart-summary-row"
                    >

                        <span>
                            Platform Fee
                        </span>


                        <strong
                            className="cart-green"
                        >
                            FREE
                        </strong>

                    </div>


                    <div
                        className="cart-summary-row"
                    >

                        <span>
                            Shipping Fee
                        </span>


                        <strong
                            className="cart-green"
                        >
                            FREE
                        </strong>

                    </div>


                    <div
                        className="cart-summary-divider"
                    />


                    <div
                        className="cart-summary-total"
                    >

                        <strong>
                            Total Amount
                        </strong>


                        <strong>
                            {
                                money(
                                    total
                                )
                            }
                        </strong>

                    </div>


                    <Link
                        to="/checkout"
                        className="cart-checkout-button"
                    >
                        PROCEED TO CHECKOUT
                    </Link>


                    <div
                        className="cart-secure"
                    >

                        <strong>
                            🔒 100% SECURE
                        </strong>


                        <span>
                            Safe and secure checkout
                        </span>

                    </div>

                </aside>

            </div>

        </main>

    );
}


export default Cart;