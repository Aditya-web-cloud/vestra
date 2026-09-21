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
    "shoes": ["36", "37", "38", "39", "40"],
    "kids_shoes": ["10C", "11C", "12C", "13C"],
    "free": ["Free Size"],
    "beauty": ["Standard"],
}

DEPARTMENTS = [
    {"name": "Women", "slug": "women"},
    {"name": "Kids", "slug": "kids"},
    {"name": "Beauty", "slug": "beauty"},
    {"name": "Jewellery", "slug": "jewellery"},
]

SUBCATEGORIES = {
    "Women": [
        {"name": "Kurtas & Kurtis", "slug": "women-kurtas-kurtis"},
        {"name": "Ethnic Sets", "slug": "women-ethnic-sets"},
        {"name": "Sarees", "slug": "women-sarees"},
        {"name": "Dresses", "slug": "women-dresses"},
        {"name": "Tops", "slug": "women-tops"},
        {"name": "Jeans", "slug": "women-jeans"},
        {"name": "Jackets", "slug": "women-jackets"},
        {"name": "Footwear", "slug": "women-footwear"},
    ],
    "Kids": [
        {"name": "Boys Clothing", "slug": "kids-boys-clothing"},
        {"name": "Girls Clothing", "slug": "kids-girls-clothing"},
        {"name": "Baby", "slug": "kids-baby"},
        {"name": "Kids Footwear", "slug": "kids-footwear"},
        {"name": "Kids Ethnic Wear", "slug": "kids-ethnic-wear"},
    ],
    "Beauty": [
        {"name": "Makeup", "slug": "beauty-makeup"},
        {"name": "Skincare", "slug": "beauty-skincare"},
        {"name": "Haircare", "slug": "beauty-haircare"},
        {"name": "Fragrances", "slug": "beauty-fragrances"},
        {"name": "Bath & Body", "slug": "beauty-bath-body"},
    ],
    "Jewellery": [
        {"name": "Earrings", "slug": "jewellery-earrings"},
        {"name": "Neck Jewellery", "slug": "jewellery-necklaces"},
        {"name": "Rings", "slug": "jewellery-rings"},
        {"name": "Bracelets", "slug": "jewellery-bracelets"},
        {"name": "Traditional Jewellery", "slug": "jewellery-kundan"},
    ],
}

PRODUCTS = [
    # ==================== WOMEN ====================
    # Kurtas & Kurtis
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
        "category": "Kurtas & Kurtis",
        "name": "Gulabi Festive Chanderi Kurta Set",
        "price": 2199,
        "discount": 20,
        "rating": 4.7,
        "photo": "/product-images/women-red-kurta-set.png",
        "color": "Ruby Red",
        "size_group": "women",
        "gender": "women",
        "featured": False,
    },
    # Ethnic Sets
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
        "category": "Ethnic Sets",
        "name": "Arohi Scalloped Kurta Set",
        "price": 2799,
        "discount": 25,
        "rating": 4.8,
        "photo": "/product-images/women-purple-embroidered-suit.png",
        "color": "Lavender",
        "size_group": "women",
        "gender": "women",
        "featured": False,
    },
    {
        "department": "Women",
        "brand": "VESTRA Woman",
        "category": "Ethnic Sets",
        "name": "Gulnaar Royal Anarkali Set",
        "price": 3999,
        "discount": 35,
        "rating": 4.9,
        "photo": "/product-images/women-maroon-anarkali-gown.png",
        "color": "Maroon",
        "size_group": "women",
        "gender": "women",
        "featured": True,
    },
    # Sarees
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
        "category": "Sarees",
        "name": "Neel Bagh Printed Cotton Saree",
        "price": 1799,
        "discount": 20,
        "rating": 4.6,
        "photo": "/product-images/women-printed-cotton-saree.jpg",
        "color": "Indigo Blue",
        "size_group": "free",
        "gender": "women",
        "featured": False,
    },
    # Dresses
    {
        "department": "Women",
        "brand": "VESTRA Woman",
        "category": "Dresses",
        "name": "Rosewood Bloom Midi Dress",
        "price": 2499,
        "discount": 20,
        "rating": 4.7,
        "photo": "/product-images/women-white-anarkali.png",
        "color": "Ivory Rose",
        "size_group": "women",
        "gender": "women",
        "featured": True,
    },
    {
        "department": "Women",
        "brand": "VESTRA Woman",
        "category": "Dresses",
        "name": "Seraphina Floral Tiered Midi Dress",
        "price": 2199,
        "discount": 25,
        "rating": 4.8,
        "photo": "/product-images/women-floral-midi-dress.jpg",
        "color": "Multi Floral",
        "size_group": "women",
        "gender": "women",
        "featured": False,
    },
    # Tops
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
        "category": "Tops",
        "name": "Blush Meadow Floral Tunic",
        "price": 1299,
        "discount": 18,
        "rating": 4.5,
        "photo": "/product-images/women-floral-kurti.png",
        "color": "Blush Pink",
        "size_group": "women",
        "gender": "women",
        "featured": False,
    },
    # Jeans
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
        "category": "Jeans",
        "name": "Indigo Avenue Straight Jeans",
        "price": 1599,
        "discount": 15,
        "rating": 4.5,
        "photo": "/product-images/straight-fit-jeans.jpg",
        "color": "Light Blue",
        "size_group": "women_waist",
        "gender": "women",
        "featured": False,
    },
    # Jackets
    {
        "department": "Women",
        "brand": "VESTRA Woman",
        "category": "Jackets",
        "name": "Active Spirit Track Jacket",
        "price": 2199,
        "discount": 25,
        "rating": 4.7,
        "photo": "/product-images/women-white-bomber-jacket.png",
        "color": "White",
        "size_group": "women",
        "gender": "women",
        "featured": False,
    },
    {
        "department": "Women",
        "brand": "VESTRA Woman",
        "category": "Jackets",
        "name": "Minimalist Zip Fleece Jacket",
        "price": 1999,
        "discount": 20,
        "rating": 4.6,
        "photo": "/product-images/women-white-jacket.png",
        "color": "Ivory",
        "size_group": "women",
        "gender": "women",
        "featured": False,
    },
    # Footwear
    {
        "department": "Women",
        "brand": "VESTRA Woman",
        "category": "Footwear",
        "name": "Ivory Street Classic Sneakers",
        "price": 2899,
        "discount": 30,
        "rating": 4.8,
        "photo": "/product-images/puma-sneakers.png",
        "color": "White",
        "size_group": "shoes",
        "gender": "women",
        "featured": True,
    },

    # ==================== KIDS ====================
    # Boys Clothing
    {
        "department": "Kids",
        "brand": "VESTRA Kids",
        "category": "Boys Clothing",
        "name": "Sky Rocket Skater Tee 3-Pack",
        "price": 999,
        "discount": 15,
        "rating": 4.6,
        "photo": "/product-images/kids-skater-tshirts.png",
        "color": "Multi",
        "size_group": "kids",
        "gender": "kids",
        "featured": False,
    },
    {
        "department": "Kids",
        "brand": "VESTRA Kids",
        "category": "Boys Clothing",
        "name": "Olive Adventure Cargo Joggers 3-Pack",
        "price": 1499,
        "discount": 20,
        "rating": 4.5,
        "photo": "/product-images/kids-cargo-joggers.png",
        "color": "Olive",
        "size_group": "kids",
        "gender": "kids",
        "featured": False,
    },
    {
        "department": "Kids",
        "brand": "VESTRA Kids",
        "category": "Boys Clothing",
        "name": "Cloudstep Denim Dungarees Set",
        "price": 1399,
        "discount": 18,
        "rating": 4.7,
        "photo": "/product-images/kids-denim-dungarees.jpg",
        "color": "Denim Blue",
        "size_group": "kids",
        "gender": "kids",
        "featured": True,
    },
    {
        "department": "Kids",
        "brand": "VESTRA Kids",
        "category": "Boys Clothing",
        "name": "Urban Pioneer Chambray Denim Shirt",
        "price": 1099,
        "discount": 15,
        "rating": 4.5,
        "photo": "/product-images/kids-denim-shirt.jpg",
        "color": "Chambray",
        "size_group": "kids",
        "gender": "kids",
        "featured": False,
    },
    {
        "department": "Kids",
        "brand": "VESTRA Kids",
        "category": "Boys Clothing",
        "name": "Collegiate Varsity Bomber Jacket",
        "price": 1699,
        "discount": 22,
        "rating": 4.8,
        "photo": "/product-images/kids-varsity-jacket.jpg",
        "color": "Navy & Yellow",
        "size_group": "kids",
        "gender": "kids",
        "featured": False,
    },
    {
        "department": "Kids",
        "brand": "VESTRA Kids",
        "category": "Boys Clothing",
        "name": "Sky Rocket Graphic Tee Set",
        "price": 899,
        "discount": 10,
        "rating": 4.4,
        "photo": "/product-images/kids-tshirts-set.png",
        "color": "Cobalt",
        "size_group": "kids",
        "gender": "kids",
        "featured": False,
    },
    # Girls Clothing
    {
        "department": "Kids",
        "brand": "VESTRA Kids",
        "category": "Girls Clothing",
        "name": "Blush Twirl Flare Party Dress",
        "price": 1499,
        "discount": 20,
        "rating": 4.8,
        "photo": "/product-images/kids-blush-twirl-dress.jpg",
        "color": "Blush Pink",
        "size_group": "kids",
        "gender": "kids",
        "featured": True,
    },
    {
        "department": "Kids",
        "brand": "VESTRA Kids",
        "category": "Girls Clothing",
        "name": "Lavender Blossom Co-ord Set",
        "price": 1299,
        "discount": 15,
        "rating": 4.6,
        "photo": "/product-images/kids-lavender-coord.jpg",
        "color": "Lavender",
        "size_group": "kids",
        "gender": "kids",
        "featured": False,
    },
    {
        "department": "Kids",
        "brand": "VESTRA Kids",
        "category": "Girls Clothing",
        "name": "London Heritage Colourblock Hoodie",
        "price": 1599,
        "discount": 25,
        "rating": 4.7,
        "photo": "/product-images/kids-pepe-hoodie.png",
        "color": "Colorblock",
        "size_group": "kids",
        "gender": "kids",
        "featured": False,
    },
    # Baby
    {
        "department": "Kids",
        "brand": "VESTRA Kids",
        "category": "Baby",
        "name": "Sunshine Organic Cotton Romper",
        "price": 799,
        "discount": 10,
        "rating": 4.9,
        "photo": "/product-images/kids-sunshine-romper.jpg",
        "color": "Mustard Yellow",
        "size_group": "baby",
        "gender": "kids",
        "featured": True,
    },
    {
        "department": "Kids",
        "brand": "VESTRA Kids",
        "category": "Baby",
        "name": "Cozy Meadow Knitted Jumpsuit",
        "price": 999,
        "discount": 12,
        "rating": 4.7,
        "photo": "/product-images/kids-baby-knit.jpg",
        "color": "Sage Green",
        "size_group": "baby",
        "gender": "kids",
        "featured": False,
    },
    # Kids Footwear
    {
        "department": "Kids",
        "brand": "VESTRA Kids",
        "category": "Kids Footwear",
        "name": "Cloudstep Pro Colorblock Sneakers",
        "price": 1899,
        "discount": 25,
        "rating": 4.8,
        "photo": "/product-images/puma-colorblock-sneakers.png",
        "color": "Multi Colorblock",
        "size_group": "kids_shoes",
        "gender": "kids",
        "featured": True,
    },
    # Kids Ethnic Wear
    {
        "department": "Kids",
        "brand": "VESTRA Kids",
        "category": "Kids Ethnic Wear",
        "name": "Zari Border Festive Kurta Pajama Set",
        "price": 1499,
        "discount": 20,
        "rating": 4.7,
        "photo": "/product-images/kids-coral-kurta-set.jpg",
        "color": "Coral Peach",
        "size_group": "kids",
        "gender": "kids",
        "featured": False,
    },
    {
        "department": "Kids",
        "brand": "VESTRA Kids",
        "category": "Kids Ethnic Wear",
        "name": "Royal Heritage Silk Blend Kurta",
        "price": 1399,
        "discount": 15,
        "rating": 4.6,
        "photo": "/product-images/kids-festive-kurta.jpg",
        "color": "Royal Gold",
        "size_group": "kids",
        "gender": "kids",
        "featured": False,
    },

    # ==================== BEAUTY ====================
    # Makeup
    {
        "department": "Beauty",
        "brand": "VESTRA Beauty",
        "category": "Makeup",
        "name": "Peachy Dew Color-Changing Lip Oil",
        "price": 499,
        "discount": 10,
        "rating": 4.7,
        "photo": "/product-images/mars-peachy-dew-lip-oil.png",
        "color": "Peachy Pink",
        "size_group": "beauty",
        "gender": "unisex",
        "featured": True,
    },
    {
        "department": "Beauty",
        "brand": "VESTRA Beauty",
        "category": "Makeup",
        "name": "Ruby Siren Velvet Matte Lipstick",
        "price": 699,
        "discount": 15,
        "rating": 4.8,
        "photo": "/product-images/velvet-matte-lipstick.jpg",
        "color": "Ruby Red",
        "size_group": "beauty",
        "gender": "unisex",
        "featured": False,
    },
    # Skincare
    {
        "department": "Beauty",
        "brand": "VESTRA Beauty",
        "category": "Skincare",
        "name": "Luminescence 10% Vitamin C Glow Serum",
        "price": 899,
        "discount": 20,
        "rating": 4.8,
        "photo": "/product-images/vitamin-c-glow-serum.jpg",
        "color": "Clear Gold",
        "size_group": "beauty",
        "gender": "unisex",
        "featured": True,
    },
    {
        "department": "Beauty",
        "brand": "VESTRA Beauty",
        "category": "Skincare",
        "name": "Aqua Cloud Ceramide Hydrating Cream",
        "price": 799,
        "discount": 15,
        "rating": 4.7,
        "photo": "/product-images/aqua-cloud-hydrating-cream.jpg",
        "color": "Pure White",
        "size_group": "beauty",
        "gender": "unisex",
        "featured": False,
    },
    # Haircare
    {
        "department": "Beauty",
        "brand": "VESTRA Beauty",
        "category": "Haircare",
        "name": "Flaxseed Ultra Smooth Hair Duo",
        "price": 1099,
        "discount": 22,
        "rating": 4.6,
        "photo": "/product-images/plix-flaxseed-shampoo-conditioner.png",
        "color": "Botanical",
        "size_group": "beauty",
        "gender": "unisex",
        "featured": True,
    },
    {
        "department": "Beauty",
        "brand": "VESTRA Beauty",
        "category": "Haircare",
        "name": "Rosemary & Methi Hair Growth Oil",
        "price": 549,
        "discount": 12,
        "rating": 4.5,
        "photo": "/product-images/mamaearth-rosemary-hair-oil.png",
        "color": "Herbal Amber",
        "size_group": "beauty",
        "gender": "unisex",
        "featured": False,
    },
    {
        "department": "Beauty",
        "brand": "VESTRA Beauty",
        "category": "Haircare",
        "name": "Flaxseed Deep Nourish Hair Care Kit",
        "price": 1299,
        "discount": 25,
        "rating": 4.8,
        "photo": "/product-images/plix-flaxseed-combo.png",
        "color": "Natural Kit",
        "size_group": "beauty",
        "gender": "unisex",
        "featured": False,
    },
    # Fragrances
    {
        "department": "Beauty",
        "brand": "VESTRA Beauty",
        "category": "Fragrances",
        "name": "Santal Velvet Signature Eau De Parfum",
        "price": 1999,
        "discount": 20,
        "rating": 4.9,
        "photo": "/product-images/signature-eau-de-parfum.jpg",
        "color": "Golden Amber",
        "size_group": "beauty",
        "gender": "unisex",
        "featured": True,
    },
    # Bath & Body
    {
        "department": "Beauty",
        "brand": "VESTRA Beauty",
        "category": "Bath & Body",
        "name": "Shea Butter Nourishing Body Lotion",
        "price": 699,
        "discount": 15,
        "rating": 4.7,
        "photo": "/product-images/shea-butter-body-lotion.jpg",
        "color": "Warm Amber",
        "size_group": "beauty",
        "gender": "unisex",
        "featured": True,
    },

    # ==================== JEWELLERY ====================
    # Earrings
    {
        "department": "Jewellery",
        "brand": "VESTRA Jewellery",
        "category": "Earrings",
        "name": "Aurelia Sculpted Gold Hoop Earrings",
        "price": 1299,
        "discount": 15,
        "rating": 4.8,
        "photo": "/product-images/jewellery-aurelia-gold-hoops.jpg",
        "color": "Yellow Gold",
        "size_group": "free",
        "gender": "women",
        "featured": True,
    },
    {
        "department": "Jewellery",
        "brand": "VESTRA Jewellery",
        "category": "Earrings",
        "name": "Meera Oxidised Floral Jhumkas",
        "price": 999,
        "discount": 20,
        "rating": 4.7,
        "photo": "/product-images/jewellery-meera-oxidised-jhumkas.jpg",
        "color": "Antique Silver",
        "size_group": "free",
        "gender": "women",
        "featured": False,
    },
    {
        "department": "Jewellery",
        "brand": "VESTRA Jewellery",
        "category": "Earrings",
        "name": "Sapphire Royale Chandelier Earrings",
        "price": 1799,
        "discount": 25,
        "rating": 4.9,
        "photo": "/product-images/jewellery-sapphire-chandelier-earrings.jpg",
        "color": "Royal Blue",
        "size_group": "free",
        "gender": "women",
        "featured": False,
    },
    {
        "department": "Jewellery",
        "brand": "VESTRA Jewellery",
        "category": "Earrings",
        "name": "Pearl Rain Drop Delicate Earrings",
        "price": 1199,
        "discount": 15,
        "rating": 4.6,
        "photo": "/product-images/jewellery-pearl-drop-earrings.jpg",
        "color": "Pearl White",
        "size_group": "free",
        "gender": "women",
        "featured": False,
    },
    # Neck Jewellery
    {
        "department": "Jewellery",
        "brand": "VESTRA Jewellery",
        "category": "Neck Jewellery",
        "name": "Emerald Halo Solitaire Pendant Necklace",
        "price": 2199,
        "discount": 20,
        "rating": 4.8,
        "photo": "/product-images/jewellery-emerald-pendant-necklace.jpg",
        "color": "Emerald Green",
        "size_group": "free",
        "gender": "women",
        "featured": True,
    },
    {
        "department": "Jewellery",
        "brand": "VESTRA Jewellery",
        "category": "Neck Jewellery",
        "name": "Noor Royal Pearl Choker Necklace",
        "price": 2599,
        "discount": 22,
        "rating": 4.9,
        "photo": "/product-images/jewellery-pearl-choker-necklace.jpg",
        "color": "Ivory Pearl",
        "size_group": "free",
        "gender": "women",
        "featured": False,
    },
    {
        "department": "Jewellery",
        "brand": "VESTRA Jewellery",
        "category": "Neck Jewellery",
        "name": "Noor Delicate Filigree Gold Choker",
        "price": 2399,
        "discount": 18,
        "rating": 4.7,
        "photo": "/product-images/jewellery-noor-gold-choker.jpg",
        "color": "Yellow Gold",
        "size_group": "free",
        "gender": "women",
        "featured": False,
    },
    {
        "department": "Jewellery",
        "brand": "VESTRA Jewellery",
        "category": "Neck Jewellery",
        "name": "Solstice Dainty Double Layered Gold Chain",
        "price": 1699,
        "discount": 15,
        "rating": 4.6,
        "photo": "/product-images/jewellery-solstice-layered-necklace.jpg",
        "color": "Yellow Gold",
        "size_group": "free",
        "gender": "women",
        "featured": False,
    },
    # Rings
    {
        "department": "Jewellery",
        "brand": "VESTRA Jewellery",
        "category": "Rings",
        "name": "Luna Minimal Sterling Silver Ring",
        "price": 899,
        "discount": 10,
        "rating": 4.7,
        "photo": "/product-images/jewellery-luna-silver-ring.jpg",
        "color": "Silver",
        "size_group": "free",
        "gender": "women",
        "featured": False,
    },
    {
        "department": "Jewellery",
        "brand": "VESTRA Jewellery",
        "category": "Rings",
        "name": "Prism Baguette Crystal Cocktail Ring",
        "price": 1399,
        "discount": 20,
        "rating": 4.8,
        "photo": "/product-images/jewellery-prism-crystal-ring.jpg",
        "color": "Rose Gold",
        "size_group": "free",
        "gender": "women",
        "featured": True,
    },
    {
        "department": "Jewellery",
        "brand": "VESTRA Jewellery",
        "category": "Rings",
        "name": "Celestial Solitaire Diamond Twist Ring",
        "price": 2999,
        "discount": 25,
        "rating": 4.9,
        "photo": "/product-images/jewellery-diamond-solitaire-ring.jpg",
        "color": "Platinum & Rose Gold",
        "size_group": "free",
        "gender": "women",
        "featured": True,
    },
    # Bracelets
    {
        "department": "Jewellery",
        "brand": "VESTRA Jewellery",
        "category": "Bracelets",
        "name": "Celeste Golden Celestial Charm Bracelet",
        "price": 1299,
        "discount": 15,
        "rating": 4.8,
        "photo": "/product-images/jewellery-celeste-charm-bracelet.jpg",
        "color": "Gold",
        "size_group": "free",
        "gender": "women",
        "featured": True,
    },
    {
        "department": "Jewellery",
        "brand": "VESTRA Jewellery",
        "category": "Bracelets",
        "name": "Heritage Freshwater Pearl Bangle Set",
        "price": 1599,
        "discount": 18,
        "rating": 4.7,
        "photo": "/product-images/jewellery-pearl-bangle-set.jpg",
        "color": "Pearl Gold",
        "size_group": "free",
        "gender": "women",
        "featured": False,
    },
    # Traditional Jewellery
    {
        "department": "Jewellery",
        "brand": "VESTRA Jewellery",
        "category": "Traditional Jewellery",
        "name": "Rajsi Royal Heritage Kundan Choker Set",
        "price": 3499,
        "discount": 30,
        "rating": 4.9,
        "photo": "/product-images/jewellery-rajsi-kundan-set.jpg",
        "color": "Gold & Green Kundan",
        "size_group": "free",
        "gender": "women",
        "featured": True,
    },
    {
        "department": "Jewellery",
        "brand": "VESTRA Jewellery",
        "category": "Traditional Jewellery",
        "name": "Devika Handcrafted Temple Jewellery Set",
        "price": 3999,
        "discount": 32,
        "rating": 4.9,
        "photo": "/product-images/jewellery-devika-temple-set.jpg",
        "color": "Antique Gold",
        "size_group": "free",
        "gender": "women",
        "featured": False,
    },
]

def seed():
    db = SessionLocal()
    try:
        print("Starting subcategory catalog seed...")

        # 1. Setup Brands
        brand_cache = {}
        for b in db.query(Brand).all():
            brand_cache[b.name] = b

        # 2. Setup Parent Categories
        dept_cache = {}
        for d in DEPARTMENTS:
            cat = db.query(Category).filter(Category.name.ilike(d["name"]), Category.parent_id.is_(None)).first()
            if not cat:
                cat = Category(name=d["name"], slug=d["slug"], parent_id=None)
                db.add(cat)
                db.flush()
                print(f"Created parent category: {cat.name} (id={cat.id})")
            else:
                cat.slug = d["slug"]
                cat.parent_id = None
                db.flush()
            dept_cache[d["name"]] = cat

        # 3. Setup Subcategories linked to parents
        subcat_cache = {} # (dept_name, subcat_name) -> Category
        for dept_name, subcats in SUBCATEGORIES.items():
            parent = dept_cache[dept_name]
            for sc in subcats:
                # Find existing category by slug or name under this parent
                cat = db.query(Category).filter(
                    (Category.slug == sc["slug"]) |
                    ((Category.name.ilike(sc["name"])) & ((Category.parent_id == parent.id) | (Category.parent_id.is_(None))))
                ).first()

                if not cat:
                    cat = Category(name=sc["name"], slug=sc["slug"], parent_id=parent.id)
                    db.add(cat)
                    db.flush()
                    print(f"Created subcategory: {dept_name} > {sc['name']} (id={cat.id})")
                else:
                    cat.name = sc["name"]
                    cat.slug = sc["slug"]
                    cat.parent_id = parent.id
                    db.flush()

                subcat_cache[(dept_name, sc["name"])] = cat

        # Deactivate older products
        db.query(Product).update({Product.is_active: False})
        db.commit()

        # 4. Upsert Products
        for idx, item in enumerate(PRODUCTS, 1):
            dept_name = item["department"]
            b_name = item["brand"]
            c_name = item["category"]

            # Brand
            if b_name not in brand_cache:
                brand = Brand(name=b_name, description=f"{b_name} by VESTRA.")
                db.add(brand)
                db.flush()
                brand_cache[b_name] = brand
            brand = brand_cache[b_name]

            # Category
            category = subcat_cache.get((dept_name, c_name))
            if not category:
                # Fallback
                category = db.query(Category).filter(Category.name == c_name).first()
                if not category:
                    category = Category(name=c_name, slug=slugify(f"{dept_name}-{c_name}"), parent_id=dept_cache[dept_name].id)
                    db.add(category)
                    db.flush()

            p_name = item["name"]
            p_slug = slugify(p_name)
            img_url = item["photo"]

            p = db.query(Product).filter((Product.slug == p_slug) | (Product.name == p_name)).first()
            if not p:
                p = Product(
                    name=p_name,
                    slug=p_slug,
                    description=f"{p_name} from {b_name}. A curated VESTRA {c_name} essential.",
                    brand_id=brand.id,
                    category_id=category.id,
                    department=dept_name,
                    base_price=float(item["price"]),
                    discount_percentage=float(item["discount"]),
                    rating=float(item["rating"]),
                    image_url=img_url,
                    gender=item["gender"],
                    is_featured=item["featured"],
                    is_active=True,
                )
                db.add(p)
                db.flush()
                print(f"[{idx:02d}/{len(PRODUCTS)}] NEW  {dept_name:9s} | {c_name:20s} | {p_name}")
            else:
                p.name = p_name
                p.slug = p_slug
                p.description = f"{p_name} from {b_name}. A curated VESTRA {c_name} essential."
                p.brand_id = brand.id
                p.category_id = category.id
                p.department = dept_name
                p.base_price = float(item["price"])
                p.discount_percentage = float(item["discount"])
                p.rating = float(item["rating"])
                p.image_url = img_url
                p.gender = item["gender"]
                p.is_featured = item["featured"]
                p.is_active = True
                db.flush()
                print(f"[{idx:02d}/{len(PRODUCTS)}] LIVE {dept_name:9s} | {c_name:20s} | {p_name}")

            # Variants
            sizes = SIZE_GROUPS.get(item["size_group"], ["Free Size"])
            var_price = selling_price(item["price"], item["discount"])
            sku_base = sku_part(p_slug)[:25]

            for s_idx, size in enumerate(sizes):
                sku = f"VST-{p.id}-{sku_base}-{sku_part(size)}-{s_idx + 1}"
                variant = db.query(ProductVariant).filter(
                    (ProductVariant.sku == sku) |
                    ((ProductVariant.product_id == p.id) & (ProductVariant.size == size))
                ).first()

                if not variant:
                    variant = ProductVariant(
                        product_id=p.id,
                        sku=sku,
                        size=size,
                        color=item["color"],
                        price=var_price,
                        stock=25 + s_idx * 5,
                        image_url=None,
                        is_active=True,
                    )
                    db.add(variant)
                else:
                    variant.sku = sku
                    variant.color = item["color"]
                    variant.price = var_price
                    variant.is_active = True
                    variant.stock = max(variant.stock or 25, 25)

        db.commit()

        active_count = db.query(Product).filter(Product.is_active == True).count()
        print(f"\nSeeding complete! Total active products across all subcategories: {active_count}")

    except Exception as e:
        db.rollback()
        print(f"Error seeding subcategories: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()
