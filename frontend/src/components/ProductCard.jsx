import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import "../styles/product-card.css";


const WISHLIST_KEY =
    "vestra_wishlist";


/* =========================================================
   HELPERS
========================================================= */

function readWishlist() {

    try {

        const stored =
            JSON.parse(
                localStorage.getItem(
                    WISHLIST_KEY
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


function getBrandName(
    product
) {

    if (
        typeof product?.brand
        ===
        "string"
    ) {

        return product.brand;
    }


    return (
        product?.brand?.name
        ||
        "VESTRA"
    );
}


function getSellingPrice(
    product
) {

    const variants =
        Array.isArray(
            product?.variants
        )
            ? product.variants
            : [];


    const available =
        variants.filter(
            variant =>
                variant?.is_active !== false
                &&
                Number(
                    variant?.stock
                ) > 0
                &&
                Number(
                    variant?.price
                ) > 0
        );


    if (
        available.length > 0
    ) {

        return Math.min(
            ...available.map(
                variant =>
                    Number(
                        variant.price
                    )
            )
        );
    }


    const basePrice =
        Number(
            product?.base_price
        )
        ||
        0;


    const discount =
        Number(
            product?.discount_percentage
        )
        ||
        0;


    return Math.round(
        basePrice
        *
        (
            1
            -
            discount / 100
        )
    );
}


function money(
    value
) {

    return (
        `₹${Math.round(
            Number(value) || 0
        ).toLocaleString(
            "en-IN"
        )}`
    );
}


/* =========================================================
   HEART ICON
========================================================= */

function HeartIcon({
    filled = false,
}) {

    return (

        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={
                filled
                    ?
                    "filled"
                    :
                    ""
            }
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
   PRODUCT CARD
========================================================= */

function ProductCard({
    product,
}) {

    const productId =
        Number(
            product?.id
        );


    const [
        wished,
        setWished
    ] = useState(false);


    const sellingPrice =
        useMemo(
            () =>
                getSellingPrice(
                    product
                ),
            [product]
        );


    const mrp =
        Number(
            product?.base_price
        )
        ||
        sellingPrice;


    const discount =
        Number(
            product?.discount_percentage
        )
        ||
        0;


    const rating =
        Number(
            product?.rating
        )
        ||
        0;


    const brand =
        getBrandName(
            product
        );

    const displayImage =
        product?.image_url
        ||
        "/product-placeholder.png";

    const productLink = `/products/${productId}`;


    /* =====================================================
       LOAD WISHLIST STATE
    ===================================================== */

    useEffect(
        () => {

            function syncWishlist() {
                const wishlist =
                    readWishlist();

                const exists =
                    wishlist.some(
                        item =>
                            Number(
                                typeof item
                                ===
                                "object"
                                    ?
                                    item?.id
                                    :
                                    item
                            )
                            ===
                            productId
                    );

                setWished(
                    exists
                );
            }

            syncWishlist();

            window.addEventListener(
                "vestra:wishlist-updated",
                syncWishlist
            );

            window.addEventListener(
                "storage",
                syncWishlist
            );

            return () => {
                window.removeEventListener(
                    "vestra:wishlist-updated",
                    syncWishlist
                );

                window.removeEventListener(
                    "storage",
                    syncWishlist
                );
            };

        },
        [
            productId,
        ]
    );



    /* =====================================================
       WISHLIST
    ===================================================== */

    function toggleWishlist(
        event
    ) {

        event.preventDefault();

        event.stopPropagation();


        if (
            !Number.isFinite(productId)
            ||
            productId <= 0
            ||
            product?.is_active === false
        ) {
            return;
        }


        const wishlist =
            readWishlist();


        const exists =
            wishlist.some(
                item =>
                    Number(
                        typeof item
                        ===
                        "object"
                            ?
                            item?.id
                            :
                            item
                    )
                    ===
                    productId
            );


        let nextWishlist;


        if (
            exists
        ) {

            nextWishlist =
                wishlist.filter(
                    item =>
                        Number(
                            typeof item
                            ===
                            "object"
                                ?
                                item?.id
                                :
                                item
                        )
                        !==
                        productId
                );

        } else {

            nextWishlist = [

                ...wishlist,

                {
                    id:
                        productId,

                    name:
                        product?.name,

                    brand:
                        brand,

                    image_url:
                        displayImage,

                    base_price:
                        mrp,

                    discount_percentage:
                        discount,

                    rating:
                        rating,
                },

            ];
        }


        localStorage.setItem(
            WISHLIST_KEY,
            JSON.stringify(
                nextWishlist
            )
        );


        setWished(
            !exists
        );


        window.dispatchEvent(
            new Event(
                "vestra:wishlist-updated"
            )
        );
    }


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <article
            className="vestra-product-card"
        >

            {/* =================================================
                IMAGE
            ================================================== */}

            <div
                className="vestra-product-image-area"
            >

                <Link
                    to={
                        productLink
                    }
                    className="vestra-product-image-link"
                >

                    <img
                        src={
                            displayImage
                        }
                        alt={
                            product?.name
                            ||
                            "VESTRA product"
                        }
                        className="vestra-product-image"
                        loading="lazy"
                    />

                </Link>


                {/* FEATURED */}

                {
                    product?.is_featured
                    &&
                    (

                        <span
                            className="vestra-product-bestseller"
                        >
                            BESTSELLER
                        </span>

                    )
                }


                {/* HEART */}

                <button
                    type="button"

                    className={
                        wished
                            ?
                            "vestra-product-heart active"
                            :
                            "vestra-product-heart"
                    }

                    aria-label={
                        wished
                            ?
                            "Remove from wishlist"
                            :
                            "Add to wishlist"
                    }

                    onClick={
                        toggleWishlist
                    }
                >

                    <HeartIcon
                        filled={
                            wished
                        }
                    />

                </button>


                {/* RATING */}

                {
                    rating > 0
                    &&
                    (

                        <div
                            className="vestra-product-rating"
                        >

                            <strong>
                                {
                                    rating.toFixed(
                                        1
                                    )
                                }
                            </strong>

                            <span>
                                ★
                            </span>

                        </div>

                    )
                }

            </div>


            {/* =================================================
                DETAILS
            ================================================== */}

            <div
                className="vestra-product-details"
            >

                <Link
                    to={
                        productLink
                    }
                    className="vestra-product-details-link"
                >

                    <h3>
                        {
                            brand
                        }
                    </h3>


                    <p>
                        {
                            product?.name
                        }
                    </p>


                    <div
                        className="vestra-product-price"
                    >

                        <strong>
                            {
                                money(
                                    sellingPrice
                                )
                            }
                        </strong>


                        {
                            discount > 0
                            &&
                            (

                                <>

                                    <span
                                        className="vestra-product-mrp-label"
                                    >
                                        MRP
                                    </span>


                                    <del>
                                        {
                                            money(
                                                mrp
                                            )
                                        }
                                    </del>


                                    <em>
                                        ({
                                            discount
                                        }% OFF)
                                    </em>

                                </>

                            )
                        }

                    </div>

                </Link>


                {/* =================================================
                    HOVER WISHLIST BUTTON
                ================================================== */}

                <div
                    className="vestra-product-hover-actions"
                >

                    <button
                        type="button"

                        className={
                            wished
                                ?
                                "active"
                                :
                                ""
                        }

                        onClick={
                            toggleWishlist
                        }
                    >

                        <HeartIcon
                            filled={
                                wished
                            }
                        />

                        {
                            wished
                                ?
                                "WISHLISTED"
                                :
                                "WISHLIST"
                        }

                    </button>

                </div>

            </div>

        </article>

    );
}


export default ProductCard;