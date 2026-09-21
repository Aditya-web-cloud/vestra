import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useSearchParams,
} from "react-router-dom";

import ProductCard
    from "../components/ProductCard";

import {
    getColorStyle,
} from "../utils/colorMap";

import "../styles/products.css";


/* =========================================================
   API
========================================================= */

const API_URL =
    import.meta.env.VITE_API_URL || "https://vestra-backend-vr8u.onrender.com";


/* =========================================================
   FILTER DATA
========================================================= */

const PRICE_FILTERS = [

    {
        label: "Under ₹1,000",
        min: 0,
        max: 999,
    },

    {
        label: "₹1,000 - ₹1,499",
        min: 1000,
        max: 1499,
    },

    {
        label: "₹1,500 - ₹1,999",
        min: 1500,
        max: 1999,
    },

    {
        label: "₹2,000 - ₹2,999",
        min: 2000,
        max: 2999,
    },

    {
        label: "₹3,000 & Above",
        min: 3000,
        max: Infinity,
    },

];


const DISCOUNT_FILTERS = [
    10,
    15,
    20,
    25,
    30,
];


/* =========================================================
   HELPERS
========================================================= */

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


function getCategoryName(
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
        ""
    );
}


function extractProducts(
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
            response?.products
        )
    ) {

        return response.products;
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


/* =========================================================
   PRODUCTS PAGE
========================================================= */

function Products() {

    const [
        searchParams
    ] = useSearchParams();


    const department =
        searchParams.get(
            "department"
        )
        ||
        "";


    const categorySlug =
        searchParams.get(
            "category_slug"
        )
        ||
        "";


    const categoryParam =
        searchParams.get(
            "category"
        )
        ||
        "";


    const searchTerm =
        searchParams.get(
            "search"
        )
        ||
        "";

    const colorParam =
        searchParams.get(
            "color"
        )
        ||
        "";


    /* =====================================================
       STATE
    ===================================================== */

    const [
        products,
        setProducts
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
        sort,
        setSort
    ] = useState(
        "recommended"
    );


    const [
        selectedBrands,
        setSelectedBrands
    ] = useState([]);


    const [
        selectedCategories,
        setSelectedCategories
    ] = useState([]);


    const [
        selectedColors,
        setSelectedColors
    ] = useState(
        colorParam
            ? [colorParam]
            : []
    );


    const [
        selectedPrices,
        setSelectedPrices
    ] = useState([]);


    const [
        selectedDiscount,
        setSelectedDiscount
    ] = useState(null);


    const [
        minRating,
        setMinRating
    ] = useState(null);


    const [
        filtersOpen,
        setFiltersOpen
    ] = useState(false);


    /* =====================================================
       RESET FILTERS WHEN URL CHANGES
    ===================================================== */

    useEffect(
        () => {

            setSelectedBrands([]);

            setSelectedCategories([]);

            setSelectedPrices([]);

            setSelectedDiscount(
                null
            );

            setMinRating(
                null
            );

            if (colorParam) {
                setSelectedColors([colorParam]);
            } else {
                setSelectedColors([]);
            }

            setSort(
                "recommended"
            );

        },
        [
            department,
            categorySlug,
            categoryParam,
            searchTerm,
            colorParam,
        ]
    );


    /* =====================================================
       LOAD PRODUCTS DIRECTLY FROM FASTAPI
    ===================================================== */

    useEffect(
        () => {

            const controller =
                new AbortController();


            async function loadProducts() {

                try {

                    setLoading(
                        true
                    );

                    setError("");


                    const query =
                        new URLSearchParams();


                    if (
                        department
                    ) {

                        query.set(
                            "department",
                            department
                        );
                    }


                    if (
                        categorySlug
                    ) {

                        query.set(
                            "category_slug",
                            categorySlug
                        );
                    }


                    if (
                        categoryParam
                    ) {

                        query.set(
                            "category",
                            categoryParam
                        );
                    }


                    if (
                        searchTerm
                    ) {

                        query.set(
                            "search",
                            searchTerm
                        );
                    }


                    query.set(
                        "limit",
                        "100"
                    );


                    const queryString =
                        query.toString();


                    const url =
                        `${API_URL}/products${
                            queryString
                                ?
                                `?${queryString}`
                                :
                                ""
                        }`;


                    console.log(
                        "Fetching products from:",
                        url
                    );


                    const response =
                        await fetch(
                            url,
                            {
                                method: "GET",

                                headers: {
                                    Accept:
                                        "application/json",
                                },

                                signal:
                                    controller.signal,
                            }
                        );


                    if (
                        !response.ok
                    ) {

                        const message =
                            await response.text();


                        throw new Error(
                            `Product API failed (${response.status}): ${
                                message
                                ||
                                response.statusText
                            }`
                        );
                    }


                    const data =
                        await response.json();


                    console.log(
                        "Product API JSON:",
                        data
                    );


                    const loadedProducts =
                        extractProducts(
                            data
                        );


                    console.log(
                        "Products extracted:",
                        loadedProducts
                    );


                    setProducts(
                        loadedProducts
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
                        "PRODUCT PAGE ERROR:",
                        requestError
                    );


                    setProducts([]);


                    setError(
                        requestError?.message
                        ||
                        "Unable to load products."
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


            loadProducts();


            return () => {

                controller.abort();
            };

        },
        [
            department,
            categorySlug,
            categoryParam,
            searchTerm,
        ]
    );


    /* =====================================================
       AVAILABLE BRANDS
    ===================================================== */

    const brands =
        useMemo(
            () => {

                const names =
                    products
                        .map(
                            getBrandName
                        )
                        .filter(
                            Boolean
                        );


                return [
                    ...new Set(
                        names
                    )
                ].sort(
                    (
                        first,
                        second
                    ) =>
                        first.localeCompare(
                            second
                        )
                );

            },
            [products]
        );


    /* =====================================================
       AVAILABLE CATEGORIES
    ===================================================== */

    const categories =
        useMemo(
            () => {

                const names =
                    products
                        .map(
                            getCategoryName
                        )
                        .filter(
                            Boolean
                        );


                return [
                    ...new Set(
                        names
                    )
                ].sort(
                    (
                        first,
                        second
                    ) =>
                        first.localeCompare(
                            second
                        )
                );

            },
            [products]
        );


    /* =====================================================
       AVAILABLE COLORS
    ===================================================== */

    const availableColors =
        useMemo(
            () => {

                const list =
                    products.flatMap(
                        product =>
                            (product?.variants || [])
                                .filter(
                                    variant =>
                                        variant?.is_active !== false
                                )
                                .map(
                                    variant =>
                                        variant?.color
                                )
                                .filter(
                                    Boolean
                                )
                    );


                return [
                    ...new Set(
                        list
                    )
                ].sort(
                    (
                        first,
                        second
                    ) =>
                        first.localeCompare(
                            second
                        )
                );

            },
            [products]
        );


    /* =====================================================
       FILTER + SORT
    ===================================================== */

    const filteredProducts =
        useMemo(
            () => {

                let result = [
                    ...products
                ];


                /* BRAND */

                if (
                    selectedBrands.length > 0
                ) {

                    result =
                        result.filter(
                            product =>
                                selectedBrands.includes(
                                    getBrandName(
                                        product
                                    )
                                )
                        );
                }


                /* CATEGORY */

                if (
                    selectedCategories.length > 0
                ) {

                    result =
                        result.filter(
                            product =>
                                selectedCategories.includes(
                                    getCategoryName(
                                        product
                                    )
                                )
                        );
                }


                /* COLOR */

                if (
                    selectedColors.length > 0
                ) {

                    result =
                        result.filter(
                            product => {

                                const prodColors =
                                    (product?.variants || [])
                                        .map(
                                            variant =>
                                                variant?.color?.toLowerCase()
                                        )
                                        .filter(
                                            Boolean
                                        );

                                return selectedColors.some(
                                    sc =>
                                        prodColors.includes(
                                            sc.toLowerCase()
                                        )
                                );
                            }
                        );
                }


                /* PRICE */

                if (
                    selectedPrices.length > 0
                ) {

                    result =
                        result.filter(
                            product => {

                                const price =
                                    getSellingPrice(
                                        product
                                    );


                                return selectedPrices.some(
                                    index => {

                                        const range =
                                            PRICE_FILTERS[
                                                index
                                            ];


                                        return (
                                            price
                                            >=
                                            range.min
                                            &&
                                            price
                                            <=
                                            range.max
                                        );
                                    }
                                );
                            }
                        );
                }


                /* DISCOUNT */

                if (
                    selectedDiscount
                    !==
                    null
                ) {

                    result =
                        result.filter(
                            product =>
                                Number(
                                    product?.discount_percentage
                                )
                                >=
                                selectedDiscount
                        );
                }


                /* RATING */

                if (
                    minRating
                    !==
                    null
                ) {

                    result =
                        result.filter(
                            product =>
                                Number(
                                    product?.rating
                                )
                                >=
                                minRating
                        );
                }


                /* SORT */

                switch (
                    sort
                ) {

                    case "newest":

                        result.sort(
                            (
                                first,
                                second
                            ) =>
                                Number(
                                    second?.id
                                )
                                -
                                Number(
                                    first?.id
                                )
                        );

                        break;


                    case "popular":

                        result.sort(
                            (
                                first,
                                second
                            ) =>
                                Number(
                                    second?.rating
                                )
                                -
                                Number(
                                    first?.rating
                                )
                        );

                        break;


                    case "discount":

                        result.sort(
                            (
                                first,
                                second
                            ) =>
                                Number(
                                    second?.discount_percentage
                                )
                                -
                                Number(
                                    first?.discount_percentage
                                )
                        );

                        break;


                    case "price-low":

                        result.sort(
                            (
                                first,
                                second
                            ) =>
                                getSellingPrice(
                                    first
                                )
                                -
                                getSellingPrice(
                                    second
                                )
                        );

                        break;


                    case "price-high":

                        result.sort(
                            (
                                first,
                                second
                            ) =>
                                getSellingPrice(
                                    second
                                )
                                -
                                getSellingPrice(
                                    first
                                )
                        );

                        break;


                    case "recommended":
                    default:

                        result.sort(
                            (
                                first,
                                second
                            ) => {

                                const ratingDifference =
                                    Number(
                                        second?.rating
                                    )
                                    -
                                    Number(
                                        first?.rating
                                    );


                                if (
                                    ratingDifference !== 0
                                ) {

                                    return ratingDifference;
                                }


                                return (
                                    Number(
                                        second?.discount_percentage
                                    )
                                    -
                                    Number(
                                        first?.discount_percentage
                                    )
                                );
                            }
                        );

                        break;
                }


                return result;

            },
            [
                products,
                selectedBrands,
                selectedCategories,
                selectedColors,
                selectedPrices,
                selectedDiscount,
                minRating,
                sort,
            ]
        );


    /* =====================================================
       FILTER FUNCTIONS
    ===================================================== */

    function toggleBrand(
        brand
    ) {

        setSelectedBrands(
            current =>
                current.includes(
                    brand
                )
                    ?
                    current.filter(
                        item =>
                            item !== brand
                    )
                    :
                    [
                        ...current,
                        brand,
                    ]
        );
    }


    function toggleCategory(
        category
    ) {

        setSelectedCategories(
            current =>
                current.includes(
                    category
                )
                    ?
                    current.filter(
                        item =>
                            item !== category
                    )
                    :
                    [
                        ...current,
                        category,
                    ]
        );
    }


    function toggleColor(
        color
    ) {

        setSelectedColors(
            current =>
                current.some(
                    c =>
                        c.toLowerCase() === color.toLowerCase()
                )
                    ?
                    current.filter(
                        c =>
                            c.toLowerCase() !== color.toLowerCase()
                    )
                    :
                    [
                        ...current,
                        color,
                    ]
        );
    }


    function togglePrice(
        index
    ) {

        setSelectedPrices(
            current =>
                current.includes(
                    index
                )
                    ?
                    current.filter(
                        item =>
                            item !== index
                    )
                    :
                    [
                        ...current,
                        index,
                    ]
        );
    }


    function clearFilters() {

        setSelectedBrands([]);

        setSelectedCategories([]);

        setSelectedColors([]);

        setSelectedPrices([]);

        setSelectedDiscount(
            null
        );

        setMinRating(
            null
        );
    }


    /* =====================================================
       ACTIVE FILTER COUNT
    ===================================================== */

    const activeFilterCount =
        selectedBrands.length
        +
        selectedCategories.length
        +
        selectedColors.length
        +
        selectedPrices.length
        +
        (
            selectedDiscount !== null
                ? 1
                : 0
        )
        +
        (
            minRating !== null
                ? 1
                : 0
        );


    /* =====================================================
       TITLE
    ===================================================== */

    const categoryTitle = useMemo(() => {
        if (categoryParam) return categoryParam;
        if (!categorySlug) return "";
        return categorySlug
            .split("-")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }, [categorySlug, categoryParam]);


    const pageTitle =
        searchTerm
            ?
            `Search results for "${searchTerm}"`
            :
            categoryTitle
                ?
                `${categoryTitle} Collection`
                :
                department
                    ?
                    `${department} Collection`
                    :
                    "All Products";


    /* =====================================================
       SIDEBAR
    ===================================================== */

    const filterSidebar = (

        <aside
            className={
                filtersOpen
                    ?
                    "products-filter-sidebar mobile-open"
                    :
                    "products-filter-sidebar"
            }
        >

            <div
                className="products-filter-mobile-head"
            >

                <strong>
                    FILTERS
                </strong>


                <button
                    type="button"
                    onClick={
                        () =>
                            setFiltersOpen(
                                false
                            )
                    }
                >
                    ✕
                </button>

            </div>


            {/* =================================================
                CATEGORIES
            ================================================== */}

            {
                categories.length > 0
                &&
                (

                    <div
                        className="products-filter-block"
                    >

                        <h3>
                            CATEGORIES
                        </h3>


                        <div
                            className="products-filter-options"
                        >

                            {
                                categories.map(
                                    category => (

                                        <label
                                            key={
                                                category
                                            }
                                            className="products-checkbox"
                                        >

                                            <input
                                                type="checkbox"

                                                checked={
                                                    selectedCategories.includes(
                                                        category
                                                    )
                                                }

                                                onChange={
                                                    () =>
                                                        toggleCategory(
                                                            category
                                                        )
                                                }
                                            />


                                            <span
                                                className="products-checkbox-box"
                                            />


                                            <span
                                                className="products-checkbox-text"
                                            >
                                                {
                                                    category
                                                }
                                            </span>

                                        </label>

                                    )
                                )
                            }

                        </div>

                    </div>

                )
            }


            {/* =================================================
                BRAND
            ================================================== */}

            {
                brands.length > 0
                &&
                (

                    <div
                        className="products-filter-block"
                    >

                        <h3>
                            BRAND
                        </h3>


                        <div
                            className="products-filter-options"
                        >

                            {
                                brands.map(
                                    brand => (

                                        <label
                                            key={
                                                brand
                                            }
                                            className="products-checkbox"
                                        >

                                            <input
                                                type="checkbox"

                                                checked={
                                                    selectedBrands.includes(
                                                        brand
                                                    )
                                                }

                                                onChange={
                                                    () =>
                                                        toggleBrand(
                                                            brand
                                                        )
                                                }
                                            />


                                            <span
                                                className="products-checkbox-box"
                                            />


                                            <span
                                                className="products-checkbox-text"
                                            >
                                                {
                                                    brand
                                                }
                                            </span>

                                        </label>

                                    )
                                )
                            }

                        </div>

                    </div>

                )
            }


            {/* =================================================
                COLOR
            ================================================== */}

            {
                availableColors.length > 0
                &&
                (

                    <div
                        className="products-filter-block"
                    >

                        <h3>
                            COLOR
                        </h3>


                        <div
                            className="products-filter-options"
                        >

                            {
                                availableColors.map(
                                    color => {

                                        const isChecked =
                                            selectedColors.some(
                                                c =>
                                                    c.toLowerCase()
                                                    ===
                                                    color.toLowerCase()
                                            );

                                        return (

                                            <label
                                                key={
                                                    color
                                                }
                                                className="products-checkbox products-color-filter-label"
                                            >

                                                <input
                                                    type="checkbox"

                                                    checked={
                                                        isChecked
                                                    }

                                                    onChange={
                                                        () =>
                                                            toggleColor(
                                                                color
                                                            )
                                                    }
                                                />


                                                <span
                                                    className="products-checkbox-box"
                                                />


                                                <span
                                                    className="products-color-filter-swatch"
                                                    style={
                                                        getColorStyle(
                                                            color
                                                        )
                                                    }
                                                />


                                                <span
                                                    className="products-checkbox-text"
                                                >
                                                    {
                                                        color
                                                    }
                                                </span>

                                            </label>

                                        );
                                    }
                                )
                            }

                        </div>

                    </div>

                )
            }


            {/* =================================================
                PRICE
            ================================================== */}

            <div
                className="products-filter-block"
            >

                <h3>
                    PRICE
                </h3>


                <div
                    className="products-filter-options"
                >

                    {
                        PRICE_FILTERS.map(
                            (
                                price,
                                index
                            ) => (

                                <label
                                    key={
                                        price.label
                                    }
                                    className="products-checkbox"
                                >

                                    <input
                                        type="checkbox"

                                        checked={
                                            selectedPrices.includes(
                                                index
                                            )
                                        }

                                        onChange={
                                            () =>
                                                togglePrice(
                                                    index
                                                )
                                        }
                                    />


                                    <span
                                        className="products-checkbox-box"
                                    />


                                    <span
                                        className="products-checkbox-text"
                                    >
                                        {
                                            price.label
                                        }
                                    </span>

                                </label>

                            )
                        )
                    }

                </div>

            </div>


            {/* =================================================
                DISCOUNT
            ================================================== */}

            <div
                className="products-filter-block"
            >

                <h3>
                    DISCOUNT RANGE
                </h3>


                <div
                    className="products-filter-options"
                >

                    {
                        DISCOUNT_FILTERS.map(
                            discount => (

                                <label
                                    key={
                                        discount
                                    }
                                    className="products-radio"
                                >

                                    <input
                                        type="radio"
                                        name="discount"

                                        checked={
                                            selectedDiscount
                                            ===
                                            discount
                                        }

                                        onChange={
                                            () =>
                                                setSelectedDiscount(
                                                    discount
                                                )
                                        }
                                    />


                                    <span
                                        className="products-radio-circle"
                                    />


                                    <span>
                                        {
                                            discount
                                        }% and above
                                    </span>

                                </label>

                            )
                        )
                    }

                </div>

            </div>


            {/* =================================================
                RATING
            ================================================== */}

            <div
                className="products-filter-block"
            >

                <h3>
                    CUSTOMER RATING
                </h3>


                <div
                    className="products-filter-options"
                >

                    {
                        [
                            4,
                            3,
                        ].map(
                            rating => (

                                <label
                                    key={
                                        rating
                                    }
                                    className="products-radio"
                                >

                                    <input
                                        type="radio"
                                        name="rating"

                                        checked={
                                            minRating
                                            ===
                                            rating
                                        }

                                        onChange={
                                            () =>
                                                setMinRating(
                                                    rating
                                                )
                                        }
                                    />


                                    <span
                                        className="products-radio-circle"
                                    />


                                    <span>
                                        {
                                            rating
                                        }★ & above
                                    </span>

                                </label>

                            )
                        )
                    }

                </div>

            </div>


            {
                activeFilterCount > 0
                &&
                (

                    <button
                        type="button"
                        className="products-clear-bottom"
                        onClick={
                            clearFilters
                        }
                    >
                        CLEAR ALL FILTERS
                    </button>

                )
            }

        </aside>

    );


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <main
            className="products-page"
        >

            {/* =================================================
                BREADCRUMB
            ================================================== */}

            <div
                className="products-breadcrumb"
            >

                <span>
                    Home
                </span>

                <b>
                    /
                </b>


                {
                    department
                    &&
                    (

                        <>

                            <span>
                                {
                                    department
                                }
                            </span>

                            <b>
                                /
                            </b>

                        </>

                    )
                }


                <strong>
                    {
                        pageTitle
                    }
                </strong>

            </div>


            {/* =================================================
                PAGE HEADING
            ================================================== */}

            <div
                className="products-page-heading"
            >

                <h1>
                    {
                        pageTitle
                    }
                </h1>


                <span>

                    {
                        loading
                            ?
                            "Loading..."
                            :
                            `${filteredProducts.length} items`
                    }

                </span>

            </div>


            {/* =================================================
                TOOLBAR
            ================================================== */}

            <div
                className="products-toolbar"
            >

                <div
                    className="products-toolbar-filter"
                >

                    <strong>
                        FILTERS
                    </strong>


                    {
                        activeFilterCount > 0
                        &&
                        (

                            <button
                                type="button"
                                onClick={
                                    clearFilters
                                }
                            >
                                CLEAR ALL
                            </button>

                        )
                    }

                </div>


                <button
                    type="button"
                    className="products-mobile-filter-button"

                    onClick={
                        () =>
                            setFiltersOpen(
                                true
                            )
                    }
                >

                    FILTERS


                    {
                        activeFilterCount > 0
                        &&
                        (

                            <span>
                                {
                                    activeFilterCount
                                }
                            </span>

                        )
                    }

                </button>


                <div
                    className="products-sort"
                >

                    <label
                        htmlFor="products-sort"
                    >
                        Sort by :
                    </label>


                    <select
                        id="products-sort"

                        value={
                            sort
                        }

                        onChange={
                            event =>
                                setSort(
                                    event.target.value
                                )
                        }
                    >

                        <option
                            value="recommended"
                        >
                            Recommended
                        </option>

                        <option
                            value="newest"
                        >
                            What&apos;s New
                        </option>

                        <option
                            value="popular"
                        >
                            Popularity
                        </option>

                        <option
                            value="discount"
                        >
                            Better Discount
                        </option>

                        <option
                            value="price-high"
                        >
                            Price: High to Low
                        </option>

                        <option
                            value="price-low"
                        >
                            Price: Low to High
                        </option>

                    </select>

                </div>

            </div>


            {/* =================================================
                MAIN LAYOUT
            ================================================== */}

            <div
                className="products-layout"
            >

                {
                    filterSidebar
                }


                <section
                    className="products-results"
                >

                    {/* =========================================
                        LOADING
                    ========================================== */}

                    {
                        loading
                        &&
                        (

                            <div
                                className="products-loading-grid"
                            >

                                {
                                    Array.from({
                                        length: 12,
                                    }).map(
                                        (
                                            _,
                                            index
                                        ) => (

                                            <div
                                                className="products-loading-card"
                                                key={
                                                    index
                                                }
                                            >

                                                <div />

                                                <span />

                                                <span />

                                                <span />

                                            </div>

                                        )
                                    )
                                }

                            </div>

                        )
                    }


                    {/* =========================================
                        ERROR
                    ========================================== */}

                    {
                        !loading
                        &&
                        error
                        &&
                        (

                            <div
                                className="products-state"
                            >

                                <h2>
                                    Unable to load products
                                </h2>


                                <p>
                                    {
                                        error
                                    }
                                </p>


                                <p>
                                    API:
                                    {" "}
                                    {
                                        API_URL
                                    }
                                </p>

                            </div>

                        )
                    }


                    {/* =========================================
                        EMPTY
                    ========================================== */}

                    {
                        !loading
                        &&
                        !error
                        &&
                        filteredProducts.length === 0
                        &&
                        (

                            <div
                                className="products-state"
                            >

                                <h2>
                                    No products found
                                </h2>


                                <p>
                                    No products matched this department or the selected filters.
                                </p>


                                {
                                    activeFilterCount > 0
                                    &&
                                    (

                                        <button
                                            type="button"

                                            onClick={
                                                clearFilters
                                            }
                                        >
                                            CLEAR FILTERS
                                        </button>

                                    )
                                }

                            </div>

                        )
                    }


                    {/* =========================================
                        PRODUCTS
                    ========================================== */}

                    {
                        !loading
                        &&
                        !error
                        &&
                        filteredProducts.length > 0
                        &&
                        (

                            <div
                                className="products-grid"
                            >

                                {
                                    filteredProducts.map(
                                        product => (

                                            <ProductCard
                                                key={
                                                    product.id
                                                }

                                                product={
                                                    product
                                                }
                                            />

                                        )
                                    )
                                }

                            </div>

                        )
                    }

                </section>

            </div>


            {/* =================================================
                MOBILE FILTER OVERLAY
            ================================================== */}

            {
                filtersOpen
                &&
                (

                    <button
                        type="button"

                        className="products-filter-overlay"

                        aria-label="Close filters"

                        onClick={
                            () =>
                                setFiltersOpen(
                                    false
                                )
                        }
                    />

                )
            }

        </main>

    );
}


export default Products;