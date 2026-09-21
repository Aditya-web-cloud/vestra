import sqlite3
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent
DB_PATH = BACKEND_DIR / "vestra.db"

def link_images():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # Noor Embroidered Kurta Set (id=2)
    # Magenta is base image. For Ruby Red:
    c.execute("""
        UPDATE product_variants
        SET image_url = '/product-images/women-red-kurta-set.png'
        WHERE product_id = 2 AND LOWER(color) LIKE '%red%'
    """)

    # Products with anarkali gowns:
    # White -> women-white-anarkali-gown.png
    # Maroon/Red -> women-maroon-anarkali-gown.png
    c.execute("""
        UPDATE product_variants
        SET image_url = '/product-images/women-maroon-anarkali-gown.png'
        WHERE LOWER(color) IN ('maroon', 'ruby red') AND product_id IN (
            SELECT id FROM products WHERE LOWER(name) LIKE '%anarkali%'
        )
    """)

    c.execute("""
        UPDATE product_variants
        SET image_url = '/product-images/women-white-anarkali-gown.png'
        WHERE LOWER(color) IN ('white', 'cream') AND product_id IN (
            SELECT id FROM products WHERE LOWER(name) LIKE '%anarkali%'
        )
    """)

    # Women Kurti (e.g. black floral kurti)
    c.execute("""
        UPDATE product_variants
        SET image_url = '/product-images/women-black-floral-kurti.png'
        WHERE LOWER(color) IN ('black', 'midnight black') AND product_id IN (
            SELECT id FROM products WHERE LOWER(name) LIKE '%kurti%' OR LOWER(name) LIKE '%peplum%'
        )
    """)

    # Kids dresses
    c.execute("""
        UPDATE product_variants
        SET image_url = '/product-images/kids-coral-kurta-set.jpg'
        WHERE LOWER(color) IN ('coral', 'red', 'orange') AND product_id IN (
            SELECT id FROM products WHERE LOWER(name) LIKE '%kurta%' AND department = 'Kids'
        )
    """)

    c.execute("""
        UPDATE product_variants
        SET image_url = '/product-images/kids-lavender-coord.jpg'
        WHERE LOWER(color) IN ('lavender', 'purple') AND product_id IN (
            SELECT id FROM products WHERE LOWER(name) LIKE '%party%' OR LOWER(name) LIKE '%dress%' OR LOWER(name) LIKE '%coord%'
        )
    """)

    conn.commit()
    conn.close()
    print("Color images linked to variants successfully.")

if __name__ == "__main__":
    link_images()
