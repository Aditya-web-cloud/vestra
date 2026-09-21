import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
    useParams,
} from "react-router-dom";

import { getColorStyle } from "../utils/colorMap";

import "../styles/product-details.css";


const API_URL =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const BAG_KEY =
    "vestra_bag";

const WISHLIST_KEY =
    "vestra_wishlist";


/* =========================================================
   STORAGE
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


function brandName(
    product
) {

    return product?.brand?.name
        ||
        product?.brand_name
        ||
        "VESTRA";
}


function categoryName(
    product
) {

    if (
        typeof product?.category
        ===
        "string"
    ) {

        return product.category;
    }

    return (
        product?.category?.name
        ||
        product?.category_name
        ||
        ""
    );
}


function discountedPrice(
    product
) {

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

    if (
        !discount
    ) {
        return Math.round(
            base
        );
    }

    return Math.round(
        base
        *
        (
            1
            -
            discount
            /
            100
        )
    );
}


function variantPrice(
    variant,
    product
) {

    if (
        variant?.price
        !==
        undefined
        &&
        variant?.price
        !==
        null
    ) {

        return Math.round(
            Number(
                variant.price
            )
        );
    }

    return discountedPrice(
        product
    );
}


function renderStars(
    rating = 0
) {

    const stars = [];

    const full =
        Math.floor(
            rating
        );

    const half =
        rating
        -
        full
        >=
        0.5;

    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        if (
            i <= full
        ) {

            stars.push(
                <span
                    key={i}
                    className="star full"
                >
                    ★
                </span>
            );

        } else if (
            i === full + 1
            &&
            half
        ) {

            stars.push(
                <span
                    key={i}
                    className="star half"
                >
                    ★
                </span>
            );

        } else {

            stars.push(
                <span
                    key={i}
                    className="star empty"
                >
                    ☆
                </span>
            );
        }
    }

    return stars;
}


const MOCK_REVIEWS = [
    {
        id: 1,
        author: "Aanya Sharma",
        rating: 5,
        title: "Absolute perfection in fabric & fit",
        comment:
            "The fit is exactly true to size and the fabric feels ultra-luxurious. Wore it to an evening reception and received endless compliments.",
        date: "2 days ago",
        verified: true,
        fitFeedback: "True to size",
    },
    {
        id: 2,
        author: "Rohan Kapoor",
        rating: 5,
        title: "Top tier tailoring and stitching",
        comment:
            "Clean seams, premium weight, and very comfortable all day long. VESTRA's quality rivals luxury European labels.",
        date: "1 week ago",
        verified: true,
        fitFeedback: "Spot-on fit",
    },
    {
        id: 3,
        author: "Priya Menon",
        rating: 4,
        title: "Beautiful piece, rich color depth",
        comment:
            "The weave has a refined sheen and drapes elegantly. Fast delivery and secure packaging as always.",
        date: "2 weeks ago",
        verified: true,
        fitFeedback: "Runs slightly relaxed",
    },
];


/* =========================================================
   ICONS
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
                    ? "filled"
                    : ""
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


/* =========================================================
   PRODUCT DETAIL
========================================================= */

function ProductDetail() {

    const {
        id
    } = useParams();

    const productId =
        Number(id);


    const [
        product,
        setProduct
    ] = useState(null);


    const [
        variants,
        setVariants
    ] = useState([]);


    const [
        selectedVariantId,
        setSelectedVariantId
    ] = useState(null);


    const [
        selectedColor,
        setSelectedColor
    ] = useState(null);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");


    const [
        wished,
        setWished
    ] = useState(false);


    const [
        bagMessage,
        setBagMessage
    ] = useState("");


    /* =====================================================
       LOAD PRODUCT
    ===================================================== */

    useEffect(
        () => {

            const controller =
                new AbortController();


            async function loadProduct() {

                try {

                    setLoading(
                        true
                    );

                    setError("");


                    const [
                        productResponse,
                        variantResponse,
                    ] =
                        await Promise.all([

                            fetch(
                                `${API_URL}/products/${productId}`,
                                {
                                    signal:
                                        controller.signal,
                                }
                            ),

                            fetch(
                                `${API_URL}/products/${productId}/variants`,
                                {
                                    signal:
                                        controller.signal,
                                }
                            ),

                        ]);


                    if (
                        !productResponse.ok
                    ) {

                        throw new Error(
                            `Product request failed (${productResponse.status})`
                        );
                    }


                    const productData =
                        await productResponse.json();


                    let variantData =
                        [];


                    if (
                        variantResponse.ok
                    ) {

                        const responseData =
                            await variantResponse.json();


                        if (
                            Array.isArray(
                                responseData
                            )
                        ) {

                            variantData =
                                responseData;

                        } else if (
                            Array.isArray(
                                responseData?.items
                            )
                        ) {

                            variantData =
                                responseData.items;
                        }
                    }


                    if (
                        variantData.length === 0
                        &&
                        Array.isArray(
                            productData?.variants
                        )
                    ) {

                        variantData =
                            productData.variants;
                    }


                    setProduct(
                        productData
                    );


                    setVariants(
                        variantData
                    );


                    const available =
                        variantData.find(
                            variant =>
                                variant?.is_active !== false
                                &&
                                Number(
                                    variant?.stock
                                ) > 0
                        );

                    const initVariant =
                        available
                        ||
                        (variantData.length > 0 ? variantData[0] : null);

                    if (initVariant) {
                        setSelectedVariantId(
                            Number(initVariant.id)
                        );
                        if (initVariant.color) {
                            setSelectedColor(initVariant.color);
                        }
                    }


                    const wishlist =
                        readArray(
                            WISHLIST_KEY
                        );


                    setWished(
                        wishlist.some(
                            item =>
                                Number(
                                    typeof item === "object"
                                        ? item?.id
                                        : item
                                )
                                ===
                                productId
                        )
                    );

                } catch (requestError) {

                    if (
                        requestError?.name
                        ===
                        "AbortError"
                    ) {

                        return;
                    }


                    console.error(
                        requestError
                    );


                    setError(
                        requestError?.message
                        ||
                        "Unable to load this product."
                    );

                    try {
                        const currentWishlist =
                            readArray(
                                WISHLIST_KEY
                            );

                        const cleaned =
                            currentWishlist.filter(
                                item =>
                                    Number(
                                        typeof item === "object"
                                            ? item?.id
                                            : item
                                    )
                                    !==
                                    productId
                            );

                        if (
                            cleaned.length
                            !==
                            currentWishlist.length
                        ) {
                            localStorage.setItem(
                                WISHLIST_KEY,
                                JSON.stringify(
                                    cleaned
                                )
                            );

                            window.dispatchEvent(
                                new Event(
                                    "vestra:wishlist-updated"
                                )
                            );
                        }
                    } catch {}

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


            if (
                Number.isFinite(
                    productId
                )
            ) {

                loadProduct();

            } else {

                setError(
                    "Invalid product."
                );

                setLoading(
                    false
                );
            }


            return () => {

                controller.abort();
            };

        },
        [
            productId,
        ]
    );


    /* =====================================================
       SELECTED VARIANT
    ===================================================== */

    const selectedVariant =
        useMemo(
            () => {

                return variants.find(
                    variant =>
                        Number(
                            variant.id
                        )
                        ===
                        Number(
                            selectedVariantId
                        )
                )
                ||
                null;

            },
            [
                variants,
                selectedVariantId,
            ]
        );


    /* =====================================================
       COLOR VARIANTS
    ===================================================== */

    const colorVariants =
        useMemo(
            () => {
                const map = new Map();
                for (const v of variants) {
                    if (!v || v.is_active === false) continue;
                    const colorName = (v.color || "").trim();
                    if (!colorName) continue;
                    const key = colorName.toLowerCase();
                    if (!map.has(key)) {
                        map.set(key, {
                            color: colorName,
                            image_url: v.image_url,
                            variant: v,
                        });
                    } else {
                        const existing = map.get(key);
                        if (!existing.image_url && v.image_url) {
                            map.set(key, {
                                color: colorName,
                                image_url: v.image_url,
                                variant: v,
                            });
                        }
                    }
                }
                return Array.from(map.values());
            },
            [variants]
        );

    const activeColor =
        selectedColor
        ||
        selectedVariant?.color
        ||
        (colorVariants.length > 0 ? colorVariants[0].color : "");

    function handleColorChange(newColor) {
        setSelectedColor(newColor);
        const currentSize = selectedVariant?.size;
        let match = variants.find(
            v =>
                v.is_active !== false &&
                (v.color || "").trim().toLowerCase() === newColor.toLowerCase() &&
                v.size === currentSize &&
                Number(v.stock) > 0
        );
        if (!match) {
            match = variants.find(
                v =>
                    v.is_active !== false &&
                    (v.color || "").trim().toLowerCase() === newColor.toLowerCase() &&
                    Number(v.stock) > 0
            );
        }
        if (!match) {
            match = variants.find(
                v => (v.color || "").trim().toLowerCase() === newColor.toLowerCase()
            );
        }
        if (match) {
            setSelectedVariantId(Number(match.id));
        }
    }

    const activeImage =
        useMemo(
            () => {
                if (selectedVariant?.image_url) {
                    return selectedVariant.image_url;
                }
                const colorMatch = colorVariants.find(
                    c => c.color.toLowerCase() === (activeColor || "").toLowerCase()
                );
                if (colorMatch?.image_url) {
                    return colorMatch.image_url;
                }
                return product?.image_url || "/product-placeholder.png";
            },
            [
                selectedVariant,
                activeColor,
                colorVariants,
                product,
            ]
        );


    /* =====================================================
       SIZE VARIANTS
    ===================================================== */

    const sizeVariants =
        useMemo(
            () => {
                const map = new Map();
                const relevantVariants = activeColor
                    ? variants.filter(
                          v => (v?.color || "").trim().toLowerCase() === activeColor.toLowerCase()
                      )
                    : variants;
                const pool = relevantVariants.length > 0 ? relevantVariants : variants;

                for (const v of pool) {
                    if (v.is_active === false) continue;
                    const sizeKey = (v.size || "ONE").trim().toUpperCase();
                    if (!map.has(sizeKey)) {
                        map.set(sizeKey, v);
                    } else {
                        const existing = map.get(sizeKey);
                        if (Number(existing.stock) <= 0 && Number(v.stock) > 0) {
                            map.set(sizeKey, v);
                        }
                    }
                }
                return Array.from(map.values());
            },
            [variants, activeColor]
        );




    /* =====================================================
       PRICING
    ===================================================== */

    const sellingPrice =
        selectedVariant
            ?
            variantPrice(
                selectedVariant,
                product
            )
            :
            discountedPrice(
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


    const rating =
        Number(
            product?.rating
        )
        ||
        0;


    const hasVariants =
        variants.length > 0;


    const hasAvailableStock =
        hasVariants
            ?
            variants.some(
                variant =>
                    variant?.is_active !== false
                    &&
                    Number(
                        variant?.stock
                    ) > 0
            )
            :
            true;


    /* =====================================================
       WISHLIST
    ===================================================== */

    function toggleWishlist() {

        const wishlist =
            readArray(
                WISHLIST_KEY
            );


        const exists =
            wishlist.some(
                item =>
                    Number(
                        typeof item === "object"
                            ? item?.id
                            : item
                    )
                    ===
                    productId
            );


        let next;


        if (
            exists
        ) {

            next =
                wishlist.filter(
                    item =>
                        Number(
                            typeof item === "object"
                                ? item?.id
                                : item
                        )
                        !==
                        productId
                );

        } else {

            next = [

                ...wishlist,

                {
                    id:
                        productId,

                    name:
                        product?.name,

                    brand:
                        brandName(
                            product
                        ),

                    image_url:
                        product?.image_url,

                    base_price:
                        product?.base_price,

                    discount_percentage:
                        product?.discount_percentage,

                    rating:
                        product?.rating,
                },

            ];
        }


        localStorage.setItem(
            WISHLIST_KEY,
            JSON.stringify(
                next
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
       ADD TO BAG
    ===================================================== */

    function addToBag() {

        setBagMessage("");


        if (
            hasVariants
            &&
            !selectedVariant
        ) {

            setBagMessage(
                "Please select a size."
            );

            return;
        }


        if (
            selectedVariant
            &&
            Number(
                selectedVariant.stock
            )
            <=
            0
        ) {

            setBagMessage(
                "This size is currently out of stock."
            );

            return;
        }


        const bag =
            readArray(
                BAG_KEY
            );


        const variantIdentifier =
            selectedVariant
                ?
                Number(
                    selectedVariant.id
                )
                :
                null;


        const existingIndex =
            bag.findIndex(
                item =>
                    Number(
                        item.product_id
                    )
                    ===
                    productId
                    &&
                    Number(
                        item.variant_id
                    )
                    ===
                    Number(
                        variantIdentifier
                    )
            );


        const item = {

            product_id:
                productId,

            variant_id:
                variantIdentifier,

            name:
                product?.name,

            brand:
                brandName(
                    product
                ),

            image:
                activeImage,

            size:
                selectedVariant?.size
                ||
                "",

            color:
                activeColor
                ||
                selectedVariant?.color
                ||
                "",

            price:
                sellingPrice,

            quantity:
                1,
        };


        let next = [
            ...bag
        ];


        if (
            existingIndex >= 0
        ) {

            const existing =
                next[
                    existingIndex
                ];


            const currentQuantity =
                Number(
                    existing.quantity
                )
                ||
                1;


            const maximum =
                selectedVariant
                    ?
                    Math.max(
                        1,
                        Number(
                            selectedVariant.stock
                        )
                    )
                    :
                    10;


            next[
                existingIndex
            ] = {

                ...existing,

                quantity:
                    Math.min(
                        currentQuantity + 1,
                        Math.min(
                            maximum,
                            10
                        )
                    ),

            };

        } else {

            next.push(
                item
            );
        }


        localStorage.setItem(
            BAG_KEY,
            JSON.stringify(
                next
            )
        );


        window.dispatchEvent(
            new Event(
                "vestra:bag-updated"
            )
        );


        setBagMessage(
            "Added to bag"
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
                className="product-detail-page"
            >

                <div
                    className="product-detail-loading"
                >

                    <div />

                    <section>

                        <span />

                        <span />

                        <span />

                        <span />

                    </section>

                </div>

            </main>

        );
    }


    /* =====================================================
       ERROR
    ===================================================== */

    if (
        error
        ||
        !product
    ) {

        return (

            <main
                className="product-detail-page"
            >

                <div
                    className="product-detail-error"
                >

                    <h1>
                        Product unavailable
                    </h1>


                    <p>
                        {
                            error
                            ||
                            "We couldn't find this product."
                        }
                    </p>


                    <Link
                        to="/products"
                    >
                        BACK TO PRODUCTS
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
            className="product-detail-page"
        >

            {/* =================================================
                BREADCRUMB
            ================================================== */}

            <div
                className="product-detail-breadcrumb"
            >

                <Link
                    to="/"
                >
                    Home
                </Link>

                <span>
                    /
                </span>


                <Link
                    to={
                        `/products?department=${
                            encodeURIComponent(
                                product.department
                                ||
                                ""
                            )
                        }`
                    }
                >
                    {
                        product.department
                        ||
                        "Products"
                    }
                </Link>

                <span>
                    /
                </span>


                {
                    categoryName(
                        product
                    )
                    &&
                    (
                        <>

                            <span>
                                {
                                    categoryName(
                                        product
                                    )
                                }
                            </span>

                            <span>
                                /
                            </span>

                        </>
                    )
                }


                <strong>
                    {
                        product.name
                    }
                </strong>

            </div>


            {/* =================================================
                PRODUCT
            ================================================== */}

            <div
                className="product-detail-layout"
            >

                {/* =============================================
                    IMAGE GALLERY
                ============================================== */}

                <section
                    className="product-detail-gallery"
                >
                    <div
                        className="product-detail-image"
                    >
                        <img
                            key={activeImage}
                            src={
                                activeImage
                            }
                            alt={
                                `${product?.name || "Product"}${activeColor ? ` - ${activeColor}` : ""}`
                            }
                            loading="lazy"
                        />
                    </div>
                </section>


                {/* =============================================
                    PRODUCT INFORMATION
                ============================================== */}

                <section
                    className="product-detail-info"
                >

                    <div
                        className="product-detail-heading"
                    >

                        <h1>
                            {
                                brandName(
                                    product
                                )
                            }
                        </h1>


                        <h2>
                            {
                                product.name
                            }
                        </h2>


                        <div
                            className="product-detail-rating"
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

                            <b>
                                |
                            </b>

                            <em>
                                Customer Rating
                            </em>

                        </div>

                    </div>


                    <div
                        className="product-detail-divider"
                    />


                    {/* =========================================
                        PRICE
                    ========================================== */}

                    <div
                        className="product-detail-price"
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

                                    <span>
                                        MRP
                                        {" "}
                                        <del>
                                            {
                                                money(
                                                    mrp
                                                )
                                            }
                                        </del>
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


                    <p
                        className="product-detail-tax"
                    >
                        inclusive of all taxes
                    </p>

                    {/* =========================================
                        COLOR SELECTION
                    ========================================== */}

                    {
                        colorVariants.length > 0
                        &&
                        (
                            <div
                                className="product-detail-color-section"
                            >
                                <div
                                    className="product-detail-color-title"
                                >
                                    <strong>
                                        SELECT COLOUR
                                    </strong>
                                    {
                                        activeColor
                                        &&
                                        (
                                            <span
                                                className="product-detail-selected-color-name"
                                            >
                                                {activeColor}
                                            </span>
                                        )
                                    }
                                </div>

                                <div
                                    className="product-detail-colors"
                                >
                                    {
                                        colorVariants.map(
                                            c => {
                                                const isActive =
                                                    c.color.toLowerCase() === (activeColor || "").toLowerCase();
                                                const colorStyle =
                                                    getColorStyle(c.color);

                                                return (
                                                    <button
                                                        key={c.color}
                                                        type="button"
                                                        className={`product-detail-color-swatch ${isActive ? "active" : ""}`}
                                                        onClick={() => handleColorChange(c.color)}
                                                        aria-label={`Select ${c.color} colour`}
                                                    >
                                                        {
                                                            c.image_url
                                                                ?
                                                                (
                                                                    <img
                                                                        src={c.image_url}
                                                                        alt={c.color}
                                                                        className="product-detail-swatch-thumb"
                                                                    />
                                                                )
                                                                :
                                                                (
                                                                    <span
                                                                        className="product-detail-swatch-fill"
                                                                        style={colorStyle}
                                                                    />
                                                                )
                                                        }
                                                        <span
                                                            className="product-detail-swatch-label"
                                                        >
                                                            {c.color}
                                                        </span>
                                                    </button>
                                                );
                                            }
                                        )
                                    }
                                </div>
                            </div>
                        )
                    }

                    {/* =========================================
                        VARIANTS / SIZE SELECTION
                    ========================================== */}

                    {
                        hasVariants
                        &&
                        (

                            <div
                                className="product-detail-size-section"
                            >

                                <div
                                    className="product-detail-size-title"
                                >

                                    <strong>
                                        SELECT SIZE
                                    </strong>

                                    <span>
                                        SIZE CHART
                                        {" "}
                                        →
                                    </span>

                                </div>


                                <div
                                    className="product-detail-sizes"
                                >

                                    {
                                        sizeVariants.map(
                                            variant => {

                                                const available =
                                                    variant?.is_active !== false
                                                    &&
                                                    Number(
                                                        variant.stock
                                                    ) > 0;


                                                const active =
                                                    Number(
                                                        selectedVariantId
                                                    )
                                                    ===
                                                    Number(
                                                        variant.id
                                                    );


                                                return (

                                                    <button
                                                        key={
                                                            variant.id
                                                        }

                                                        type="button"

                                                        disabled={
                                                            !available
                                                        }

                                                        className={
                                                            active
                                                                ?
                                                                "active"
                                                                :
                                                                ""
                                                        }

                                                        onClick={
                                                            () =>
                                                                setSelectedVariantId(
                                                                    Number(
                                                                        variant.id
                                                                    )
                                                                )
                                                        }
                                                    >

                                                        <strong>
                                                            {
                                                                variant.size
                                                                ||
                                                                "ONE"
                                                            }
                                                        </strong>

                                                    </button>

                                                );
                                            }
                                        )
                                    }

                                </div>


                                {
                                    selectedVariant
                                    &&
                                    (

                                        <p
                                            className="product-detail-stock-line"
                                        >

                                            {
                                                Number(
                                                    selectedVariant.stock
                                                )
                                                <=
                                                5
                                                    ?
                                                    `Only ${
                                                        selectedVariant.stock
                                                    } left`
                                                    :
                                                    "In stock"
                                            }

                                        </p>

                                    )
                                }

                            </div>

                        )
                    }


                    {/* =========================================
                        ACTIONS
                    ========================================== */}

                    <div
                        className="product-detail-actions"
                    >

                        <button
                            type="button"

                            className="product-add-bag"

                            disabled={
                                !hasAvailableStock
                            }

                            onClick={
                                addToBag
                            }
                        >

                            <BagIcon />

                            {
                                hasAvailableStock
                                    ?
                                    "ADD TO BAG"
                                    :
                                    "OUT OF STOCK"
                            }

                        </button>


                        <button
                            type="button"

                            className={
                                wished
                                    ?
                                    "product-wishlist active"
                                    :
                                    "product-wishlist"
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


                    {
                        bagMessage
                        &&
                        (

                            <div
                                className={
                                    bagMessage
                                    ===
                                    "Added to bag"
                                        ?
                                        "product-detail-message success"
                                        :
                                        "product-detail-message"
                                }
                            >
                                {
                                    bagMessage
                                }
                            </div>

                        )
                    }


                    <div
                        className="product-detail-divider"
                    />


                    {/* =========================================
                        DELIVERY
                    ========================================== */}

                    <section
                        className="product-detail-delivery"
                    >

                        <h3>
                            DELIVERY OPTIONS
                        </h3>


                        <div
                            className="product-detail-pincode"
                        >

                            <input
                                type="text"
                                placeholder="Enter pincode"
                                maxLength={6}
                            />

                            <button
                                type="button"
                            >
                                CHECK
                            </button>

                        </div>


                        <p>
                            Please enter PIN code to check delivery time and availability.
                        </p>


                        <ul>

                            <li>
                                100% Original Products
                            </li>

                            <li>
                                Secure online payments
                            </li>

                            <li>
                                Easy shopping experience
                            </li>

                        </ul>

                    </section>


                    <div
                        className="product-detail-divider"
                    />


                    {/* =========================================
                        PRODUCT DETAILS
                    ========================================== */}

                    <section
                        className="product-detail-description"
                    >

                        <h3>
                            PRODUCT DETAILS
                        </h3>


                        <p>
                            {
                                product.description
                                ||
                                `${product.name} from ${
                                    brandName(
                                        product
                                    )
                                }, designed for effortless everyday style.`
                            }
                        </p>


                        {
                            categoryName(
                                product
                            )
                            &&
                            (

                                <div
                                    className="product-detail-spec"
                                >

                                    <span>
                                        Category
                                    </span>

                                    <strong>
                                        {
                                            categoryName(
                                                product
                                            )
                                        }
                                    </strong>

                                </div>

                            )
                        }


                        {
                            product.department
                            &&
                            (

                                <div
                                    className="product-detail-spec"
                                >

                                    <span>
                                        Department
                                    </span>

                                    <strong>
                                        {
                                            product.department
                                        }
                                    </strong>

                                </div>

                            )
                        }


                        {
                            selectedVariant?.color
                            &&
                            (

                                <div
                                    className="product-detail-spec"
                                >

                                    <span>
                                        Colour
                                    </span>

                                    <strong>
                                        {
                                            selectedVariant.color
                                        }
                                    </strong>

                                </div>

                            )
                        }

                    </section>

                </section>

            </div>

        </main>

    );
}


export default ProductDetail;