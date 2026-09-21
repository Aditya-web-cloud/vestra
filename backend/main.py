import os
import re

import payment_models

from order_routes import (
    router as orders_router,
)

from payments import (
    router as payments_router,
)

from fastapi import (
    Depends,
    FastAPI,
    HTTPException,
    Query,
    status,
)

from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import (
    asc,
    desc,
    or_,
)

from sqlalchemy.orm import Session

from database import (
    Base,
    engine,
    get_db,
)

from models import (
    Brand,
    Cart,
    Category,
    Product,
    ProductVariant,
    User,
    Wishlist,
)

from schemas import (
    ProductResponse,
    ProductVariantResponse,
    RegisterRequest,
    UserResponse,
)

from login_schema import (
    LoginRequest,
    TokenResponse,
)

from security import (
    hash_password,
    verify_password,
)

from auth import (
    create_access_token,
    get_current_user,
)

import access_models

from access import (
    router as access_router,
)

from admin import (
    router as admin_router,
)


# =========================================================
# DATABASE
# =========================================================

Base.metadata.create_all(
    bind=engine
)


# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="VESTRA API",
    version="1.0.0",
)

app.include_router(
    access_router
)


app.include_router(
    admin_router
)

app.include_router(
    payments_router
)

app.include_router(
    orders_router
)

# =========================================================
# CORS
# =========================================================

cors_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]
frontend_env_url = os.getenv("FRONTEND_URL")
if frontend_env_url:
    cors_origins.append(frontend_env_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"^https://.*(\.vercel\.app|\.onrender\.com)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




# =========================================================
# BASIC ROUTES
# =========================================================

@app.get("/")
def root():

    return {
        "name": "VESTRA API",
        "status": "running",
    }


@app.get("/health")
def health():

    return {
        "status": "ok",
    }


# =========================================================
# REGISTER
# =========================================================

@app.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
):

    name = payload.name.strip()

    username = (
        payload.username
        .strip()
        .lower()
    )

    email = (
        payload.email
        .strip()
        .lower()
    )

    password = payload.password


    # -----------------------------------------------------
    # NAME
    # -----------------------------------------------------

    if len(name) < 2:

        raise HTTPException(
            status_code=400,
            detail="Name must contain at least 2 characters.",
        )


    # -----------------------------------------------------
    # USERNAME
    # -----------------------------------------------------

    if not re.fullmatch(
        r"[A-Za-z0-9_]{3,30}",
        username,
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Username must be 3-30 characters "
                "using only letters, numbers or underscores."
            ),
        )


    # -----------------------------------------------------
    # PASSWORD
    # -----------------------------------------------------

    if len(password) < 8:

        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 8 characters.",
        )


    if not re.search(
        r"[a-z]",
        password,
    ):

        raise HTTPException(
            status_code=400,
            detail="Password must contain a lowercase letter.",
        )


    if not re.search(
        r"[A-Z]",
        password,
    ):

        raise HTTPException(
            status_code=400,
            detail="Password must contain an uppercase letter.",
        )


    if not re.search(
        r"\d",
        password,
    ):

        raise HTTPException(
            status_code=400,
            detail="Password must contain a number.",
        )


    if not re.search(
        r"[^A-Za-z0-9]",
        password,
    ):

        raise HTTPException(
            status_code=400,
            detail="Password must contain a special character.",
        )


    # -----------------------------------------------------
    # DUPLICATES
    # -----------------------------------------------------

    existing_username = (
        db.query(User)
        .filter(
            User.username == username
        )
        .first()
    )


    if existing_username:

        raise HTTPException(
            status_code=409,
            detail="Username already exists.",
        )


    existing_email = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )


    if existing_email:

        raise HTTPException(
            status_code=409,
            detail="Email is already registered.",
        )


    # -----------------------------------------------------
    # CREATE USER
    # -----------------------------------------------------

    user = User(
        name=name,
        username=username,
        email=email,
        hashed_password=hash_password(
            password
        ),
        is_admin=False,
        is_active=True,
    )


    db.add(
        user
    )

    db.commit()

    db.refresh(
        user
    )


    # -----------------------------------------------------
    # CREATE ACCOUNT CART + WISHLIST
    # -----------------------------------------------------

    cart = Cart(
        user_id=user.id
    )


    wishlist = Wishlist(
        user_id=user.id
    )


    db.add_all([
        cart,
        wishlist,
    ])


    db.commit()


    return user


# =========================================================
# LOGIN
# =========================================================

@app.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):

    username = (
        payload.username
        .strip()
        .lower()
    )


    user = (
        db.query(User)
        .filter(
            User.username == username
        )
        .first()
    )


    if (
        not user
        or
        not verify_password(
            payload.password,
            user.hashed_password,
        )
    ):

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
        )


    if not user.is_active:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is inactive.",
        )


    access_token = (
        create_access_token(
            user.id
        )
    )


    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


# =========================================================
# CURRENT USER
# =========================================================

@app.get(
    "/me",
    response_model=UserResponse,
)
def me(
    current_user: User = Depends(
        get_current_user
    ),
):

    return current_user


# =========================================================
# PRODUCTS
# =========================================================

@app.get(
    "/products",
    response_model=list[ProductResponse],
)
def get_products(
    search: str | None = None,

    department: str | None = None,

    category_id: int | None = None,

    category_slug: str | None = None,

    category: str | None = None,

    gender: str | None = None,

    min_price: float | None = Query(
        default=None,
        ge=0,
    ),

    max_price: float | None = Query(
        default=None,
        ge=0,
    ),

    sort: str = "newest",

    page: int = Query(
        default=1,
        ge=1,
    ),

    limit: int = Query(
        default=12,
        ge=1,
        le=100,
    ),

    db: Session = Depends(get_db),
):

    query = (
        db.query(Product)
        .filter(
            Product.is_active.is_(True)
        )
    )


    # -----------------------------------------------------
    # SEARCH
    # -----------------------------------------------------

    if search:
        search_term = search.strip()
        stems = [search_term]
        lower_term = search_term.lower()

        # Handle common plurals/synonyms for fashion e-commerce
        if lower_term.endswith("es"):
            stems.append(search_term[:-2])
        elif lower_term.endswith("s"):
            stems.append(search_term[:-1])

        if "t-shirt" in lower_term or "tee" in lower_term:
            stems.extend(["tee", "t-shirt", "tshirt", "t-shirts"])
        if "perfume" in lower_term or "parfum" in lower_term:
            stems.extend(["perfume", "parfum", "fragrance"])
        if "kurta" in lower_term:
            stems.extend(["kurta", "kurti"])

        search_conditions = []
        for stem in set(stems):
            if stem:
                pattern = f"%{stem}%"
                search_conditions.extend([
                    Product.name.ilike(pattern),
                    Product.description.ilike(pattern),
                    Category.name.ilike(pattern),
                    Category.slug.ilike(pattern),
                ])

        query = query.outerjoin(Category, Product.category_id == Category.id).filter(
            or_(*search_conditions)
        )


    # -----------------------------------------------------
    # DEPARTMENT
    # -----------------------------------------------------

    if department:

        query = query.filter(
            Product.department.ilike(
                department.strip()
            )
        )


    # -----------------------------------------------------
    # CATEGORY ID / SLUG / NAME (HIERARCHICAL)
    # -----------------------------------------------------

    if category_id is not None:
        cat = db.query(Category).filter(Category.id == category_id).first()
        if cat:
            child_ids = [c[0] for c in db.query(Category.id).filter(Category.parent_id == cat.id).all()]
            if child_ids:
                query = query.filter(Product.category_id.in_([cat.id] + child_ids))
            else:
                query = query.filter(Product.category_id == cat.id)
        else:
            query = query.filter(Product.category_id == category_id)

    if category_slug:
        clean_slug = category_slug.strip().lower()
        cat = db.query(Category).filter(Category.slug == clean_slug).first()
        if cat:
            child_ids = [c[0] for c in db.query(Category.id).filter(Category.parent_id == cat.id).all()]
            if child_ids:
                query = query.filter(Product.category_id.in_([cat.id] + child_ids))
            else:
                query = query.filter(Product.category_id == cat.id)
        else:
            query = (
                query
                .join(
                    Category,
                    Product.category_id ==
                    Category.id,
                )
                .filter(
                    Category.slug ==
                    clean_slug
                )
            )

    if category:
        clean_name = category.strip()
        cat = db.query(Category).filter(Category.name.ilike(clean_name)).first()
        if cat:
            child_ids = [c[0] for c in db.query(Category.id).filter(Category.parent_id == cat.id).all()]
            if child_ids:
                query = query.filter(Product.category_id.in_([cat.id] + child_ids))
            else:
                query = query.filter(Product.category_id == cat.id)
        else:
            query = (
                query
                .join(
                    Category,
                    Product.category_id ==
                    Category.id,
                )
                .filter(
                    Category.name.ilike(
                        f"%{clean_name}%"
                    )
                )
            )


    # -----------------------------------------------------
    # GENDER
    # -----------------------------------------------------

    if gender:

        query = query.filter(
            Product.gender.ilike(
                gender.strip()
            )
        )


    # -----------------------------------------------------
    # PRICE
    # -----------------------------------------------------

    if min_price is not None:

        query = query.filter(
            Product.base_price >=
            min_price
        )


    if max_price is not None:

        query = query.filter(
            Product.base_price <=
            max_price
        )


    # -----------------------------------------------------
    # SORT
    # -----------------------------------------------------

    if sort == "price_low":

        query = query.order_by(
            asc(
                Product.base_price
            )
        )


    elif sort == "price_high":

        query = query.order_by(
            desc(
                Product.base_price
            )
        )


    elif sort == "rating":

        query = query.order_by(
            desc(
                Product.rating
            )
        )


    elif sort == "discount":

        query = query.order_by(
            desc(
                Product.discount_percentage
            )
        )


    elif sort == "name":

        query = query.order_by(
            asc(
                Product.name
            )
        )


    else:

        query = query.order_by(
            desc(
                Product.created_at
            ),
            desc(
                Product.id
            ),
        )


    # -----------------------------------------------------
    # PAGINATION
    # -----------------------------------------------------

    offset = (
        page - 1
    ) * limit


    return (
        query
        .offset(
            offset
        )
        .limit(
            limit
        )
        .all()
    )


# =========================================================
# FEATURED
# Must remain before /products/{product_id}
# =========================================================

@app.get(
    "/products/featured",
    response_model=list[ProductResponse],
)
def featured_products(
    db: Session = Depends(get_db),
):

    return (
        db.query(Product)
        .filter(
            Product.is_active.is_(True),
            Product.is_featured.is_(True),
        )
        .order_by(
            desc(
                Product.rating
            )
        )
        .limit(
            8
        )
        .all()
    )


# =========================================================
# PRODUCT DETAILS
# =========================================================

@app.get(
    "/products/{product_id}",
    response_model=ProductResponse,
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
):

    product = (
        db.query(Product)
        .filter(
            Product.id ==
            product_id,

            Product.is_active.is_(True),
        )
        .first()
    )


    if not product:

        raise HTTPException(
            status_code=404,
            detail="Product not found.",
        )


    return product


# =========================================================
# PRODUCT VARIANTS
# =========================================================

@app.get(
    "/products/{product_id}/variants",
    response_model=list[
        ProductVariantResponse
    ],
)
def get_product_variants(
    product_id: int,
    db: Session = Depends(get_db),
):

    product = (
        db.query(Product)
        .filter(
            Product.id ==
            product_id,

            Product.is_active.is_(True),
        )
        .first()
    )


    if not product:

        raise HTTPException(
            status_code=404,
            detail="Product not found.",
        )


    return (
        db.query(ProductVariant)
        .filter(
            ProductVariant.product_id ==
            product_id,

            ProductVariant.is_active.is_(True),
        )
        .order_by(
            ProductVariant.id
        )
        .all()
    )


# =========================================================
# CATEGORIES
# =========================================================

@app.get("/categories")
def get_categories(
    db: Session = Depends(get_db),
):

    categories = (
        db.query(Category)
        .order_by(
            Category.parent_id,
            Category.name,
        )
        .all()
    )


    return [
        {
            "id":
                category.id,

            "name":
                category.name,

            "slug":
                category.slug,

            "parent_id":
                category.parent_id,
        }

        for category
        in categories
    ]


# =========================================================
# BRANDS
# =========================================================

@app.get("/brands")
def get_brands(
    db: Session = Depends(get_db),
):

    brands = (
        db.query(Brand)
        .order_by(
            Brand.name
        )
        .all()
    )


    return [
        {
            "id":
                brand.id,

            "name":
                brand.name,

            "description":
                brand.description,

            "logo_url":
                brand.logo_url,
        }

        for brand
        in brands
    ]