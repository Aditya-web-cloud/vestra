import re
import shutil
import sqlite3
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent
DB_PATH = BACKEND_DIR / "vestra.db"
BACKUP_PATH = BACKEND_DIR / "vestra-backup.db"

# 1. Safety backup
if DB_PATH.exists():
    shutil.copy2(DB_PATH, BACKUP_PATH)
    print(f"Database backed up to {BACKUP_PATH.name}")

def sku_part(val: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9]+", "", str(val))
    return cleaned.upper() or "ONE"

# Color palettes by department & product classification
PALETTES = {
    "women_ethnic": ["Magenta", "Emerald Green", "Ruby Red", "Mustard Yellow", "Royal Navy", "Ivory Rose"],
    "women_western": ["Black", "Blush Pink", "Lavender", "Olive Green", "White", "Navy Blue"],
    "women_jeans": ["Dark Indigo", "Light Blue", "Black", "Denim Blue", "Grey"],
    "footwear": ["White", "Black", "Beige", "Tan Brown", "Blush Pink"],
    "jewellery": ["Yellow Gold", "Rose Gold", "Silver", "Antique Gold"],
    "kids_boys": ["Cobalt", "Forest Green", "Mustard", "Navy", "Red"],
    "kids_girls": ["Pink", "Lavender", "Mint Green", "Sunny Yellow", "Sky Blue"],
    "kids_baby": ["Cream", "Pastel Yellow", "Soft Blue", "Blush Pink"],
    "beauty_makeup": ["Ruby Red", "Berry Rose", "Peach", "Plum", "Coral"],
    "beauty_general": ["Warm Amber", "Rose", "Natural", "Lavender", "Citrus"],
}

def pick_palette(dept: str, cat: str, name: str):
    dept_lower = (dept or "").lower()
    cat_lower = (cat or "").lower()
    name_lower = (name or "").lower()

    if "jewel" in dept_lower or "jewel" in cat_lower:
        return PALETTES["jewellery"]
    
    if "beauty" in dept_lower:
        if any(w in name_lower or w in cat_lower for w in ["lip", "lipstick", "tint", "blush", "eyeshadow", "nail", "makeup"]):
            return PALETTES["beauty_makeup"]
        return PALETTES["beauty_general"]

    if "kids" in dept_lower:
        if "baby" in cat_lower or "baby" in name_lower or "romper" in name_lower:
            return PALETTES["kids_baby"]
        if "girl" in cat_lower or "dress" in name_lower:
            return PALETTES["kids_girls"]
        return PALETTES["kids_boys"]

    if "shoe" in cat_lower or "sneaker" in name_lower or "footwear" in cat_lower or "heel" in name_lower or "flat" in name_lower:
        return PALETTES["footwear"]

    if "jean" in cat_lower or "denim" in name_lower or "trouser" in cat_lower:
        return PALETTES["women_jeans"]

    if any(w in cat_lower or w in name_lower for w in ["kurta", "kurti", "saree", "ethnic", "anarkali", "suit", "lehenga", "dupatta"]):
        return PALETTES["women_ethnic"]

    return PALETTES["women_western"]

def enrich_colors():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # Get existing SKUs to avoid collisions
    c.execute("SELECT sku FROM product_variants WHERE sku IS NOT NULL")
    existing_skus = set(row[0] for row in c.fetchall())

    # Get all products
    c.execute("""
        SELECT p.id, p.name, p.department, p.base_price, p.discount_percentage, p.image_url, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
    """)
    products = c.fetchall()

    print(f"Scanning {len(products)} products for color enrichment...")
    total_added = 0
    enriched_products_count = 0

    for prod in products:
        p_id, p_name, p_dept, p_base_price, p_discount, p_image, c_name = prod

        # Get existing variants for this product
        c.execute("""
            SELECT id, size, color, price, stock, image_url, sku
            FROM product_variants
            WHERE product_id = ? AND is_active = 1
        """, (p_id,))
        variants = c.fetchall()

        existing_colors = list(dict.fromkeys(v[2] for v in variants if v[2]))
        existing_sizes = list(dict.fromkeys(v[1] for v in variants if v[1]))

        if not existing_sizes:
            # Default sizes if none
            dept_lower = (p_dept or "").lower()
            if "jewel" in dept_lower or "beauty" in dept_lower:
                existing_sizes = ["Free Size"]
            elif "shoe" in (c_name or "").lower():
                existing_sizes = ["36", "37", "38", "39", "40"]
            else:
                existing_sizes = ["S", "M", "L", "XL"]

        # Base price and variant price
        base_p = float(p_base_price or 999)
        disc = float(p_discount or 0)
        var_price = round(base_p * (1 - disc / 100), 2)
        if variants and variants[0][3] and float(variants[0][3]) > 0:
            var_price = float(variants[0][3])

        # If product has fewer than 3 colors, add more
        needed_colors = 3 - len(existing_colors)
        if needed_colors <= 0:
            continue

        palette = pick_palette(p_dept, c_name, p_name)
        candidate_colors = [col for col in palette if col not in existing_colors]

        colors_to_add = candidate_colors[:max(2, needed_colors)]
        if not colors_to_add:
            continue

        enriched_products_count += 1
        for col_idx, new_color in enumerate(colors_to_add):
            for s_idx, size in enumerate(existing_sizes):
                sku_candidate = f"VST-{p_id}-{sku_part(new_color)}-{sku_part(size)}"
                counter = 1
                while sku_candidate in existing_skus:
                    sku_candidate = f"VST-{p_id}-{sku_part(new_color)}-{sku_part(size)}-{counter}"
                    counter += 1
                existing_skus.add(sku_candidate)

                stock = 20 + (s_idx * 5) + (col_idx * 3)

                c.execute("""
                    INSERT INTO product_variants (product_id, sku, size, color, price, stock, image_url, is_active)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
                """, (p_id, sku_candidate, size, new_color, var_price, stock, p_image))
                total_added += 1

    conn.commit()
    conn.close()

    print(f"Enrichment finished!")
    print(f"Products enriched: {enriched_products_count}")
    print(f"Total new color variants created: {total_added}")

if __name__ == "__main__":
    enrich_colors()
