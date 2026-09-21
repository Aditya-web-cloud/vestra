// =====================================================
// VESTRA API
// =====================================================

export const API_URL =
    import.meta.env.VITE_API_URL || "https://vestra-backend-vr8u.onrender.com";

export const TOKEN_KEY =
    "vestra_access_token";


// =====================================================
// TOKEN
// =====================================================

function getStoredToken() {

    return localStorage.getItem(
        TOKEN_KEY
    );
}


// =====================================================
// REQUEST
// =====================================================

async function request(
    endpoint,
    options = {}
) {

    const token =
        options.token ||
        getStoredToken();


    const headers = {
        ...(options.headers || {}),
    };


    if (
        options.body &&
        !headers["Content-Type"]
    ) {

        headers["Content-Type"] =
            "application/json";
    }


    if (token) {

        headers.Authorization =
            `Bearer ${token}`;
    }


    let response;


    try {

        response = await fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,
                headers,
            }
        );


    } catch {

        throw new Error(
            "Cannot reach the VESTRA backend. Make sure FastAPI is running."
        );
    }


    let data = null;


    try {

        data = await response.json();

    } catch {

        data = null;
    }


    if (!response.ok) {

        throw new Error(
            data?.detail ||
            data?.message ||
            `Request failed (${response.status})`
        );
    }


    return data;
}


// =====================================================
// AUTH
// =====================================================

export async function loginUser(
    username,
    password
) {

    return request(
        "/login",
        {
            method: "POST",

            body: JSON.stringify({
                username,
                password,
            }),
        }
    );
}


export async function registerUser(
    payload
) {

    return request(
        "/register",
        {
            method: "POST",

            body: JSON.stringify(
                payload
            ),
        }
    );
}


export async function getCurrentUser(
    token
) {

    return request(
        "/me",
        {
            token,
        }
    );
}


export async function getMyAccess(
    token
) {

    return request(
        "/access/me",
        {
            token,
        }
    );
}


// =====================================================
// PRODUCTS
// =====================================================

export async function getProducts(
    params = {}
) {

    const searchParams =
        new URLSearchParams();


    Object.entries(
        params
    ).forEach(
        ([key, value]) => {

            if (
                value !== undefined &&
                value !== null &&
                value !== ""
            ) {

                searchParams.set(
                    key,
                    value
                );
            }
        }
    );


    const query =
        searchParams.toString();


    return request(
        `/products${
            query
                ? `?${query}`
                : ""
        }`
    );
}


export async function getProduct(
    id
) {

    return request(
        `/products/${id}`
    );
}


// =====================================================
// ADMIN
// =====================================================

export async function getAdminSummary() {

    return request(
        "/admin/summary"
    );
}


export async function getAdminUsers() {

    return request(
        "/admin/users"
    );
}


export async function getAdminUserDetails(userId) {

    return request(
        `/admin/users/${userId}/details`
    );
}


export async function updateUserRole(
    userId,
    role
) {

    return request(
        `/admin/users/${userId}/role`,
        {
            method: "PATCH",

            body: JSON.stringify({
                role,
            }),
        }
    );
}


export async function getAdminProducts() {

    return request(
        "/admin/products"
    );
}


export async function toggleAdminProductActive(
    productId
) {

    return request(
        `/admin/products/${productId}/toggle-active`,
        {
            method: "PATCH",
        }
    );
}


export async function updateAdminVariant(
    variantId,
    payload
) {

    return request(
        `/admin/variants/${variantId}`,
        {
            method: "PUT",

            body: JSON.stringify(
                payload
            ),
        }
    );
}


// =====================================================
// RAZORPAY
// =====================================================

export async function createPaymentOrder(
    items,
    shippingAddress
) {

    return request(
        "/payments/create-order",
        {
            method: "POST",

            body: JSON.stringify({
                items,

                shipping_address:
                    shippingAddress,
            }),
        }
    );
}


export async function verifyPayment(
    paymentResponse
) {

    return request(
        "/payments/verify",
        {
            method: "POST",

            body: JSON.stringify({
                razorpay_order_id:
                    paymentResponse.razorpay_order_id,

                razorpay_payment_id:
                    paymentResponse.razorpay_payment_id,

                razorpay_signature:
                    paymentResponse.razorpay_signature,
            }),
        }
    );
}

// =====================================================
// ORDERS
// =====================================================

export async function getMyOrders() {

    return request(
        "/orders/my"
    );
}


export async function getMyOrder(
    orderId
) {

    return request(
        `/orders/${orderId}`
    );
}


export async function createDirectOrder(
    items,
    shippingAddress,
    paymentMethod = "cod"
) {

    return request(
        "/orders",
        {
            method: "POST",
            body: JSON.stringify({
                items,
                shipping_address: shippingAddress,
                payment_method: paymentMethod,
            }),
        }
    );
}


export async function getOrderTracking(orderId) {
    return request(`/orders/${orderId}/tracking`);
}


export async function trackOrderPublic(identifier) {
    return request(`/orders/track/${encodeURIComponent(identifier)}`);
}


// =====================================================
// ADMIN ORDERS & CATALOGUE MANAGEMENT
// =====================================================

export async function getAdminOrders(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.status && params.status !== "all") {
        searchParams.append("status", params.status);
    }
    if (params.search) {
        searchParams.append("search", params.search);
    }
    const query = searchParams.toString();
    return request(`/admin/orders${query ? `?${query}` : ""}`);
}


export async function updateAdminOrderStatus(orderId, payload) {
    return request(
        `/admin/orders/${orderId}/status`,
        {
            method: "PATCH",
            body: JSON.stringify(payload),
        }
    );
}


export async function updateAdminOrderTracking(orderId, payload) {
    return request(
        `/admin/orders/${orderId}/tracking`,
        {
            method: "PATCH",
            body: JSON.stringify(payload),
        }
    );
}


export async function createAdminProduct(payload) {
    return request(
        "/admin/products",
        {
            method: "POST",
            body: JSON.stringify(payload),
        }
    );
}


export async function updateAdminProduct(productId, payload) {
    return request(
        `/admin/products/${productId}`,
        {
            method: "PUT",
            body: JSON.stringify(payload),
        }
    );
}


export async function deleteAdminProduct(productId) {
    return request(
        `/admin/products/${productId}`,
        {
            method: "DELETE",
        }
    );
}


export async function addAdminVariant(productId, payload) {
    return request(
        `/admin/products/${productId}/variants`,
        {
            method: "POST",
            body: JSON.stringify(payload),
        }
    );
}


export async function getCategories() {
    return request(
        "/categories"
    );
}


export async function getBrands() {
    return request(
        "/brands"
    );
}