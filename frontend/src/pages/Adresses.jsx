import {
    useEffect,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import {
    motion
} from "framer-motion";

import {
    useAuth
} from "../context/AuthContext";

import {
    addressStorageKey,
    createLocalId,
    readStorageArray,
    writeStorageArray
} from "../utils/accountStorage";

import "../styles/adresses.css";


const EMPTY_FORM = {
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    type: "Home"
};


function Addresses() {

    const {
        user,
        authLoading
    } = useAuth();


    const [
        addresses,
        setAddresses
    ] = useState([]);


    const [
        form,
        setForm
    ] = useState(
        EMPTY_FORM
    );


    const [
        formOpen,
        setFormOpen
    ] = useState(false);


    const [
        editingId,
        setEditingId
    ] = useState(null);


    const [
        error,
        setError
    ] = useState("");


    const [
        message,
        setMessage
    ] = useState("");


    // =====================================================
    // LOAD ADDRESSES
    // =====================================================

    useEffect(
        () => {

            if (!user) {

                setAddresses(
                    []
                );

                return;
            }


            const key =
                addressStorageKey(
                    user
                );


            setAddresses(
                readStorageArray(
                    key
                )
            );

        },
        [user]
    );


    // =====================================================
    // SAVE
    // =====================================================

    function persistAddresses(
        nextAddresses
    ) {

        setAddresses(
            nextAddresses
        );


        writeStorageArray(
            addressStorageKey(
                user
            ),
            nextAddresses
        );


        window.dispatchEvent(
            new Event(
                "vestra-addresses-updated"
            )
        );
    }


    // =====================================================
    // INPUTS
    // =====================================================

    function updateField(
        event
    ) {

        const {
            name,
            value
        } = event.target;


        setForm(
            current => ({
                ...current,
                [name]:
                    value
            })
        );


        setError(
            ""
        );


        setMessage(
            ""
        );
    }


    // =====================================================
    // OPEN NEW
    // =====================================================

    function openNewAddress() {

        setForm({
            ...EMPTY_FORM,

            name:
                user?.name
                ||
                ""
        });


        setEditingId(
            null
        );


        setError(
            ""
        );


        setMessage(
            ""
        );


        setFormOpen(
            true
        );
    }


    // =====================================================
    // EDIT
    // =====================================================

    function editAddress(
        address
    ) {

        setForm({
            name:
                address.name
                ||
                "",

            phone:
                address.phone
                ||
                "",

            line1:
                address.line1
                ||
                "",

            line2:
                address.line2
                ||
                "",

            city:
                address.city
                ||
                "",

            state:
                address.state
                ||
                "",

            postalCode:
                address.postalCode
                ||
                "",

            country:
                address.country
                ||
                "India",

            type:
                address.type
                ||
                "Home"
        });


        setEditingId(
            address.id
        );


        setError(
            ""
        );


        setMessage(
            ""
        );


        setFormOpen(
            true
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    // =====================================================
    // CANCEL
    // =====================================================

    function cancelForm() {

        setForm(
            EMPTY_FORM
        );


        setEditingId(
            null
        );


        setError(
            ""
        );


        setFormOpen(
            false
        );
    }


    // =====================================================
    // SUBMIT
    // =====================================================

    function handleSubmit(
        event
    ) {

        event.preventDefault();


        const cleaned = {

            name:
                form.name.trim(),

            phone:
                form.phone.trim(),

            line1:
                form.line1.trim(),

            line2:
                form.line2.trim(),

            city:
                form.city.trim(),

            state:
                form.state.trim(),

            postalCode:
                form.postalCode.trim(),

            country:
                form.country.trim(),

            type:
                form.type
        };


        if (
            cleaned.name.length < 2
        ) {

            setError(
                "Enter the recipient's name."
            );

            return;
        }


        if (
            !/^[0-9+\-\s]{8,16}$/.test(
                cleaned.phone
            )
        ) {

            setError(
                "Enter a valid phone number."
            );

            return;
        }


        if (
            cleaned.line1.length < 5
        ) {

            setError(
                "Enter a complete street address."
            );

            return;
        }


        if (
            !cleaned.city
            ||
            !cleaned.state
        ) {

            setError(
                "Enter your city and state."
            );

            return;
        }


        if (
            cleaned.postalCode.length < 4
        ) {

            setError(
                "Enter a valid postal code."
            );

            return;
        }


        if (editingId) {

            const next =
                addresses.map(
                    address => {

                        if (
                            address.id !==
                            editingId
                        ) {

                            return address;
                        }


                        return {
                            ...address,
                            ...cleaned
                        };
                    }
                );


            persistAddresses(
                next
            );


            setMessage(
                "Address updated."
            );


        } else {

            const newAddress = {

                id:
                    createLocalId(
                        "ADR"
                    ),

                ...cleaned,

                isDefault:
                    addresses.length ===
                    0
            };


            persistAddresses([
                ...addresses,
                newAddress
            ]);


            setMessage(
                "Address saved."
            );
        }


        setForm(
            EMPTY_FORM
        );


        setEditingId(
            null
        );


        setFormOpen(
            false
        );
    }


    // =====================================================
    // DEFAULT
    // =====================================================

    function makeDefault(
        addressId
    ) {

        const next =
            addresses.map(
                address => ({
                    ...address,

                    isDefault:
                        address.id ===
                        addressId
                })
            );


        persistAddresses(
            next
        );


        setMessage(
            "Default delivery address updated."
        );
    }


    // =====================================================
    // DELETE
    // =====================================================

    function deleteAddress(
        addressId
    ) {

        const removedAddress =
            addresses.find(
                address =>
                    address.id ===
                    addressId
            );


        let next =
            addresses.filter(
                address =>
                    address.id !==
                    addressId
            );


        if (
            removedAddress?.isDefault
            &&
            next.length > 0
        ) {

            next =
                next.map(
                    (
                        address,
                        index
                    ) => ({
                        ...address,

                        isDefault:
                            index === 0
                    })
                );
        }


        persistAddresses(
            next
        );


        setMessage(
            "Address removed."
        );
    }


    // =====================================================
    // LOADING
    // =====================================================

    if (authLoading) {

        return (

            <main className="addresses-loading">

                <div className="addresses-spinner" />

                <span>

                    Loading your addresses...

                </span>

            </main>
        );
    }


    // =====================================================
    // GUEST
    // =====================================================

    if (!user) {

        return (

            <main className="addresses-guest">

                <motion.div
                    className="addresses-guest-card"

                    initial={{
                        opacity: 0,
                        y: 20
                    }}

                    animate={{
                        opacity: 1,
                        y: 0
                    }}
                >

                    <span className="addresses-eyebrow">

                        DELIVERY

                    </span>


                    <div className="addresses-guest-mark">

                        ⌖

                    </div>


                    <h1>

                        Sign in to save
                        <br />

                        your addresses.

                    </h1>


                    <p>

                        Your delivery locations
                        stay connected to your
                        VESTRA account.

                    </p>


                    <Link
                        to="/login"
                        className="addresses-dark-button"
                    >

                        SIGN IN

                        <b>
                            →
                        </b>

                    </Link>

                </motion.div>

            </main>
        );
    }


    return (

        <main className="addresses-page">

            {/* =================================================
                HERO
            ================================================== */}

            <section className="addresses-hero">

                <div className="addresses-hero-inner">

                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 18
                        }}

                        animate={{
                            opacity: 1,
                            y: 0
                        }}
                    >

                        <span className="addresses-eyebrow">

                            MY VESTRA

                        </span>


                        <h1>

                            Delivery
                            <br />

                            <em>
                                addresses.
                            </em>

                        </h1>


                        <p>

                            Save the places where
                            you want your VESTRA
                            pieces delivered.

                        </p>

                    </motion.div>


                    <div className="addresses-hero-mark">

                        ⌖

                    </div>

                </div>

            </section>


            {/* =================================================
                CONTENT
            ================================================== */}

            <section className="addresses-content">

                <div className="addresses-toolbar">

                    <div>

                        <span>

                            SAVED LOCATIONS

                        </span>


                        <strong>

                            {
                                addresses.length
                            }

                            {
                                addresses.length === 1
                                    ? " address"
                                    : " addresses"
                            }

                        </strong>

                    </div>


                    <button
                        type="button"

                        onClick={
                            openNewAddress
                        }
                    >

                        + ADD NEW ADDRESS

                    </button>

                </div>


                {
                    message
                    &&
                    (

                        <div className="addresses-message">

                            <span>
                                ✓
                            </span>

                            <p>

                                {
                                    message
                                }

                            </p>

                        </div>

                    )
                }


                {/* =================================================
                    FORM
                ================================================== */}

                {
                    formOpen
                    &&
                    (

                        <motion.section
                            className="address-form-panel"

                            initial={{
                                opacity: 0,
                                y: 15
                            }}

                            animate={{
                                opacity: 1,
                                y: 0
                            }}
                        >

                            <div className="address-form-heading">

                                <div>

                                    <span>

                                        {
                                            editingId
                                                ? "EDIT ADDRESS"
                                                : "NEW ADDRESS"
                                        }

                                    </span>


                                    <h2>

                                        {
                                            editingId
                                                ? "Update delivery details"
                                                : "Where should we deliver?"
                                        }

                                    </h2>

                                </div>


                                <button
                                    type="button"

                                    onClick={
                                        cancelForm
                                    }
                                >

                                    ×

                                </button>

                            </div>


                            <form
                                className="address-form"

                                onSubmit={
                                    handleSubmit
                                }
                            >

                                <div className="address-field-grid">

                                    <label>

                                        <span>
                                            FULL NAME
                                        </span>


                                        <input
                                            type="text"

                                            name="name"

                                            value={
                                                form.name
                                            }

                                            onChange={
                                                updateField
                                            }

                                            placeholder=
                                                "Recipient name"
                                        />

                                    </label>


                                    <label>

                                        <span>
                                            PHONE
                                        </span>


                                        <input
                                            type="tel"

                                            name="phone"

                                            value={
                                                form.phone
                                            }

                                            onChange={
                                                updateField
                                            }

                                            placeholder=
                                                "Phone number"
                                        />

                                    </label>

                                </div>


                                <label>

                                    <span>
                                        ADDRESS LINE 1
                                    </span>


                                    <input
                                        type="text"

                                        name="line1"

                                        value={
                                            form.line1
                                        }

                                        onChange={
                                            updateField
                                        }

                                        placeholder=
                                            "House, building, street"
                                    />

                                </label>


                                <label>

                                    <span>
                                        ADDRESS LINE 2
                                    </span>


                                    <input
                                        type="text"

                                        name="line2"

                                        value={
                                            form.line2
                                        }

                                        onChange={
                                            updateField
                                        }

                                        placeholder=
                                            "Area, landmark (optional)"
                                    />

                                </label>


                                <div className="address-field-grid address-three-grid">

                                    <label>

                                        <span>
                                            CITY
                                        </span>


                                        <input
                                            type="text"

                                            name="city"

                                            value={
                                                form.city
                                            }

                                            onChange={
                                                updateField
                                            }

                                            placeholder=
                                                "City"
                                        />

                                    </label>


                                    <label>

                                        <span>
                                            STATE
                                        </span>


                                        <input
                                            type="text"

                                            name="state"

                                            value={
                                                form.state
                                            }

                                            onChange={
                                                updateField
                                            }

                                            placeholder=
                                                "State"
                                        />

                                    </label>


                                    <label>

                                        <span>
                                            PIN / POSTAL CODE
                                        </span>


                                        <input
                                            type="text"

                                            name="postalCode"

                                            value={
                                                form.postalCode
                                            }

                                            onChange={
                                                updateField
                                            }

                                            placeholder=
                                                "Postal code"
                                        />

                                    </label>

                                </div>


                                <div className="address-field-grid">

                                    <label>

                                        <span>
                                            COUNTRY
                                        </span>


                                        <input
                                            type="text"

                                            name="country"

                                            value={
                                                form.country
                                            }

                                            onChange={
                                                updateField
                                            }
                                        />

                                    </label>


                                    <label>

                                        <span>
                                            ADDRESS TYPE
                                        </span>


                                        <select
                                            name="type"

                                            value={
                                                form.type
                                            }

                                            onChange={
                                                updateField
                                            }
                                        >

                                            <option value="Home">
                                                Home
                                            </option>

                                            <option value="Work">
                                                Work
                                            </option>

                                            <option value="Other">
                                                Other
                                            </option>

                                        </select>

                                    </label>

                                </div>


                                {
                                    error
                                    &&
                                    (

                                        <div className="address-form-error">

                                            <span>
                                                !
                                            </span>

                                            {
                                                error
                                            }

                                        </div>

                                    )
                                }


                                <div className="address-form-actions">

                                    <button
                                        type="button"

                                        className="address-cancel-button"

                                        onClick={
                                            cancelForm
                                        }
                                    >

                                        CANCEL

                                    </button>


                                    <button
                                        type="submit"

                                        className="address-save-button"
                                    >

                                        {
                                            editingId
                                                ? "SAVE CHANGES"
                                                : "SAVE ADDRESS"
                                        }

                                        <b>
                                            →
                                        </b>

                                    </button>

                                </div>

                            </form>

                        </motion.section>

                    )
                }


                {/* =================================================
                    EMPTY
                ================================================== */}

                {
                    addresses.length === 0
                    &&
                    !formOpen
                    &&
                    (

                        <div className="addresses-empty">

                            <div>

                                ⌖

                            </div>


                            <span className="addresses-eyebrow">

                                NO ADDRESSES YET

                            </span>


                            <h2>

                                Add your first
                                <br />

                                delivery address.

                            </h2>


                            <p>

                                Save a location now
                                and checkout will be
                                much faster later.

                            </p>


                            <button
                                type="button"

                                onClick={
                                    openNewAddress
                                }
                            >

                                ADD ADDRESS

                                <b>
                                    →
                                </b>

                            </button>

                        </div>

                    )
                }


                {/* =================================================
                    ADDRESS GRID
                ================================================== */}

                {
                    addresses.length > 0
                    &&
                    (

                        <div className="addresses-grid">

                            {
                                addresses.map(
                                    (
                                        address,
                                        index
                                    ) => (

                                        <motion.article
                                            className={
                                                address.isDefault
                                                    ? "address-card default"
                                                    : "address-card"
                                            }

                                            key={
                                                address.id
                                            }

                                            initial={{
                                                opacity: 0,
                                                y: 20
                                            }}

                                            animate={{
                                                opacity: 1,
                                                y: 0
                                            }}

                                            transition={{
                                                delay:
                                                    Math.min(
                                                        index * 0.05,
                                                        0.2
                                                    )
                                            }}
                                        >

                                            <div className="address-card-top">

                                                <span className="address-type">

                                                    {
                                                        address.type
                                                    }

                                                </span>


                                                {
                                                    address.isDefault
                                                    &&
                                                    (

                                                        <span className="address-default-badge">

                                                            DEFAULT

                                                        </span>

                                                    )
                                                }

                                            </div>


                                            <h3>

                                                {
                                                    address.name
                                                }

                                            </h3>


                                            <p>

                                                {
                                                    address.line1
                                                }

                                                {
                                                    address.line2
                                                    &&
                                                    (
                                                        <>
                                                            <br />

                                                            {
                                                                address.line2
                                                            }
                                                        </>
                                                    )
                                                }

                                                <br />

                                                {
                                                    address.city
                                                }, {
                                                    address.state
                                                } {
                                                    address.postalCode
                                                }

                                                <br />

                                                {
                                                    address.country
                                                }

                                            </p>


                                            <span className="address-phone">

                                                {
                                                    address.phone
                                                }

                                            </span>


                                            <div className="address-card-divider" />


                                            <div className="address-card-actions">

                                                <button
                                                    type="button"

                                                    onClick={
                                                        () =>
                                                            editAddress(
                                                                address
                                                            )
                                                    }
                                                >

                                                    EDIT

                                                </button>


                                                {
                                                    !address.isDefault
                                                    &&
                                                    (

                                                        <button
                                                            type="button"

                                                            onClick={
                                                                () =>
                                                                    makeDefault(
                                                                        address.id
                                                                    )
                                                            }
                                                        >

                                                            MAKE DEFAULT

                                                        </button>

                                                    )
                                                }


                                                <button
                                                    type="button"

                                                    className="address-delete"

                                                    onClick={
                                                        () =>
                                                            deleteAddress(
                                                                address.id
                                                            )
                                                    }
                                                >

                                                    REMOVE

                                                </button>

                                            </div>

                                        </motion.article>

                                    )
                                )
                            }

                        </div>

                    )
                }


                {
                    addresses.length > 0
                    &&
                    (

                        <div className="addresses-checkout-strip">

                            <div>

                                <span>
                                    READY TO SHOP?
                                </span>


                                <strong>

                                    Your delivery
                                    details are ready.

                                </strong>

                            </div>


                            <Link
                                to="/cart"
                            >

                                GO TO BAG

                                <b>
                                    →
                                </b>

                            </Link>

                        </div>

                    )
                }

            </section>

        </main>
    );
}


export default Addresses;