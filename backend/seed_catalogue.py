from pathlib import Path
from urllib.request import (
    Request,
    urlopen,
)

from sqlalchemy.orm import Session

from database import (
    Base,
    engine,
)

from models import (
    Brand,
    Category,
    Product,
    ProductVariant,
)


# =========================================================
# PATHS
# =========================================================

BACKEND_DIR = (
    Path(__file__)
    .resolve()
    .parent
)


PROJECT_DIR = (
    BACKEND_DIR.parent
)


IMAGE_DIR = (
    PROJECT_DIR
    / "frontend"
    / "public"
    / "product-images"
)


IMAGE_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# =========================================================
# PRODUCTS
# =========================================================

PRODUCTS = [

    # =====================================================
    # WOMEN
    # =====================================================

    {
        "name":
            "Floral Midi Dress",

        "slug":
            "floral-midi-dress",

        "department":
            "women",

        "category":
            "Dresses",

        "category_slug":
            "women-dresses",

        "brand":
            "VESTRA Woman",

        "gender":
            "women",

        "price":
            2499,

        "discount":
            20,

        "rating":
            4.7,

        "featured":
            True,

        "color":
            "Rose",

        "sizes":
            ["S", "M", "L"],

        "image":
            "floral-midi-dress.jpg",

        "source":
            "https://images.unsplash.com/"
            "photo-1496747611176-843222e1e57c"
            "?fm=jpg&fit=crop&w=900&h=1100&q=85",
    },

    {
        "name":
            "Embroidered Kurta Set",

        "slug":
            "embroidered-kurta-set",

        "department":
            "women",

        "category":
            "Kurtas & Kurtis",

        "category_slug":
            "women-kurtas-kurtis",

        "brand":
            "VESTRA Woman",

        "gender":
            "women",

        "price":
            1899,

        "discount":
            15,

        "rating":
            4.6,

        "featured":
            True,

        "color":
            "Ivory",

        "sizes":
            ["S", "M", "L", "XL"],

        "image":
            "women-floral-kurti.png",

        "source":
            "https://images.unsplash.com/"
            "photo-1539008835657-9e8e9680c956"
            "?fm=jpg&fit=crop&w=900&h=1100&q=85",
    },

    {
        "name":
            "Straight Fit Jeans",

        "slug":
            "straight-fit-jeans",

        "department":
            "women",

        "category":
            "Jeans",

        "category_slug":
            "women-jeans",

        "brand":
            "VESTRA Woman",

        "gender":
            "women",

        "price":
            1699,

        "discount":
            10,

        "rating":
            4.4,

        "featured":
            False,

        "color":
            "Blue",

        "sizes":
            ["26", "28", "30", "32"],

        "image":
            "women-white-jacket.png",

        "source":
            "https://images.unsplash.com/"
            "photo-1542272604-787c3835535d"
            "?fm=jpg&fit=crop&w=900&h=1100&q=85",
    },

    {
        "name":
            "Classic White Sneakers",

        "slug":
            "classic-white-sneakers",

        "department":
            "women",

        "category":
            "Footwear",

        "category_slug":
            "women-footwear",

        "brand":
            "VESTRA Woman",

        "gender":
            "women",

        "price":
            2199,

        "discount":
            18,

        "rating":
            4.5,

        "featured":
            False,

        "color":
            "White",

        "sizes":
            ["5", "6", "7", "8"],

        "image":
            "puma-sneakers.png",

        "source":
            "https://images.unsplash.com/"
            "photo-1543163521-1bf539c55dd2"
            "?fm=jpg&fit=crop&w=900&h=1100&q=85",
    },


    # =====================================================
    # KIDS
    # =====================================================

    {
        "name":
            "Kids Graphic T-Shirt Set",

        "slug":
            "kids-graphic-tshirt-set",

        "department":
            "kids",

        "category":
            "Boys Clothing",

        "category_slug":
            "kids-boys-clothing",

        "brand":
            "VESTRA Kids",

        "gender":
            "kids",

        "price":
            999,

        "discount":
            15,

        "rating":
            4.6,

        "featured":
            True,

        "color":
            "Sky Blue",

        "sizes":
            ["4-5Y", "6-7Y", "8-9Y"],

        "image":
            "kids-tshirts-set.png",

        "source":
            "https://images.unsplash.com/"
            "photo-1516627145497-ae6968895b74"
            "?fm=jpg&fit=crop&w=900&h=1100&q=85",
    },

    {
        "name":
            "Girls Party Dress",

        "slug":
            "girls-party-dress",

        "department":
            "kids",

        "category":
            "Girls Clothing",

        "category_slug":
            "kids-girls-clothing",

        "brand":
            "VESTRA Kids",

        "gender":
            "kids",

        "price":
            1399,

        "discount":
            20,

        "rating":
            4.7,

        "featured":
            True,

        "color":
            "Pink",

        "sizes":
            ["4-5Y", "6-7Y", "8-9Y"],

        "image":
            "girls-party-dress.jpg",

        "source":
            "https://images.unsplash.com/"
            "photo-1519238263530-99bdd11df2ea"
            "?fm=jpg&fit=crop&w=900&h=1100&q=85",
    },

    {
        "name":
            "Baby Cotton Romper",

        "slug":
            "baby-cotton-romper",

        "department":
            "kids",

        "category":
            "Baby",

        "category_slug":
            "kids-baby",

        "brand":
            "VESTRA Kids",

        "gender":
            "kids",

        "price":
            699,

        "discount":
            10,

        "rating":
            4.5,

        "featured":
            False,

        "color":
            "Cream",

        "sizes":
            ["6-12M", "12-18M", "18-24M"],

        "image":
            "baby-cotton-romper.jpg",

        "source":
            "https://images.unsplash.com/"
            "photo-1503944583220-79d8926ad5e2"
            "?fm=jpg&fit=crop&w=900&h=1100&q=85",
    },

    {
        "name":
            "Kids Everyday Sneakers",

        "slug":
            "kids-everyday-sneakers",

        "department":
            "kids",

        "category":
            "Kids Footwear",

        "category_slug":
            "kids-footwear",

        "brand":
            "VESTRA Kids",

        "gender":
            "kids",

        "price":
            1199,

        "discount":
            12,

        "rating":
            4.4,

        "featured":
            False,

        "color":
            "White",

        "sizes":
            ["1", "2", "3", "4"],

        "image":
            "puma-sneakers.png",

        "source":
            "https://images.unsplash.com/"
            "photo-1522771930-78848d9293e8"
            "?fm=jpg&fit=crop&w=900&h=1100&q=85",
    },


    # =====================================================
    # BEAUTY
    # =====================================================

    {
        "name":
            "Velvet Matte Lipstick",

        "slug":
            "velvet-matte-lipstick",

        "department":
            "beauty",

        "category":
            "Makeup",

        "category_slug":
            "beauty-makeup",

        "brand":
            "VESTRA Beauty",

        "gender":
            "unisex",

        "price":
            799,

        "discount":
            10,

        "rating":
            4.8,

        "featured":
            True,

        "color":
            "Berry Rose",

        "sizes":
            ["ONE SIZE"],

        "image":
            "velvet-matte-lipstick.jpg",

        "source":
            "https://images.unsplash.com/"
            "photo-1596462502278-27bfdc403348"
            "?fm=jpg&fit=crop&w=900&h=1100&q=85",
    },

    {
        "name":
            "Vitamin C Glow Serum",

        "slug":
            "vitamin-c-glow-serum",

        "department":
            "beauty",

        "category":
            "Skincare",

        "category_slug":
            "beauty-skincare",

        "brand":
            "VESTRA Beauty",

        "gender":
            "unisex",

        "price":
            1099,

        "discount":
            15,

        "rating":
            4.7,

        "featured":
            True,

        "color":
            "Natural",

        "sizes":
            ["30 ML"],

        "image":
            "plix-flaxseed-combo.png",

        "source":
            "https://images.unsplash.com/"
            "photo-1522335789203-aabd1fc54bc9"
            "?fm=jpg&fit=crop&w=900&h=1100&q=85",
    },

    {
        "name":
            "Hydrating Face Cream",

        "slug":
            "hydrating-face-cream",

        "department":
            "beauty",

        "category":
            "Skincare",

        "category_slug":
            "beauty-face-cream",

        "brand":
            "VESTRA Beauty",

        "gender":
            "unisex",

        "price":
            899,

        "discount":
            8,

        "rating":
            4.5,

        "featured":
            False,

        "color":
            "White",

        "sizes":
            ["50 G"],

        "image":
            "hydrating-face-cream.jpg",

        "source":
            "https://images.unsplash.com/"
            "photo-1571781926291-c477ebfd024b"
            "?fm=jpg&fit=crop&w=900&h=1100&q=85",
    },

    {
        "name":
            "Signature Eau De Parfum",

        "slug":
            "signature-eau-de-parfum",

        "department":
            "beauty",

        "category":
            "Fragrances",

        "category_slug":
            "beauty-fragrances",

        "brand":
            "VESTRA Beauty",

        "gender":
            "unisex",

        "price":
            1799,

        "discount":
            12,

        "rating":
            4.6,

        "featured":
            False,

        "color":
            "Amber",

        "sizes":
            ["50 ML"],

        "image":
            "signature-eau-de-parfum.jpg",

        "source":
            "https://images.unsplash.com/"
            "photo-1541643600914-78b084683601"
            "?fm=jpg&fit=crop&w=900&h=1100&q=85",
    },


    # =====================================================
    # JEWELLERY
    # =====================================================

    {
        "name":
            "Golden Hoop Earrings",

        "slug":
            "golden-hoop-earrings",

        "department":
            "jewellery",

        "category":
            "Earrings",

        "category_slug":
            "jewellery-earrings",

        "brand":
            "VESTRA Jewels",

        "gender":
            "unisex",

        "price":
            1199,

        "discount":
            15,

        "rating":
            4.7,

        "featured":
            True,

        "color":
            "Gold",

        "sizes":
            ["ONE SIZE"],

        "image":
            "golden-hoop-earrings.jpg",

        "source":
            "https://images.unsplash.com/"
            "photo-1515562141207-7a88fb7ce338"
            "?fm=jpg&fit=crop&w=900&h=1100&q=85",
    },

    {
        "name":
            "Layered Gold Necklace",

        "slug":
            "layered-gold-necklace",

        "department":
            "jewellery",

        "category":
            "Neck Jewellery",

        "category_slug":
            "jewellery-necklaces",

        "brand":
            "VESTRA Jewels",

        "gender":
            "unisex",

        "price":
            1999,

        "discount":
            20,

        "rating":
            4.8,

        "featured":
            True,

        "color":
            "Gold",

        "sizes":
            ["ONE SIZE"],

        "image":
            "layered-gold-necklace.jpg",

        "source":
            "https://images.unsplash.com/"
            "photo-1535632066927-ab7c9ab60908"
            "?fm=jpg&fit=crop&w=900&h=1100&q=85",
    },

    {
        "name":
            "Minimal Silver Ring",

        "slug":
            "minimal-silver-ring",

        "department":
            "jewellery",

        "category":
            "Rings",

        "category_slug":
            "jewellery-rings",

        "brand":
            "VESTRA Jewels",

        "gender":
            "unisex",

        "price":
            999,

        "discount":
            10,

        "rating":
            4.5,

        "featured":
            False,

        "color":
            "Silver",

        "sizes":
            ["6", "7", "8"],

        "image":
            "minimal-silver-ring.jpg",

        "source":
            "https://images.unsplash.com/"
            "photo-1605100804763-247f67b3557e"
            "?fm=jpg&fit=crop&w=900&h=1100&q=85",
    },

    {
        "name":
            "Classic Kundan Set",

        "slug":
            "classic-kundan-set",

        "department":
            "jewellery",

        "category":
            "Traditional Jewellery",

        "category_slug":
            "jewellery-kundan",

        "brand":
            "VESTRA Jewels",

        "gender":
            "unisex",

        "price":
            3299,

        "discount":
            22,

        "rating":
            4.9,

        "featured":
            False,

        "color":
            "Gold",

        "sizes":
            ["ONE SIZE"],

        "image":
            "classic-kundan-set.jpg",

        "source":
            "https://images.unsplash.com/"
            "photo-1599643478518-a784e5dc4c8f"
            "?fm=jpg&fit=crop&w=900&h=1100&q=85",
    },
]


# =========================================================
# IMAGE DOWNLOAD
# =========================================================

def download_image(
    source,
    destination,
):

    if destination.exists():

        print(
            "Image already exists:",
            destination.name
        )

        return True


    try:

        request = Request(
            source,

            headers={
                "User-Agent":
                    "Mozilla/5.0"
            }
        )


        with urlopen(
            request,
            timeout=25
        ) as response:

            data = response.read()


        if len(data) < 5000:

            raise ValueError(
                "Image download was too small."
            )


        destination.write_bytes(
            data
        )


        print(
            "Downloaded:",
            destination.name
        )


        return True


    except Exception as error:

        print(
            "Could not download:",
            destination.name
        )

        print(
            "Reason:",
            error
        )

        return False


# =========================================================
# GET OR CREATE BRAND
# =========================================================

def get_brand(
    db,
    name,
):

    brand = (
        db.query(Brand)
        .filter(
            Brand.name == name
        )
        .first()
    )


    if brand:

        return brand


    brand = Brand(
        name=name,

        description=
            f"{name} collection.",
    )


    db.add(brand)

    db.flush()

    return brand


# =========================================================
# GET OR CREATE MAIN CATEGORY
# =========================================================

def get_department_category(
    db,
    department,
):

    slug = department.lower()


    category = (
        db.query(Category)
        .filter(
            Category.slug ==
            slug
        )
        .first()
    )


    if category:

        return category


    category = Category(
        name=
            department.title(),

        slug=
            slug,

        parent_id=
            None,
    )


    db.add(category)

    db.flush()

    return category


# =========================================================
# GET OR CREATE SUBCATEGORY
# =========================================================

def get_subcategory(
    db,
    product_data,
    parent,
):

    category = (
        db.query(Category)
        .filter(
            Category.slug ==
            product_data[
                "category_slug"
            ]
        )
        .first()
    )


    if category:

        return category


    category = Category(
        name=
            product_data[
                "category"
            ],

        slug=
            product_data[
                "category_slug"
            ],

        parent_id=
            parent.id,
    )


    db.add(category)

    db.flush()

    return category


# =========================================================
# PRODUCT
# =========================================================

def create_or_update_product(
    db,
    data,
    brand,
    category,
    image_url,
):

    product = (
        db.query(Product)
        .filter(
            Product.slug ==
            data["slug"]
        )
        .first()
    )


    if not product:

        product = Product(
            slug=
                data["slug"]
        )

        db.add(product)


    product.name = (
        data["name"]
    )


    product.description = (
        f"{data['name']} from "
        f"the VESTRA "
        f"{data['department'].title()} "
        f"collection."
    )


    product.brand_id = (
        brand.id
    )


    product.category_id = (
        category.id
    )


    product.department = (
        data["department"]
    )


    product.gender = (
        data["gender"]
    )


    product.base_price = (
        data["price"]
    )


    product.discount_percentage = (
        data["discount"]
    )


    product.rating = (
        data["rating"]
    )


    product.image_url = (
        image_url
    )


    product.is_featured = (
        data["featured"]
    )


    product.is_active = True


    db.flush()


    return product


# =========================================================
# VARIANTS
# =========================================================

def create_variants(
    db,
    product,
    data,
    image_url,
):

    discounted_price = round(
        data["price"]
        *
        (
            1
            -
            data["discount"]
            / 100
        ),
        2
    )


    for index, size in enumerate(
        data["sizes"],
        start=1
    ):

        sku = (
            f"VST-"
            f"{product.id:04d}-"
            f"{index:02d}"
        )


        variant = (
            db.query(
                ProductVariant
            )
            .filter(
                ProductVariant.sku ==
                sku
            )
            .first()
        )


        if not variant:

            variant = (
                ProductVariant(
                    product_id=
                        product.id,

                    sku=
                        sku,
                )
            )

            db.add(
                variant
            )


        variant.product_id = (
            product.id
        )


        variant.size = size


        variant.color = (
            data["color"]
        )


        variant.price = (
            discounted_price
        )


        variant.stock = (
            25
            +
            index * 5
        )


        variant.image_url = (
            image_url
        )


        variant.is_active = True


# =========================================================
# MAIN
# =========================================================

def main():

    print()

    print(
        "========================================"
    )

    print(
        "VESTRA CATALOGUE SEED"
    )

    print(
        "========================================"
    )

    print()

    print(
        "Product image folder:"
    )

    print(
        IMAGE_DIR
    )

    print()


    Base.metadata.create_all(
        bind=engine
    )


    db = Session(
        bind=engine
    )


    try:

        for index, data in enumerate(
            PRODUCTS,
            start=1
        ):

            print(
                f"[{index}/{len(PRODUCTS)}]",
                data["name"]
            )


            local_file = (
                IMAGE_DIR
                /
                data["image"]
            )


            downloaded = (
                download_image(
                    data["source"],
                    local_file,
                )
            )


            if downloaded:

                image_url = (
                    "/product-images/"
                    +
                    data["image"]
                )

            else:

                # Online fallback.
                image_url = (
                    data["source"]
                )


            brand = (
                get_brand(
                    db,
                    data["brand"]
                )
            )


            parent = (
                get_department_category(
                    db,
                    data[
                        "department"
                    ]
                )
            )


            category = (
                get_subcategory(
                    db,
                    data,
                    parent,
                )
            )


            product = (
                create_or_update_product(
                    db=
                        db,

                    data=
                        data,

                    brand=
                        brand,

                    category=
                        category,

                    image_url=
                        image_url,
                )
            )


            create_variants(
                db=
                    db,

                product=
                    product,

                data=
                    data,

                image_url=
                    image_url,
            )


            print(
                "    Product ID:",
                product.id
            )


        db.commit()


        active_products = (
            db.query(Product)
            .filter(
                Product.is_active ==
                True
            )
            .count()
        )


        print()

        print(
            "========================================"
        )

        print(
            "SUCCESS"
        )

        print(
            "========================================"
        )

        print(
            "Active products:",
            active_products
        )

        print(
            "Expected curated products:",
            len(PRODUCTS)
        )

        print()

        print(
            "Women: 4"
        )

        print(
            "Kids: 4"
        )

        print(
            "Beauty: 4"
        )

        print(
            "Jewellery: 4"
        )

        print()

        print(
            "Each product has its own "
            "image filename."
        )


    except Exception:

        db.rollback()

        raise


    finally:

        db.close()


if __name__ == "__main__":

    main()