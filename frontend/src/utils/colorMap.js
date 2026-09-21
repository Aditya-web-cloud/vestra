/**
 * Color mapping utilities for VESTRA products
 * Provides visual color representations (hex, gradients) and styling helpers.
 */

const COLOR_MAP = {
    // Monochromes
    "black": "#18181b",
    "midnight black": "#09090b",
    "white": "#ffffff",
    "classic white": "#ffffff",
    "pure white": "#ffffff",
    "grey": "#6b7280",
    "slate grey": "#475569",
    "charcoal": "#27272a",
    "charcoal black": "#18181b",

    // Pinks & Purples
    "magenta": "#be185d",
    "pink": "#ec4899",
    "blush pink": "#f472b6",
    "peachy pink": "#fb7185",
    "lavender": "#c084fc",
    "purple": "#7e22ce",
    "plum": "#701a75",
    "berry rose": "#9f1239",
    "ivory rose": "#f2d6d0",

    // Reds & Oranges
    "red": "#dc2626",
    "ruby red": "#991b1b",
    "maroon": "#831843",
    "coral": "#f97316",
    "coral peach": "#fb923c",
    "sunset orange": "#ea580c",
    "peach": "#fdba74",

    // Blues
    "blue": "#2563eb",
    "light blue": "#60a5fa",
    "sky blue": "#38bdf8",
    "cobalt": "#1d4ed8",
    "navy": "#1e3a8a",
    "navy blue": "#172554",
    "royal navy": "#1e3a8a",
    "royal blue": "#1d4ed8",
    "dark indigo": "#1e1b4b",
    "denim": "#2563eb",
    "denim blue": "#3b82f6",
    "chambray": "#93c5fd",
    "baby blue": "#bae6fd",
    "soft blue": "#7dd3fc",

    // Greens
    "emerald": "#047857",
    "emerald green": "#065f46",
    "green": "#16a34a",
    "forest green": "#14532d",
    "olive": "#4d7c0f",
    "olive green": "#3f6212",
    "sage": "#84a98c",
    "sage green": "#84a98c",
    "mint green": "#34d399",

    // Yellows & Earth
    "yellow": "#eab308",
    "sunny yellow": "#facc15",
    "mustard": "#d97706",
    "mustard yellow": "#d97706",
    "cream": "#fef3c7",
    "beige": "#f5f5dc",
    "warm beige": "#e6dec8",
    "ivory": "#fef9c3",
    "tan brown": "#b45309",
    "brown": "#78350f",
    "amber": "#d97706",
    "warm amber": "#b45309",

    // Metallics (Gradients)
    "gold": "linear-gradient(135deg, #fef08a 0%, #ca8a04 100%)",
    "yellow gold": "linear-gradient(135deg, #fef08a 0%, #ca8a04 100%)",
    "royal gold": "linear-gradient(135deg, #fef08a 0%, #a16207 100%)",
    "antique gold": "linear-gradient(135deg, #fde047 0%, #854d0e 100%)",
    "rose gold": "linear-gradient(135deg, #fce7f3 0%, #be185d 100%)",
    "silver": "linear-gradient(135deg, #f3f4f6 0%, #9ca3af 100%)",
    "antique silver": "linear-gradient(135deg, #e5e7eb 0%, #6b7280 100%)",
    "oxidised silver": "linear-gradient(135deg, #d1d5db 0%, #4b5563 100%)",
    "platinum": "linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)",

    // Multicolors & Special
    "multicolor": "linear-gradient(135deg, #ef4444 0%, #f59e0b 33%, #10b981 66%, #3b82f6 100%)",
    "multi": "linear-gradient(135deg, #ef4444 0%, #f59e0b 33%, #10b981 66%, #3b82f6 100%)",
    "colorblock": "linear-gradient(135deg, #3b82f6 0%, #f43f5e 50%, #10b981 100%)",
    "natural": "#e2e8f0",
};

/**
 * Returns a CSS style object for swatch backgrounds
 */
export function getColorStyle(colorName) {
    if (!colorName || typeof colorName !== "string") {
        return { background: "#e5e7eb" };
    }

    const key = colorName.trim().toLowerCase();

    // Direct match
    if (COLOR_MAP[key]) {
        const val = COLOR_MAP[key];
        const isGradient = val.startsWith("linear-gradient");
        const isWhiteOrLight =
            key.includes("white") ||
            key.includes("cream") ||
            key.includes("ivory") ||
            key.includes("natural");

        return {
            background: val,
            border: isWhiteOrLight ? "1px solid #d1d5db" : "1px solid transparent",
        };
    }

    // Substring matches
    for (const [mapKey, mapVal] of Object.entries(COLOR_MAP)) {
        if (key.includes(mapKey) || mapKey.includes(key)) {
            const isWhiteOrLight =
                key.includes("white") ||
                key.includes("cream") ||
                key.includes("ivory");
            return {
                background: mapVal,
                border: isWhiteOrLight ? "1px solid #d1d5db" : "1px solid transparent",
            };
        }
    }

    // Deterministic fallback based on hash
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return {
        background: `hsl(${h}, 55%, 50%)`,
        border: "1px solid transparent",
    };
}

const COLOR_HUES = {
    "red": 0,
    "ruby": 350,
    "ruby red": 350,
    "maroon": 340,
    "coral": 18,
    "coral peach": 24,
    "sunset orange": 24,
    "peach": 28,
    "mustard": 42,
    "mustard yellow": 42,
    "yellow": 48,
    "sunny yellow": 48,
    "amber": 38,
    "warm amber": 38,
    "olive": 78,
    "olive green": 78,
    "sage": 115,
    "sage green": 115,
    "green": 130,
    "emerald": 145,
    "emerald green": 145,
    "forest green": 135,
    "mint green": 160,
    "sky blue": 195,
    "light blue": 200,
    "soft blue": 200,
    "baby blue": 200,
    "chambray": 210,
    "denim": 215,
    "denim blue": 215,
    "blue": 220,
    "cobalt": 225,
    "royal blue": 225,
    "navy": 235,
    "navy blue": 235,
    "royal navy": 235,
    "dark indigo": 245,
    "indigo": 245,
    "purple": 270,
    "lavender": 265,
    "plum": 285,
    "magenta": 315,
    "pink": 330,
    "blush pink": 335,
    "peachy pink": 340,
    "berry rose": 340,
    "ivory rose": 345,
};

function findHue(name) {
    if (!name || typeof name !== "string") return null;
    const key = name.trim().toLowerCase();
    if (COLOR_HUES[key] !== undefined) return COLOR_HUES[key];
    for (const [k, v] of Object.entries(COLOR_HUES)) {
        if (key.includes(k) || k.includes(key)) return v;
    }
    return null;
}

/**
 * Maps a selected color to a CSS filter for realistic preview transformation
 * when an image doesn't have an explicit variant photograph.
 */
export function getColorFilter(colorName, baseColorName) {
    if (!colorName || typeof colorName !== "string") {
        return "none";
    }

    const key = colorName.trim().toLowerCase();
    const baseKey = (baseColorName || "").trim().toLowerCase();

    // If active color is the base/original color of the product, keep original photograph
    if (baseKey && key === baseKey) {
        return "none";
    }

    // Monochromes & metallics
    if (key.includes("black") || key.includes("charcoal")) {
        return "brightness(0.55) contrast(1.3) grayscale(0.85)";
    }
    if (key.includes("white")) {
        return "brightness(1.38) contrast(0.92) saturate(0.2)";
    }
    if (key.includes("silver") || key.includes("platinum")) {
        return "grayscale(0.9) brightness(1.08) contrast(1.06)";
    }
    if (key.includes("gold") || key.includes("antique gold")) {
        return "sepia(0.65) hue-rotate(15deg) saturate(1.45) brightness(1.05)";
    }
    if (key.includes("rose gold")) {
        return "sepia(0.4) hue-rotate(315deg) saturate(1.35)";
    }
    if (key.includes("beige") || key.includes("cream") || key.includes("ivory")) {
        return "sepia(0.3) brightness(1.1) saturate(0.8)";
    }
    if (key.includes("brown") || key.includes("tan")) {
        return "sepia(0.55) hue-rotate(345deg) saturate(1.2) brightness(0.88)";
    }

    // Dynamic hue delta calculation based on base color
    const targetHue = findHue(colorName);
    const baseHue = findHue(baseColorName) ?? 0;

    if (targetHue !== null) {
        const delta = (targetHue - baseHue + 360) % 360;
        let brightness = "1";
        if (key.includes("navy") || key.includes("indigo") || key.includes("forest")) {
            brightness = "0.88";
        } else if (key.includes("yellow") || key.includes("mustard") || key.includes("light")) {
            brightness = "1.06";
        }
        return `hue-rotate(${delta}deg) saturate(1.35) contrast(1.05) brightness(${brightness})`;
    }

    return "hue-rotate(90deg) saturate(1.2)";
}

/**
 * Returns a subtle tint overlay for enhanced realism
 */
export function getColorTint(colorName, baseColorName) {
    if (!colorName || typeof colorName !== "string") return "transparent";
    const key = colorName.trim().toLowerCase();
    const baseKey = (baseColorName || "").trim().toLowerCase();

    if (baseKey && key === baseKey) return "transparent";

    if (key.includes("black") || key.includes("charcoal")) return "rgba(18, 18, 24, 0.42)";
    if (key.includes("white")) return "rgba(255, 255, 255, 0.38)";
    if (key.includes("emerald") || key.includes("green")) return "rgba(6, 95, 70, 0.45)";
    if (key.includes("ruby") || key.includes("red") || key.includes("maroon")) return "rgba(185, 28, 28, 0.42)";
    if (key.includes("magenta")) return "rgba(190, 24, 93, 0.42)";
    if (key.includes("navy") || key.includes("blue") || key.includes("cobalt") || key.includes("indigo")) return "rgba(30, 58, 138, 0.42)";
    if (key.includes("pink") || key.includes("blush")) return "rgba(236, 72, 153, 0.4)";
    if (key.includes("lavender") || key.includes("purple") || key.includes("plum")) return "rgba(147, 51, 234, 0.4)";
    if (key.includes("gold") || key.includes("yellow") || key.includes("mustard") || key.includes("amber")) return "rgba(217, 119, 6, 0.4)";
    if (key.includes("rose gold")) return "rgba(225, 29, 72, 0.38)";
    if (key.includes("coral") || key.includes("orange") || key.includes("peach")) return "rgba(234, 88, 12, 0.4)";
    if (key.includes("olive") || key.includes("sage")) return "rgba(77, 124, 15, 0.4)";
    if (key.includes("silver") || key.includes("platinum")) return "rgba(203, 213, 225, 0.35)";

    return "rgba(120, 120, 120, 0.25)";
}

