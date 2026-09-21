import {
    Link,
} from "react-router-dom";

import "../styles/editorial-showcase.css";


const MAIN_IMAGE =
    "/images/banners/editorial-couture-main.jpg";


const SMALL_IMAGE =
    "/product-images/women-printed-cotton-saree.jpg";


function EditorialShowcase() {

    return (

        <section className="vestra-editorial">

            {/* =========================================
                DECORATIVE ELEMENTS
            ========================================== */}

            <div
                className="
                    vestra-editorial-star
                    vestra-editorial-star-left
                "
                aria-hidden="true"
            >
                ✧
            </div>


            <div
                className="
                    vestra-editorial-star
                    vestra-editorial-star-right
                "
                aria-hidden="true"
            >
                ✦
            </div>


            <div
                className="vestra-editorial-ring"
                aria-hidden="true"
            />


            {/* =========================================
                CONTENT
            ========================================== */}

            <div className="vestra-editorial-content">


                {/* BACKGROUND SHAPE */}

                <div
                    className="vestra-editorial-shape"
                    aria-hidden="true"
                />


                <div
                    className="vestra-editorial-outline"
                    aria-hidden="true"
                />


                {/* =====================================
                    MAIN SAREE IMAGE
                ====================================== */}

                <Link
                    to="/products?department=Women"
                    className="vestra-editorial-main-frame"
                >

                    <img
                        src={MAIN_IMAGE}
                        alt="VESTRA traditional Indian saree collection"
                        className="vestra-editorial-main-image"
                        loading="eager"
                    />

                </Link>


                {/* =====================================
                    SMALL LEHENGA IMAGE
                ====================================== */}

                <Link
                    to="/products?department=Women"
                    className="vestra-editorial-small-frame"
                >

                    <img
                        src={SMALL_IMAGE}
                        alt="VESTRA embroidered Indian lehenga collection"
                        className="vestra-editorial-small-image"
                        loading="lazy"
                    />

                </Link>


                {/* =====================================
                    LABEL
                ====================================== */}

                <Link
                    to="/products?department=Women"
                    className="vestra-editorial-label"
                >

                    <span className="vestra-editorial-eyebrow">

                        CURATED

                    </span>


                    <h2>

                        The VESTRA Edit

                    </h2>


                    <p>

                        Timeless Indian elegance

                    </p>

                </Link>

            </div>

        </section>

    );
}


export default EditorialShowcase;