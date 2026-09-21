import {
    useEffect,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import "../styles/wishlist.css";


const API_URL =
    import.meta.env.VITE_API_URL || "https://vestra-backend-vr8u.onrender.com";

const WISHLIST_KEY =
    "vestra_wishlist";


/* =========================================================
   HELPERS
========================================================= */

function readWishlist() {

    try {

        const value =
            JSON.parse(
                localStorage.getItem(
                    WISHLIST_KEY
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


function productIdFromItem(
    item
) {

    if (
        typeof item
        ===
        "object"
    ) {

        return Number(
            item?.id
            ||
            item?.product_id
        );
    }


    return Number(
        item
    );
}


function getBrand(
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


    const base =
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
        base
        *
        (
            1
            -
            discount / 100
        )
    );
}


/* =========================================================
   EMPTY HEART ICON
========================================================= */

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
   WISHLIST PAGE
========================================================= */

function Wishlist() {

    const [
        products,
        setProducts
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    /* =====================================================
       LOAD WISHLIST PRODUCTS
    ===================================================== */

    useEffect(
        () => {

            const controller =
                new AbortController();


            async function loadWishlist() {

                try {

                    setLoading(
                        true
                    );


                    const saved =
                        readWishlist();


                    if (
                        saved.length === 0
                    ) {

                        setProducts([]);

                        return;
                    }


                    const ids =
                        [
                            ...new Set(
                                saved
                                    .map(
                                        productIdFromItem
                                    )
                                    .filter(
                                        id =>
                                            Number.isFinite(
                                                id
                                            )
                                            &&
                                            id > 0
                                    )
                            )
                        ];


                    if (
                        ids.length === 0
                    ) {

                        setProducts([]);

                        localStorage.setItem(
                            WISHLIST_KEY,
                            "[]"
                        );

                        window.dispatchEvent(
                            new Event(
                                "vestra:wishlist-updated"
                            )
                        );

                        return;
                    }


                    const resolved =
                        await Promise.all(
                            ids.map(
                                async id => {

                                    try {

                                        const response =
                                            await fetch(
                                                `${API_URL}/products/${id}`,
                                                {
                                                    signal:
                                                        controller.signal,
                                                }
                                            );


                                        if (
                                            response.ok
                                        ) {

                                            const data =
                                                await response.json();

                                            if (
                                                data
                                                &&
                                                data.is_active !== false
                                                &&
                                                data.id
                                            ) {

                                                return data;
                                            }
                                        }

                                    } catch (
                                        error
                                    ) {

                                        if (
                                            error?.name
                                            ===
                                            "AbortError"
                                        ) {

                                            throw error;
                                        }
                                    }

                                    // Products that are not active, deleted, or return 404
                                    // cannot redirect to product section. Do not fallback.
                                    return null;
                                }
                            )
                        );


                    const validProducts =
                        resolved.filter(
                            Boolean
                        );


                    setProducts(
                        validProducts
                    );


                    // Synchronize storage: prune items that cannot redirect to product section
                    const validIds =
                        new Set(
                            validProducts.map(
                                p =>
                                    Number(
                                        p.id
                                    )
                            )
                        );


                    const cleanedSaved =
                        saved.filter(
                            item => {

                                const pid =
                                    productIdFromItem(
                                        item
                                    );

                                return (
                                    Number.isFinite(
                                        pid
                                    )
                                    &&
                                    validIds.has(
                                        pid
                                    )
                                );
                            }
                        );


                    if (
                        cleanedSaved.length
                        !==
                        saved.length
                    ) {

                        localStorage.setItem(
                            WISHLIST_KEY,
                            JSON.stringify(
                                cleanedSaved
                            )
                        );

                        window.dispatchEvent(
                            new Event(
                                "vestra:wishlist-updated"
                            )
                        );
                    }

                } catch (error) {

                    if (
                        error?.name
                        !==
                        "AbortError"
                    ) {

                        console.error(
                            "Wishlist loading failed:",
                            error
                        );
                    }

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


            loadWishlist();


            return () => {

                controller.abort();
            };

        },
        []
    );


    /* =====================================================
       REMOVE
    ===================================================== */

    function removeProduct(
        id
    ) {

        const next =
            products.filter(
                product =>
                    Number(
                        product?.id
                        ||
                        product?.product_id
                    )
                    !==
                    Number(id)
            );


        setProducts(
            next
        );


        const stored =
            readWishlist();


        const nextStored =
            stored.filter(
                item =>
                    productIdFromItem(
                        item
                    )
                    !==
                    Number(id)
            );


        localStorage.setItem(
            WISHLIST_KEY,
            JSON.stringify(
                nextStored
            )
        );


        window.dispatchEvent(
            new Event(
                "vestra:wishlist-updated"
            )
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
                className="wishlist-page"
            >

                <div
                    className="wishlist-shell"
                >

                    <div
                        className="wishlist-heading"
                    >

                        <h1>
                            My Wishlist
                        </h1>

                    </div>


                    <div
                        className="wishlist-loading-grid"
                    >

                        {
                            Array.from({
                                length: 5,
                            }).map(
                                (
                                    _,
                                    index
                                ) => (

                                    <div
                                        className="wishlist-loading-card"
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
       EMPTY
    ===================================================== */

    if (
        products.length
        ===
        0
    ) {

        return (

            <main
                className="wishlist-page"
            >

                <div
                    className="wishlist-empty"
                >

                    <div
                        className="wishlist-empty-icon"
                    >
                        <HeartIcon />
                    </div>


                    <h1>
                        YOUR WISHLIST IS EMPTY
                    </h1>


                    <p>
                        Add products you like to your wishlist and find them here whenever you want.
                    </p>


                    <Link
                        to="/products"
                    >
                        CONTINUE SHOPPING
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
            className="wishlist-page"
        >

            <div
                className="wishlist-shell"
            >

                <div
                    className="wishlist-heading"
                >

                    <h1>
                        My Wishlist
                    </h1>


                    <span>
                        {
                            products.length
                        }
                        {" "}
                        {
                            products.length
                            ===
                            1
                                ?
                                "item"
                                :
                                "items"
                        }
                    </span>

                </div>


                <div
                    className="wishlist-grid"
                >

                    {
                        products.map(
                            product => {

                                const id =
                                    Number(
                                        product?.id
                                        ||
                                        product?.product_id
                                    );


                                const sellingPrice =
                                    getSellingPrice(
                                        product
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


                                return (

                                    <article
                                        className="wishlist-card"
                                        key={
                                            id
                                        }
                                    >

                                        <button
                                            type="button"
                                            className="wishlist-remove"
                                            aria-label="Remove product"
                                            onClick={
                                                () =>
                                                    removeProduct(
                                                        id
                                                    )
                                            }
                                        >
                                            ×
                                        </button>


                                        <Link
                                            to={
                                                `/products/${id}`
                                            }
                                            className="wishlist-image"
                                        >

                                            <img
                                                src={
                                                    product?.image_url
                                                    ||
                                                    product?.image
                                                    ||
                                                    "/product-placeholder.png"
                                                }
                                                alt={
                                                    product?.name
                                                    ||
                                                    "VESTRA product"
                                                }
                                            />

                                        </Link>


                                        <div
                                            className="wishlist-content"
                                        >

                                            <Link
                                                to={
                                                    `/products/${id}`
                                                }
                                                className="wishlist-title-link"
                                            >

                                                <h2>
                                                    {
                                                        getBrand(
                                                            product
                                                        )
                                                    }
                                                </h2>


                                                <p>
                                                    {
                                                        product?.name
                                                    }
                                                </p>

                                            </Link>


                                            <div
                                                className="wishlist-price"
                                            >

                                                <strong>
                                                    {
                                                        money(
                                                            sellingPrice
                                                        )
                                                    }
                                                </strong>


                                                {
                                                    discount
                                                    >
                                                    0
                                                    &&
                                                    (

                                                        <>

                                                            <span>
                                                                {
                                                                    money(
                                                                        mrp
                                                                    )
                                                                }
                                                            </span>


                                                            <em>
                                                                ({
                                                                    discount
                                                                }% OFF)
                                                            </em>

                                                        </>

                                                    )
                                                }

                                            </div>

                                        </div>


                                        <Link
                                            className="wishlist-view-product"
                                            to={
                                                `/products/${id}`
                                            }
                                        >
                                            VIEW PRODUCT
                                        </Link>

                                    </article>

                                );
                            }
                        )
                    }

                </div>

            </div>

        </main>

    );
}


export default Wishlist;