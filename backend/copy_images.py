from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "frontend" / "public" / "product-images"
HOME_DIR = ROOT / "frontend" / "public" / "images" / "homepage"
HOME_DIR.mkdir(parents=True, exist_ok=True)

IMAGE_MAP = {
    "Screenshot 2026-09-02 163337.png": "women-wide-leg-jeans.png",
    "Screenshot 2026-09-03 104026.png": "kids-pepe-hoodie.png",
    "Screenshot 2026-09-03 104101.png": "kids-cargo-joggers.png",
    "Screenshot 2026-09-03 104147.png": "women-magenta-kurta-set.png",
    "Screenshot 2026-09-03 104213.png": "women-white-anarkali-gown.png",
    "Screenshot 2026-09-03 104238.png": "kids-skater-tshirts.png",
    "Screenshot 2026-09-03 104319.png": "puma-colorblock-sneakers.png",
    "Screenshot 2026-09-03 104357.png": "women-black-floral-kurti.png",
    "Screenshot 2026-09-03 104424.png": "women-white-bomber-jacket.png",
    "Screenshot 2026-09-03 104448.png": "mars-peachy-dew-lip-oil.png",
    "Screenshot 2026-09-03 104512.png": "plix-flaxseed-shampoo-conditioner.png",
    "Screenshot 2026-09-03 104712.png": "women-silk-ikat-saree.png",
    "Screenshot 2026-09-03 104857.png": "women-purple-embroidered-suit.png",
    "Screenshot 2026-09-03 105002.png": "women-maroon-anarkali-gown.png",
    "Screenshot 2026-09-03 105033.png": "mamaearth-rosemary-hair-oil.png",
}

for src_name, clean_name in IMAGE_MAP.items():
    src_file = SRC_DIR / src_name
    if src_file.exists():
        shutil.copy2(src_file, SRC_DIR / clean_name)
        shutil.copy2(src_file, HOME_DIR / clean_name)
        print(f"Copied {src_name} -> {clean_name}")

# Also copy all files from SRC_DIR to HOME_DIR so homepage can access all
for file in SRC_DIR.glob("*.*"):
    if file.suffix.lower() in [".png", ".jpg", ".jpeg", ".webp"]:
        shutil.copy2(file, HOME_DIR / file.name)

print("All image copies complete.")
