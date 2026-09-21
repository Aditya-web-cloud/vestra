import {
    Link
} from "react-router-dom";

import "../styles/footer.css";


const FOOTER_GROUPS = [
    {
        title: "SHOP",

        links: [
            {
                label: "Women",
                to: "/products?department=women"
            },
            {
                label: "Kids",
                to: "/products?department=kids"
            },
            {
                label: "Beauty",
                to: "/products?department=beauty"
            },
            {
                label: "Jewellery",
                to: "/products?department=jewellery"
            },
            {
                label: "All Products",
                to: "/products"
            }
        ]
    },

    {
        title: "YOUR APSARA TRENDS",

        links: [
            {
                label: "My Account",
                to: "/profile"
            },
            {
                label: "Wishlist",
                to: "/wishlist"
            },
            {
                label: "Shopping Bag",
                to: "/cart"
            },
            {
                label: "Orders",
                to: "/orders"
            },
            {
                label: "Addresses",
                to: "/addresses"
            }
        ]
    },

    {
        title: "DISCOVER",

        links: [
            {
                label: "New Arrivals",
                to: "/products?sort=newest"
            },
            {
                label: "Top Rated",
                to: "/products?sort=rating"
            },
            {
                label: "Best Discounts",
                to: "/products?sort=discount"
            },
            {
                label: "The Apsara Edit",
                to: "/"
            }
        ]
    }
];


function Footer() {

    const year =
        new Date()
            .getFullYear();


    return (

        <footer className="vestra-footer">

            {/* =============================================
                NEWSLETTER / BRAND STRIP
            ============================================== */}

            <section className="footer-top">

                <div className="footer-top-inner">

                    <div className="footer-top-copy">

                        <span className="footer-eyebrow">

                            THE APSARA TRENDS EDIT

                        </span>


                        <h2>

                            Style,
                            <br />

                            delivered.

                        </h2>


                        <p>

                            Fashion, beauty and jewellery
                            curated around the way you
                            want to feel.

                        </p>

                    </div>


                    <div className="footer-newsletter">

                        <span>

                            STAY IN THE LOOP

                        </span>


                        <p>

                            Join the Apsara Trends list for
                            new edits, collections and
                            style stories.

                        </p>


                        <form
                            onSubmit={
                                event =>
                                    event.preventDefault()
                            }
                        >

                            <input
                                type="email"
                                placeholder="Your email address"
                                aria-label="Email address"
                            />


                            <button
                                type="submit"
                            >

                                JOIN

                                <b>
                                    →
                                </b>

                            </button>

                        </form>


                        <small>

                            Newsletter signup is
                            visual only for now.

                        </small>

                    </div>

                </div>

            </section>


            {/* =============================================
                MAIN FOOTER
            ============================================== */}

            <section className="footer-main">

                <div className="footer-main-inner">

                    {/* BRAND */}

                    <div className="footer-brand-column">

                        <Link
                            to="/"
                            className="footer-logo"
                            style={{ display: "inline-block", background: "#ffffff", padding: "6px 14px", borderRadius: "10px" }}
                        >

                            <img
                                src="/apsara_logo.png"
                                alt="Apsara Trends - Style For Every Woman, Every Age"
                                style={{ height: "42px", display: "block", objectFit: "contain" }}
                            />

                        </Link>


                        <p>

                            A modern destination for
                            fashion, beauty and
                            jewellery — curated with
                            individuality at its core.

                        </p>


                        <div className="footer-values">

                            <span>
                                ✦ CURATED STYLE
                            </span>

                            <span>
                                ♢ SECURE SHOPPING
                            </span>

                            <span>
                                ↻ EASY RETURNS
                            </span>

                        </div>

                    </div>


                    {/* LINKS */}

                    <div className="footer-link-grid">

                        {
                            FOOTER_GROUPS.map(
                                group => (

                                    <div
                                        className="footer-link-column"

                                        key={
                                            group.title
                                        }
                                    >

                                        <h3>

                                            {
                                                group.title
                                            }

                                        </h3>


                                        {
                                            group.links.map(
                                                link => (

                                                    <Link
                                                        key={
                                                            link.label
                                                        }

                                                        to={
                                                            link.to
                                                        }
                                                    >

                                                        {
                                                            link.label
                                                        }

                                                    </Link>

                                                )
                                            )
                                        }

                                    </div>

                                )
                            )
                        }

                    </div>

                </div>

            </section>


            {/* =============================================
                BOTTOM
            ============================================== */}

            <section className="footer-bottom">

                <div className="footer-bottom-inner">

                    <span>

                        © {year} APSARA TRENDS

                    </span>


                    <div>

                        <span>

                            DESIGNED FOR YOUR STYLE

                        </span>


                        <i>
                            ✦
                        </i>


                        <span>

                            INDIA

                        </span>

                    </div>


                    <Link to="/">

                        BACK TO TOP ↑

                    </Link>

                </div>

            </section>


            {/* GIANT BRAND */}

            <div className="footer-wordmark" style={{ letterSpacing: "12px", fontSize: "clamp(32px, 8vw, 90px)" }}>

                APSARA TRENDS

            </div>

        </footer>
    );
}

export default Footer;