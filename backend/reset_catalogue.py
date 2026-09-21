import re
from database import SessionLocal, Base, engine
from models import Brand, Category, Product, ProductVariant

def slugify(value: str) -> str:
    value = str(value).lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")

def sku_part(value):
    cleaned = re.sub(r"[^A-Za-z0-9]+", "", str(value))
    return cleaned.upper() or "ONE"

def selling_price(base_price, discount):
    return round(float(base_price) * (1 - float(discount) / 100), 2)

SIZE_GROUPS = {
    "women": ["S", "M", "L", "XL"],
    "women_waist": ["26", "28", "30", "32"],
    "kids": ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    "baby": ["0-3M", "3-6M", "6-12M", "12-18M"],
    "kids_shoes": ["10C", "11C", "12C", "13C"],
    "free": ["Free Size"],
    "one": ["ONE"],
}

# 100% User-Provided Images Only (No External URLs)
CATALOGUE = [
    # WOMEN
    {
        "department": "Women",
        "brand": "VESTRA Woman",
        "category": "Kurtas & Kurtis",
        "name": "Noor Embroidered Kurta Set",
        "price": 1899,
        "discount": 15,
        "rating": 4.6,
        "photo": "/product-images/women-magenta-kurta-set.png",
        "color": "Magenta",
        "size_group": "women",
        "gender": "women",
        "featured": True,
    },
    {
        "department": "Women",
        "brand": "VESTRA Woman",
        "category": "Ethnic Sets",
        "name": "Meher Embellished Anarkali Gown",
        "price": 3499,
        "discount": 30,
        "rating": 4.9,
        "photo": "/product-images/women-white-anarkali-gown.png",
        "color": "White",
        "size_group": "women",
        "gender": "women",
        "featured": True,
    },
    {
        "department": "Women",
        "brand": "VESTRA Woman",
        "category": "Jeans",
        "name": "Indigo Avenue Wide Leg Jeans",
        "price": 1699,
        "discount": 10,
        "rating": 4.4,
        "photo": "/product-images/women-wide-leg-jeans.png",
        "color": "Blue",
        "size_group": "women_waist",
        "gender": "women",
        "featured": False,
    },
    {
        "department": "Women",
        "brand": "VESTRA Woman",
        "category": "Tops",
        "name": "Black Bloom Peplum Kurti Top",
        "price": 1199,
        "discount": 16,
        "rating": 4.5,
        "photo": "/product-images/women-black-floral-kurti.png",
        "color": "Black",
        "size_group": "women",
        "gender": "women",
        "featured": False,
    },
    {
        "department": "Women",
        "brand": "VESTRA Woman",
        "category": "Sarees",
        "name": "Zariya Banarasi Silk Saree",
        "price": 3299,
        "discount": 28,
        "rating": 4.9,
        "photo": "/product-images/women-silk-ikat-saree.png",
        "color": "Brown",
        "size_group": "free",
        "gender": "women",
        "featured": True,
    },
    {
        "department": "Women",
        "brand": "VESTRA Woman",
        "category": "Jackets",
        "name": "Active Spirit Track Jacket",
        "price": 2299,
        "discount": 21,
        "rating": 4.5,
        "photo": "/product-images/women-white-bomber-jacket.png",
        "color": "White",
        "size_group": "women",
        "gender": "women",
        "featured": False,
    },
    {
        "department": "Women",
        "brand": "VESTRA Woman",
        "category": "Palazzos",
        "name": "Gulnaar Royal Anarkali Set",
        "price": 2099,
        "discount": 25,
        "rating": 4.7,
        "photo": "/product-images/women-maroon-anarkali-gown.png",
        "color": "Maroon",
        "size_group": "women",
        "gender": "women",
        "featured": True,
    },
    {
        "department": "Women",
        "brand": "VESTRA Woman",
        "category": "Ethnic Sets",
        "name": "Arohi Scalloped Kurta Set",
        "price": 2899,
        "discount": 24,
        "rating": 4.8,
        "photo": "/product-images/women-purple-embroidered-suit.png",
        "color": "Purple",
        "size_group": "women",
        "gender": "women",
        "featured": True,
    },

    # KIDS
    {
        "department": "Kids",
        "brand": "VESTRA Kids",
        "category": "Boys Clothing",
        "name": "Sky Rocket Skater Tee 3-Pack",
        "price": 999,
        "discount": 15,
        "rating": 4.6,
        "photo": "/product-images/kids-skater-tshirts.png",
        "color": "Multicolor",
        "size_group": "kids",
        "gender": "kids",
        "featured": True,
    },
    {
        "department": "Kids",
        "brand": "VESTRA Kids",
        "category": "Girls Clothing",
        "name": "London Heritage Colourblock Hoodie",
        "price": 1299,
        "discount": 18,
        "rating": 4.8,
        "photo": "/product-images/kids-pepe-hoodie.png",
        "color": "Navy Yellow",
        "size_group": "kids",
        "gender": "kids",
        "featured": True,
    },
    {
        "department": "Kids",
        "brand": "VESTRA Kids",
        "category": "Boys Clothing",
        "name": "Olive Adventure Cargo Joggers 3-Pack",
        "price": 1299,
        "discount": 20,
        "rating": 4.6,
        "photo": "/product-images/kids-cargo-joggers.png",
        "color": "Multi",
        "size_group": "kids",
        "gender": "kids",
        "featured": False,
    },
    {
        "department": "Kids",
        "brand": "VESTRA Kids",
        "category": "Girls Clothing",
        "name": "Blush Twirl Party Dress",
        "price": 1399,
        "discount": 20,
        "rating": 4.7,
        "photo": "/product-images/kids-blush-twirl-dress.jpg",
        "color": "Pink",
        "size_group": "kids",
        "gender": "kids",
        "featured": True,
    },
    {
        "department": "Kids",
        "brand": "VESTRA Kids",
        "category": "Baby",
        "name": "Sunshine Snuggle Cotton Romper",
        "price": 699,
        "discount": 10,
        "rating": 4.5,
        "photo": "/product-images/kids-sunshine-romper.jpg",
        "color": "Yellow",
        "size_group": "baby",
        "gender": "kids",
        "featured": False,
    },
    {
        "department": "Kids",
        "brand": "VESTRA Kids",
        "category": "Boys Clothing",
        "name": "Cloudstep Denim Dungarees Set",
        "price": 1299,
        "discount": 15,
        "rating": 4.7,
        "photo": "/product-images/kids-denim-dungarees.jpg",
        "color": "Blue",
        "size_group": "kids",
        "gender": "kids",
        "featured": False,
    },
    {
        "department": "Kids",
        "brand": "VESTRA Kids",
        "category": "Boys Clothing",
        "name": "Little Explorer Denim Shirt",
        "price": 1099,
        "discount": 18,
        "rating": 4.5,
        "photo": "/product-images/kids-denim-shirt.jpg",
        "color": "Denim",
        "size_group": "kids",
        "gender": "kids",
        "featured": False,
    },
    {
        "department": "Kids",
        "brand": "VESTRA Kids",
        "category": "Girls Ethnic Wear",
        "name": "Coral Bloom Festive Kurta Set",
        "price": 1599,
        "discount": 25,
        "rating": 4.8,
        "photo": "/product-images/kids-coral-kurta-set.jpg",
        "color": "Coral",
        "size_group": "kids",
        "gender": "kids",
        "featured": True,
    },
    {
        "department": "Kids",
        "brand": "VESTRA Kids",
        "category": "Girls Clothing",
        "name": "Lavender Play Cotton Co-ord Set",
        "price": 1499,
        "discount": 22,
        "rating": 4.7,
        "photo": "/product-images/kids-lavender-coord.jpg",
        "color": "Lavender",
        "size_group": "kids",
        "gender": "kids",
        "featured": False,
    },
    {
        "department": "Kids",
        "brand": "VESTRA Kids",
        "category": "Baby",
        "name": "Cozy Cloud Baby Knit Set",
        "price": 899,
        "discount": 14,
        "rating": 4.6,
        "photo": "/product-images/kids-baby-knit.jpg",
        "color": "Cream",
        "size_group": "baby",
        "gender": "kids",
        "featured": False,
    },
    {
        "department": "Kids",
        "brand": "VESTRA Kids",
        "category": "Boys Clothing",
        "name": "Navy Trail Varsity Bomber Jacket",
        "price": 1499,
        "discount": 18,
        "rating": 4.7,
        "photo": "/product-images/kids-varsity-jacket.jpg",
        "color": "Navy",
        "size_group": "kids",
        "gender": "kids",
        "featured": False,
    },
    {
        "department": "Kids",
        "brand": "VESTRA Kids",
        "category": "Boys Ethnic Wear",
        "name": "Sunehri Celebration Kurta Set",
        "price": 1799,
        "discount": 26,
        "rating": 4.8,
        "photo": "/product-images/kids-festive-kurta.jpg",
        "color": "Mustard",
        "size_group": "kids",
        "gender": "kids",
        "featured": True,
    },

    # BEAUTY
    {
        "department": "Beauty",
        "brand": "VESTRA Beauty",
        "category": "Makeup",
        "name": "Peachy Dew Color-Changing Lip Oil",
        "price": 799,
        "discount": 15,
        "rating": 4.8,
        "photo": "/product-images/mars-peachy-dew-lip-oil.png",
        "color": "Peach",
        "size_group": "one",
        "gender": "unisex",
        "featured": True,
    },
    {
        "department": "Beauty",
        "brand": "VESTRA Beauty",
        "category": "Haircare",
        "name": "Flaxseed Ultra Smooth Hair Duo",
        "price": 999,
        "discount": 19,
        "rating": 4.7,
        "photo": "/product-images/plix-flaxseed-shampoo-conditioner.png",
        "color": "Rose",
        "size_group": "one",
        "gender": "unisex",
        "featured": True,
    },
    {
        "department": "Beauty",
        "brand": "VESTRA Beauty",
        "category": "Haircare",
        "name": "Rosemary & Methi Hair Growth Oil",
        "price": 699,
        "discount": 14,
        "rating": 4.6,
        "photo": "/product-images/mamaearth-rosemary-hair-oil.png",
        "color": "Herbal",
        "size_group": "one",
        "gender": "unisex",
        "featured": True,
    },
    {
        "department": "Beauty",
        "brand": "VESTRA Beauty",
        "category": "Makeup",
        "name": "Ruby Veil Velvet Lip Colour",
        "price": 799,
        "discount": 10,
        "rating": 4.8,
        "photo": "/product-images/velvet-matte-lipstick.jpg",
        "color": "Ruby Red",
        "size_group": "one",
        "gender": "unisex",
        "featured": False,
    },
    {
        "department": "Beauty",
        "brand": "VESTRA Beauty",
        "category": "Skincare",
        "name": "Radiance C Brightening Serum",
        "price": 1099,
        "discount": 15,
        "rating": 4.7,
        "photo": "/product-images/vitamin-c-glow-serum.jpg",
        "color": "Clear",
        "size_group": "one",
        "gender": "unisex",
        "featured": False,
    },
    {
        "department": "Beauty",
        "brand": "VESTRA Beauty",
        "category": "Fragrances",
        "name": "Amber Muse Eau De Parfum",
        "price": 1799,
        "discount": 12,
        "rating": 4.6,
        "photo": "/product-images/signature-eau-de-parfum.jpg",
        "color": "Amber",
        "size_group": "one",
        "gender": "unisex",
        "featured": False,
    },

    # JEWELLERY
    {
        "department": "Jewellery",
        "brand": "VESTRA Jewels",
        "category": "Necklaces",
        "name": "Solstice Emerald Crescent Gold Necklace",
        "price": 2499,
        "discount": 20,
        "rating": 4.8,
        "photo": "/product-images/jewellery-emerald-pendant-necklace.jpg",
        "color": "Gold Green",
        "size_group": "one",
        "gender": "unisex",
        "featured": True,
    },
    {
        "department": "Jewellery",
        "brand": "VESTRA Jewels",
        "category": "Necklaces",
        "name": "Noor Royal Pearl Choker Necklace",
        "price": 3499,
        "discount": 18,
        "rating": 4.9,
        "photo": "/product-images/jewellery-pearl-choker-necklace.jpg",
        "color": "Pearl White",
        "size_group": "one",
        "gender": "unisex",
        "featured": True,
    },
    {
        "department": "Jewellery",
        "brand": "VESTRA Jewels",
        "category": "Earrings",
        "name": "Sapphire Royale Chandelier Earrings",
        "price": 1899,
        "discount": 25,
        "rating": 4.8,
        "photo": "/product-images/jewellery-sapphire-chandelier-earrings.jpg",
        "color": "Royal Blue",
        "size_group": "one",
        "gender": "unisex",
        "featured": True,
    },
    {
        "department": "Jewellery",
        "brand": "VESTRA Jewels",
        "category": "Earrings",
        "name": "Starlight Solitaire Diamond Stud Earrings",
        "price": 2199,
        "discount": 15,
        "rating": 4.9,
        "photo": "/product-images/jewellery-pearl-bangle-set.jpg",
        "color": "Silver White",
        "size_group": "one",
        "gender": "unisex",
        "featured": True,
    },
    {
        "department": "Jewellery",
        "brand": "VESTRA Jewels",
        "category": "Earrings",
        "name": "Rosaline Rose Gold Teardrop Earrings",
        "price": 1799,
        "discount": 20,
        "rating": 4.7,
        "photo": "/product-images/jewellery-prism-crystal-ring.jpg",
        "color": "Rose Gold",
        "size_group": "one",
        "gender": "unisex",
        "featured": False,
    },
    {
        "department": "Jewellery",
        "brand": "VESTRA Jewels",
        "category": "Earrings",
        "name": "Lustre Pearl & Diamond Halo Studs",
        "price": 1499,
        "discount": 15,
        "rating": 4.8,
        "photo": "/product-images/jewellery-noor-gold-choker.jpg",
        "color": "Gold Pearl",
        "size_group": "one",
        "gender": "unisex",
        "featured": False,
    },
    {
        "department": "Jewellery",
        "brand": "VESTRA Jewels",
        "category": "Rings",
        "name": "Aura Dual Diamond Twist Ring",
        "price": 1299,
        "discount": 10,
        "rating": 4.6,
        "photo": "/product-images/jewellery-aurelia-gold-hoops.jpg",
        "color": "Two-Tone",
        "size_group": "one",
        "gender": "unisex",
        "featured": False,
    },
    {
        "department": "Jewellery",
        "brand": "VESTRA Jewels",
        "category": "Rings",
        "name": "Eternal Duo Gold Wedding Bands",
        "price": 2899,
        "discount": 15,
        "rating": 4.9,
        "photo": "/product-images/jewellery-luna-silver-ring.jpg",
        "color": "Yellow Gold",
        "size_group": "one",
        "gender": "unisex",
        "featured": True,
    },
    {
        "department": "Jewellery",
        "brand": "VESTRA Jewels",
        "category": "Rings",
        "name": "Celestial Solitaire Diamond Ring",
        "price": 3199,
        "discount": 22,
        "rating": 4.9,
        "photo": "/product-images/jewellery-pearl-drop-earrings.jpg",
        "color": "Platinum",
        "size_group": "one",
        "gender": "unisex",
        "featured": True,
    },
    {
        "department": "Jewellery",
        "brand": "VESTRA Jewels",
        "category": "Bracelets",
        "name": "Celeste Bohemian Charm Bracelets",
        "price": 1399,
        "discount": 20,
        "rating": 4.7,
        "photo": "/product-images/jewellery-solstice-layered-necklace.jpg",
        "color": "Mixed Metal",
        "size_group": "one",
        "gender": "unisex",
        "featured": False,
    },
    {
        "department": "Jewellery",
        "brand": "VESTRA Jewels",
        "category": "Bracelets",
        "name": "Aria Crystal Etched Silver Bangles",
        "price": 1699,
        "discount": 18,
        "rating": 4.8,
        "photo": "/product-images/jewellery-rajsi-kundan-set.jpg",
        "color": "Silver",
        "size_group": "one",
        "gender": "unisex",
        "featured": False,
    },
]

def main():
    db = SessionLocal()
    try:
        # Deactivate all existing products first
        db.query(Product).update({Product.is_active: False})
        db.commit()

        # Cache brands and categories
        brand_cache = {}
        for b in db.query(Brand).all():
            brand_cache[b.name] = b

        category_cache = {}
        for c in db.query(Category).all():
            category_cache[c.name] = c

        used_images = set()

        for idx, item_data in enumerate(CATALOGUE, 1):
            b_name = item_data["brand"]
            if b_name not in brand_cache:
                b = Brand(name=b_name, slug=slugify(b_name), description=f"{b_name} — curated by VESTRA.")
                db.add(b)
                db.flush()
                brand_cache[b_name] = b
            brand = brand_cache[b_name]

            c_name = item_data["category"]
            if c_name not in category_cache:
                c = Category(name=c_name, slug=slugify(c_name))
                db.add(c)
                db.flush()
                category_cache[c_name] = c
            category = category_cache[c_name]

            p_name = item_data["name"]
            p_slug = slugify(p_name)
            img_url = item_data["photo"]

            assert img_url not in used_images, f"Duplicate image: {img_url}"
            used_images.add(img_url)

            p = db.query(Product).filter((Product.slug == p_slug) | (Product.name == p_name)).first()
            if not p:
                p = Product(
                    name=p_name,
                    slug=p_slug,
                    description=f"{p_name} from {b_name}. A curated VESTRA {c_name} essential.",
                    brand_id=brand.id,
                    category_id=category.id,
                    department=item_data["department"],
                    base_price=float(item_data["price"]),
                    discount_percentage=float(item_data["discount"]),
                    rating=float(item_data["rating"]),
                    image_url=img_url,
                    gender=item_data["gender"],
                    is_featured=item_data["featured"],
                    is_active=True,
                )
                db.add(p)
                db.flush()
                print(f"[{idx:02d}/{len(CATALOGUE)}] CREATED {item_data['department']:7s} | {p_name}")
            else:
                p.name = p_name
                p.slug = p_slug
                p.description = f"{p_name} from {b_name}. A curated VESTRA {c_name} essential."
                p.brand_id = brand.id
                p.category_id = category.id
                p.department = item_data["department"]
                p.base_price = float(item_data["price"])
                p.discount_percentage = float(item_data["discount"])
                p.rating = float(item_data["rating"])
                p.image_url = img_url
                p.gender = item_data["gender"]
                p.is_featured = item_data["featured"]
                p.is_active = True
                db.flush()
                print(f"[{idx:02d}/{len(CATALOGUE)}] UPDATED {item_data['department']:7s} | {p_name}")

            # Variants
            sizes = SIZE_GROUPS[item_data["size_group"]]
            var_price = selling_price(item_data["price"], item_data["discount"])
            sku_base = sku_part(p_slug)[:35]

            for s_idx, size in enumerate(sizes):
                variant = db.query(ProductVariant).filter(
                    ProductVariant.product_id == p.id,
                    ProductVariant.size == size,
                    ProductVariant.color == item_data["color"]
                ).first()

                if not variant:
                    sku = f"VST-{sku_base}-{sku_part(size)}-{s_idx + 1}"
                    variant = ProductVariant(
                        product_id=p.id,
                        sku=sku,
                        size=size,
                        color=item_data["color"],
                        price=var_price,
                        stock=25 + s_idx * 5,
                        image_url=None,
                        is_active=True,
                    )
                    db.add(variant)
                else:
                    variant.price = var_price
                    variant.is_active = True
                    variant.image_url = None

        db.commit()
        active_count = db.query(Product).filter(Product.is_active == True).count()
        print(f"\nCatalogue seed complete. Total active products: {active_count}. All images are 100% user-provided local assets.")
    except Exception as e:
        db.rollback()
        print(f"Error resetting catalogue: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
