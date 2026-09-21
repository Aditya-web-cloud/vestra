import re

from database import SessionLocal

from models import (
    Brand,
    Category,
    Product,
    ProductVariant,
)


# =========================================================
# IMAGE HELPER
# =========================================================

def image(photo_id) -> str:
    if isinstance(photo_id, str):
        return photo_id
    return (
        f"https://images.pexels.com/photos/{photo_id}/"
        f"pexels-photo-{photo_id}.jpeg"
        f"?auto=compress&cs=tinysrgb&w=900&h=1200&fit=crop"
    )


# =========================================================
# SLUG
# =========================================================

def slugify(value: str) -> str:

    value = str(value).lower().strip()

    value = re.sub(
        r"[^a-z0-9]+",
        "-",
        value,
    )

    return value.strip("-")


# =========================================================
# MODEL HELPERS
# =========================================================

def model_has(
    model,
    field: str,
) -> bool:

    return hasattr(
        model,
        field,
    )


def set_if_supported(
    instance,
    model,
    field: str,
    value,
):

    if model_has(
        model,
        field,
    ):

        setattr(
            instance,
            field,
            value,
        )


# =========================================================
# PRODUCT DATA HELPER
# =========================================================

def item(
    department,
    brand,
    category,
    old_name,
    name,
    price,
    discount,
    rating,
    photo,
    color,
    size_group,
    gender,
    featured=False,
):

    return {

        "department":
            department,

        "brand":
            brand,

        "category":
            category,

        "old_name":
            old_name,

        "name":
            name,

        "price":
            price,

        "discount":
            discount,

        "rating":
            rating,

        "photo":
            photo,

        "color":
            color,

        "size_group":
            size_group,

        "gender":
            gender,

        "featured":
            featured,

    }


# =========================================================
# PRODUCTS
#
# Every product now has a distinct merchandising name.
#
# old_name = current database name
# name     = new name shown on VESTRA
# =========================================================

PRODUCTS = [

    # =====================================================
    # WOMEN
    # =====================================================

    item(
        "Women",
        "VESTRA Woman",
        "Dresses",
        "Floral Midi Dress",
        "Rosewood Bloom Midi Dress",
        2499,
        20,
        4.7,
        1021693,
        "Rose",
        "women",
        "women",
        True,
    ),

    item(
        "Women",
        "VESTRA Woman",
        "Kurtas & Kurtis",
        "Embroidered Kurta Set",
        "Noor Embroidered Kurta Set",
        1899,
        15,
        4.6,
        "/product-images/women-magenta-kurta-set.png",
        "Magenta",
        "women",
        "women",
        True,
    ),

    item(
        "Women",
        "VESTRA Woman",
        "Jeans",
        "Straight Fit Jeans",
        "Indigo Avenue Straight Jeans",
        1699,
        10,
        4.4,
        "/product-images/women-wide-leg-jeans.png",
        "Blue",
        "women_waist",
        "women",
    ),

    item(
        "Women",
        "VESTRA Woman",
        "Footwear",
        "Classic White Sneakers",
        "Ivory Street Classic Sneakers",
        2199,
        18,
        4.5,
        "/product-images/puma-colorblock-sneakers.png",
        "Multicolor",
        "women_shoes",
        "women",
    ),

    item(
        "Women",
        "VESTRA Woman",
        "Sarees",
        "Banarasi Silk Saree",
        "Zariya Banarasi Silk Saree",
        3299,
        28,
        4.9,
        "/product-images/women-silk-ikat-saree.png",
        "Brown",
        "free",
        "women",
        True,
    ),

    item(
        "Women",
        "VESTRA Woman",
        "Sarees",
        "Printed Cotton Saree",
        "Neel Bagh Printed Cotton Saree",
        1799,
        22,
        4.6,
        985635,
        "Indigo",
        "free",
        "women",
    ),

    item(
        "Women",
        "VESTRA Woman",
        "Co-ords",
        "Linen Co-ord Set",
        "Sandstone Linen Co-ord Set",
        2399,
        24,
        4.7,
        1381556,
        "Beige",
        "women",
        "women",
        True,
    ),

    item(
        "Women",
        "VESTRA Woman",
        "Tops",
        "Ribbed Crop Top",
        "Black Bloom Peplum Kurti Top",
        1199,
        16,
        4.5,
        "/product-images/women-black-floral-kurti.png",
        "Black",
        "women",
        "women",
    ),

    item(
        "Women",
        "VESTRA Woman",
        "Trousers",
        "Wide Leg Trousers",
        "Midnight Flow Wide-Leg Trousers",
        1599,
        18,
        4.6,
        1346187,
        "Black",
        "women",
        "women",
    ),

    item(
        "Women",
        "VESTRA Woman",
        "Ethnic Sets",
        "Anarkali Festive Set",
        "Meher Embellished Anarkali Gown",
        3499,
        30,
        4.9,
        "/product-images/women-white-anarkali-gown.png",
        "White",
        "women",
        "women",
        True,
    ),

    item(
        "Women",
        "VESTRA Woman",
        "Jackets",
        "Denim Jacket",
        "Active Spirit Track Jacket",
        2299,
        21,
        4.5,
        "/product-images/women-white-bomber-jacket.png",
        "White",
        "women",
        "women",
    ),

    item(
        "Women",
        "VESTRA Woman",
        "Palazzos",
        "Block Print Palazzo Set",
        "Gulnaar Royal Anarkali Set",
        2099,
        25,
        4.7,
        "/product-images/women-maroon-anarkali-gown.png",
        "Maroon",
        "women",
        "women",
    ),


    # =====================================================
    # KIDS
    # =====================================================

    item(
        "Kids",
        "VESTRA Kids",
        "Boys Clothing",
        "Kids Graphic T-Shirt Set",
        "Sky Rocket Skater Tee 3-Pack",
        999,
        15,
        4.6,
        "/product-images/kids-skater-tshirts.png",
        "Multicolor",
        "kids",
        "kids",
        True,
    ),

    item(
        "Kids",
        "VESTRA Kids",
        "Girls Clothing",
        "Girls Party Dress",
        "Blush Twirl Party Dress",
        1399,
        20,
        4.7,
        "/product-images/kids-blush-twirl-dress.jpg",
        "Pink",
        "kids",
        "kids",
        True,
    ),

    item(
        "Kids",
        "VESTRA Kids",
        "Baby",
        "Baby Cotton Romper",
        "Sunshine Snuggle Cotton Romper",
        699,
        10,
        4.5,
        "/product-images/kids-sunshine-romper.jpg",
        "Yellow",
        "baby",
        "kids",
    ),

    item(
        "Kids",
        "VESTRA Kids",
        "Boys Clothing",
        "Kids Denim Dungarees",
        "Cloudstep Denim Dungarees Set",
        1299,
        15,
        4.7,
        "/product-images/kids-denim-dungarees.jpg",
        "Blue",
        "kids",
        "kids",
    ),

    item(
        "Kids",
        "VESTRA Kids",
        "Boys Clothing",
        "Boys Denim Shirt",
        "Little Explorer Denim Shirt",
        1099,
        18,
        4.5,
        "/product-images/kids-denim-shirt.jpg",
        "Denim",
        "kids",
        "kids",
    ),

    item(
        "Kids",
        "VESTRA Kids",
        "Girls Ethnic Wear",
        "Girls Floral Kurta Set",
        "Coral Bloom Festive Kurta Set",
        1599,
        25,
        4.8,
        "/product-images/kids-coral-kurta-set.jpg",
        "Coral",
        "kids",
        "kids",
        True,
    ),

    item(
        "Kids",
        "VESTRA Kids",
        "Boys Clothing",
        "Kids Cargo Joggers",
        "Olive Adventure Cargo Joggers 3-Pack",
        1299,
        20,
        4.6,
        "/product-images/kids-cargo-joggers.png",
        "Multi",
        "kids",
        "kids",
    ),

    item(
        "Kids",
        "VESTRA Kids",
        "Girls Clothing",
        "Girls Cotton Co-ord Set",
        "Lavender Play Cotton Co-ord Set",
        1499,
        22,
        4.7,
        "/product-images/kids-lavender-coord.jpg",
        "Lavender",
        "kids",
        "kids",
    ),

    item(
        "Kids",
        "VESTRA Kids",
        "Baby",
        "Baby Knit Set",
        "Cozy Cloud Baby Knit Set",
        899,
        14,
        4.6,
        "/product-images/kids-baby-knit.jpg",
        "Cream",
        "baby",
        "kids",
    ),

    item(
        "Kids",
        "VESTRA Kids",
        "Boys Clothing",
        "Kids Varsity Jacket",
        "Navy Trail Varsity Bomber Jacket",
        1499,
        18,
        4.7,
        "/product-images/kids-varsity-jacket.jpg",
        "Navy",
        "kids",
        "kids",
    ),

    item(
        "Kids",
        "VESTRA Kids",
        "Boys Ethnic Wear",
        "Boys Festive Kurta",
        "Sunehri Celebration Kurta Set",
        1799,
        26,
        4.8,
        "/product-images/kids-festive-kurta.jpg",
        "Mustard",
        "kids",
        "kids",
        True,
    ),

    item(
        "Kids",
        "VESTRA Kids",
        "Girls Clothing",
        "Kids Hoodies & Sweatshirts",
        "London Heritage Colourblock Hoodie",
        999,
        19,
        4.5,
        "/product-images/kids-pepe-hoodie.png",
        "Navy Yellow",
        "kids",
        "kids",
    ),


    # =====================================================
    # BEAUTY
    # =====================================================

    item(
        "Beauty",
        "VESTRA Beauty",
        "Makeup",
        "Velvet Matte Lipstick",
        "Ruby Veil Velvet Lip Colour",
        799,
        10,
        4.8,
        "/product-images/velvet-matte-lipstick.jpg",
        "Ruby Red",
        "one",
        "unisex",
        True,
    ),

    item(
        "Beauty",
        "VESTRA Beauty",
        "Skincare",
        "Vitamin C Glow Serum",
        "Radiance C Brightening Serum",
        1099,
        15,
        4.7,
        "/product-images/vitamin-c-glow-serum.jpg",
        "Clear",
        "one",
        "unisex",
        True,
    ),

    item(
        "Beauty",
        "VESTRA Beauty",
        "Skincare",
        "Hydrating Face Cream",
        "Aqua Cloud Hydrating Cream",
        899,
        8,
        4.5,
        2693644,
        "White",
        "one",
        "unisex",
    ),

    item(
        "Beauty",
        "VESTRA Beauty",
        "Fragrances",
        "Signature Eau De Parfum",
        "Amber Muse Eau De Parfum",
        1799,
        12,
        4.6,
        "/product-images/signature-eau-de-parfum.jpg",
        "Amber",
        "one",
        "unisex",
    ),

    item(
        "Beauty",
        "VESTRA Beauty",
        "Makeup",
        "Waterproof Volume Mascara",
        "Noir Lift Volume Mascara",
        849,
        18,
        4.7,
        1625037,
        "Black",
        "one",
        "unisex",
    ),

    item(
        "Beauty",
        "VESTRA Beauty",
        "Makeup",
        "Dewy Skin Foundation",
        "Peachy Dew Color-Changing Lip Oil",
        1299,
        20,
        4.8,
        "/product-images/mars-peachy-dew-lip-oil.png",
        "Peach",
        "one",
        "unisex",
        True,
    ),

    item(
        "Beauty",
        "VESTRA Beauty",
        "Skincare",
        "Niacinamide Repair Serum",
        "Barrier Reset Niacinamide Serum",
        1199,
        22,
        4.8,
        3762879,
        "Clear",
        "one",
        "unisex",
        True,
    ),

    item(
        "Beauty",
        "VESTRA Beauty",
        "Skincare",
        "Gentle Foaming Cleanser",
        "Cloud Foam Gentle Cleanser",
        749,
        16,
        4.6,
        4041392,
        "Clear",
        "one",
        "unisex",
    ),

    item(
        "Beauty",
        "VESTRA Beauty",
        "Haircare",
        "Repair Hair Serum",
        "Flaxseed Ultra Smooth Hair Duo",
        999,
        19,
        4.6,
        "/product-images/plix-flaxseed-shampoo-conditioner.png",
        "Pink",
        "one",
        "unisex",
    ),

    item(
        "Beauty",
        "VESTRA Beauty",
        "Haircare",
        "Nourishing Hair Oil",
        "Rosemary & Methi Hair Growth Oil",
        699,
        14,
        4.5,
        "/product-images/mamaearth-rosemary-hair-oil.png",
        "Herbal",
        "one",
        "unisex",
    ),

    item(
        "Beauty",
        "VESTRA Beauty",
        "Fragrances",
        "Rose Petal Body Mist",
        "Rose Whisper Body Mist",
        899,
        21,
        4.7,
        2587175,
        "Rose",
        "one",
        "unisex",
    ),

    item(
        "Beauty",
        "VESTRA Beauty",
        "Bath & Body",
        "Shea Nourishing Body Lotion",
        "Shea Comfort Body Lotion",
        799,
        17,
        4.6,
        6634653,
        "Cream",
        "one",
        "unisex",
    ),


    # =====================================================
    # JEWELLERY
    # =====================================================

    item(
        "Jewellery",
        "VESTRA Jewels",
        "Earrings",
        "Golden Hoop Earrings",
        "Aurelia Sculpted Hoop Earrings",
        1199,
        15,
        4.7,
        1457801,
        "Gold",
        "one",
        "unisex",
        True,
    ),

    item(
        "Jewellery",
        "VESTRA Jewels",
        "Necklaces",
        "Layered Gold Necklace",
        "Solstice Layered Gold Necklace",
        1999,
        20,
        4.8,
        1191531,
        "Gold",
        "one",
        "unisex",
        True,
    ),

    item(
        "Jewellery",
        "VESTRA Jewels",
        "Rings",
        "Minimal Silver Ring",
        "Luna Minimal Silver Ring",
        999,
        10,
        4.5,
        248077,
        "Silver",
        "one",
        "unisex",
    ),

    item(
        "Jewellery",
        "VESTRA Jewels",
        "Traditional Jewellery",
        "Classic Kundan Set",
        "Rajsi Heritage Kundan Set",
        3299,
        22,
        4.9,
        265906,
        "Gold",
        "one",
        "unisex",
        True,
    ),

    item(
        "Jewellery",
        "VESTRA Jewels",
        "Earrings",
        "Pearl Drop Earrings",
        "Pearl Rain Drop Earrings",
        1399,
        18,
        4.7,
        691046,
        "Pearl",
        "one",
        "unisex",
    ),

    item(
        "Jewellery",
        "VESTRA Jewels",
        "Earrings",
        "Oxidised Jhumka Earrings",
        "Meera Oxidised Jhumka Earrings",
        1299,
        24,
        4.8,
        1927259,
        "Oxidised Silver",
        "one",
        "unisex",
        True,
    ),

    item(
        "Jewellery",
        "VESTRA Jewels",
        "Necklaces",
        "Emerald Pendant Necklace",
        "Emerald Halo Pendant Necklace",
        2499,
        25,
        4.8,
        989967,
        "Emerald",
        "one",
        "unisex",
    ),

    item(
        "Jewellery",
        "VESTRA Jewels",
        "Necklaces",
        "Gold Plated Choker",
        "Noor Gold-Plated Choker",
        2699,
        27,
        4.9,
        1721937,
        "Gold",
        "one",
        "unisex",
        True,
    ),

    item(
        "Jewellery",
        "VESTRA Jewels",
        "Rings",
        "Crystal Cocktail Ring",
        "Prism Crystal Cocktail Ring",
        1499,
        19,
        4.6,
        10983783,
        "Crystal",
        "one",
        "unisex",
    ),

    item(
        "Jewellery",
        "VESTRA Jewels",
        "Bracelets",
        "Golden Charm Bracelet",
        "Celeste Golden Charm Bracelet",
        1599,
        21,
        4.7,
        1232931,
        "Gold",
        "one",
        "unisex",
    ),

    item(
        "Jewellery",
        "VESTRA Jewels",
        "Traditional Jewellery",
        "Temple Jewellery Set",
        "Devika Temple Jewellery Set",
        3999,
        30,
        4.9,
        1670723,
        "Antique Gold",
        "one",
        "unisex",
        True,
    ),

    item(
        "Jewellery",
        "VESTRA Jewels",
        "Bracelets",
        "Classic Pearl Bangles",
        "Pearl Heritage Bangle Set",
        1899,
        23,
        4.8,
        2735970,
        "Pearl",
        "one",
        "unisex",
    ),

]


# =========================================================
# SIZE GROUPS
# =========================================================

SIZE_GROUPS = {

    "women": [
        "S",
        "M",
        "L",
        "XL",
    ],

    "women_waist": [
        "26",
        "28",
        "30",
        "32",
    ],

    "women_shoes": [
        "5",
        "6",
        "7",
        "8",
    ],

    "kids": [
        "2-3Y",
        "4-5Y",
        "6-7Y",
        "8-9Y",
    ],

    "baby": [
        "0-3M",
        "3-6M",
        "6-9M",
        "9-12M",
    ],

    "kids_shoes": [
        "10C",
        "11C",
        "12C",
        "13C",
    ],

    "free": [
        "Free Size",
    ],

    "one": [
        "ONE",
    ],

}


# =========================================================
# BRAND
# =========================================================

def get_or_create_brand(
    db,
    name,
):

    brand = (
        db.query(
            Brand
        )
        .filter(
            Brand.name == name
        )
        .first()
    )


    if brand:

        if (
            model_has(
                Brand,
                "slug",
            )
            and
            not getattr(
                brand,
                "slug",
                None,
            )
        ):

            brand.slug = slugify(
                name
            )


        return brand


    brand = Brand(
        name=name
    )


    set_if_supported(
        brand,
        Brand,
        "slug",
        slugify(
            name
        ),
    )


    set_if_supported(
        brand,
        Brand,
        "description",
        f"{name} — curated by VESTRA.",
    )


    db.add(
        brand
    )

    db.flush()


    return brand


# =========================================================
# CATEGORY
# =========================================================

def get_or_create_category(
    db,
    name,
):

    category = (
        db.query(
            Category
        )
        .filter(
            Category.name == name
        )
        .first()
    )


    if category:

        if (
            model_has(
                Category,
                "slug",
            )
            and
            not getattr(
                category,
                "slug",
                None,
            )
        ):

            category.slug = slugify(
                name
            )


        return category


    category = Category(
        name=name,
        parent_id=None,
    )


    set_if_supported(
        category,
        Category,
        "slug",
        slugify(
            name
        ),
    )


    db.add(
        category
    )

    db.flush()


    return category


# =========================================================
# FIND EXISTING PRODUCT
#
# We search using:
#
# 1. New slug
# 2. New name
# 3. Old slug
# 4. Old name
#
# This means existing products are RENAMED, not duplicated.
# =========================================================

def find_existing_product(
    db,
    old_name,
    new_name,
):

    new_slug = slugify(
        new_name
    )


    old_slug = slugify(
        old_name
    )


    # =====================================================
    # NEW SLUG
    # =====================================================

    if model_has(
        Product,
        "slug",
    ):

        product = (
            db.query(
                Product
            )
            .filter(
                Product.slug == new_slug
            )
            .first()
        )


        if product:

            return product


    # =====================================================
    # NEW NAME
    # =====================================================

    product = (
        db.query(
            Product
        )
        .filter(
            Product.name == new_name
        )
        .first()
    )


    if product:

        return product


    # =====================================================
    # OLD SLUG
    # =====================================================

    if model_has(
        Product,
        "slug",
    ):

        product = (
            db.query(
                Product
            )
            .filter(
                Product.slug == old_slug
            )
            .first()
        )


        if product:

            return product


    # =====================================================
    # OLD NAME
    # =====================================================

    product = (
        db.query(
            Product
        )
        .filter(
            Product.name == old_name
        )
        .first()
    )


    return product


# =========================================================
# PRICE
# =========================================================

def selling_price(
    base_price,
    discount,
):

    return round(
        float(
            base_price
        )
        *
        (
            1
            -
            float(
                discount
            )
            /
            100
        ),
        2,
    )


# =========================================================
# SKU HELPER
# =========================================================

def sku_part(
    value,
):

    cleaned = re.sub(
        r"[^A-Za-z0-9]+",
        "",
        str(
            value
        ),
    )


    return (
        cleaned.upper()
        or
        "ONE"
    )


# =========================================================
# UPSERT PRODUCT
# =========================================================

def upsert_product(
    db,
    data,
):

    brand = get_or_create_brand(
        db,
        data["brand"],
    )


    category = get_or_create_category(
        db,
        data["category"],
    )


    new_name = data[
        "name"
    ]


    old_name = data[
        "old_name"
    ]


    new_slug = slugify(
        new_name
    )


    product = find_existing_product(
        db,
        old_name,
        new_name,
    )


    description = (
        f"{new_name} from "
        f"{data['brand']}. "
        f"A curated VESTRA "
        f"{data['category']} essential."
    )


    created = False


    # =====================================================
    # CREATE PRODUCT
    # =====================================================

    if product is None:

        product_kwargs = {

            "name":
                new_name,

            "description":
                description,

            "brand_id":
                brand.id,

            "category_id":
                category.id,

            "base_price":
                float(
                    data["price"]
                ),

            "discount_percentage":
                float(
                    data["discount"]
                ),

            "gender":
                data["gender"],

            "rating":
                float(
                    data["rating"]
                ),

            "is_active":
                True,

        }


        if model_has(
            Product,
            "slug",
        ):

            product_kwargs[
                "slug"
            ] = new_slug


        if model_has(
            Product,
            "department",
        ):

            product_kwargs[
                "department"
            ] = data[
                "department"
            ]


        if model_has(
            Product,
            "image_url",
        ):

            product_kwargs[
                "image_url"
            ] = image(
                data["photo"]
            )


        if model_has(
            Product,
            "is_featured",
        ):

            product_kwargs[
                "is_featured"
            ] = data[
                "featured"
            ]


        product = Product(
            **product_kwargs
        )


        db.add(
            product
        )

        db.flush()


        created = True


    # =====================================================
    # UPDATE / RENAME PRODUCT
    # =====================================================

    else:

        product.name = (
            new_name
        )


        product.description = (
            description
        )


        product.brand_id = (
            brand.id
        )


        product.category_id = (
            category.id
        )


        product.base_price = float(
            data["price"]
        )


        product.discount_percentage = float(
            data["discount"]
        )


        product.gender = (
            data["gender"]
        )


        product.rating = float(
            data["rating"]
        )


        product.is_active = True


        set_if_supported(
            product,
            Product,
            "slug",
            new_slug,
        )


        set_if_supported(
            product,
            Product,
            "department",
            data["department"],
        )


        set_if_supported(
            product,
            Product,
            "image_url",
            image(
                data["photo"]
            ),
        )


        set_if_supported(
            product,
            Product,
            "is_featured",
            data["featured"],
        )


        db.flush()


    # =====================================================
    # VARIANTS
    # =====================================================

    sizes = SIZE_GROUPS[
        data["size_group"]
    ]


    price = selling_price(
        data["price"],
        data["discount"],
    )


    sku_base = sku_part(
        new_slug
    )[:40]


    for index, size in enumerate(
        sizes
    ):

        existing_variant = (
            db.query(
                ProductVariant
            )
            .filter(

                ProductVariant.product_id
                ==
                product.id,

                ProductVariant.size
                ==
                size,

                ProductVariant.color
                ==
                data["color"],

            )
            .first()
        )


        # =================================================
        # UPDATE EXISTING VARIANT
        # =================================================

        if existing_variant:

            existing_variant.price = (
                price
            )


            existing_variant.stock = (
                18
                +
                index * 3
            )


            existing_variant.is_active = (
                True
            )


            set_if_supported(
                existing_variant,
                ProductVariant,
                "image_url",
                None,
            )


            continue


        # =================================================
        # CREATE NEW VARIANT
        # =================================================

        sku = (
            f"VESTRA-"
            f"{sku_base}-"
            f"{sku_part(size)}"
        )


        duplicate_sku = (
            db.query(
                ProductVariant
            )
            .filter(
                ProductVariant.sku == sku
            )
            .first()
        )


        if duplicate_sku:

            sku = (
                f"{sku}-"
                f"{product.id}-"
                f"{index + 1}"
            )


        variant_kwargs = {

            "product_id":
                product.id,

            "sku":
                sku,

            "size":
                size,

            "color":
                data["color"],

            "price":
                price,

            "stock":
                18
                +
                index * 3,

            "is_active":
                True,

        }


        if model_has(
            ProductVariant,
            "image_url",
        ):

            variant_kwargs[
                "image_url"
            ] = None


        variant = ProductVariant(
            **variant_kwargs
        )


        db.add(
            variant
        )


    return (
        product,
        created,
    )


# =========================================================
# DEPARTMENT COUNT
# =========================================================

def count_department(
    db,
    department,
):

    if not model_has(
        Product,
        "department",
    ):

        return None


    return (
        db.query(
            Product
        )
        .filter(
            Product.department == department,
            Product.is_active == True,
        )
        .count()
    )


# =========================================================
# MAIN
# =========================================================

def main():

    db = SessionLocal()


    created_count = 0

    renamed_count = 0


    try:

        print()

        print(
            "=============================================="
        )

        print(
            " VESTRA PRODUCT NAME REFRESH"
        )

        print(
            "=============================================="
        )

        print()


        for index, data in enumerate(
            PRODUCTS,
            start=1,
        ):

            product, created = upsert_product(
                db,
                data,
            )


            if created:

                created_count += 1

                action = "CREATED"

            else:

                renamed_count += 1

                action = "RENAMED"


            print(
                f"[{index:02d}/{len(PRODUCTS)}] "
                f"{action:<7} "
                f"{data['department']:<10} | "
                f"{data['category']:<22} | "
                f"{product.name}"
            )


        # =================================================
        # COMMIT
        # =================================================

        db.commit()


        # =================================================
        # COUNTS
        # =================================================

        total_products = (
            db.query(
                Product
            )
            .filter(
                Product.is_active == True
            )
            .count()
        )


        women_count = count_department(
            db,
            "Women",
        )


        kids_count = count_department(
            db,
            "Kids",
        )


        beauty_count = count_department(
            db,
            "Beauty",
        )


        jewellery_count = count_department(
            db,
            "Jewellery",
        )


        # =================================================
        # COMPLETE
        # =================================================

        print()

        print(
            "=============================================="
        )

        print(
            " PRODUCT NAMES UPDATED"
        )

        print(
            "=============================================="
        )


        print(
            f"Existing products renamed: "
            f"{renamed_count}"
        )


        print(
            f"New products created: "
            f"{created_count}"
        )


        print(
            f"Active products: "
            f"{total_products}"
        )


        if women_count is not None:

            print()

            print(
                "Department totals:"
            )


            print(
                f"  Women: "
                f"{women_count}"
            )


            print(
                f"  Kids: "
                f"{kids_count}"
            )


            print(
                f"  Beauty: "
                f"{beauty_count}"
            )


            print(
                f"  Jewellery: "
                f"{jewellery_count}"
            )


        print()

        print(
            "VESTRA catalogue names refreshed successfully."
        )

        print()


    except Exception as error:

        db.rollback()


        print()

        print(
            "=============================================="
        )

        print(
            " PRODUCT UPDATE FAILED"
        )

        print(
            "=============================================="
        )

        print()


        print(
            error
        )

        print()


        raise


    finally:

        db.close()


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":

    main()