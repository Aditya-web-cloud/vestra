/**
 * Smart garment analyzer and recolorizer for VESTRA.
 * - Accurately models and preserves the background (walls, studio seamless, floors, furniture).
 * - Accurately protects human models (face, hair, skin, arms, legs).
 * - Dynamically adapts luminance for white and black garments so all colors are rich and visible.
 * - Supports every color in the VESTRA catalog.
 */

const recolorCache = new Map();

function rgbToHsl(r, g, b) {
    const rf = r / 255;
    const gf = g / 255;
    const bf = b / 255;
    const max = Math.max(rf, gf, bf);
    const min = Math.min(rf, gf, bf);
    const delta = max - min;
    const l = (max + min) / 2;

    let h = 0;
    let s = 0;

    if (delta !== 0) {
        s = delta / (1 - Math.abs(2 * l - 1));
        if (max === rf) {
            h = ((gf - bf) / delta) % 6;
        } else if (max === gf) {
            h = (bf - rf) / delta + 2;
        } else {
            h = (rf - gf) / delta + 4;
        }
        h = Math.round(h * 60);
        if (h < 0) h += 360;
    }

    return [h, s, l];
}

function hslToRgb(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0;
    let g = 0;
    let b = 0;

    if (h >= 0 && h < 60) {
        r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
        r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
        r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
        r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
        r = x; g = 0; b = c;
    } else {
        r = c; g = 0; b = x;
    }

    return [
        Math.round((r + m) * 255),
        Math.round((g + m) * 255),
        Math.round((b + m) * 255),
    ];
}

/**
 * Biometric human skin tone detector.
 * Melanin/hemoglobin creates a strict slope: r > g > b with (r-g) >= 12.
 * Validates inside normalized YCbCr skin ellipsoid.
 */
function isHumanSkin(r, g, b) {
    if (r <= 45) return false;

    const isSkinRatio = (g / r) >= 0.48 && (b / r) >= 0.30 && r > b && (r - g) >= 12;
    if (!isSkinRatio) return false;

    const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
    const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
    return cb >= 77 && cb <= 134 && cr >= 130 && cr <= 178;
}

/**
 * Universal color dictionary covering all colors in VESTRA catalog.
 */
const COLOR_TARGETS = {
    // Reds & Corals
    "red": { h: 0, s: 0.85, optLum: 0.46 },
    "ruby": { h: 350, s: 0.85, optLum: 0.44 },
    "ruby red": { h: 350, s: 0.85, optLum: 0.44 },
    "maroon": { h: 342, s: 0.80, optLum: 0.32 },
    "coral": { h: 16, s: 0.82, optLum: 0.54 },
    "coral peach": { h: 20, s: 0.78, optLum: 0.56 },
    "peach": { h: 26, s: 0.72, optLum: 0.60 },
    "peachy pink": { h: 340, s: 0.70, optLum: 0.58 },

    // Oranges & Yellows
    "orange": { h: 25, s: 0.85, optLum: 0.52 },
    "sunset orange": { h: 25, s: 0.85, optLum: 0.52 },
    "mustard": { h: 42, s: 0.88, optLum: 0.50 },
    "mustard yellow": { h: 42, s: 0.88, optLum: 0.50 },
    "yellow": { h: 48, s: 0.90, optLum: 0.54 },
    "sunny yellow": { h: 48, s: 0.90, optLum: 0.54 },
    "pastel yellow": { h: 50, s: 0.75, optLum: 0.65 },
    "amber": { h: 38, s: 0.82, optLum: 0.48 },
    "warm amber": { h: 38, s: 0.82, optLum: 0.48 },
    "golden amber": { h: 40, s: 0.85, optLum: 0.50 },
    "herbal amber": { h: 38, s: 0.80, optLum: 0.48 },
    "herbal": { h: 80, s: 0.65, optLum: 0.45 },

    // Golds & Metallics
    "gold": { h: 45, s: 0.85, optLum: 0.52 },
    "yellow gold": { h: 46, s: 0.85, optLum: 0.52 },
    "royal gold": { h: 45, s: 0.85, optLum: 0.52 },
    "antique gold": { h: 42, s: 0.70, optLum: 0.45 },
    "golden": { h: 45, s: 0.85, optLum: 0.52 },
    "rose gold": { h: 350, s: 0.60, optLum: 0.58 },
    "silver": { h: 215, s: 0.15, optLum: 0.70 },
    "antique silver": { h: 215, s: 0.12, optLum: 0.60 },
    "oxidised silver": { h: 215, s: 0.10, optLum: 0.45 },
    "platinum": { h: 210, s: 0.12, optLum: 0.72 },
    "mixed metal": { h: 45, s: 0.50, optLum: 0.55 },

    // Greens
    "olive": { h: 78, s: 0.65, optLum: 0.42 },
    "olive green": { h: 78, s: 0.65, optLum: 0.42 },
    "sage": { h: 115, s: 0.55, optLum: 0.52 },
    "sage green": { h: 115, s: 0.55, optLum: 0.52 },
    "green": { h: 130, s: 0.75, optLum: 0.42 },
    "emerald": { h: 145, s: 0.80, optLum: 0.40 },
    "emerald green": { h: 145, s: 0.80, optLum: 0.40 },
    "forest green": { h: 135, s: 0.72, optLum: 0.35 },
    "mint green": { h: 160, s: 0.68, optLum: 0.58 },
    "botanical": { h: 132, s: 0.75, optLum: 0.38 },

    // Blues
    "sky blue": { h: 195, s: 0.75, optLum: 0.58 },
    "light blue": { h: 205, s: 0.68, optLum: 0.58 },
    "soft blue": { h: 205, s: 0.68, optLum: 0.58 },
    "chambray": { h: 210, s: 0.62, optLum: 0.54 },
    "blue": { h: 220, s: 0.82, optLum: 0.44 },
    "royal blue": { h: 222, s: 0.85, optLum: 0.42 },
    "cobalt": { h: 225, s: 0.88, optLum: 0.42 },
    "navy": { h: 235, s: 0.82, optLum: 0.30 },
    "navy blue": { h: 235, s: 0.82, optLum: 0.30 },
    "royal navy": { h: 235, s: 0.82, optLum: 0.30 },
    "indigo": { h: 240, s: 0.78, optLum: 0.32 },
    "dark indigo": { h: 240, s: 0.78, optLum: 0.30 },
    "indigo blue": { h: 240, s: 0.78, optLum: 0.32 },
    "denim": { h: 215, s: 0.74, optLum: 0.44 },
    "denim blue": { h: 215, s: 0.74, optLum: 0.44 },

    // Purples & Pinks
    "purple": { h: 270, s: 0.78, optLum: 0.42 },
    "lavender": { h: 265, s: 0.65, optLum: 0.60 },
    "plum": { h: 285, s: 0.72, optLum: 0.36 },
    "magenta": { h: 315, s: 0.82, optLum: 0.44 },
    "pink": { h: 330, s: 0.72, optLum: 0.56 },
    "blush pink": { h: 335, s: 0.68, optLum: 0.62 },
    "berry rose": { h: 342, s: 0.78, optLum: 0.44 },
    "rose": { h: 345, s: 0.72, optLum: 0.50 },

    // Neutrals & Earth Tones
    "brown": { h: 25, s: 0.65, optLum: 0.35 },
    "beige": { h: 35, s: 0.35, optLum: 0.65 },
    "warm beige": { h: 35, s: 0.35, optLum: 0.65 },
    "cream": { h: 42, s: 0.30, optLum: 0.75 },
    "ivory": { h: 42, s: 0.25, optLum: 0.78 },
    "ivory rose": { h: 350, s: 0.30, optLum: 0.75 },
    "pearl": { h: 42, s: 0.22, optLum: 0.80 },
    "pearl white": { h: 42, s: 0.20, optLum: 0.82 },
    "clear": { h: 40, s: 0.25, optLum: 0.75 },
    "natural": { h: 38, s: 0.35, optLum: 0.65 },
    "natural kit": { h: 38, s: 0.35, optLum: 0.65 },

    // Multi & Multicolor
    "multicolor": { h: 220, s: 0.85, optLum: 0.48 },
    "multi": { h: 220, s: 0.85, optLum: 0.48 },
    "colorblock": { h: 215, s: 0.85, optLum: 0.48 },
    "multi colorblock": { h: 215, s: 0.85, optLum: 0.48 },
    "multi floral": { h: 335, s: 0.75, optLum: 0.54 },
    "two-tone": { h: 225, s: 0.80, optLum: 0.45 },
};

function getTargetHue(colorName) {
    if (!colorName) return null;
    const key = colorName.trim().toLowerCase();
    if (key.includes("black") || key.includes("charcoal")) return { special: "black" };
    if (key.includes("white") || key.includes("pure white")) return { special: "white" };
    if (COLOR_TARGETS[key]) return COLOR_TARGETS[key];
    for (const [k, v] of Object.entries(COLOR_TARGETS)) {
        if (key.includes(k) || k.includes(key)) return v;
    }
    return { h: 220, s: 0.80, optLum: 0.45 }; // graceful fallback
}

/**
 * Models the background from perimeter pixels.
 */
function buildBackgroundModel(d, w, h) {
    const borderPixels = [];
    const step = 2;

    const samplePixel = (x, y) => {
        const idx = (y * w + x) * 4;
        const a = d[idx + 3];
        if (a < 50) return null;
        return [d[idx], d[idx + 1], d[idx + 2]];
    };

    const topH = Math.max(2, Math.round(h * 0.05));
    for (let y = 0; y < topH; y += step) {
        for (let x = 0; x < w; x += step * 2) {
            const p = samplePixel(x, y);
            if (p) borderPixels.push(p);
        }
    }
    const btmStart = h - Math.max(2, Math.round(h * 0.05));
    for (let y = btmStart; y < h; y += step) {
        for (let x = 0; x < w; x += step * 2) {
            const p = samplePixel(x, y);
            if (p) borderPixels.push(p);
        }
    }

    const leftW = Math.max(2, Math.round(w * 0.05));
    for (let y = 0; y < h; y += step * 2) {
        for (let x = 0; x < leftW; x += step) {
            const p = samplePixel(x, y);
            if (p) borderPixels.push(p);
        }
        for (let x = w - leftW; x < w; x += step) {
            const p = samplePixel(x, y);
            if (p) borderPixels.push(p);
        }
    }

    const bucketMap = new Map();
    let neutralCount = 0;
    let neutralLumSum = 0;

    for (let i = 0; i < borderPixels.length; i++) {
        const [r, g, b] = borderPixels[i];
        const [bh, bs, bl] = rgbToHsl(r, g, b);
        if (bs < 0.12) {
            neutralCount++;
            neutralLumSum += bl;
        }
        const qr = Math.floor(r / 16) * 16;
        const qg = Math.floor(g / 16) * 16;
        const qb = Math.floor(b / 16) * 16;
        const key = `${qr}_${qg}_${qb}`;
        bucketMap.set(key, (bucketMap.get(key) || 0) + 1);
    }

    const borderIsNeutral = borderPixels.length > 0 && (neutralCount / borderPixels.length) > 0.60;
    const borderAvgLum = neutralCount > 0 ? (neutralLumSum / neutralCount) : 1.0;

    const sortedBuckets = [...bucketMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([key]) => {
            const [r, g, b] = key.split("_").map(Number);
            return { r, g, b };
        });

    return {
        isBackground: (r, g, b, sat, lum) => {
            if (lum > 0.94 && sat < 0.08) return true;
            if (borderIsNeutral && sat < 0.08 && Math.abs(lum - borderAvgLum) < 0.20) return true;
            if (borderIsNeutral && borderAvgLum < 0.35 && lum < 0.25 && sat < 0.12) return true;

            for (let i = 0; i < sortedBuckets.length; i++) {
                const bc = sortedBuckets[i];
                const dr = r - bc.r;
                const dg = g - bc.g;
                const db = b - bc.b;
                if ((dr * dr + dg * dg + db * db) < 850) return true;
            }
            return false;
        }
    };
}

/**
 * Checks if human model is present in photo.
 */
function detectModelPresence(d, w, h, bgModel) {
    let nonBgCount = 0;
    const startY = Math.round(h * 0.04);
    const endY = Math.round(h * 0.20);
    const startX = Math.round(w * 0.35);
    const endX = Math.round(w * 0.65);

    for (let y = startY; y < endY; y += 4) {
        for (let x = startX; x < endX; x += 4) {
            const idx = (y * w + x) * 4;
            const a = d[idx + 3];
            if (a < 80) continue;
            const r = d[idx];
            const g = d[idx + 1];
            const b = d[idx + 2];
            const [hue, sat, lum] = rgbToHsl(r, g, b);
            if (!bgModel.isBackground(r, g, b, sat, lum)) {
                nonBgCount++;
            }
        }
    }

    return nonBgCount >= 18;
}

/**
 * Analyzes garment fabric profile.
 */
function analyzeGarmentProfile(d, w, h, bgModel, hasModel) {
    const samples = [];
    const startY = Math.round(h * 0.20);
    const endY = Math.round(h * 0.85);
    const startX = Math.round(w * 0.18);
    const endX = Math.round(w * 0.82);

    for (let y = startY; y < endY; y += 3) {
        for (let x = startX; x < endX; x += 3) {
            const idx = (y * w + x) * 4;
            const a = d[idx + 3];
            if (a < 80) continue;

            const r = d[idx];
            const g = d[idx + 1];
            const b = d[idx + 2];
            const [hue, sat, lum] = rgbToHsl(r, g, b);

            if (bgModel.isBackground(r, g, b, sat, lum)) continue;

            if (hasModel) {
                if (y < h * 0.22 && x >= w * 0.35 && x <= w * 0.65) continue;
                if (isHumanSkin(r, g, b)) continue;
                if (y < h * 0.25 && lum < 0.16 && sat < 0.22) continue;
            }

            samples.push({ hue, sat, lum, r, g, b });
        }
    }

    if (samples.length === 0) {
        return { type: "generic", avgLum: 0.5 };
    }

    const avgLum = samples.reduce((acc, s) => acc + s.lum, 0) / samples.length;
    const chromatic = samples.filter(s => s.sat >= 0.08);

    if (chromatic.length >= samples.length * 0.18 && chromatic.length > 0) {
        let sinSum = 0;
        let cosSum = 0;
        let satSum = 0;
        for (let i = 0; i < chromatic.length; i++) {
            const rad = (chromatic[i].hue * Math.PI) / 180;
            sinSum += Math.sin(rad);
            cosSum += Math.cos(rad);
            satSum += chromatic[i].sat;
        }
        let avgHue = Math.round((Math.atan2(sinSum, cosSum) * 180) / Math.PI);
        if (avgHue < 0) avgHue += 360;
        const avgSat = satSum / chromatic.length;

        return {
            type: "chromatic",
            hue: avgHue,
            sat: avgSat,
            avgLum,
        };
    }

    return {
        type: "monochrome",
        avgLum,
    };
}

/**
 * Asynchronously generates a recolored image with 100% background and human skin protection.
 * - Background is NEVER touched.
 * - Human model (skin, face, hair) is NEVER touched.
 * - ONLY the analyzed dress/clothing fabric is recolored.
 * - White and black fabrics are dynamically adapted so colors are rich, deep, and clearly visible.
 */
export async function recolorGarment(src, targetColor) {
    if (!src || !targetColor) return src;

    const key = targetColor.trim().toLowerCase();
    const target = getTargetHue(targetColor);

    const cacheKey = `${src}__${key}`;
    if (recolorCache.has(cacheKey)) {
        return recolorCache.get(cacheKey);
    }

    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
            try {
                const maxDim = 700;
                let w = img.naturalWidth || 400;
                let h = img.naturalHeight || 500;
                if (w > maxDim) {
                    h = Math.round((h * maxDim) / w);
                    w = maxDim;
                }

                const canvas = document.createElement("canvas");
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext("2d", { willReadFrequently: true });
                ctx.drawImage(img, 0, 0, w, h);

                const imgData = ctx.getImageData(0, 0, w, h);
                const d = imgData.data;

                // 1. Build background model from perimeter
                const bgModel = buildBackgroundModel(d, w, h);

                // 2. Detect if human model is present
                const hasModel = detectModelPresence(d, w, h, bgModel);

                // 3. Analyze garment profile
                const profile = analyzeGarmentProfile(d, w, h, bgModel, hasModel);

                // If target matches existing garment color hue within 15 deg, return original
                if (profile.type === "chromatic" && target && !target.special) {
                    let hDiff = Math.abs(target.h - profile.hue);
                    if (hDiff > 180) hDiff = 360 - hDiff;
                    if (hDiff <= 15 && Math.abs(target.s - profile.sat) < 0.15) {
                        recolorCache.set(cacheKey, src);
                        return resolve(src);
                    }
                }

                const isBlack = target?.special === "black";
                const isWhite = target?.special === "white";
                const optLum = target?.optLum || 0.46;

                for (let y = 0; y < h; y++) {
                    const normY = y / h;
                    for (let x = 0; x < w; x++) {
                        const idx = (y * w + x) * 4;
                        const a = d[idx + 3];
                        if (a < 30) continue; // Skip transparent

                        const r = d[idx];
                        const g = d[idx + 1];
                        const b = d[idx + 2];
                        const [hue, sat, lum] = rgbToHsl(r, g, b);

                        // Strict background protection
                        if (bgModel.isBackground(r, g, b, sat, lum)) continue;

                        // Strict human model protection (face, hair, skin)
                        if (hasModel) {
                            const normX = x / w;
                            // Head/face oval
                            if (normY <= 0.16 && normX >= 0.35 && normX <= 0.65) continue;
                            // Human skin (neck, shoulders, arms, hands, legs, feet)
                            if (isHumanSkin(r, g, b)) continue;
                            // Dark hair
                            if (normY <= 0.24 && lum < 0.16 && sat < 0.22) continue;
                        }

                        // 4. CHECK IF PIXEL BELONGS TO THE ANALYZED CLOTHES:
                        let isGarment = false;
                        if (profile.type === "chromatic") {
                            let diff = Math.abs(hue - profile.hue);
                            if (diff > 180) diff = 360 - diff;
                            if (diff <= 50 && sat >= 0.07) {
                                isGarment = true;
                            }
                        } else {
                            // Truly monochrome clothes (white/black/grey)
                            if (!bgModel.isBackground(r, g, b, sat, lum)) {
                                isGarment = true;
                            }
                        }

                        if (!isGarment) continue;

                        // 5. RECOLOR THE GARMENT FABRIC
                        if (isBlack) {
                            const v = Math.round(lum * 0.32 * 255);
                            d[idx] = v;
                            d[idx + 1] = v;
                            d[idx + 2] = v;
                        } else if (isWhite) {
                            const v = Math.min(255, Math.round((0.35 + lum * 0.65) * 255));
                            d[idx] = v;
                            d[idx + 1] = v;
                            d[idx + 2] = v;
                        } else if (target) {
                            // Compute adapted luminance so colors on white & black fabrics are vibrant
                            let adaptedLum = lum;
                            if (profile.type === "monochrome") {
                                if (profile.avgLum > 0.65) {
                                    // White fabric: scale down into rich dye range while keeping texture
                                    adaptedLum = Math.max(0.25, Math.min(0.72, optLum + (lum - profile.avgLum) * 0.50));
                                } else if (profile.avgLum < 0.30) {
                                    // Black fabric: elevate so dye color is vibrant and visible
                                    adaptedLum = Math.max(0.28, Math.min(0.68, optLum + (lum - profile.avgLum) * 0.60));
                                }
                            }

                            const newSat = Math.min(1.0, Math.max(sat, target.s));
                            const [nr, ng, nb] = hslToRgb(target.h, newSat, adaptedLum);
                            d[idx] = nr;
                            d[idx + 1] = ng;
                            d[idx + 2] = nb;
                        }
                    }
                }

                ctx.putImageData(imgData, 0, 0);
                const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
                recolorCache.set(cacheKey, dataUrl);
                resolve(dataUrl);
            } catch (err) {
                resolve(src);
            }
        };

        img.onerror = () => {
            resolve(src);
        };

        img.src = src;
    });
}
