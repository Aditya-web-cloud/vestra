import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import ProductCard
    from "../components/ProductCard";

import "../styles/home.css";


const API_URL =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";


/* =========================================================
   HERO
========================================================= */

const heroSlides = [

    {
        id: 1,

        eyebrow:
            "APSARA TRENDS FESTIVE EDIT",

        title:
            "Indian Elegance, Reimagined",

        subtitle:
            "Celebrate the season in timeless royal silk & handloom styles.",

        offer:
            "UP TO 40% OFF",

        button:
            "SHOP WOMEN",

        link:
            "/products?department=Women",

        image:
            "/images/banners/hero-festive-women.jpg",
    },

    {
        id: 2,

        eyebrow:
            "BEAUTY DAYS",

        title:
            "Glow. Glam. Radiate.",

        subtitle:
            "Curated luxury serums, velvet lipsticks and beauty essentials.",

        offer:
            "UP TO 25% OFF",

        button:
            "SHOP BEAUTY",

        link:
            "/products?department=Beauty",

        image:
            "/images/banners/hero-beauty-luxury.jpg",
    },

    {
        id: 3,

        eyebrow:
            "ROYAL JEWELLERY EDIT",

        title:
            "Timeless Sparkle & Gold",

        subtitle:
            "Exquisite handcrafted diamond chokers, solitaires and pearls.",

        offer:
            "UP TO 30% OFF",

        button:
            "SHOP JEWELLERY",

        link:
            "/products?department=Jewellery",

        image:
            "/images/banners/hero-jewellery-luxury.jpg",
    },

    {
        id: 4,

        eyebrow:
            "KIDS COLLECTION",

        title:
            "Playful Vibes & Colors",

        subtitle:
            "Everyday cotton styles, denim jackets and comfortable sets.",

        offer:
            "FLAT 20% OFF",

        button:
            "SHOP KIDS",

        link:
            "/products?department=Kids",

        image:
            "/images/banners/hero-kids-luxury.jpg",
    },

    {
        id: 5,

        eyebrow:
            "STREETWEAR & SNEAKERS",

        title:
            "The Modern Collection",

        subtitle:
            "Urban essentials, minimal layers and iconic footwear.",

        offer:
            "UP TO 35% OFF",

        button:
            "SHOP URBAN",

        link:
            "/products?department=Women&search=Sneakers",

        image:
            "/images/banners/hero-urban-streetwear.jpg",
    },

];





/* =========================================================
   WOW DEALS
========================================================= */

const wowDeals = [

    {
        eyebrow:
            "VESTRA WOMEN",

        title:
            "Extra",

        offer:
            "20% OFF",

        text:
            "Festive & everyday styles",

        link:
            "/products?department=Women",

        className:
            "wow-pink",
    },

    {
        eyebrow:
            "BEAUTY DAYS",

        title:
            "Up To",

        offer:
            "25% OFF",

        text:
            "Makeup, skincare & fragrances",

        link:
            "/products?department=Beauty",

        className:
            "wow-purple",
    },

    {
        eyebrow:
            "KIDS STORE",

        title:
            "Flat",

        offer:
            "20% OFF",

        text:
            "Playful looks for little stars",

        link:
            "/products?department=Kids",

        className:
            "wow-blue",
    },

    {
        eyebrow:
            "JEWELLERY EDIT",

        title:
            "Up To",

        offer:
            "30% OFF",

        text:
            "Sparkle for every occasion",

        link:
            "/products?department=Jewellery",

        className:
            "wow-gold",
    },

];


/* =========================================================
   SHOP BY CATEGORY
========================================================= */

const categories = [

    {
        title:
            "Sarees",

        offer:
            "UP TO 30% OFF",

        link:
            "/products?department=Women&search=Saree",

        image:
            "/product-images/women-silk-ikat-saree.png",
    },

    {
        title:
            "Kurtas & Sets",

        offer:
            "UP TO 25% OFF",

        link:
            "/products?department=Women&search=Kurta",

        image:
            "/product-images/women-magenta-kurta-set.png",
    },

    {
        title:
            "Anarkali Gowns",

        offer:
            "UP TO 30% OFF",

        link:
            "/products?department=Women&search=Anarkali",

        image:
            "/product-images/women-anarkali-yellow.jpg",
    },

    {
        title:
            "Royal Heritage Anarkalis",

        offer:
            "UP TO 25% OFF",

        link:
            "/products?department=Women&search=Anarkali",

        image:
            "/product-images/women-maroon-anarkali-gown.png",
    },

    {
        title:
            "Festive Suits",

        offer:
            "NEW SEASON",

        link:
            "/products?department=Women",

        image:
            "/product-images/women-purple-embroidered-suit.png",
    },

    {
        title:
            "Tops & Peplum Kurtis",

        offer:
            "UP TO 20% OFF",

        link:
            "/products?department=Women&search=Top",

        image:
            "/product-images/women-black-floral-kurti.png",
    },

    {
        title:
            "Denim & Wide Leg Jeans",

        offer:
            "UP TO 20% OFF",

        link:
            "/products?department=Women&search=Jeans",

        image:
            "/product-images/women-wide-leg-jeans.png",
    },

    {
        title:
            "Active & Bomber Jackets",

        offer:
            "UP TO 25% OFF",

        link:
            "/products?department=Women&search=Jacket",

        image:
            "/product-images/women-white-bomber-jacket.png",
    },

    {
        title:
            "Kids Skater Tees",

        offer:
            "FLAT 20% OFF",

        link:
            "/products?department=Kids&search=T-Shirt",

        image:
            "/product-images/kids-tshirts-set.png",
    },

    {
        title:
            "Kids Hoodies & Sweatshirts",

        offer:
            "FROM ₹699",

        link:
            "/products?department=Kids&search=Hoodie",

        image:
            "/product-images/kids-pepe-hoodie.png",
    },

    {
        title:
            "Kids Cargo Joggers",

        offer:
            "UP TO 25% OFF",

        link:
            "/products?department=Kids&search=Joggers",

        image:
            "/product-images/kids-cargo-joggers.png",
    },

    {
        title:
            "Kids Party Wear",

        offer:
            "FROM ₹899",

        link:
            "/products?department=Kids&search=Dress",

        image:
            "/product-images/kids-blush-twirl-dress.jpg",
    },

    {
        title:
            "Lip Colour & Oils",

        offer:
            "UP TO 20% OFF",

        link:
            "/products?department=Beauty&search=Lip",

        image:
            "/product-images/mars-peachy-dew-lip-oil.png",
    },

    {
        title:
            "Velvet Matte Lipsticks",

        offer:
            "UP TO 15% OFF",

        link:
            "/products?department=Beauty&search=Lipstick",

        image:
            "/product-images/velvet-matte-lipstick.jpg",
    },

    {
        title:
            "Skincare & Glow Serums",

        offer:
            "UP TO 25% OFF",

        link:
            "/products?department=Beauty&search=Serum",

        image:
            "/product-images/vitamin-c-glow-serum.jpg",
    },

    {
        title:
            "Rosemary Hair Growth Oil",

        offer:
            "UP TO 20% OFF",

        link:
            "/products?department=Beauty&search=Hair",

        image:
            "/product-images/mamaearth-rosemary-hair-oil.png",
    },

    {
        title:
            "Hair Shampoos & Combos",

        offer:
            "UP TO 20% OFF",

        link:
            "/products?department=Beauty&search=Hair",

        image:
            "/product-images/plix-flaxseed-shampoo-conditioner.png",
    },

    {
        title:
            "Luxury Fragrances",

        offer:
            "UP TO 20% OFF",

        link:
            "/products?department=Beauty&search=Parfum",

        image:
            "/product-images/signature-eau-de-parfum.jpg",
    },

    {
        title:
            "Diamond & Solitaire Rings",

        offer:
            "UP TO 20% OFF",

        link:
            "/products?department=Jewellery&category_slug=jewellery-rings",

        image:
            "/product-images/jewellery-diamond-solitaire-ring.jpg",
    },

    {
        title:
            "Chandelier & Stud Earrings",

        offer:
            "FLAT 15% OFF",

        link:
            "/products?department=Jewellery&category_slug=jewellery-earrings",

        image:
            "/product-images/jewellery-sapphire-chandelier-earrings.jpg",
    },

    {
        title:
            "Gold Necklaces & Chokers",

        offer:
            "UP TO 25% OFF",

        link:
            "/products?department=Jewellery&category_slug=jewellery-necklaces",

        image:
            "/product-images/jewellery-emerald-pendant-necklace.jpg",
    },

];


/* =========================================================
   HELPERS
========================================================= */

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
        ""
    );
}


function getProductDepartment(
    product
) {

    const direct =
        String(
            product?.department
            ||
            ""
        )
            .trim()
            .toLowerCase();


    if (
        direct
    ) {

        return direct;
    }


    /*
     * Fallback makes the page compatible with catalogue
     * responses where department is not returned.
     */
    const brand =
        getBrandName(
            product
        )
            .toLowerCase();


    if (
        brand.includes(
            "woman"
        )
        ||
        brand.includes(
            "women"
        )
    ) {

        return "women";
    }


    if (
        brand.includes(
            "kids"
        )
        ||
        brand.includes(
            "kid"
        )
    ) {

        return "kids";
    }


    if (
        brand.includes(
            "beauty"
        )
    ) {

        return "beauty";
    }


    if (
        brand.includes(
            "jewel"
        )
    ) {

        return "jewellery";
    }


    return "";
}


function getDiscount(
    product
) {

    return Number(
        product?.discount_percentage
    )
    ||
    0;
}


function getRating(
    product
) {

    return Number(
        product?.rating
    )
    ||
    0;
}


function productScore(
    product
) {

    return (
        (
            product?.is_featured
                ?
                100
                :
                0
        )
        +
        getRating(
            product
        )
        *
        10
        +
        getDiscount(
            product
        )
    );
}


/* =========================================================
   GUARANTEED UNIQUE HOMEPAGE SECTIONS

   A product ID is added to "usedIds" as soon as it is
   selected. Therefore the same product can NEVER appear
   in two product sections on the homepage.
========================================================= */

function createHomepageSections(
    products
) {

    const usedIds =
        new Set();


    function pickProducts(
        source,
        count
    ) {

        const selected = [];


        for (
            const product
            of
            source
        ) {

            const id =
                Number(
                    product?.id
                );


            if (
                !Number.isFinite(
                    id
                )
            ) {

                continue;
            }


            if (
                usedIds.has(
                    id
                )
            ) {

                continue;
            }


            usedIds.add(
                id
            );


            selected.push(
                product
            );


            if (
                selected.length
                >=
                count
            ) {

                break;
            }
        }


        return selected;
    }


    function departmentProducts(
        department
    ) {

        return products
            .filter(
                product =>
                    getProductDepartment(
                        product
                    )
                    ===
                    department
            )
            .sort(
                (
                    first,
                    second
                ) =>
                    productScore(
                        second
                    )
                    -
                    productScore(
                        first
                    )
            );
    }


    /*
     * Biggest Deals intentionally takes only TWO items
     * from each department.
     *
     * With the expanded catalogue, that leaves 10 different
     * products for every dedicated department section.
     */

    const biggestDeals = [];


    [
        "women",
        "kids",
        "beauty",
        "jewellery",
    ].forEach(
        department => {

            biggestDeals.push(
                ...pickProducts(
                    departmentProducts(
                        department
                    )
                        .sort(
                            (
                                first,
                                second
                            ) =>
                                getDiscount(
                                    second
                                )
                                -
                                getDiscount(
                                    first
                                )
                                ||
                                getRating(
                                    second
                                )
                                -
                                getRating(
                                    first
                                )
                        ),
                    2
                )
            );

        }
    );


    const women =
        pickProducts(
            departmentProducts(
                "women"
            ),
            10
        );


    const kids =
        pickProducts(
            departmentProducts(
                "kids"
            ),
            10
        );


    const beauty =
        pickProducts(
            departmentProducts(
                "beauty"
            ),
            10
        );


    const jewellery =
        pickProducts(
            departmentProducts(
                "jewellery"
            ),
            10
        );


    return {

        biggestDeals,

        women,

        kids,

        beauty,

        jewellery,

    };
}


/* =========================================================
   PRODUCT SECTION
========================================================= */

function ProductSection({
    title,
    subtitle,
    products,
    link,
    loading,
}) {

    return (

        <section
            className="home-product-section"
        >

            <div
                className="home-section-heading-row"
            >

                <div>

                    <h2>
                        {
                            title
                        }
                    </h2>


                    <p>
                        {
                            subtitle
                        }
                    </p>

                </div>


                <Link
                    to={
                        link
                    }
                    className="home-view-all"
                >
                    VIEW ALL
                </Link>

            </div>


            {
                loading
                    ?
                    (

                        <div
                            className="home-products-loading"
                        >

                            {
                                Array.from({
                                    length: 10,
                                }).map(
                                    (
                                        _,
                                        index
                                    ) => (

                                        <div
                                            className="home-product-skeleton"
                                            key={
                                                index
                                            }
                                        />

                                    )
                                )
                            }

                        </div>

                    )
                    :
                    products.length > 0
                        ?
                        (

                            <div
                                className="home-products-grid"
                            >

                                {
                                    products.map(
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
                        :
                        (

                            <div
                                className="home-empty-products"
                            >
                                More styles are coming soon
                            </div>

                        )
            }

        </section>

    );
}


/* =========================================================
   HOME
========================================================= */

function Home() {

    const [
        products,
        setProducts
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        heroIndex,
        setHeroIndex
    ] = useState(0);


    /* =====================================================
       HERO ROTATION
    ===================================================== */

    useEffect(
        () => {

            const interval =
                window.setInterval(
                    () => {

                        setHeroIndex(
                            current =>
                                (
                                    current + 1
                                )
                                %
                                heroSlides.length
                        );

                    },
                    5500
                );


            return () => {

                window.clearInterval(
                    interval
                );
            };

        },
        []
    );


    /* =====================================================
       LOAD ALL HOMEPAGE PRODUCTS
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


                    /*
                     * Expanded catalogue contains 48 products.
                     * 80 leaves room for us to add more later.
                     */
                    const response =
                        await fetch(
                            `${API_URL}/products?limit=80`,
                            {

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

                        throw new Error(
                            `Product request failed (${response.status})`
                        );
                    }


                    const data =
                        await response.json();


                    setProducts(
                        extractProducts(
                            data
                        )
                    );

                } catch (
                    error
                ) {

                    if (
                        error?.name
                        ===
                        "AbortError"
                    ) {

                        return;
                    }


                    console.error(
                        "Homepage product loading failed:",
                        error
                    );


                    setProducts([]);

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
        []
    );


    /* =====================================================
       BUILD NON-DUPLICATING SECTIONS
    ===================================================== */

    const sections =
        useMemo(
            () =>
                createHomepageSections(
                    products
                ),
            [products]
        );





    const hero =
        heroSlides[
            heroIndex
        ];


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <main
            className="vestra-home"
        >

            {/* =================================================
                SALE STRIP
            ================================================== */}

            <Link
                to="/products"
                className="home-sale-strip"
            >

                <span>
                    APSARA TRENDS SALE
                </span>


                <strong>
                    BIGGEST FASHION DEALS
                </strong>


                <span>
                    SHOP NOW →
                </span>

            </Link>


            {/* =================================================
                HERO
            ================================================== */}

            <section
                className="home-hero"
            >

                <Link
                    to={
                        hero.link
                    }
                    className="home-hero-link"
                >

                    <img
                        src={
                            hero.image
                        }
                        alt={
                            hero.title
                            ||
                            "VESTRA collection"
                        }
                        className="home-hero-image"
                    />

                </Link>


                <div
                    className="home-hero-dots"
                >

                    {
                        heroSlides.map(
                            (
                                slide,
                                index
                            ) => (

                                <button
                                    type="button"

                                    key={
                                        slide.id
                                    }

                                    className={
                                        index
                                        ===
                                        heroIndex
                                            ?
                                            "active"
                                            :
                                            ""
                                    }

                                    aria-label={
                                        `Show banner ${
                                            index + 1
                                        }`
                                    }

                                    onClick={
                                        () =>
                                            setHeroIndex(
                                                index
                                            )
                                    }
                                />

                            )
                        )
                    }

                </div>

            </section>


            {/* =================================================
                WOW DEALS
            ================================================== */}

            <section
                className="home-wow-section"
            >

                <div
                    className="home-section-title"
                >

                    <h2>
                        WOW DEALS
                    </h2>

                </div>


                <div
                    className="home-wow-banner"
                >

                    {
                        wowDeals.map(
                            (
                                deal,
                                index
                            ) => (

                                <Link
                                    key={
                                        `${deal.eyebrow}-${index}`
                                    }

                                    to={
                                        deal.link
                                    }

                                    className={
                                        `home-wow-deal ${
                                            deal.className
                                        }`
                                    }
                                >

                                    <span
                                        className="home-wow-eyebrow"
                                    >
                                        {
                                            deal.eyebrow
                                        }
                                    </span>


                                    <div
                                        className="home-wow-offer"
                                    >

                                        <span>
                                            {
                                                deal.title
                                            }
                                        </span>


                                        <strong>
                                            {
                                                deal.offer
                                            }
                                        </strong>

                                    </div>


                                    <p>
                                        {
                                            deal.text
                                        }
                                    </p>


                                    <span
                                        className="home-wow-shop"
                                    >
                                        SHOP NOW →
                                    </span>

                                </Link>

                            )
                        )
                    }

                </div>

            </section>


            {/* =================================================
                BIGGEST DEALS

                8 products:
                2 Women
                2 Kids
                2 Beauty
                2 Jewellery
            ================================================== */}

            <ProductSection
                title="BIGGEST DEALS ON TOP BRANDS"
                subtitle="Our strongest offers across every department"
                products={
                    sections.biggestDeals
                }
                link="/products"
                loading={
                    loading
                }
            />


            {/* =================================================
                WOMEN
            ================================================== */}

            <ProductSection
                title="WOMEN'S FASHION FAVOURITES"
                subtitle="Sarees, kurtas, dresses, co-ords, denim and more"
                products={
                    sections.women
                }
                link="/products?department=Women"
                loading={
                    loading
                }
            />


            {/* =================================================
                SHOP BY CATEGORY
            ================================================== */}

            <section
                className="home-category-section"
            >

                <div
                    className="home-section-title"
                >

                    <h2>
                        SHOP BY CATEGORY
                    </h2>

                </div>


                <div
                    className="home-category-grid"
                >

                    {
                        categories.map(
                            (
                                category,
                                index
                            ) => (

                                <Link
                                    to={
                                        category.link
                                    }

                                    className="home-category-card"

                                    key={
                                        `${category.title}-${index}`
                                    }
                                >

                                    <div
                                        className="home-category-image"
                                    >

                                        <img
                                            src={
                                                category.image
                                            }
                                            alt={
                                                category.title
                                            }
                                        />

                                    </div>


                                    <div
                                        className="home-category-copy"
                                    >

                                        <h3>
                                            {
                                                category.title
                                            }
                                        </h3>


                                        <strong>
                                            {
                                                category.offer
                                            }
                                        </strong>


                                        <span>
                                            SHOP NOW
                                        </span>

                                    </div>

                                </Link>

                            )
                        )
                    }

                </div>

            </section>


            {/* =================================================
                KIDS

                Unique products only.
            ================================================== */}

            <ProductSection
                title="KIDS' FASHION FAVOURITES"
                subtitle="Casuals, ethnic wear, baby styles and winterwear"
                products={
                    sections.kids
                }
                link="/products?department=Kids"
                loading={
                    loading
                }
            />


            {/* =================================================
                BEAUTY

                Unique products only.
            ================================================== */}

            <ProductSection
                title="BEAUTY MUST-HAVES"
                subtitle="Makeup, skincare, haircare, fragrance and body care"
                products={
                    sections.beauty
                }
                link="/products?department=Beauty"
                loading={
                    loading
                }
            />


            {/* =================================================
                JEWELLERY

                Unique products only.
            ================================================== */}

            <ProductSection
                title="THE JEWELLERY EDIT"
                subtitle="Earrings, necklaces, rings, bracelets and traditional sets"
                products={
                    sections.jewellery
                }
                link="/products?department=Jewellery"
                loading={
                    loading
                }
            />


            {/* =================================================
                FESTIVE BANNER
            ================================================== */}

            <section
                className="home-festive-banner"
            >

                <Link
                    to="/products?department=Women"
                >

                    <img
                        src="/images/banners/festive-grand-banner.jpg"
                        alt="VESTRA grand royal festive collection"
                    />


                    <div
                        className="home-festive-overlay"
                    />


                    <div
                        className="home-festive-copy"
                    >

                        <span>
                            VESTRA FESTIVE STORE
                        </span>


                        <h2>
                            Timeless Indian Style
                        </h2>


                        <strong>
                            UP TO 40% OFF
                        </strong>


                        <em>
                            EXPLORE NOW →
                        </em>

                    </div>

                </Link>

            </section>


            {/* =================================================
                TRUST
            ================================================== */}

            <section
                className="home-trust-strip"
            >

                <div>

                    <strong>
                        100% ORIGINAL
                    </strong>

                    <span>
                        Authentic products
                    </span>

                </div>


                <div>

                    <strong>
                        SECURE PAYMENTS
                    </strong>

                    <span>
                        Razorpay protected
                    </span>

                </div>


                <div>

                    <strong>
                        EASY SHOPPING
                    </strong>

                    <span>
                        Cart and wishlist
                    </span>

                </div>


                <div>

                    <strong>
                        CURATED FOR YOU
                    </strong>

                    <span>
                        Fashion, beauty & jewellery
                    </span>

                </div>

            </section>

        </main>

    );
}


export default Home;