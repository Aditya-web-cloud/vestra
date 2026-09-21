import {
    Fragment,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import {
    addAdminVariant,
    createAdminProduct,
    deleteAdminProduct,
    getAdminOrders,
    getAdminProducts,
    getAdminSummary,
    getAdminUserDetails,
    getAdminUsers,
    getBrands,
    getCategories,
    toggleAdminProductActive,
    updateAdminOrderStatus,
    updateAdminOrderTracking,
    updateAdminVariant,
    updateUserRole
} from "../services/api";

import {
    useAuth
} from "../context/AuthContext";

import "../styles/staff.css";


const INITIAL_PRODUCT_FORM = {
    name: "",
    department: "Women",
    category_id: "",
    category_name: "",
    brand_id: "",
    brand_name: "",
    gender: "Women",
    base_price: "",
    discount_percentage: 0,
    description: "",
    image_url: "",
    is_featured: false,
    is_active: true,
    variants: [
        {
            size: "Free Size",
            color: "Standard",
            price: "",
            stock: 15,
            sku: "",
            image_url: ""
        }
    ]
};


function AdminDashboard() {

    const {
        user,
        logout
    } = useAuth();


    const [summary, setSummary] = useState(null);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [liveSync, setLiveSync] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Busy indicators
    const [busyUserId, setBusyUserId] = useState(null);
    const [busyProductId, setBusyProductId] = useState(null);
    const [busyVariantId, setBusyVariantId] = useState(null);
    const [busyOrderId, setBusyOrderId] = useState(null);

    // Role drafts
    const [roleDrafts, setRoleDrafts] = useState({});

    // Product catalogue filters & editing
    const [selectedDepartment, setSelectedDepartment] = useState("all");
    const [productSearch, setProductSearch] = useState("");
    const [editingProduct, setEditingProduct] = useState(null);
    const [variantDrafts, setVariantDrafts] = useState({});

    // Orders filters & modal
    const [orderStatusFilter, setOrderStatusFilter] = useState("all");
    const [orderSearch, setOrderSearch] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [newOrderAlert, setNewOrderAlert] = useState(null);

    // Shipment and Tracking form state
    const [trackingForm, setTrackingForm] = useState({
        courier_name: "",
        tracking_number: "",
        current_location: "",
        estimated_delivery: "",
        checkpoint_title: "",
        checkpoint_description: "",
    });
    const [savingTracking, setSavingTracking] = useState(false);

    useEffect(() => {
        if (selectedOrder) {
            setTrackingForm({
                courier_name: selectedOrder.courier_name || "Apsara Express Priority Logistics",
                tracking_number: selectedOrder.tracking_number || `APS-EXP-${selectedOrder.id}`,
                current_location: selectedOrder.current_location || "Apsara Central Fulfilment Hub, Mumbai",
                estimated_delivery: selectedOrder.estimated_delivery || "",
                checkpoint_title: "",
                checkpoint_description: "",
            });
        }
    }, [selectedOrder?.id]);

    // Customer details modal & new customer tracking
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    const [customerDetails, setCustomerDetails] = useState(null);
    const [loadingCustomerDetails, setLoadingCustomerDetails] = useState(false);
    const [customerModalTab, setCustomerModalTab] = useState("orders");
    const [newCustomerAlert, setNewCustomerAlert] = useState(null);
    const [userSearch, setUserSearch] = useState("");
    const lastKnownUserIdsRef = useRef(new Set());

    // Add Product Modal
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [creatingProduct, setCreatingProduct] = useState(false);
    const [productForm, setProductForm] = useState(INITIAL_PRODUCT_FORM);

    // Add Variant Modal
    const [showAddVariantModal, setShowAddVariantModal] = useState(false);
    const [selectedProductIdForVariant, setSelectedProductIdForVariant] = useState(null);
    const [newVariantForm, setNewVariantForm] = useState({
        size: "M",
        color: "Standard",
        price: "",
        stock: 10,
        sku: ""
    });

    const lastKnownOrderIdsRef = useRef(new Set());
    const isFirstLoadRef = useRef(true);


    // =====================================================
    // LOAD DASHBOARD DATA
    // =====================================================

    async function loadDashboard(showLoader = true) {
        try {
            if (showLoader) {
                setLoading(true);
            }
            setIsSyncing(true);
            setError("");

            const [
                summaryData,
                userData,
                productData,
                orderData,
                categoryData,
                brandData
            ] = await Promise.all([
                getAdminSummary(),
                getAdminUsers(),
                getAdminProducts(),
                getAdminOrders(),
                getCategories().catch(() => []),
                getBrands().catch(() => [])
            ]);

            const safeUsers = Array.isArray(userData) ? userData : [];
            const safeProducts = Array.isArray(productData) ? productData : [];
            const safeOrders = Array.isArray(orderData) ? orderData : [];

            setSummary(summaryData);
            setUsers(safeUsers);
            setProducts(safeProducts);
            setOrders(safeOrders);
            setCategories(Array.isArray(categoryData) ? categoryData : []);
            setBrands(Array.isArray(brandData) ? brandData : []);

            // Track IDs for new order alert detection
            const currentIds = new Set(safeOrders.map(o => o.id));
            const currentUserIds = new Set(safeUsers.map(u => u.id));

            if (!isFirstLoadRef.current) {
                const newOrders = safeOrders.filter(o => !lastKnownOrderIdsRef.current.has(o.id));
                if (newOrders.length > 0) {
                    const latest = newOrders[0];
                    setNewOrderAlert({
                        id: latest.id,
                        customer: latest.customer?.name || "A customer",
                        amount: latest.total_amount,
                        itemsCount: latest.items_count || 1,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    });
                }

                // Check for new customer registrations
                const newUsers = safeUsers.filter(u => !lastKnownUserIdsRef.current.has(u.id));
                if (newUsers.length > 0) {
                    const latestUser = newUsers[0];
                    setNewCustomerAlert({
                        id: latestUser.id,
                        name: latestUser.name || latestUser.username,
                        username: latestUser.username,
                        email: latestUser.email,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    });
                }
            } else {
                isFirstLoadRef.current = false;
            }
            lastKnownOrderIdsRef.current = currentIds;
            lastKnownUserIdsRef.current = currentUserIds;

            // Update role drafts
            const nextRoleDrafts = {};
            safeUsers.forEach(item => {
                nextRoleDrafts[item.id] = item.role;
            });
            setRoleDrafts(nextRoleDrafts);

            // If an expanded product is currently open, refresh its data
            if (editingProduct) {
                const refreshed = safeProducts.find(p => p.id === editingProduct.id);
                if (refreshed) {
                    setEditingProduct(refreshed);
                }
            }

            // If customer modal is open, refresh silently
            if (selectedCustomerId) {
                getAdminUserDetails(selectedCustomerId).then(setCustomerDetails).catch(() => {});
            }

        } catch (err) {
            setError(err.message || "Unable to load admin dashboard.");
        } finally {
            if (showLoader) {
                setLoading(false);
            }
            setIsSyncing(false);
        }
    }


    // =====================================================
    // INITIAL LOAD & LIVE POLLING (EVERY 5 SECONDS)
    // =====================================================

    useEffect(() => {
        loadDashboard(true);
    }, []);

    useEffect(() => {
        if (!liveSync) return;

        const interval = setInterval(() => {
            loadDashboard(false);
        }, 5000);

        return () => clearInterval(interval);
    }, [liveSync, editingProduct]);


    // =====================================================
    // UPDATE ORDER STATUS
    // =====================================================

    async function handleUpdateOrderStatus(orderId, nextStatus, nextPaymentStatus = null) {

        // ── Optimistic update: reflect the change in the UI immediately ──
        const prevOrders = orders;
        setOrders(prev => prev.map(o => {
            if (o.id !== orderId) return o;
            return {
                ...o,
                ...(nextStatus        ? { status:         nextStatus }        : {}),
                ...(nextPaymentStatus ? { payment_status: nextPaymentStatus } : {}),
            };
        }));
        if (selectedOrder?.id === orderId) {
            setSelectedOrder(prev => ({
                ...prev,
                ...(nextStatus        ? { status:         nextStatus }        : {}),
                ...(nextPaymentStatus ? { payment_status: nextPaymentStatus } : {}),
            }));
        }

        try {
            setBusyOrderId(orderId);
            setMessage("");
            setError("");

            const payload = {};
            if (nextStatus) payload.status = nextStatus;
            if (nextPaymentStatus) payload.payment_status = nextPaymentStatus;

            const res = await updateAdminOrderStatus(orderId, payload);

            // Sync with the confirmed server response
            setOrders(prev => prev.map(o => o.id === orderId ? res.order : o));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder(res.order);
            }

            setMessage(`Order #${orderId} status updated to ${nextStatus || nextPaymentStatus}.`);

            // Also refresh summary quietly
            getAdminSummary().then(setSummary).catch(() => {});

        } catch (err) {
            // Roll back the optimistic update on failure
            setOrders(prevOrders);
            setError(err.message || "Failed to update order status.");
        } finally {
            setBusyOrderId(null);
        }
    }


    // =====================================================
    // UPDATE SHIPMENT & REAL-TIME TRACKING
    // =====================================================

    function generateAwb() {
        const seed = Math.floor(100000 + Math.random() * 900000);
        const newAwb = `APS-EXP-${selectedOrder?.id || 100}-${seed % 1000}`;
        setTrackingForm(prev => ({ ...prev, tracking_number: newAwb }));
    }

    async function handleSaveTracking(statusOverride = null) {
        if (!selectedOrder) return;
        try {
            setSavingTracking(true);
            setMessage("");
            setError("");

            const payload = {
                courier_name: trackingForm.courier_name,
                tracking_number: trackingForm.tracking_number,
                current_location: trackingForm.current_location,
                estimated_delivery: trackingForm.estimated_delivery,
                checkpoint_title: trackingForm.checkpoint_title,
                checkpoint_description: trackingForm.checkpoint_description,
            };

            if (statusOverride) {
                payload.status = statusOverride;
            }

            const res = await updateAdminOrderTracking(selectedOrder.id, payload);

            setOrders(prev => prev.map(o => o.id === selectedOrder.id ? res.order : o));
            setSelectedOrder(res.order);

            setTrackingForm(prev => ({
                ...prev,
                checkpoint_title: "",
                checkpoint_description: "",
            }));

            setMessage(`Tracking & telemetry updated for Order #${selectedOrder.id}.`);
            getAdminSummary().then(setSummary).catch(() => {});
        } catch (err) {
            setError(err.message || "Failed to update tracking details.");
        } finally {
            setSavingTracking(false);
        }
    }


    // =====================================================
    // CHANGE USER ROLE
    // =====================================================

    async function handleRoleChange(targetUser) {
        const nextRole = roleDrafts[targetUser.id];
        if (!nextRole || nextRole === targetUser.role) return;

        try {
            setBusyUserId(targetUser.id);
            setMessage("");
            setError("");

            await updateUserRole(targetUser.id, nextRole);
            await loadDashboard(false);
            setMessage(`Updated ${targetUser.username}'s role to ${nextRole.toUpperCase()}.`);

        } catch (err) {
            setError(err.message || "Unable to update user role.");
        } finally {
            setBusyUserId(null);
        }
    }


    // =====================================================
    // VIEW CUSTOMER DETAILS MODAL
    // =====================================================

    async function handleOpenCustomerDetails(userId) {
        try {
            setSelectedCustomerId(userId);
            setLoadingCustomerDetails(true);
            setCustomerModalTab("orders");
            setError("");
            const data = await getAdminUserDetails(userId);
            setCustomerDetails(data);
        } catch (err) {
            setError(err.message || "Failed to load customer details.");
        } finally {
            setLoadingCustomerDetails(false);
        }
    }


    // =====================================================
    // TOGGLE PRODUCT ACTIVE
    // =====================================================

    async function handleToggleProductActive(product) {
        try {
            setBusyProductId(product.id);
            setMessage("");
            setError("");

            const result = await toggleAdminProductActive(product.id);
            await loadDashboard(false);

            setMessage(`${product.name} is now ${result.is_active ? "active" : "inactive"}.`);

        } catch (err) {
            setError(err.message || "Unable to change product status.");
        } finally {
            setBusyProductId(null);
        }
    }


    // =====================================================
    // DELETE PRODUCT
    // =====================================================

    async function handleDeleteProduct(product) {
        if (!window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            setBusyProductId(product.id);
            setMessage("");
            setError("");

            await deleteAdminProduct(product.id);
            await loadDashboard(false);

            if (editingProduct?.id === product.id) {
                setEditingProduct(null);
            }

            setMessage(`Product "${product.name}" was deleted.`);

        } catch (err) {
            setError(err.message || "Failed to delete product.");
        } finally {
            setBusyProductId(null);
        }
    }


    // =====================================================
    // VARIANT DRAWER & EDITING
    // =====================================================

    function openVariantEditor(product) {
        if (editingProduct?.id === product.id) {
            setEditingProduct(null);
            setVariantDrafts({});
            return;
        }

        setEditingProduct(product);

        const initialDrafts = {};
        (product.variants || []).forEach(v => {
            initialDrafts[v.id] = {
                price: v.price,
                stock: v.stock,
                is_active: v.is_active
            };
        });

        setVariantDrafts(initialDrafts);
    }

    async function handleSaveVariant(variantId) {
        const draft = variantDrafts[variantId];
        if (!draft) return;

        try {
            setBusyVariantId(variantId);
            setMessage("");
            setError("");

            await updateAdminVariant(variantId, {
                price: Number(draft.price),
                stock: Number(draft.stock),
                is_active: Boolean(draft.is_active)
            });

            await loadDashboard(false);
            setMessage("Variant inventory updated successfully.");

        } catch (err) {
            setError(err.message || "Failed to update variant.");
        } finally {
            setBusyVariantId(null);
        }
    }


    // =====================================================
    // ADD PRODUCT FORM HANDLERS
    // =====================================================

    function handleAddVariantRow() {
        setProductForm(prev => ({
            ...prev,
            variants: [
                ...prev.variants,
                {
                    size: "M",
                    color: "Standard",
                    price: prev.base_price || "",
                    stock: 10,
                    sku: "",
                    image_url: ""
                }
            ]
        }));
    }

    function handleRemoveVariantRow(index) {
        setProductForm(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    }

    function handleVariantChange(index, field, value) {
        setProductForm(prev => {
            const updated = [...prev.variants];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, variants: updated };
        });
    }

    async function handleCreateProductSubmit(e) {
        e.preventDefault();

        if (!productForm.name.trim()) {
            setError("Product name is required.");
            return;
        }

        if (!productForm.base_price || Number(productForm.base_price) <= 0) {
            setError("A valid base price greater than 0 is required.");
            return;
        }

        try {
            setCreatingProduct(true);
            setError("");
            setMessage("");

            const payload = {
                name: productForm.name.trim(),
                description: productForm.description.trim(),
                department: productForm.department,
                category_id: productForm.category_id ? Number(productForm.category_id) : null,
                category_name: productForm.category_name.trim() || null,
                brand_id: productForm.brand_id ? Number(productForm.brand_id) : null,
                brand_name: productForm.brand_name.trim() || null,
                gender: productForm.gender,
                base_price: Number(productForm.base_price),
                discount_percentage: Number(productForm.discount_percentage || 0),
                image_url: productForm.image_url.trim() || null,
                is_featured: Boolean(productForm.is_featured),
                is_active: Boolean(productForm.is_active),
                variants: productForm.variants.map(v => ({
                    size: v.size.trim() || "Free Size",
                    color: v.color.trim() || "Standard",
                    price: v.price ? Number(v.price) : Number(productForm.base_price),
                    stock: Math.max(0, parseInt(v.stock, 10) || 0),
                    sku: v.sku.trim() || null,
                    image_url: v.image_url.trim() || null,
                    is_active: true
                }))
            };

            const res = await createAdminProduct(payload);

            await loadDashboard(false);

            setMessage(`Product "${res.product.name}" created with ${res.product.variants.length} variant(s)!`);
            setShowAddProductModal(false);
            setProductForm(INITIAL_PRODUCT_FORM);

        } catch (err) {
            setError(err.message || "Failed to create product.");
        } finally {
            setCreatingProduct(false);
        }
    }


    // =====================================================
    // ADD VARIANT TO EXISTING PRODUCT
    // =====================================================

    async function handleAddVariantToExistingProductSubmit(e) {
        e.preventDefault();
        if (!selectedProductIdForVariant) return;

        try {
            setCreatingProduct(true);
            setError("");

            await addAdminVariant(selectedProductIdForVariant, {
                size: newVariantForm.size.trim() || "Free Size",
                color: newVariantForm.color.trim() || "Standard",
                price: newVariantForm.price ? Number(newVariantForm.price) : null,
                stock: Math.max(0, parseInt(newVariantForm.stock, 10) || 0),
                sku: newVariantForm.sku.trim() || null
            });

            await loadDashboard(false);
            setMessage("New variant added to product successfully.");
            setShowAddVariantModal(false);
            setNewVariantForm({ size: "M", color: "Standard", price: "", stock: 10, sku: "" });

        } catch (err) {
            setError(err.message || "Failed to add variant.");
        } finally {
            setCreatingProduct(false);
        }
    }


    // =====================================================
    // FILTERED PRODUCTS & ORDERS
    // =====================================================

    const filteredProducts = useMemo(() => {
        return products.filter(item => {
            const matchesDept =
                selectedDepartment === "all" ||
                item.department?.toLowerCase() === selectedDepartment.toLowerCase();

            const query = productSearch.trim().toLowerCase();
            const matchesSearch =
                !query ||
                item.name?.toLowerCase().includes(query) ||
                item.department?.toLowerCase().includes(query) ||
                item.category?.toLowerCase().includes(query) ||
                String(item.id) === query;

            return matchesDept && matchesSearch;
        });
    }, [products, selectedDepartment, productSearch]);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesStatus =
                orderStatusFilter === "all" ||
                order.status?.toLowerCase() === orderStatusFilter.toLowerCase();

            const q = orderSearch.trim().toLowerCase();
            const matchesSearch =
                !q ||
                String(order.id).includes(q) ||
                `#${order.id}`.includes(q) ||
                (order.customer?.name || "").toLowerCase().includes(q) ||
                (order.customer?.email || "").toLowerCase().includes(q) ||
                (order.customer?.phone || "").toLowerCase().includes(q) ||
                (order.items || []).some(it => (it.product_name || "").toLowerCase().includes(q));

            return matchesStatus && matchesSearch;
        });
    }, [orders, orderStatusFilter, orderSearch]);

    const filteredUsers = useMemo(() => {
        const q = userSearch.trim().toLowerCase();
        if (!q) return users;
        return users.filter(u =>
            (u.name || "").toLowerCase().includes(q) ||
            (u.email || "").toLowerCase().includes(q) ||
            (u.username || "").toLowerCase().includes(q) ||
            String(u.id) === q ||
            (u.phone || "").toLowerCase().includes(q)
        );
    }, [users, userSearch]);


    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="staff-shell">

            {/* =================================================
                MOBILE DRAWER BACKDROP & MOBILE TOP BAR
            ================================================== */}
            <div
                className={`staff-sidebar-backdrop ${mobileMenuOpen ? "open" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
            />

            <div className="staff-mobile-nav-bar">
                <Link to="/" className="staff-mobile-brand">
                    <div style={{ background: "#ffffff", padding: "3px 6px", borderRadius: "6px", display: "flex", alignItems: "center" }}>
                        <img
                            src="/apsara_logo.png"
                            alt="Apsara Trends"
                        />
                    </div>
                    <div className="staff-mobile-brand-text">
                        <strong>APSARA TRENDS</strong>
                        <small>CONTROL PANEL</small>
                    </div>
                </Link>

                <div className="staff-mobile-actions">
                    <span className="staff-sync-badge" style={{ padding: "4px 10px", fontSize: "11px" }}>
                        <span className="staff-live-dot" />
                        {liveSync ? "Live" : "Paused"}
                    </span>

                    <button
                        type="button"
                        className="staff-mobile-toggle-btn"
                        onClick={() => setMobileMenuOpen(prev => !prev)}
                        aria-label="Toggle navigation menu"
                    >
                        {mobileMenuOpen ? "✕" : "☰"}
                    </button>
                </div>
            </div>

            {/* =================================================
                SIDEBAR (Desktop Fixed / Mobile Slide-out Drawer)
            ================================================== */}
            <aside className={`staff-sidebar ${mobileMenuOpen ? "open" : ""}`}>
                <div className="staff-sidebar-brand" style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative" }}>
                    <div style={{ background: "#ffffff", padding: "4px 8px", borderRadius: "8px", display: "flex", alignItems: "center" }}>
                        <img
                            src="/apsara_logo.png"
                            alt="Apsara Trends"
                            style={{ height: "34px", objectFit: "contain" }}
                        />
                    </div>
                    <div>
                        <span style={{ fontSize: "14px", fontWeight: "800", color: "#ffffff", letterSpacing: "0.5px" }}>
                            APSARA TRENDS
                        </span>
                        <small style={{ display: "block", color: "#94a3b8", fontSize: "10px" }}>
                            ADMIN CONTROL PANEL
                        </small>
                    </div>

                    <button
                        type="button"
                        className="staff-sidebar-close-btn"
                        onClick={() => setMobileMenuOpen(false)}
                        title="Close navigation"
                    >
                        ✕
                    </button>
                </div>

                <nav className="staff-nav">
                    <a href="#overview" onClick={() => setMobileMenuOpen(false)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="9" rx="1" />
                            <rect x="14" y="3" width="7" height="5" rx="1" />
                            <rect x="14" y="12" width="7" height="9" rx="1" />
                            <rect x="3" y="16" width="7" height="5" rx="1" />
                        </svg>
                        Dashboard Overview
                    </a>

                    <a href="#orders" style={{ position: "relative" }} onClick={() => setMobileMenuOpen(false)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        Customer Orders
                        <span className="staff-nav-badge" style={{ background: orders.length > 0 ? "#10b981" : undefined, color: "#ffffff" }}>
                            {orders.length}
                        </span>
                    </a>

                    <a href="#users" onClick={() => setMobileMenuOpen(false)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        Users & Roles
                        <span className="staff-nav-badge">{users.length}</span>
                    </a>

                    <a href="#products" onClick={() => setMobileMenuOpen(false)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        Catalogue & Stock
                        <span className="staff-nav-badge">{products.length}</span>
                    </a>

                    <div style={{ marginTop: "16px", padding: "0 4px" }}>
                        <button
                            type="button"
                            onClick={() => {
                                setShowAddProductModal(true);
                                setMobileMenuOpen(false);
                            }}
                            style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                padding: "10px 14px",
                                background: "linear-gradient(135deg, #ff3f6c 0%, #d9224e 100%)",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontWeight: "700",
                                cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(255, 63, 108, 0.3)"
                            }}
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            + ADD NEW PRODUCT
                        </button>
                    </div>
                </nav>

                <div className="staff-sidebar-bottom">
                    <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        Storefront Home
                    </Link>

                    <button type="button" onClick={() => { setMobileMenuOpen(false); logout(); }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* =================================================
                MAIN VIEWPORT
            ================================================== */}
            <main className="staff-main">

                {/* TOP HEADER */}
                <header className="staff-header">
                    <div>
                        <p>APSARA TRENDS ENTERPRISE ADMINISTRATION</p>
                        <h1>Control Centre</h1>
                    </div>

                    <div className="staff-header-actions">
                        {/* LIVE SYNC CONTROLS */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span className="staff-sync-badge">
                                <span className="staff-live-dot" />
                                {liveSync ? "Live Sync (5s)" : "Sync Paused"}
                            </span>

                            <button
                                type="button"
                                className="staff-sync-btn"
                                onClick={() => loadDashboard(false)}
                                title="Refresh all data now"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    width="14"
                                    height="14"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{
                                        animation: isSyncing ? "spin 1s linear infinite" : "none"
                                    }}
                                >
                                    <polyline points="23 4 23 10 17 10" />
                                    <polyline points="1 20 1 14 7 14" />
                                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                                </svg>
                                {isSyncing ? "Refreshing..." : "Refresh"}
                            </button>

                            <button
                                type="button"
                                className="staff-sync-btn"
                                onClick={() => setLiveSync(prev => !prev)}
                                style={{ color: liveSync ? "#10b981" : "#64748b" }}
                            >
                                {liveSync ? "Pause" : "Resume"}
                            </button>
                        </div>

                        <div className="staff-user-chip">
                            <div className="staff-avatar">
                                {user?.name?.charAt(0) || "A"}
                            </div>
                            <div>
                                <strong>{user?.name || "Admin"}</strong>
                                <span>Administrator</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* NEW ORDER LIVE TOAST ALERT */}
                {newOrderAlert && (
                    <div className="staff-order-toast">
                        <div className="staff-order-toast-content">
                            <span style={{ fontSize: "24px" }}>🎉</span>
                            <div>
                                <strong>NEW ORDER RECEIVED! Order #{newOrderAlert.id}</strong>
                                <p>
                                    Placed by {newOrderAlert.customer} for <strong>₹{Number(newOrderAlert.amount).toLocaleString("en-IN")}</strong> ({newOrderAlert.itemsCount} items) at {newOrderAlert.time}.
                                </p>
                            </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <a
                                href="#orders"
                                className="staff-order-toast-btn"
                                onClick={() => setNewOrderAlert(null)}
                            >
                                View Order
                            </a>
                            <button
                                type="button"
                                onClick={() => setNewOrderAlert(null)}
                                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "16px" }}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                {/* NEW CUSTOMER LIVE TOAST ALERT */}
                {newCustomerAlert && (
                    <div className="staff-order-toast" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", border: "1px solid #38bdf8" }}>
                        <div className="staff-order-toast-content">
                            <span style={{ fontSize: "24px" }}>👤</span>
                            <div>
                                <strong style={{ color: "#38bdf8" }}>NEW CUSTOMER REGISTERED!</strong>
                                <p style={{ color: "#e2e8f0" }}>
                                    <strong>{newCustomerAlert.name}</strong> (@{newCustomerAlert.username} • {newCustomerAlert.email}) joined at {newCustomerAlert.time}.
                                </p>
                            </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <button
                                type="button"
                                className="staff-order-toast-btn"
                                style={{ background: "#38bdf8", color: "#0f172a" }}
                                onClick={() => {
                                    handleOpenCustomerDetails(newCustomerAlert.id);
                                    setNewCustomerAlert(null);
                                }}
                            >
                                View Customer
                            </button>
                            <button
                                type="button"
                                onClick={() => setNewCustomerAlert(null)}
                                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "16px" }}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                {/* ALERTS */}
                {error && (
                    <div className="staff-alert staff-alert-error">
                        {error}
                        <button type="button" onClick={() => setError("")} style={{ float: "right", background: "none", border: "none", cursor: "pointer", color: "inherit" }}>✕</button>
                    </div>
                )}

                {message && (
                    <div className="staff-alert staff-alert-success">
                        {message}
                        <button type="button" onClick={() => setMessage("")} style={{ float: "right", background: "none", border: "none", cursor: "pointer", color: "inherit" }}>✕</button>
                    </div>
                )}

                {loading ? (
                    <div className="staff-loading-card">
                        <div className="staff-spinner" />
                        <p>Loading administration data...</p>
                    </div>
                ) : (
                    <>
                        {/* =============================================
                            SUMMARY METRICS GRID
                        ============================================== */}
                        <section id="overview" className="staff-metric-grid">
                            <article>
                                <span>
                                    TOTAL ORDERS
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="9" cy="21" r="1" />
                                        <circle cx="20" cy="21" r="1" />
                                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                    </svg>
                                </span>
                                <strong>{summary?.orders ?? orders.length}</strong>
                                <small>
                                    {summary?.pending_orders ?? 0} active / pending fulfillment
                                </small>
                            </article>

                            <article>
                                <span>
                                    TOTAL REVENUE
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ff3f6c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="1" x2="12" y2="23" />
                                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                    </svg>
                                </span>
                                <strong>
                                    ₹{Number(summary?.total_revenue ?? 0).toLocaleString("en-IN")}
                                </strong>
                                <small>From paid & confirmed orders</small>
                            </article>

                            <article>
                                <span>
                                    CUSTOMERS
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                </span>
                                <strong>{summary?.customers ?? 0}</strong>
                                <small>Registered customer accounts</small>
                            </article>

                            <article>
                                <span>
                                    TOTAL PRODUCTS
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                        <line x1="3" y1="6" x2="21" y2="6" />
                                        <path d="M16 10a4 4 0 0 1-8 0" />
                                    </svg>
                                </span>
                                <strong>{summary?.products ?? products.length}</strong>
                                <small>In catalogue ({summary?.active_products ?? 0} active live)</small>
                            </article>

                            <article>
                                <span>
                                    TOTAL STOCK UNITS
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                        <line x1="12" y1="22.08" x2="12" y2="12" />
                                    </svg>
                                </span>
                                <strong>{summary?.total_stock ?? 0}</strong>
                                <small>Across all sizes & variants</small>
                            </article>

                            <article>
                                <span>
                                    ADMINISTRATORS
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                </span>
                                <strong>{summary?.admins ?? 1}</strong>
                                <small>Full administrative privileges</small>
                            </article>
                        </section>


                        {/* =============================================
                            ORDERS MANAGEMENT SECTION
                        ============================================== */}
                        <section id="orders" className="staff-panel">
                            <div className="staff-panel-head">
                                <div>
                                    <p>LIVE ORDER FULFILLMENT & TRACKING</p>
                                    <h2>Customer Orders</h2>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <span className="staff-live-dot" />
                                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>
                                        {filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"} displayed
                                    </span>
                                </div>
                            </div>

                            <div className="staff-section-note">
                                Whenever an order is placed on the storefront (via Online Checkout or Cash on Delivery), it immediately appears in this live feed. You can review items, verify delivery addresses, and update fulfillment status directly.
                            </div>

                            {/* ORDER CONTROLS */}
                            <div className="staff-controls-bar">
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                    {[
                                        { key: "all", label: "ALL ORDERS" },
                                        { key: "confirmed", label: "CONFIRMED" },
                                        { key: "processing", label: "PROCESSING" },
                                        { key: "shipped", label: "SHIPPED" },
                                        { key: "delivered", label: "DELIVERED" },
                                        { key: "cancelled", label: "CANCELLED" }
                                    ].map(tab => (
                                        <button
                                            key={tab.key}
                                            type="button"
                                            className={`staff-dept-btn ${orderStatusFilter.toLowerCase() === tab.key ? "active" : ""}`}
                                            onClick={() => setOrderStatusFilter(tab.key)}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                <input
                                    type="search"
                                    className="staff-search-input"
                                    placeholder="Search by Order ID, customer, email, product..."
                                    value={orderSearch}
                                    onChange={e => setOrderSearch(e.target.value)}
                                />
                            </div>

                            {/* ORDERS TABLE */}
                            <div className="staff-table-wrap">
                                {filteredOrders.length === 0 ? (
                                    <div style={{ padding: "48px 24px", textAlign: "center", color: "#64748b" }}>
                                        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ margin: "0 auto 16px" }}>
                                            <circle cx="9" cy="21" r="1" />
                                            <circle cx="20" cy="21" r="1" />
                                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                        </svg>
                                        <h3 style={{ margin: "0 0 6px", color: "#1e293b", fontSize: "16px" }}>
                                            No customer orders found
                                        </h3>
                                        <p style={{ margin: "0", fontSize: "13px" }}>
                                            {orders.length === 0
                                                ? "When a customer completes a purchase, their order will immediately show up here in real-time."
                                                : "No orders match your current filter criteria."}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {/* DESKTOP ORDERS VIEW */}
                                        <div className="staff-orders-desktop-view">
                                            <table className="staff-table">
                                                <thead>
                                                    <tr>
                                                        <th>ORDER ID & TIME</th>
                                                        <th>CUSTOMER</th>
                                                        <th>ITEMS ORDERED</th>
                                                        <th>DESTINATION</th>
                                                        <th>TOTAL AMOUNT</th>
                                                        <th>PAYMENT</th>
                                                        <th>STATUS & ACTIONS</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredOrders.map(order => {
                                                        const shipping = order.shipping_address || {};
                                                        const destinationText = shipping.city
                                                            ? `${shipping.city}, ${shipping.state || ""} - ${shipping.pincode || ""}`
                                                            : shipping.raw || "Not specified";

                                                        return (
                                                            <tr key={order.id}>
                                                                <td>
                                                                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                                                        <strong style={{ color: "#0f172a", fontSize: "14px", fontFamily: "monospace" }}>
                                                                            #{order.id}
                                                                        </strong>
                                                                        <small style={{ color: "#64748b", fontSize: "11px" }}>
                                                                            {order.created_at
                                                                                ? new Date(order.created_at).toLocaleString([], {
                                                                                    month: "short",
                                                                                    day: "numeric",
                                                                                    hour: "2-digit",
                                                                                    minute: "2-digit"
                                                                                })
                                                                                : "Just now"}
                                                                        </small>
                                                                    </div>
                                                                </td>

                                                                <td>
                                                                    <div className="staff-user-cell">
                                                                        <span className="staff-mini-avatar" style={{ background: "#e0f2fe", color: "#0284c7" }}>
                                                                            {order.customer?.name?.charAt(0) || "C"}
                                                                        </span>
                                                                        <div>
                                                                            <strong style={{ display: "block", color: "#1e293b" }}>
                                                                                {order.customer?.name || "Customer"}
                                                                            </strong>
                                                                            <small style={{ color: "#64748b" }}>
                                                                                {order.customer?.email || order.customer?.phone || ""}
                                                                            </small>
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td>
                                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                                        {(order.items || []).slice(0, 3).map((it, idx) => (
                                                                            <div key={idx} title={`${it.product_name} (${it.size}) x${it.quantity}`} style={{ position: "relative" }}>
                                                                                {it.image_url ? (
                                                                                    <img
                                                                                        src={it.image_url}
                                                                                        alt={it.product_name}
                                                                                        style={{
                                                                                            width: "36px",
                                                                                            height: "46px",
                                                                                            objectFit: "cover",
                                                                                            borderRadius: "4px",
                                                                                            border: "1px solid #e2e8f0"
                                                                                        }}
                                                                                    />
                                                                                ) : (
                                                                                    <div style={{ width: "36px", height: "46px", background: "#f1f5f9", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#94a3b8" }}>
                                                                                        IMG
                                                                                    </div>
                                                                                )}
                                                                                <span style={{
                                                                                    position: "absolute",
                                                                                    bottom: "-4px",
                                                                                    right: "-4px",
                                                                                    background: "#0f172a",
                                                                                    color: "#ffffff",
                                                                                    fontSize: "9px",
                                                                                    fontWeight: "800",
                                                                                    padding: "1px 4px",
                                                                                    borderRadius: "4px"
                                                                                }}>
                                                                                    {it.quantity}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                        {order.items?.length > 3 && (
                                                                            <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>
                                                                                +{order.items.length - 3} more
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>

                                                                <td>
                                                                    <span style={{ fontSize: "12px", color: "#475569", display: "block", maxWidth: "160px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                                        {destinationText}
                                                                    </span>
                                                                </td>

                                                                <td>
                                                                    <strong style={{ fontSize: "14px", color: "#0f172a" }}>
                                                                        ₹{Number(order.total_amount).toLocaleString("en-IN")}
                                                                    </strong>
                                                                </td>

                                                                <td>
                                                                    <span className={`staff-payment-badge ${order.payment_status?.toLowerCase()}`}>
                                                                        {order.payment_status || "PENDING"}
                                                                    </span>
                                                                </td>

                                                                <td>
                                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                                        <select
                                                                            className="staff-select"
                                                                            value={order.status || "confirmed"}
                                                                            disabled={busyOrderId === order.id}
                                                                            onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                                                                            style={{
                                                                                fontWeight: "700",
                                                                                fontSize: "12px",
                                                                                padding: "5px 8px"
                                                                            }}
                                                                        >
                                                                            <option value="confirmed">Confirmed</option>
                                                                            <option value="processing">Processing</option>
                                                                            <option value="shipped">Shipped</option>
                                                                            <option value="delivered">Delivered</option>
                                                                            <option value="cancelled">Cancelled</option>
                                                                        </select>

                                                                        <button
                                                                            type="button"
                                                                            className="staff-primary-small"
                                                                            onClick={() => setSelectedOrder(order)}
                                                                            title="View full order breakdown"
                                                                            style={{ padding: "6px 10px" }}
                                                                        >
                                                                            Details
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* MOBILE TOUCH-FRIENDLY ORDERS VIEW (<=860px) */}
                                        <div className="staff-orders-mobile-view">
                                            {filteredOrders.map(order => {
                                                const shipping = order.shipping_address || {};
                                                const destinationText = shipping.city
                                                    ? `${shipping.city}, ${shipping.state || ""} - ${shipping.pincode || ""}`
                                                    : shipping.raw || "Not specified";

                                                return (
                                                    <div key={`m-${order.id}`} className="staff-order-mobile-card">
                                                        {/* Header: Order ID & Badges */}
                                                        <div className="staff-order-mobile-header">
                                                            <div className="staff-order-mobile-id-group">
                                                                <strong style={{ color: "#0f172a", fontSize: "14px", fontFamily: "monospace" }}>
                                                                    #{order.id}
                                                                </strong>
                                                                <small style={{ color: "#64748b", fontSize: "11px" }}>
                                                                    {order.created_at
                                                                        ? new Date(order.created_at).toLocaleString([], {
                                                                            month: "short",
                                                                            day: "numeric",
                                                                            hour: "2-digit",
                                                                            minute: "2-digit"
                                                                        })
                                                                        : "Just now"}
                                                                </small>
                                                            </div>
                                                            <div className="staff-order-mobile-badges">
                                                                <span className={`staff-payment-badge ${order.payment_status?.toLowerCase()}`}>
                                                                    {order.payment_status || "PENDING"}
                                                                </span>
                                                                <span className={`staff-order-status ${order.status?.toLowerCase()}`}>
                                                                    {order.status || "confirmed"}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Customer Info & Amount */}
                                                        <div className="staff-order-mobile-customer-row">
                                                            <div className="staff-order-mobile-customer-info">
                                                                <span className="staff-mini-avatar" style={{ background: "#e0f2fe", color: "#0284c7" }}>
                                                                    {order.customer?.name?.charAt(0) || "C"}
                                                                </span>
                                                                <div style={{ minWidth: 0 }}>
                                                                    <strong style={{ display: "block", color: "#1e293b", fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                                        {order.customer?.name || "Customer"}
                                                                    </strong>
                                                                    <small style={{ color: "#64748b", fontSize: "11px", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                                        {order.customer?.email || order.customer?.phone || ""}
                                                                    </small>
                                                                </div>
                                                            </div>
                                                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                                                                <small style={{ display: "block", fontSize: "10px", color: "#64748b", fontWeight: "700" }}>TOTAL</small>
                                                                <strong style={{ fontSize: "15px", color: "#0f172a" }}>
                                                                    ₹{Number(order.total_amount).toLocaleString("en-IN")}
                                                                </strong>
                                                            </div>
                                                        </div>

                                                        {/* Destination */}
                                                        <div style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                                                            <span>📍</span>
                                                            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                                {destinationText}
                                                            </span>
                                                        </div>

                                                        {/* Items thumbnails row */}
                                                        <div className="staff-order-mobile-items-row">
                                                            {(order.items || []).map((it, idx) => (
                                                                <div key={idx} title={`${it.product_name} (${it.size}) x${it.quantity}`} style={{ position: "relative", flexShrink: 0 }}>
                                                                    {it.image_url ? (
                                                                        <img
                                                                            src={it.image_url}
                                                                            alt={it.product_name}
                                                                            style={{
                                                                                width: "36px",
                                                                                height: "46px",
                                                                                objectFit: "cover",
                                                                                borderRadius: "4px",
                                                                                border: "1px solid #e2e8f0"
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <div style={{ width: "36px", height: "46px", background: "#f1f5f9", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#94a3b8" }}>
                                                                            IMG
                                                                        </div>
                                                                    )}
                                                                    <span style={{
                                                                        position: "absolute",
                                                                        bottom: "-4px",
                                                                        right: "-4px",
                                                                        background: "#0f172a",
                                                                        color: "#ffffff",
                                                                        fontSize: "9px",
                                                                        fontWeight: "800",
                                                                        padding: "1px 4px",
                                                                        borderRadius: "4px"
                                                                    }}>
                                                                        {it.quantity}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                            <div style={{ marginLeft: "4px", fontSize: "11px", color: "#475569" }}>
                                                                <strong>{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}</strong>
                                                            </div>
                                                        </div>

                                                        {/* Mobile Actions Footer */}
                                                        <div className="staff-order-mobile-footer">
                                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "150px" }}>
                                                                <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", whiteSpace: "nowrap" }}>Status:</label>
                                                                <select
                                                                    className="staff-select"
                                                                    value={order.status || "confirmed"}
                                                                    disabled={busyOrderId === order.id}
                                                                    onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                                                                    style={{
                                                                        fontWeight: "700",
                                                                        fontSize: "12px",
                                                                        padding: "6px 8px",
                                                                        flex: 1
                                                                    }}
                                                                >
                                                                    <option value="confirmed">Confirmed</option>
                                                                    <option value="processing">Processing</option>
                                                                    <option value="shipped">Shipped</option>
                                                                    <option value="delivered">Delivered</option>
                                                                    <option value="cancelled">Cancelled</option>
                                                                </select>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                className="staff-primary-small"
                                                                onClick={() => setSelectedOrder(order)}
                                                                title="View full order breakdown"
                                                                style={{ padding: "7px 14px", fontSize: "12px" }}
                                                            >
                                                                Details
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>


                        {/* =============================================
                            PRODUCTS & INVENTORY SECTION
                        ============================================== */}
                        <section id="products" className="staff-panel">
                            <div className="staff-panel-head">
                                <div>
                                    <p>CATALOGUE & STOCK MANAGEMENT</p>
                                    <h2>Products & Inventory</h2>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddProductModal(true)}
                                        className="staff-primary-small"
                                        style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                                    >
                                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <line x1="12" y1="5" x2="12" y2="19" />
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                        </svg>
                                        Add Product
                                    </button>
                                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>
                                        {filteredProducts.length} of {products.length} products
                                    </span>
                                </div>
                            </div>

                            <div className="staff-section-note">
                                As Administrator, you can add new products with sizes, colors, pricing, and stock, or modify variants and active status for any existing item in the catalog.
                            </div>

                            {/* CONTROLS */}
                            <div className="staff-controls-bar">
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                    {["all", "Women", "Kids", "Beauty", "Jewellery"].map(dept => (
                                        <button
                                            key={dept}
                                            type="button"
                                            className={`staff-dept-btn ${selectedDepartment.toLowerCase() === dept.toLowerCase() ? "active" : ""}`}
                                            onClick={() => setSelectedDepartment(dept)}
                                        >
                                            {dept === "all" ? "ALL DEPARTMENTS" : dept.toUpperCase()}
                                        </button>
                                    ))}
                                </div>

                                <input
                                    type="search"
                                    className="staff-search-input"
                                    placeholder="Search product name, category, ID..."
                                    value={productSearch}
                                    onChange={e => setProductSearch(e.target.value)}
                                />
                            </div>

                            {/* PRODUCTS TABLE - DESKTOP VIEW */}
                            <div className="staff-products-desktop-view">
                                <div className="staff-table-wrap">
                                    <table className="staff-table staff-management-table">
                                        <thead>
                                            <tr>
                                                <th>PRODUCT</th>
                                                <th>DEPARTMENT</th>
                                                <th>CATEGORY</th>
                                                <th>PRICE</th>
                                                <th>TOTAL STOCK</th>
                                                <th>STATUS</th>
                                                <th>MANAGE</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredProducts.map(product => {
                                                const isExpanded = editingProduct?.id === product.id;

                                                return (
                                                    <Fragment key={product.id}>
                                                        <tr>
                                                            <td>
                                                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                                    {product.image_url && (
                                                                        <img
                                                                            src={product.image_url}
                                                                            alt={product.name}
                                                                            style={{
                                                                                width: "38px",
                                                                                height: "48px",
                                                                                objectFit: "cover",
                                                                                borderRadius: "4px",
                                                                                border: "1px solid #eeeeef"
                                                                            }}
                                                                        />
                                                                    )}
                                                                    <div>
                                                                        <strong style={{ display: "block", color: "#282c3f", fontSize: "13px" }}>
                                                                            {product.name}
                                                                        </strong>
                                                                        <small style={{ color: "#878b94", fontSize: "11px" }}>
                                                                            #{product.id} • {product.brand || "Apsara Trends"}
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td>
                                                                <span className="staff-capitalize" style={{ fontWeight: "600" }}>
                                                                    {product.department}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <span style={{ color: "#535766", fontSize: "12px" }}>
                                                                    {product.category || "General"}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <strong style={{ color: "#282c3f", fontSize: "13px" }}>
                                                                    ₹{Number(product.base_price).toLocaleString("en-IN")}
                                                                </strong>
                                                                {product.discount_percentage > 0 && (
                                                                    <span style={{ display: "block", color: "#03a685", fontSize: "10px", fontWeight: "700" }}>
                                                                        {product.discount_percentage}% OFF
                                                                    </span>
                                                                )}
                                                            </td>

                                                            <td>
                                                                <span style={{
                                                                    display: "inline-block",
                                                                    padding: "3px 8px",
                                                                    borderRadius: "4px",
                                                                    background: product.total_stock > 10 ? "#e5f7f3" : product.total_stock > 0 ? "#fff4e5" : "#ffe8ee",
                                                                    color: product.total_stock > 10 ? "#03a685" : product.total_stock > 0 ? "#f26a10" : "#ff3f6c",
                                                                    fontWeight: "700",
                                                                    fontSize: "11px"
                                                                }}>
                                                                    {product.total_stock} units ({product.variant_count} sizes)
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <span className={product.is_active ? "staff-status-active" : "staff-status-inactive"}>
                                                                    {product.is_active ? "ACTIVE" : "INACTIVE"}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <div className="staff-row-actions">
                                                                    <button
                                                                        type="button"
                                                                        className="staff-primary-small"
                                                                        style={{
                                                                            background: isExpanded ? "#282c3f" : "#ff3f6c"
                                                                        }}
                                                                        onClick={() => openVariantEditor(product)}
                                                                    >
                                                                        {isExpanded ? "CLOSE" : "VARIANTS"}
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        className="staff-danger-small"
                                                                        style={{
                                                                            background: product.is_active ? "#fff0f3" : "#eef8f5",
                                                                            color: product.is_active ? "#ff3f6c" : "#03a685",
                                                                            border: `1px solid ${product.is_active ? "#ffb8c7" : "#a8e2d4"}`
                                                                        }}
                                                                        disabled={busyProductId === product.id}
                                                                        onClick={() => handleToggleProductActive(product)}
                                                                    >
                                                                        {busyProductId === product.id
                                                                            ? "..."
                                                                            : product.is_active
                                                                                ? "HIDE"
                                                                                : "ENABLE"}
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        className="staff-danger-small"
                                                                        style={{
                                                                            background: "#fee2e2",
                                                                            color: "#b91c1c",
                                                                            border: "1px solid #fecaca"
                                                                        }}
                                                                        disabled={busyProductId === product.id}
                                                                        onClick={() => handleDeleteProduct(product)}
                                                                        title="Delete Product"
                                                                    >
                                                                        DELETE
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>

                                                        {/* EXPANDED VARIANT EDITOR */}
                                                        {isExpanded && (
                                                            <tr key={`variants-${product.id}`} style={{ background: "#fbfbfd" }}>
                                                                <td colSpan="7" style={{ padding: "16px 24px" }}>
                                                                    <div className="staff-variant-drawer">
                                                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px", alignItems: "center" }}>
                                                                            <div>
                                                                                <strong style={{ color: "#0f172a", fontSize: "14px", fontWeight: "700" }}>
                                                                                    Inventory & Pricing for "{product.name}"
                                                                                </strong>
                                                                                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                                                                                    {product.description || "No description provided."}
                                                                                </p>
                                                                            </div>

                                                                            <button
                                                                                type="button"
                                                                                className="staff-sync-btn"
                                                                                onClick={() => {
                                                                                    setSelectedProductIdForVariant(product.id);
                                                                                    setShowAddVariantModal(true);
                                                                                }}
                                                                            >
                                                                                + Add Variant
                                                                            </button>
                                                                        </div>

                                                                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                                                            <thead>
                                                                                <tr style={{ background: "#f1f5f9", textAlign: "left", color: "#475569" }}>
                                                                                    <th style={{ padding: "10px 12px", borderRadius: "6px 0 0 6px" }}>SKU</th>
                                                                                    <th style={{ padding: "10px 12px" }}>SIZE</th>
                                                                                    <th style={{ padding: "10px 12px" }}>COLOR</th>
                                                                                    <th style={{ padding: "10px 12px" }}>PRICE (₹)</th>
                                                                                    <th style={{ padding: "10px 12px" }}>STOCK (UNITS)</th>
                                                                                    <th style={{ padding: "10px 12px" }}>ACTIVE</th>
                                                                                    <th style={{ padding: "10px 12px", borderRadius: "0 6px 6px 0" }}>ACTION</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {(product.variants || []).map(v => {
                                                                                    const draft = variantDrafts[v.id] || { price: v.price, stock: v.stock, is_active: v.is_active };

                                                                                    return (
                                                                                        <tr key={v.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                                                                            <td style={{ padding: "10px 12px", color: "#64748b", fontFamily: "monospace", fontSize: "12px" }}>
                                                                                                {v.sku}
                                                                                            </td>
                                                                                            <td style={{ padding: "10px 12px" }}>
                                                                                                <strong style={{ color: "#0f172a" }}>{v.size}</strong>
                                                                                            </td>
                                                                                            <td style={{ padding: "10px 12px", color: "#475569" }}>
                                                                                                {v.color || "Standard"}
                                                                                            </td>
                                                                                            <td style={{ padding: "10px 12px" }}>
                                                                                                <input
                                                                                                    type="number"
                                                                                                    value={draft.price ?? ""}
                                                                                                    onChange={e => setVariantDrafts(prev => ({
                                                                                                        ...prev,
                                                                                                        [v.id]: { ...draft, price: e.target.value }
                                                                                                    }))}
                                                                                                    className="staff-variant-input"
                                                                                                    style={{ width: "100px" }}
                                                                                                />
                                                                                            </td>
                                                                                            <td style={{ padding: "10px 12px" }}>
                                                                                                <input
                                                                                                    type="number"
                                                                                                    value={draft.stock ?? ""}
                                                                                                    onChange={e => setVariantDrafts(prev => ({
                                                                                                        ...prev,
                                                                                                        [v.id]: { ...draft, stock: e.target.value }
                                                                                                    }))}
                                                                                                    className="staff-variant-input"
                                                                                                    style={{ width: "90px" }}
                                                                                                />
                                                                                            </td>
                                                                                            <td style={{ padding: "10px 12px" }}>
                                                                                                <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                                                                                    <input
                                                                                                        type="checkbox"
                                                                                                        checked={Boolean(draft.is_active)}
                                                                                                        onChange={e => setVariantDrafts(prev => ({
                                                                                                            ...prev,
                                                                                                            [v.id]: { ...draft, is_active: e.target.checked }
                                                                                                        }))}
                                                                                                    />
                                                                                                    <span style={{ fontSize: "12px", fontWeight: "600", color: draft.is_active ? "#047857" : "#94a3b8" }}>
                                                                                                        {draft.is_active ? "Active" : "Disabled"}
                                                                                                    </span>
                                                                                                </label>
                                                                                            </td>
                                                                                            <td style={{ padding: "8px" }}>
                                                                                                <button
                                                                                                    type="button"
                                                                                                    className="staff-primary-small"
                                                                                                    disabled={busyVariantId === v.id}
                                                                                                    onClick={() => handleSaveVariant(v.id)}
                                                                                                >
                                                                                                    {busyVariantId === v.id ? "SAVING..." : "SAVE"}
                                                                                                </button>
                                                                                            </td>
                                                                                        </tr>
                                                                                    );
                                                                                })}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </Fragment>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* PRODUCTS - MOBILE CARD VIEW */}
                            <div className="staff-products-mobile-view">
                                {filteredProducts.map(product => {
                                    const isExpanded = editingProduct?.id === product.id;
                                    return (
                                        <div key={`m-prod-${product.id}`} className="staff-product-mobile-card">
                                            <div className="staff-product-mobile-header">
                                                {product.image_url && (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="staff-product-mobile-img"
                                                    />
                                                )}
                                                <div className="staff-product-mobile-info">
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                                                        <strong style={{ fontSize: "14px", color: "#1e293b", lineHeight: "1.3" }}>
                                                            {product.name}
                                                        </strong>
                                                        <span className={product.is_active ? "staff-status-active" : "staff-status-inactive"}>
                                                            {product.is_active ? "ACTIVE" : "INACTIVE"}
                                                        </span>
                                                    </div>
                                                    <div className="staff-product-mobile-meta">
                                                        <span style={{ color: "#64748b" }}>#{product.id}</span>
                                                        <span>•</span>
                                                        <span style={{ fontWeight: "600", color: "#475569" }} className="staff-capitalize">{product.department}</span>
                                                        <span>•</span>
                                                        <span style={{ color: "#64748b" }}>{product.category || "General"}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="staff-product-mobile-stats">
                                                <div>
                                                    <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>Price</div>
                                                    <strong style={{ color: "#0f172a", fontSize: "14px" }}>
                                                        ₹{Number(product.base_price).toLocaleString("en-IN")}
                                                    </strong>
                                                    {product.discount_percentage > 0 && (
                                                        <span style={{ marginLeft: "4px", color: "#03a685", fontSize: "11px", fontWeight: "700" }}>
                                                            {product.discount_percentage}% OFF
                                                        </span>
                                                    )}
                                                </div>

                                                <div>
                                                    <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>Total Stock</div>
                                                    <span style={{
                                                        display: "inline-block",
                                                        padding: "2px 8px",
                                                        borderRadius: "4px",
                                                        background: product.total_stock > 10 ? "#e5f7f3" : product.total_stock > 0 ? "#fff4e5" : "#ffe8ee",
                                                        color: product.total_stock > 10 ? "#03a685" : product.total_stock > 0 ? "#f26a10" : "#ff3f6c",
                                                        fontWeight: "700",
                                                        fontSize: "11px"
                                                    }}>
                                                        {product.total_stock} in {product.variant_count} sizes
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="staff-product-mobile-actions">
                                                <button
                                                    type="button"
                                                    className="staff-primary-small"
                                                    style={{
                                                        background: isExpanded ? "#1e293b" : "#ff3f6c",
                                                        flex: 1
                                                    }}
                                                    onClick={() => openVariantEditor(product)}
                                                >
                                                    {isExpanded ? "Close Variants" : `Variants (${product.variants?.length || 0})`}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="staff-danger-small"
                                                    style={{
                                                        background: product.is_active ? "#fff0f3" : "#eef8f5",
                                                        color: product.is_active ? "#ff3f6c" : "#03a685",
                                                        border: `1px solid ${product.is_active ? "#ffb8c7" : "#a8e2d4"}`
                                                    }}
                                                    disabled={busyProductId === product.id}
                                                    onClick={() => handleToggleProductActive(product)}
                                                >
                                                    {busyProductId === product.id ? "..." : product.is_active ? "Hide" : "Enable"}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="staff-danger-small"
                                                    style={{
                                                        background: "#fee2e2",
                                                        color: "#b91c1c",
                                                        border: "1px solid #fecaca"
                                                    }}
                                                    disabled={busyProductId === product.id}
                                                    onClick={() => handleDeleteProduct(product)}
                                                    title="Delete Product"
                                                >
                                                    Delete
                                                </button>
                                            </div>

                                            {/* EXPANDED VARIANT EDITOR ON MOBILE */}
                                            {isExpanded && (
                                                <div className="staff-product-mobile-variants">
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "6px" }}>
                                                        <strong style={{ fontSize: "12px", color: "#0f172a" }}>Variant Stock & Pricing</strong>
                                                        <button
                                                            type="button"
                                                            className="staff-sync-btn"
                                                            style={{ fontSize: "11px", padding: "4px 8px" }}
                                                            onClick={() => {
                                                                setSelectedProductIdForVariant(product.id);
                                                                setShowAddVariantModal(true);
                                                            }}
                                                        >
                                                            + Add Variant
                                                        </button>
                                                    </div>

                                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                        {(product.variants || []).map(v => {
                                                            const draft = variantDrafts[v.id] || { price: v.price, stock: v.stock, is_active: v.is_active };
                                                            return (
                                                                <div key={`mv-${v.id}`} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "8px 10px" }}>
                                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                                                        <span style={{ fontWeight: "700", fontSize: "12px", color: "#0f172a" }}>Size: {v.size} ({v.color || "Standard"})</span>
                                                                        <span style={{ fontFamily: "monospace", fontSize: "10px", color: "#64748b" }}>{v.sku}</span>
                                                                    </div>
                                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                                                        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}>
                                                                            <span style={{ color: "#64748b" }}>₹</span>
                                                                            <input
                                                                                type="number"
                                                                                value={draft.price ?? ""}
                                                                                onChange={e => setVariantDrafts(prev => ({
                                                                                    ...prev,
                                                                                    [v.id]: { ...draft, price: e.target.value }
                                                                                }))}
                                                                                className="staff-variant-input"
                                                                                style={{ width: "75px", padding: "4px 6px", fontSize: "12px" }}
                                                                            />
                                                                        </div>
                                                                        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}>
                                                                            <span style={{ color: "#64748b" }}>Qty</span>
                                                                            <input
                                                                                type="number"
                                                                                value={draft.stock ?? ""}
                                                                                onChange={e => setVariantDrafts(prev => ({
                                                                                    ...prev,
                                                                                    [v.id]: { ...draft, stock: e.target.value }
                                                                                }))}
                                                                                className="staff-variant-input"
                                                                                style={{ width: "65px", padding: "4px 6px", fontSize: "12px" }}
                                                                            />
                                                                        </div>
                                                                        <label style={{ display: "inline-flex", alignItems: "center", gap: "4px", cursor: "pointer", fontSize: "11px" }}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={Boolean(draft.is_active)}
                                                                                onChange={e => setVariantDrafts(prev => ({
                                                                                    ...prev,
                                                                                    [v.id]: { ...draft, is_active: e.target.checked }
                                                                                }))}
                                                                            />
                                                                            <span style={{ color: draft.is_active ? "#047857" : "#94a3b8", fontWeight: "600" }}>Active</span>
                                                                        </label>
                                                                        <button
                                                                            type="button"
                                                                            className="staff-primary-small"
                                                                            style={{ padding: "4px 8px", fontSize: "11px", marginLeft: "auto" }}
                                                                            disabled={busyVariantId === v.id}
                                                                            onClick={() => handleSaveVariant(v.id)}
                                                                        >
                                                                            {busyVariantId === v.id ? "..." : "Save"}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>


                        {/* =============================================
                            USERS & ROLES SECTION
                        ============================================== */}
                        <section id="users" className="staff-panel">
                            <div className="staff-panel-head">
                                <div>
                                    <p>ACCESS MANAGEMENT</p>
                                    <h2>Users & Roles</h2>
                                </div>
                                <span>{users.length} registered accounts</span>
                            </div>

                            <div className="staff-section-note">
                                Only administrators have access to management dashboards, product catalogue, variant pricing, inventory, and order fulfillment.
                            </div>

                            <div className="staff-controls-bar">
                                <span style={{ fontSize: "13px", fontWeight: "700", color: "#475569" }}>
                                    Showing {filteredUsers.length} of {users.length} customer accounts
                                </span>
                                <input
                                    type="search"
                                    className="staff-search-input"
                                    placeholder="Search customer by name, email, @handle, phone, ID..."
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                />
                            </div>

                            {/* USERS - DESKTOP VIEW */}
                            <div className="staff-users-desktop-view">
                                <div className="staff-table-wrap">
                                    <table className="staff-table">
                                        <thead>
                                            <tr>
                                                <th>USER</th>
                                                <th>CONTACT</th>
                                                <th>ORDERS</th>
                                                <th>TOTAL SPENT</th>
                                                <th>CURRENT ROLE</th>
                                                <th>CHANGE ROLE</th>
                                                <th>ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map(item => (
                                                <tr key={item.id}>
                                                    <td>
                                                        <div className="staff-user-cell">
                                                            <span className="staff-mini-avatar">
                                                                {item.name?.charAt(0) || "U"}
                                                            </span>
                                                            <div>
                                                                <strong>
                                                                    {item.name}
                                                                    {item.id === user?.id && <em>YOU</em>}
                                                                </strong>
                                                                <small>
                                                                    @{item.username} • Joined {new Date(item.created_at).toLocaleDateString()}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <div style={{ fontSize: "13px", color: "#334155" }}>
                                                            <div>{item.email}</div>
                                                            {item.phone && (
                                                                <small style={{ color: "#64748b", display: "block" }}>
                                                                    📞 {item.phone}
                                                                </small>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <span className="staff-order-status confirmed" style={{ padding: "4px 8px", fontSize: "11px", fontWeight: "700" }}>
                                                            {item.orders_count || 0} order{item.orders_count === 1 ? "" : "s"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <strong style={{ color: "#0f172a", fontSize: "13px" }}>
                                                            ₹{Number(item.total_spent || 0).toLocaleString("en-IN")}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        <span className={item.role === "admin" ? "staff-role-badge staff-role-admin" : "staff-role-badge staff-role-customer"}>
                                                            {item.role === "admin" ? "Admin" : "Customer"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                            <select
                                                                className="staff-select"
                                                                value={roleDrafts[item.id] || "customer"}
                                                                disabled={item.id === user?.id}
                                                                onChange={e => setRoleDrafts(prev => ({
                                                                    ...prev,
                                                                    [item.id]: e.target.value
                                                                }))}
                                                            >
                                                                <option value="customer">Customer</option>
                                                                <option value="admin">Admin</option>
                                                            </select>

                                                            <button
                                                                type="button"
                                                                className="staff-primary-small"
                                                                disabled={
                                                                    item.id === user?.id ||
                                                                    busyUserId === item.id ||
                                                                    roleDrafts[item.id] === item.role
                                                                }
                                                                onClick={() => handleRoleChange(item)}
                                                            >
                                                                {busyUserId === item.id ? "SAVING..." : "UPDATE"}
                                                            </button>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="staff-primary-small"
                                                            style={{
                                                                background: "#0f172a",
                                                                color: "#ffffff",
                                                                whiteSpace: "nowrap",
                                                                padding: "6px 12px"
                                                            }}
                                                            onClick={() => handleOpenCustomerDetails(item.id)}
                                                        >
                                                            VIEW DETAILS
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* USERS - MOBILE CARD VIEW */}
                            <div className="staff-users-mobile-view">
                                {filteredUsers.map(item => (
                                    <div key={`m-user-${item.id}`} className="staff-user-mobile-card">
                                        <div className="staff-user-mobile-header">
                                            <div className="staff-user-cell">
                                                <span className="staff-mini-avatar">
                                                    {item.name?.charAt(0) || "U"}
                                                </span>
                                                <div>
                                                    <strong style={{ fontSize: "14px", color: "#1e293b" }}>
                                                        {item.name}
                                                        {item.id === user?.id && <em style={{ marginLeft: "4px" }}>YOU</em>}
                                                    </strong>
                                                    <small style={{ display: "block", color: "#64748b" }}>
                                                        @{item.username} • Joined {new Date(item.created_at).toLocaleDateString()}
                                                    </small>
                                                </div>
                                            </div>
                                            <span className={item.role === "admin" ? "staff-role-badge staff-role-admin" : "staff-role-badge staff-role-customer"}>
                                                {item.role === "admin" ? "Admin" : "Customer"}
                                            </span>
                                        </div>

                                        <div className="staff-user-mobile-details">
                                            <div>📧 {item.email}</div>
                                            {item.phone && <div>📞 {item.phone}</div>}
                                        </div>

                                        <div className="staff-user-mobile-metrics">
                                            <div>
                                                <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>Orders</div>
                                                <span className="staff-order-status confirmed" style={{ padding: "3px 8px", fontSize: "11px", fontWeight: "700" }}>
                                                    {item.orders_count || 0} order{item.orders_count === 1 ? "" : "s"}
                                                </span>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>Total Spent</div>
                                                <strong style={{ color: "#0f172a", fontSize: "14px" }}>
                                                    ₹{Number(item.total_spent || 0).toLocaleString("en-IN")}
                                                </strong>
                                            </div>
                                        </div>

                                        <div className="staff-user-mobile-actions">
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <select
                                                    className="staff-select"
                                                    value={roleDrafts[item.id] || "customer"}
                                                    disabled={item.id === user?.id}
                                                    onChange={e => setRoleDrafts(prev => ({
                                                        ...prev,
                                                        [item.id]: e.target.value
                                                    }))}
                                                    style={{ padding: "6px 8px", fontSize: "12px" }}
                                                >
                                                    <option value="customer">Customer</option>
                                                    <option value="admin">Admin</option>
                                                </select>

                                                <button
                                                    type="button"
                                                    className="staff-primary-small"
                                                    disabled={
                                                        item.id === user?.id ||
                                                        busyUserId === item.id ||
                                                        roleDrafts[item.id] === item.role
                                                    }
                                                    onClick={() => handleRoleChange(item)}
                                                >
                                                    {busyUserId === item.id ? "SAVING..." : "UPDATE"}
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                className="staff-primary-small"
                                                style={{
                                                    background: "#0f172a",
                                                    color: "#ffffff",
                                                    padding: "6px 12px"
                                                }}
                                                onClick={() => handleOpenCustomerDetails(item.id)}
                                            >
                                                VIEW DETAILS
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </main>


            {/* =================================================
                ORDER DETAILS MODAL
            ================================================== */}
            {selectedOrder && (
                <div className="staff-modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="staff-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="staff-modal-header">
                            <div>
                                <h2>Order Details #{selectedOrder.id}</h2>
                                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                                    Placed on {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : "Recently"}
                                </p>
                            </div>
                            <button type="button" className="staff-modal-close" onClick={() => setSelectedOrder(null)}>✕</button>
                        </div>

                        <div className="staff-modal-body">
                            {/* Summary row */}
                            <div className="staff-customer-stats-grid" style={{ marginBottom: "20px" }}>
                                <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                    <small style={{ color: "#64748b", display: "block", fontSize: "11px", fontWeight: "700" }}>TOTAL AMOUNT</small>
                                    <strong style={{ fontSize: "16px", color: "#0f172a" }}>₹{Number(selectedOrder.total_amount).toLocaleString("en-IN")}</strong>
                                </div>
                                <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                    <small style={{ color: "#64748b", display: "block", fontSize: "11px", fontWeight: "700" }}>ORDER STATUS</small>
                                    <span className={`staff-order-status ${selectedOrder.status?.toLowerCase()}`}>{selectedOrder.status}</span>
                                </div>
                                <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                    <small style={{ color: "#64748b", display: "block", fontSize: "11px", fontWeight: "700" }}>PAYMENT STATUS</small>
                                    <span className={`staff-payment-badge ${selectedOrder.payment_status?.toLowerCase()}`}>{selectedOrder.payment_status}</span>
                                </div>
                                <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                    <small style={{ color: "#64748b", display: "block", fontSize: "11px", fontWeight: "700" }}>TOTAL ITEMS</small>
                                    <strong style={{ fontSize: "16px", color: "#0f172a" }}>{selectedOrder.items_count || selectedOrder.items?.length || 0}</strong>
                                </div>
                            </div>

                            {/* Customer & Shipping info */}
                            <div className="staff-order-modal-grid">
                                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: "16px", borderRadius: "10px" }}>
                                    <h4 style={{ margin: "0 0 10px", fontSize: "13px", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.5px" }}>Customer Information</h4>
                                    <p style={{ margin: "4px 0", fontSize: "13px" }}><strong>Name:</strong> {selectedOrder.customer?.name || "Customer"}</p>
                                    <p style={{ margin: "4px 0", fontSize: "13px" }}><strong>Email:</strong> {selectedOrder.customer?.email || "N/A"}</p>
                                    <p style={{ margin: "4px 0", fontSize: "13px" }}><strong>Username:</strong> @{selectedOrder.customer?.username || "N/A"}</p>
                                    <p style={{ margin: "4px 0", fontSize: "13px" }}><strong>Phone:</strong> {selectedOrder.customer?.phone || selectedOrder.shipping_address?.phone || "N/A"}</p>
                                </div>

                                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: "16px", borderRadius: "10px" }}>
                                    <h4 style={{ margin: "0 0 10px", fontSize: "13px", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.5px" }}>Shipping & Delivery Address</h4>
                                    {selectedOrder.shipping_address ? (
                                        <div style={{ fontSize: "13px", lineHeight: "1.5", color: "#334155" }}>
                                            <p style={{ margin: "2px 0", fontWeight: "700" }}>{selectedOrder.shipping_address.name || selectedOrder.customer?.name}</p>
                                            <p style={{ margin: "2px 0" }}>{selectedOrder.shipping_address.address_line1}</p>
                                            {selectedOrder.shipping_address.address_line2 && <p style={{ margin: "2px 0" }}>{selectedOrder.shipping_address.address_line2}</p>}
                                            <p style={{ margin: "2px 0" }}>
                                                {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.pincode}
                                            </p>
                                            <p style={{ margin: "2px 0", color: "#64748b" }}>Contact: {selectedOrder.shipping_address.phone}</p>
                                        </div>
                                    ) : (
                                        <p style={{ color: "#94a3b8", fontSize: "13px" }}>No address provided.</p>
                                    )}
                                </div>
                            </div>

                            {/* Items breakdown */}
                            <h4 style={{ margin: "20px 0 12px", fontSize: "14px", color: "#0f172a" }}>Ordered Products ({selectedOrder.items?.length || 0})</h4>
                            <div className="staff-order-items-scroll">
                                <table>
                                    <thead>
                                        <tr style={{ background: "#f8fafc", textAlign: "left", color: "#475569" }}>
                                            <th style={{ padding: "10px 14px" }}>Item</th>
                                            <th style={{ padding: "10px 14px" }}>Size</th>
                                            <th style={{ padding: "10px 14px" }}>Color</th>
                                            <th style={{ padding: "10px 14px" }}>Qty</th>
                                            <th style={{ padding: "10px 14px" }}>Unit Price</th>
                                            <th style={{ padding: "10px 14px", textAlign: "right" }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(selectedOrder.items || []).map((it, idx) => (
                                            <tr key={idx} style={{ borderTop: "1px solid #f1f5f9" }}>
                                                <td style={{ padding: "12px 14px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                        {it.image_url && (
                                                            <img
                                                                src={it.image_url}
                                                                alt={it.product_name}
                                                                style={{ width: "36px", height: "46px", objectFit: "cover", borderRadius: "4px" }}
                                                            />
                                                        )}
                                                        <div>
                                                            <strong style={{ display: "block", color: "#0f172a" }}>{it.product_name}</strong>
                                                            <small style={{ color: "#64748b" }}>{it.brand || "Apsara Trends"}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: "12px 14px" }}><strong>{it.size}</strong></td>
                                                <td style={{ padding: "12px 14px", color: "#475569" }}>{it.color || "Standard"}</td>
                                                <td style={{ padding: "12px 14px" }}>{it.quantity}</td>
                                                <td style={{ padding: "12px 14px" }}>₹{Number(it.unit_price).toLocaleString("en-IN")}</td>
                                                <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: "700", color: "#0f172a" }}>
                                                    ₹{Number(it.line_total).toLocaleString("en-IN")}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Real-time Logistics & Dispatch Control Section */}
                            <div style={{ marginTop: "20px", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px 20px", background: "#f8fafc" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
                                    <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span>🚚 Real-Time Logistics & Shipment Dispatch</span>
                                        <span style={{ fontSize: "11px", background: "#e0e7ff", color: "#3730a3", padding: "2px 8px", borderRadius: "999px", fontWeight: "700" }}>
                                            Live Telemetry
                                        </span>
                                    </h4>
                                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                                        Current Status: <strong style={{ textTransform: "uppercase", color: "#ff3f6c" }}>{selectedOrder.status}</strong>
                                    </span>
                                </div>

                                {/* Quick Advance Milestone Bar */}
                                <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#475569", marginRight: "6px" }}>Advance Milestone:</span>
                                    {[
                                        { key: "confirmed", label: "1. Confirmed" },
                                        { key: "processing", label: "2. Processing & Packed" },
                                        { key: "shipped", label: "3. Shipped" },
                                        { key: "out_for_delivery", label: "4. Out for Delivery" },
                                        { key: "delivered", label: "5. Delivered" },
                                        { key: "cancelled", label: "Cancelled" }
                                    ].map(st => (
                                        <button
                                            key={st.key}
                                            type="button"
                                            onClick={() => handleSaveTracking(st.key)}
                                            className="staff-sync-btn"
                                            style={{
                                                padding: "5px 10px",
                                                fontSize: "11px",
                                                borderColor: selectedOrder.status === st.key ? (st.key === "cancelled" ? "#ef4444" : "#10b981") : "#cbd5e1",
                                                background: selectedOrder.status === st.key ? (st.key === "cancelled" ? "#fef2f2" : "#ecfdf5") : "#ffffff",
                                                color: selectedOrder.status === st.key ? (st.key === "cancelled" ? "#b91c1c" : "#047857") : "#334155",
                                                fontWeight: selectedOrder.status === st.key ? "800" : "600"
                                            }}
                                        >
                                            {st.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Dispatch Form Grid */}
                                <div className="staff-dispatch-grid">
                                    <div>
                                        <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                                            Courier Partner
                                        </label>
                                        <input
                                            type="text"
                                            list="courier-partner-list"
                                            className="staff-form-input"
                                            style={{ fontSize: "12px", padding: "6px 10px" }}
                                            value={trackingForm.courier_name}
                                            onChange={e => setTrackingForm({ ...trackingForm, courier_name: e.target.value })}
                                            placeholder="e.g. Apsara Express, BlueDart"
                                        />
                                        <datalist id="courier-partner-list">
                                            <option value="Apsara Express Priority Logistics" />
                                            <option value="BlueDart Express" />
                                            <option value="Delhivery Express" />
                                            <option value="Shadowfax Logistics" />
                                            <option value="DTDC Express" />
                                        </datalist>
                                    </div>

                                    <div>
                                        <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                                            AWB Tracking Number
                                        </label>
                                        <div style={{ display: "flex", gap: "6px" }}>
                                            <input
                                                type="text"
                                                className="staff-form-input"
                                                style={{ fontSize: "12px", padding: "6px 10px" }}
                                                value={trackingForm.tracking_number}
                                                onChange={e => setTrackingForm({ ...trackingForm, tracking_number: e.target.value })}
                                                placeholder="e.g. APS-EXP-930412"
                                            />
                                            <button
                                                type="button"
                                                onClick={generateAwb}
                                                className="staff-sync-btn"
                                                title="Auto-Generate Unique AWB"
                                                style={{ padding: "4px 8px", fontSize: "11px", whiteSpace: "nowrap" }}
                                            >
                                                Auto AWB
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                                            Current Hub / Location
                                        </label>
                                        <input
                                            type="text"
                                            className="staff-form-input"
                                            style={{ fontSize: "12px", padding: "6px 10px" }}
                                            value={trackingForm.current_location}
                                            onChange={e => setTrackingForm({ ...trackingForm, current_location: e.target.value })}
                                            placeholder="e.g. Mumbai Air Cargo Hub"
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                                            Estimated Delivery Date
                                        </label>
                                        <input
                                            type="text"
                                            className="staff-form-input"
                                            style={{ fontSize: "12px", padding: "6px 10px" }}
                                            value={trackingForm.estimated_delivery}
                                            onChange={e => setTrackingForm({ ...trackingForm, estimated_delivery: e.target.value })}
                                            placeholder="e.g. Fri, 25 Sep 2026"
                                        />
                                    </div>
                                </div>

                                {/* Custom Checkpoint Broadcast */}
                                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 14px", marginBottom: "14px" }}>
                                    <span style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                                        Broadcast Custom Checkpoint Note (Visible to Customer Immediately)
                                    </span>
                                    <div className="staff-checkpoint-broadcast-row">
                                        <input
                                            type="text"
                                            className="staff-form-input"
                                            style={{ fontSize: "12px", padding: "6px 8px" }}
                                            placeholder="Checkpoint Title (e.g. Departed Mumbai Hub)"
                                            value={trackingForm.checkpoint_title}
                                            onChange={e => setTrackingForm({ ...trackingForm, checkpoint_title: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            className="staff-form-input"
                                            style={{ fontSize: "12px", padding: "6px 8px" }}
                                            placeholder="Optional details / cargo flight notes..."
                                            value={trackingForm.checkpoint_description}
                                            onChange={e => setTrackingForm({ ...trackingForm, checkpoint_description: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            className="staff-primary-small"
                                            onClick={() => handleSaveTracking(null)}
                                            disabled={savingTracking}
                                            style={{ padding: "6px 12px", fontSize: "12px", whiteSpace: "nowrap" }}
                                        >
                                            {savingTracking ? "Saving..." : "Save & Broadcast"}
                                        </button>
                                    </div>
                                </div>

                                {/* Timeline Checkpoints Preview */}
                                {selectedOrder.tracking_events && selectedOrder.tracking_events.length > 0 && (
                                    <div>
                                        <span style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>
                                            Logged Checkpoints ({selectedOrder.tracking_events.length})
                                        </span>
                                        <div style={{ maxHeight: "140px", overflowY: "auto", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 12px" }}>
                                            {selectedOrder.tracking_events.map((ev, i) => (
                                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "6px 0", borderBottom: i < selectedOrder.tracking_events.length - 1 ? "1px solid #f1f5f9" : "none", fontSize: "12px" }}>
                                                    <span style={{ color: "#10b981", fontWeight: "700" }}>●</span>
                                                    <div style={{ flex: 1 }}>
                                                        <strong>{ev.title}</strong>
                                                        {ev.location && <span style={{ color: "#64748b", marginLeft: "6px" }}>({ev.location})</span>}
                                                        <p style={{ margin: "2px 0 0", color: "#475569", fontSize: "11px" }}>{ev.description}</p>
                                                    </div>
                                                    <span style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>
                                                        {ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="staff-modal-footer">
                            <div style={{ marginRight: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontSize: "12px", fontWeight: "700", color: "#475569" }}>Quick Status:</span>
                                {["confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"].map(st => (
                                    <button
                                        key={st}
                                        type="button"
                                        onClick={() => handleUpdateOrderStatus(selectedOrder.id, st)}
                                        className="staff-sync-btn"
                                        style={{
                                            padding: "4px 8px",
                                            fontSize: "11px",
                                            borderColor: selectedOrder.status === st ? "#ff3f6c" : "#e2e8f0",
                                            color: selectedOrder.status === st ? "#ff3f6c" : "#334155",
                                            fontWeight: selectedOrder.status === st ? "800" : "600"
                                        }}
                                    >
                                        {st.replace(/_/g, " ").toUpperCase()}
                                    </button>
                                ))}
                            </div>
                            <button type="button" className="staff-primary-small" onClick={() => setSelectedOrder(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}


            {/* =================================================
                CUSTOMER DETAILS MODAL
            ================================================== */}
            {selectedCustomerId && (
                <div className="staff-modal-overlay" onClick={() => { setSelectedCustomerId(null); setCustomerDetails(null); }}>
                    <div className="staff-modal-card" style={{ maxWidth: "950px" }} onClick={e => e.stopPropagation()}>
                        <div className="staff-modal-header">
                            <div>
                                <h2>Customer Intelligence & Activity</h2>
                                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                                    {customerDetails ? `${customerDetails.user.name} (@${customerDetails.user.username}) • ID #${customerDetails.user.id}` : "Loading customer records..."}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="staff-modal-close"
                                onClick={() => { setSelectedCustomerId(null); setCustomerDetails(null); }}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="staff-modal-body">
                            {loadingCustomerDetails && !customerDetails ? (
                                <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                                    <div style={{ fontSize: "28px", marginBottom: "8px" }}>⏳</div>
                                    <p>Retrieving complete customer profile, orders, and payment records...</p>
                                </div>
                            ) : customerDetails ? (
                                <>
                                    {/* CUSTOMER HEADER HERO */}
                                    <div className="staff-customer-header-card">
                                        <div className="staff-customer-profile-info">
                                            <div className="staff-customer-big-avatar">
                                                {customerDetails.user.name?.charAt(0) || "C"}
                                            </div>
                                            <div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <h3 style={{ margin: 0, fontSize: "18px", color: "#ffffff" }}>
                                                        {customerDetails.user.name}
                                                    </h3>
                                                    <span className={customerDetails.user.role === "admin" ? "staff-role-badge staff-role-admin" : "staff-role-badge staff-role-customer"}>
                                                        {customerDetails.user.role?.toUpperCase()}
                                                    </span>
                                                    <span style={{ background: "rgba(16, 185, 129, 0.2)", color: "#34d399", padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" }}>
                                                        ACTIVE
                                                    </span>
                                                </div>
                                                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#cbd5e1" }}>
                                                    ✉ {customerDetails.user.email} &nbsp;•&nbsp; 
                                                    {customerDetails.user.phone ? ` 📞 ${customerDetails.user.phone}` : " No phone registered"} &nbsp;•&nbsp; 
                                                    @{customerDetails.user.username}
                                                </p>
                                            </div>
                                        </div>

                                        <div style={{ textAlign: "right", fontSize: "12px", color: "#94a3b8" }}>
                                            <div>Account ID: <strong>#{customerDetails.user.id}</strong></div>
                                            <div>Registered: <strong>{new Date(customerDetails.user.created_at).toLocaleDateString()}</strong></div>
                                        </div>
                                    </div>

                                    {/* 4 STAT CARDS */}
                                    <div className="staff-customer-stats-grid">
                                        <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                            <small style={{ color: "#64748b", display: "block", fontSize: "11px", fontWeight: "700" }}>TOTAL ORDERS</small>
                                            <strong style={{ fontSize: "18px", color: "#0f172a" }}>{customerDetails.stats.total_orders}</strong>
                                        </div>
                                        <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                            <small style={{ color: "#64748b", display: "block", fontSize: "11px", fontWeight: "700" }}>LIFETIME SPENT</small>
                                            <strong style={{ fontSize: "18px", color: "#0f172a" }}>₹{Number(customerDetails.stats.total_spent).toLocaleString("en-IN")}</strong>
                                        </div>
                                        <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                            <small style={{ color: "#64748b", display: "block", fontSize: "11px", fontWeight: "700" }}>PENDING ORDERS</small>
                                            <strong style={{ fontSize: "18px", color: customerDetails.stats.pending_orders > 0 ? "#f59e0b" : "#10b981" }}>
                                                {customerDetails.stats.pending_orders}
                                            </strong>
                                        </div>
                                        <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                            <small style={{ color: "#64748b", display: "block", fontSize: "11px", fontWeight: "700" }}>PAYMENTS RECORDED</small>
                                            <strong style={{ fontSize: "18px", color: "#0f172a" }}>{customerDetails.stats.total_payments}</strong>
                                        </div>
                                    </div>

                                    {/* TAB SWITCHER */}
                                    <div className="staff-customer-modal-tabs">
                                        <button
                                            type="button"
                                            className={`staff-customer-tab-btn ${customerModalTab === "orders" ? "active" : ""}`}
                                            onClick={() => setCustomerModalTab("orders")}
                                        >
                                            📦 Order History ({customerDetails.orders.length})
                                        </button>
                                        <button
                                            type="button"
                                            className={`staff-customer-tab-btn ${customerModalTab === "payments" ? "active" : ""}`}
                                            onClick={() => setCustomerModalTab("payments")}
                                        >
                                            💳 Payments & Gateway ({customerDetails.payments.length})
                                        </button>
                                        <button
                                            type="button"
                                            className={`staff-customer-tab-btn ${customerModalTab === "addresses" ? "active" : ""}`}
                                            onClick={() => setCustomerModalTab("addresses")}
                                        >
                                            📍 Delivery Addresses ({customerDetails.addresses.length})
                                        </button>
                                    </div>

                                    {/* TAB CONTENT: ORDERS */}
                                    {customerModalTab === "orders" && (
                                        <div>
                                            {customerDetails.orders.length === 0 ? (
                                                <div style={{ padding: "30px", textAlign: "center", color: "#94a3b8", background: "#f8fafc", borderRadius: "8px" }}>
                                                    This customer has not placed any orders yet.
                                                </div>
                                            ) : (
                                                customerDetails.orders.map(o => (
                                                    <div key={o.id} className="staff-customer-order-card">
                                                        <div className="staff-customer-order-card-header">
                                                            <div>
                                                                <strong style={{ fontSize: "14px", color: "#0f172a" }}>Order #{o.id}</strong>
                                                                <span style={{ margin: "0 8px", color: "#cbd5e1" }}>•</span>
                                                                <small style={{ color: "#64748b" }}>
                                                                    {o.created_at ? new Date(o.created_at).toLocaleString() : "Recently"}
                                                                </small>
                                                            </div>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                                <span className={`staff-order-status ${o.status?.toLowerCase()}`}>{o.status}</span>
                                                                <span className={`staff-payment-badge ${o.payment_status?.toLowerCase()}`}>{o.payment_status}</span>
                                                                <strong style={{ fontSize: "14px", color: "#0f172a", marginLeft: "6px" }}>
                                                                    ₹{Number(o.total_amount).toLocaleString("en-IN")}
                                                                </strong>
                                                                <button
                                                                    type="button"
                                                                    className="staff-primary-small"
                                                                    style={{ padding: "4px 8px", fontSize: "11px", marginLeft: "8px" }}
                                                                    onClick={() => setSelectedOrder(o)}
                                                                >
                                                                    Inspect Order
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Items table */}
                                                        <div className="staff-customer-order-card-items-wrap" style={{ padding: "12px 18px" }}>
                                                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                                                                <thead>
                                                                    <tr style={{ textAlign: "left", color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>
                                                                        <th style={{ paddingBottom: "6px" }}>Item</th>
                                                                        <th style={{ paddingBottom: "6px" }}>Size</th>
                                                                        <th style={{ paddingBottom: "6px" }}>Color</th>
                                                                        <th style={{ paddingBottom: "6px" }}>Qty</th>
                                                                        <th style={{ paddingBottom: "6px", textAlign: "right" }}>Total</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {(o.items || []).map((it, idx) => (
                                                                        <tr key={idx} style={{ borderBottom: "1px solid #f8fafc" }}>
                                                                            <td style={{ padding: "8px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                                                                                {it.image_url && (
                                                                                    <img src={it.image_url} alt={it.product_name} style={{ width: "28px", height: "36px", objectFit: "cover", borderRadius: "3px" }} />
                                                                                )}
                                                                                <span>{it.product_name}</span>
                                                                            </td>
                                                                            <td style={{ padding: "8px 0" }}>{it.size}</td>
                                                                            <td style={{ padding: "8px 0", color: "#64748b" }}>{it.color || "Standard"}</td>
                                                                            <td style={{ padding: "8px 0" }}>{it.quantity}</td>
                                                                            <td style={{ padding: "8px 0", textAlign: "right", fontWeight: "700" }}>
                                                                                ₹{Number(it.line_total).toLocaleString("en-IN")}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>

                                                            {o.shipping_address && (
                                                                <div style={{ marginTop: "10px", fontSize: "11px", color: "#64748b", borderTop: "1px dashed #e2e8f0", paddingTop: "8px" }}>
                                                                    📍 <strong>Shipped to:</strong> {o.shipping_address.name}, {o.shipping_address.address_line1}, {o.shipping_address.city} ({o.shipping_address.pincode}) • Contact: {o.shipping_address.phone}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}

                                    {/* TAB CONTENT: PAYMENTS */}
                                    {customerModalTab === "payments" && (
                                        <div>
                                            {customerDetails.payments.length === 0 ? (
                                                <div style={{ padding: "30px", textAlign: "center", color: "#94a3b8", background: "#f8fafc", borderRadius: "8px" }}>
                                                    No online payment transactions registered for this customer.
                                                </div>
                                            ) : (
                                                <div className="staff-order-items-scroll">
                                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                                                        <thead>
                                                            <tr style={{ background: "#f8fafc", textAlign: "left", color: "#475569" }}>
                                                                <th style={{ padding: "10px 14px" }}>Intent ID</th>
                                                                <th style={{ padding: "10px 14px" }}>Razorpay Order ID</th>
                                                                <th style={{ padding: "10px 14px" }}>Payment ID</th>
                                                                <th style={{ padding: "10px 14px" }}>Amount</th>
                                                                <th style={{ padding: "10px 14px" }}>Status</th>
                                                                <th style={{ padding: "10px 14px" }}>Created</th>
                                                                <th style={{ padding: "10px 14px" }}>Paid At</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {customerDetails.payments.map(p => (
                                                                <tr key={p.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                                                                    <td style={{ padding: "10px 14px", fontWeight: "700" }}>#{p.id}</td>
                                                                    <td style={{ padding: "10px 14px", color: "#64748b", fontFamily: "monospace" }}>{p.razorpay_order_id}</td>
                                                                    <td style={{ padding: "10px 14px", color: "#64748b", fontFamily: "monospace" }}>{p.razorpay_payment_id || "—"}</td>
                                                                    <td style={{ padding: "10px 14px", fontWeight: "700", color: "#0f172a" }}>₹{Number(p.amount).toLocaleString("en-IN")}</td>
                                                                    <td style={{ padding: "10px 14px" }}>
                                                                        <span className={`staff-payment-badge ${p.status?.toLowerCase()}`}>{p.status}</span>
                                                                    </td>
                                                                    <td style={{ padding: "10px 14px", color: "#64748b" }}>{p.created_at ? new Date(p.created_at).toLocaleString() : "—"}</td>
                                                                    <td style={{ padding: "10px 14px", color: "#64748b" }}>{p.paid_at ? new Date(p.paid_at).toLocaleString() : "—"}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* TAB CONTENT: ADDRESSES */}
                                    {customerModalTab === "addresses" && (
                                        <div>
                                            {customerDetails.addresses.length === 0 ? (
                                                <div style={{ padding: "30px", textAlign: "center", color: "#94a3b8", background: "#f8fafc", borderRadius: "8px" }}>
                                                    No delivery addresses on record for this customer.
                                                </div>
                                            ) : (
                                                <div className="staff-order-modal-grid">
                                                    {customerDetails.addresses.map((addr, idx) => (
                                                        <div key={idx} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px" }}>
                                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                                                <strong style={{ fontSize: "14px", color: "#0f172a" }}>{addr.name || customerDetails.user.name}</strong>
                                                                <span style={{ fontSize: "11px", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", color: "#64748b" }}>Address #{idx + 1}</span>
                                                            </div>
                                                            <div style={{ fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>
                                                                <p style={{ margin: "2px 0" }}>{addr.address_line1}</p>
                                                                {addr.address_line2 && <p style={{ margin: "2px 0" }}>{addr.address_line2}</p>}
                                                                <p style={{ margin: "2px 0" }}>{addr.city}, {addr.state} - <strong>{addr.pincode}</strong></p>
                                                                <p style={{ margin: "4px 0 0", color: "#64748b" }}>📞 Phone: {addr.phone}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : null}
                        </div>

                        <div className="staff-modal-footer">
                            {selectedCustomerId && (
                                <button
                                    type="button"
                                    className="staff-sync-btn"
                                    style={{ marginRight: "auto" }}
                                    onClick={() => handleOpenCustomerDetails(selectedCustomerId)}
                                >
                                    ↻ Refresh Records
                                </button>
                            )}
                            <button
                                type="button"
                                className="staff-primary-small"
                                onClick={() => { setSelectedCustomerId(null); setCustomerDetails(null); }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* =================================================
                ADD PRODUCT MODAL
            ================================================== */}
            {showAddProductModal && (
                <div className="staff-modal-overlay" onClick={() => setShowAddProductModal(false)}>
                    <div className="staff-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="staff-modal-header">
                            <div>
                                <h2>Add New Product to Apsara Trends</h2>
                                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                                    Fill in product details, pricing, media, and customize all inventory variants (sizes & colors).
                                </p>
                            </div>
                            <button type="button" className="staff-modal-close" onClick={() => setShowAddProductModal(false)}>✕</button>
                        </div>

                        <form onSubmit={handleCreateProductSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
                            <div className="staff-modal-body">
                                <h4 style={{ margin: "0 0 14px", color: "#0f172a", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                    1. Basic Product Information
                                </h4>

                                <div className="staff-form-group">
                                    <label>Product Title / Name *</label>
                                    <input
                                        type="text"
                                        className="staff-form-input"
                                        placeholder="e.g. Royal Silk Embroidered Anarkali Kurta Set"
                                        value={productForm.name}
                                        onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="staff-form-grid-3">
                                    <div className="staff-form-group">
                                        <label>Department *</label>
                                        <select
                                            className="staff-form-select"
                                            value={productForm.department}
                                            onChange={e => setProductForm({ ...productForm, department: e.target.value })}
                                        >
                                            <option value="Women">Women</option>
                                            <option value="Men">Men</option>
                                            <option value="Kids">Kids</option>
                                            <option value="Beauty">Beauty</option>
                                            <option value="Jewellery">Jewellery</option>
                                        </select>
                                    </div>

                                    <div className="staff-form-group">
                                        <label>Category</label>
                                        <input
                                            type="text"
                                            className="staff-form-input"
                                            placeholder="e.g. Kurtas, Dresses, Footwear"
                                            value={productForm.category_name}
                                            onChange={e => setProductForm({ ...productForm, category_name: e.target.value })}
                                            list="category-suggestions"
                                        />
                                        <datalist id="category-suggestions">
                                            {categories.map(c => <option key={c.id} value={c.name} />)}
                                        </datalist>
                                    </div>

                                    <div className="staff-form-group">
                                        <label>Brand</label>
                                        <input
                                            type="text"
                                            className="staff-form-input"
                                            placeholder="e.g. Apsara Trends Woman, Apsara Trends Jewels"
                                            value={productForm.brand_name}
                                            onChange={e => setProductForm({ ...productForm, brand_name: e.target.value })}
                                            list="brand-suggestions"
                                        />
                                        <datalist id="brand-suggestions">
                                            {brands.map(b => <option key={b.id} value={b.name} />)}
                                        </datalist>
                                    </div>
                                </div>

                                <div className="staff-form-grid-3">
                                    <div className="staff-form-group">
                                        <label>Base Price (₹) *</label>
                                        <input
                                            type="number"
                                            className="staff-form-input"
                                            placeholder="2999"
                                            value={productForm.base_price}
                                            onChange={e => setProductForm({ ...productForm, base_price: e.target.value })}
                                            required
                                            min="1"
                                        />
                                    </div>

                                    <div className="staff-form-group">
                                        <label>Discount Percentage (%)</label>
                                        <input
                                            type="number"
                                            className="staff-form-input"
                                            placeholder="0"
                                            value={productForm.discount_percentage}
                                            onChange={e => setProductForm({ ...productForm, discount_percentage: e.target.value })}
                                            min="0"
                                            max="90"
                                        />
                                    </div>

                                    <div className="staff-form-group">
                                        <label>Gender / Audience</label>
                                        <select
                                            className="staff-form-select"
                                            value={productForm.gender}
                                            onChange={e => setProductForm({ ...productForm, gender: e.target.value })}
                                        >
                                            <option value="Women">Women</option>
                                            <option value="Men">Men</option>
                                            <option value="Girls">Girls</option>
                                            <option value="Boys">Boys</option>
                                            <option value="Unisex">Unisex</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="staff-form-group">
                                    <label>Main Product Image URL</label>
                                    <input
                                        type="url"
                                        className="staff-form-input"
                                        placeholder="https://images.unsplash.com/... or /images/products/..."
                                        value={productForm.image_url}
                                        onChange={e => setProductForm({ ...productForm, image_url: e.target.value })}
                                    />
                                </div>

                                <div className="staff-form-group">
                                    <label>Product Description</label>
                                    <textarea
                                        className="staff-form-textarea"
                                        placeholder="Crafted with pure luxury fabrics, hand-detailed accents..."
                                        value={productForm.description}
                                        onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                                    />
                                </div>

                                <div style={{ display: "flex", gap: "24px", margin: "16px 0" }}>
                                    <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
                                        <input
                                            type="checkbox"
                                            checked={productForm.is_active}
                                            onChange={e => setProductForm({ ...productForm, is_active: e.target.checked })}
                                        />
                                        Active in Storefront (Live Immediately)
                                    </label>

                                    <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
                                        <input
                                            type="checkbox"
                                            checked={productForm.is_featured}
                                            onChange={e => setProductForm({ ...productForm, is_featured: e.target.checked })}
                                        />
                                        Featured Collection Item
                                    </label>
                                </div>

                                {/* VARIANTS BUILDER */}
                                <div style={{ marginTop: "24px", borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                                        <div>
                                            <h4 style={{ margin: 0, color: "#0f172a", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                                2. Sizes, Colors & Inventory Variants
                                            </h4>
                                            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                                                Define size and color combinations with their initial inventory stocks.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddVariantRow}
                                            className="staff-sync-btn"
                                            style={{ color: "#ff3f6c", borderColor: "#ff3f6c" }}
                                        >
                                            + Add Another Size/Color
                                        </button>
                                    </div>

                                    {productForm.variants.map((v, index) => (
                                        <div key={index} className="staff-variant-item-box">
                                            {productForm.variants.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="staff-variant-remove-btn"
                                                    onClick={() => handleRemoveVariantRow(index)}
                                                >
                                                    Remove
                                                </button>
                                            )}

                                            <div className="staff-form-grid-3">
                                                <div className="staff-form-group" style={{ margin: 0 }}>
                                                    <label>Size *</label>
                                                    <input
                                                        type="text"
                                                        className="staff-form-input"
                                                        placeholder="e.g. S, M, L, XL, Free Size"
                                                        value={v.size}
                                                        onChange={e => handleVariantChange(index, "size", e.target.value)}
                                                        required
                                                    />
                                                </div>

                                                <div className="staff-form-group" style={{ margin: 0 }}>
                                                    <label>Color</label>
                                                    <input
                                                        type="text"
                                                        className="staff-form-input"
                                                        placeholder="e.g. Ruby Red, Jet Black"
                                                        value={v.color}
                                                        onChange={e => handleVariantChange(index, "color", e.target.value)}
                                                    />
                                                </div>

                                                <div className="staff-form-group" style={{ margin: 0 }}>
                                                    <label>Stock Units *</label>
                                                    <input
                                                        type="number"
                                                        className="staff-form-input"
                                                        placeholder="15"
                                                        value={v.stock}
                                                        onChange={e => handleVariantChange(index, "stock", e.target.value)}
                                                        min="0"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="staff-form-grid-2" style={{ marginTop: "10px", marginBottom: 0 }}>
                                                <div className="staff-form-group" style={{ margin: 0 }}>
                                                    <label>Variant Price Override (₹, leave blank for Base Price)</label>
                                                    <input
                                                        type="number"
                                                        className="staff-form-input"
                                                        placeholder={productForm.base_price || "Same as base price"}
                                                        value={v.price}
                                                        onChange={e => handleVariantChange(index, "price", e.target.value)}
                                                    />
                                                </div>

                                                <div className="staff-form-group" style={{ margin: 0 }}>
                                                    <label>Custom SKU (optional)</label>
                                                    <input
                                                        type="text"
                                                        className="staff-form-input"
                                                        placeholder="Auto-generated if empty"
                                                        value={v.sku}
                                                        onChange={e => handleVariantChange(index, "sku", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="staff-modal-footer">
                                <button
                                    type="button"
                                    className="staff-sync-btn"
                                    onClick={() => setShowAddProductModal(false)}
                                    disabled={creatingProduct}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="staff-primary-small"
                                    disabled={creatingProduct}
                                    style={{ padding: "10px 24px", height: "auto", fontSize: "13px" }}
                                >
                                    {creatingProduct ? "CREATING PRODUCT..." : "CREATE PRODUCT & PUBLISH"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {/* =================================================
                ADD VARIANT TO EXISTING PRODUCT MODAL
            ================================================== */}
            {showAddVariantModal && (
                <div className="staff-modal-overlay" onClick={() => setShowAddVariantModal(false)}>
                    <div className="staff-modal-card" style={{ maxWidth: "520px" }} onClick={e => e.stopPropagation()}>
                        <div className="staff-modal-header">
                            <h2>Add Size / Variant to Product</h2>
                            <button type="button" className="staff-modal-close" onClick={() => setShowAddVariantModal(false)}>✕</button>
                        </div>

                        <form onSubmit={handleAddVariantToExistingProductSubmit}>
                            <div className="staff-modal-body">
                                <div className="staff-form-group">
                                    <label>Size *</label>
                                    <input
                                        type="text"
                                        className="staff-form-input"
                                        placeholder="e.g. S, M, L, XL, XXL, Free Size"
                                        value={newVariantForm.size}
                                        onChange={e => setNewVariantForm({ ...newVariantForm, size: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="staff-form-group">
                                    <label>Color</label>
                                    <input
                                        type="text"
                                        className="staff-form-input"
                                        placeholder="e.g. Emerald Green, Navy Blue"
                                        value={newVariantForm.color}
                                        onChange={e => setNewVariantForm({ ...newVariantForm, color: e.target.value })}
                                    />
                                </div>

                                <div className="staff-form-group">
                                    <label>Stock Quantity (Units) *</label>
                                    <input
                                        type="number"
                                        className="staff-form-input"
                                        placeholder="20"
                                        value={newVariantForm.stock}
                                        onChange={e => setNewVariantForm({ ...newVariantForm, stock: e.target.value })}
                                        min="0"
                                        required
                                    />
                                </div>

                                <div className="staff-form-group">
                                    <label>Price (₹, leave blank to use product base price)</label>
                                    <input
                                        type="number"
                                        className="staff-form-input"
                                        placeholder="Base price"
                                        value={newVariantForm.price}
                                        onChange={e => setNewVariantForm({ ...newVariantForm, price: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="staff-modal-footer">
                                <button type="button" className="staff-sync-btn" onClick={() => setShowAddVariantModal(false)}>Cancel</button>
                                <button type="submit" className="staff-primary-small" disabled={creatingProduct}>
                                    {creatingProduct ? "ADDING..." : "ADD VARIANT"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;