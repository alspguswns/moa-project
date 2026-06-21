const LIGHT = { bg: "#f5f5f5", bgCard: "#ffffff", text: "#333333", textSub: "#888888", divider: "#eeeeee", grid: "#e0e0e0" }
const DARK  = { bg: "#111827", bgCard: "#1f2937", text: "#f3f4f6", textSub: "#9ca3af", divider: "#374151", grid: "#1f2937" }

export const THEMES = [
    { id: "pink",     name: "기본 핑크", emoji: "🌸", price: 0,   primary: "#F4A7B9", light: "#fff0f3", border: "#ffd9e2", ...LIGHT },
    { id: "mint",     name: "민트",     emoji: "🌿", price: 150, primary: "#00b894", light: "#f0fff8", border: "#b2f0e0", ...LIGHT },
    { id: "lavender", name: "라벤더",   emoji: "💜", price: 150, primary: "#a29bfe", light: "#f4f0ff", border: "#d6d0ff", ...LIGHT },
    { id: "peach",    name: "피치",     emoji: "🧡", price: 200, primary: "#e17055", light: "#fff4f0", border: "#ffc0b0", ...LIGHT },
    { id: "sky",      name: "스카이",   emoji: "🩵", price: 200, primary: "#74b9ff", light: "#f0f8ff", border: "#c0dbff", ...LIGHT },
    { id: "charcoal", name: "다크",     emoji: "🖤", price: 300, primary: "#636e72", light: "#f5f5f5", border: "#dfe6e9", ...LIGHT },

    // 색약 접근성 테마 (무료)
    { id: "cb-blue",     name: "색약 블루", emoji: "🔵", price: 0, colorblind: true, primary: "#0072B2", light: "#e8f4fb", border: "#a8d4f0", ...LIGHT },
    { id: "cb-amber",    name: "색약 앰버", emoji: "🟡", price: 0, colorblind: true, primary: "#E69F00", light: "#fef9e7", border: "#fad7a0", ...LIGHT },
    { id: "cb-contrast", name: "고대비",    emoji: "⬛", price: 0, colorblind: true, primary: "#e2e8f0", light: "#374151", border: "#4b5563", ...DARK },
]

export function applyTheme(theme) {
    const r = document.documentElement.style
    r.setProperty("--moa-primary",  theme.primary)
    r.setProperty("--moa-light",    theme.light)
    r.setProperty("--moa-border",   theme.border)
    r.setProperty("--moa-bg",       theme.bg)
    r.setProperty("--moa-bg-card",  theme.bgCard)
    r.setProperty("--moa-text",     theme.text)
    r.setProperty("--moa-text-sub", theme.textSub)
    r.setProperty("--moa-divider",  theme.divider)
    r.setProperty("--moa-grid",     theme.grid)
}

const FREE_THEMES = THEMES.filter(t => t.price === 0).map(t => t.id)

export function getPurchasedThemes() {
    try {
        const saved = JSON.parse(localStorage.getItem("moa_purchased_themes") || "null")
        if (!saved) return FREE_THEMES
        // 무료 테마는 항상 보유 목록에 포함
        const merged = [...new Set([...FREE_THEMES, ...saved])]
        return merged
    } catch { return FREE_THEMES }
}

export function savePurchasedThemes(ids) {
    localStorage.setItem("moa_purchased_themes", JSON.stringify(ids))
}

export function getActiveThemeId() {
    return localStorage.getItem("moa_active_theme") || "pink"
}

export function setActiveThemeId(id) {
    localStorage.setItem("moa_active_theme", id)
}
