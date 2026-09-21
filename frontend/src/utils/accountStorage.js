// =========================================================
// VESTRA ACCOUNT STORAGE
// =========================================================

export function addressStorageKey(
    user
) {

    if (!user?.username) {

        return null;
    }


    return (
        `vestra_addresses_${user.username}`
    );
}


export function orderStorageKey(
    user
) {

    if (!user?.username) {

        return null;
    }


    return (
        `vestra_orders_${user.username}`
    );
}


// =========================================================
// SAFE ARRAY READER
// =========================================================

export function readStorageArray(
    key
) {

    if (!key) {

        return [];
    }


    try {

        const data =
            JSON.parse(
                localStorage.getItem(
                    key
                )
                ||
                "[]"
            );


        return Array.isArray(data)
            ? data
            : [];

    } catch {

        return [];
    }
}


// =========================================================
// SAFE ARRAY WRITER
// =========================================================

export function writeStorageArray(
    key,
    value
) {

    if (!key) {

        return;
    }


    localStorage.setItem(
        key,
        JSON.stringify(
            Array.isArray(value)
                ? value
                : []
        )
    );
}


// =========================================================
// ID
// =========================================================

export function createLocalId(
    prefix = "VST"
) {

    if (
        typeof crypto !==
        "undefined"
        &&
        typeof crypto.randomUUID ===
        "function"
    ) {

        return (
            `${prefix}-${crypto.randomUUID()}`
        );
    }


    return (
        `${prefix}-${Date.now()}-${Math.floor(
            Math.random() * 100000
        )}`
    );
}