import {
    Link
} from "react-router-dom";

import {
    motion
} from "framer-motion";

import "../styles/not-found.css";


function NotFound() {

    return (

        <main className="not-found-page">

            <div className="not-found-glow not-found-glow-one" />

            <div className="not-found-glow not-found-glow-two" />


            <motion.section
                className="not-found-content"

                initial={{
                    opacity: 0,
                    y: 25
                }}

                animate={{
                    opacity: 1,
                    y: 0
                }}

                transition={{
                    duration: 0.5
                }}
            >

                <span className="not-found-eyebrow">

                    VESTRA · 404

                </span>


                <div className="not-found-number">

                    4

                    <span>
                        V
                    </span>

                    4

                </div>


                <h1>

                    This look
                    <br />

                    <em>
                        isn't here.
                    </em>

                </h1>


                <p>

                    The page may have moved,
                    disappeared or simply never
                    made it into the VESTRA edit.

                </p>


                <div className="not-found-actions">

                    <Link
                        to="/"
                        className="not-found-primary"
                    >

                        BACK HOME

                        <b>
                            →
                        </b>

                    </Link>


                    <Link
                        to="/products"
                        className="not-found-secondary"
                    >

                        SHOP VESTRA

                    </Link>

                </div>

            </motion.section>


            <div className="not-found-big-mark">

                V

            </div>

        </main>
    );
}


export default NotFound;