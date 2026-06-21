import { useState, useEffect } from "react"
import { API } from "../config.js"
import MobileBottomNav from "../components/MobileBottomNav"
import { THEMES, applyTheme, getPurchasedThemes, savePurchasedThemes, getActiveThemeId, setActiveThemeId } from "../themes.js"

function ThemeShopPage({ onHome, onHistory, onAnalysis, onWishlist, onChat, onGame, onShop, onFriends, onLogout, current, isMobile }) {
    const userId = parseInt(localStorage.getItem("user_id"))
    const [seeds, setSeeds] = useState(0)
    const [purchased, setPurchased] = useState(getPurchasedThemes)
    const [activeId, setActiveId] = useState(getActiveThemeId)
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState(null)
    const [previewingId, setPreviewingId] = useState(null)
    const [modalConfig, setModalConfig] = useState({ isOpen: false, message: "", onConfirm: null })

    const navItems = [
        { key: "main",    icon: "🏠", onClick: onHome },
        { key: "history", icon: "📋", onClick: onHistory },
        { key: "analysis",icon: "📊", onClick: onAnalysis },
        { key: "wishlist", icon: "🛍️", onClick: onWishlist },
        { key: "chat",    icon: "💬", onClick: onChat },
        { key: "game",    icon: "🎮", onClick: onGame },
        { key: "shop",    icon: "🎨", onClick: onShop },
        { key: "friends", icon: "👥", onClick: onFriends },
        { key: "logout",  icon: "🚪", onClick: () => setModalConfig({
            isOpen: true, message: "정말로 로그아웃 하시겠습니까? 🐷",
            onConfirm: () => { setModalConfig({ isOpen: false }); onLogout() }
        })},
    ]

    const showToast = (msg, type = "success") => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 2500)
    }

    useEffect(() => {
        if (!userId) return
        fetch(`${API}/game/seeds/${userId}`)
            .then(r => r.json())
            .then(d => setSeeds(d.seeds || 0))
            .catch(() => {})
    }, [userId])

    const handleBuy = async (theme) => {
        if (purchased.includes(theme.id)) return
        if (seeds < theme.price) { showToast("씨앗이 부족해요!", "error"); return }

        setLoading(true)
        try {
            const res = await fetch(`${API}/game/spend-seeds`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, amount: theme.price })
            })
            if (!res.ok) { showToast("구매에 실패했어요.", "error"); return }
            const data = await res.json()
            const next = [...purchased, theme.id]
            setPurchased(next)
            savePurchasedThemes(next)
            setSeeds(data.remaining_seeds)
            showToast(`${theme.emoji} ${theme.name} 테마를 구매했어요!`)
        } catch {
            showToast("서버 오류가 발생했어요.", "error")
        } finally {
            setLoading(false)
        }
    }

    const handlePreview = (theme) => {
        applyTheme(theme)
        setPreviewingId(theme.id)
    }

    const cancelPreview = () => {
        const original = THEMES.find(t => t.id === activeId)
        if (original) applyTheme(original)
        setPreviewingId(null)
    }

    const renderCard = (theme, owned, active, previewing) => (
        <div key={theme.id} style={{ background: "var(--moa-bg-card)", borderRadius: "20px", padding: "20px", boxShadow: previewing ? `0 0 0 2.5px ${theme.primary}, 0 4px 20px rgba(0,0,0,0.1)` : active ? `0 0 0 2.5px ${theme.primary}` : "0 2px 12px rgba(0,0,0,0.06)", border: (active || previewing) ? `1px solid ${theme.primary}` : "1px solid #f0f0f0", transition: "all 0.2s", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: theme.primary, flexShrink: 0 }} />
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: theme.light, border: `1px solid ${theme.border}`, flexShrink: 0 }} />
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: theme.border, flexShrink: 0 }} />
                {previewing && <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "700", color: theme.primary, background: theme.light, padding: "2px 8px", borderRadius: "100px", border: `1px solid ${theme.border}` }}>👁 미리보기 중</span>}
                {active && !previewing && <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "700", color: theme.primary, background: theme.light, padding: "2px 8px", borderRadius: "100px", border: `1px solid ${theme.border}` }}>적용중</span>}
            </div>
            <div>
                <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--moa-text)" }}>{theme.emoji} {theme.name}</div>
                <div style={{ fontSize: "12px", color: "var(--moa-text-sub)", marginTop: "2px" }}>
                    {theme.price === 0 ? "무료" : `🌱 ${theme.price} 씨앗`}
                </div>
            </div>
            {!previewing && !active && (
                <button onClick={() => handlePreview(theme)} style={{ width: "100%", padding: "8px", borderRadius: "10px", border: `1.5px solid ${theme.primary}`, fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", background: "var(--moa-bg-card)", color: theme.primary, transition: "all 0.2s" }}>
                    👁 미리보기
                </button>
            )}
            {owned ? (
                <button onClick={() => handleApply(theme)} disabled={active} style={{ width: "100%", padding: "9px", borderRadius: "10px", border: "none", fontSize: "12px", fontWeight: "700", cursor: active ? "default" : "pointer", fontFamily: "inherit", background: active ? theme.light : theme.primary, color: active ? theme.primary : "white", transition: "all 0.2s" }}>
                    {active ? "현재 테마" : "적용하기"}
                </button>
            ) : (
                <button onClick={() => handleBuy(theme)} disabled={loading || seeds < theme.price} style={{ width: "100%", padding: "9px", borderRadius: "10px", border: `1px solid ${seeds >= theme.price ? theme.primary : "#ddd"}`, fontSize: "12px", fontWeight: "700", cursor: loading || seeds < theme.price ? "default" : "pointer", fontFamily: "inherit", background: seeds >= theme.price ? theme.light : "#f5f5f5", color: seeds >= theme.price ? theme.primary : "#bbb", transition: "all 0.2s" }}>
                    {seeds < theme.price ? "씨앗 부족" : "구매하기"}
                </button>
            )}
        </div>
    )

    const handleApply = (theme) => {
        applyTheme(theme)
        setActiveId(theme.id)
        setActiveThemeId(theme.id)
        setPreviewingId(null)
        showToast(`${theme.emoji} ${theme.name} 테마가 적용됐어요!`)
    }

    return (
        <div style={{
            display: "flex", height: isMobile ? "auto" : "100vh", minHeight: "100vh",
            width: "100vw", fontFamily: "'GriounPolice', cursive",
            backgroundImage: `linear-gradient(var(--moa-grid) 1px, transparent 1px), linear-gradient(90deg, var(--moa-grid) 1px, transparent 1px)`,
            backgroundSize: "28px 28px", backgroundColor: "var(--moa-bg)",
            overflow: isMobile ? "auto" : "hidden", boxSizing: "border-box"
        }}>

            {/* 커스텀 모달 */}
            {modalConfig.isOpen && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(2px)" }}>
                    <div style={{ background: "var(--moa-bg-card)", borderRadius: "20px", padding: "24px", width: "320px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", border: "1px solid var(--moa-border)" }}>
                        <span style={{ fontSize: "36px", display: "block", marginBottom: "12px" }}>🐷</span>
                        <p style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: "600", color: "var(--moa-text)" }}>{modalConfig.message}</p>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                            <button onClick={() => setModalConfig({ isOpen: false })} style={{ flex: 1, padding: "10px", background: "#eee", border: "none", borderRadius: "10px", fontSize: "13px", cursor: "pointer", fontWeight: "600", color: "var(--moa-text)", fontFamily: "inherit" }}>취소</button>
                            <button onClick={modalConfig.onConfirm} style={{ flex: 1, padding: "10px", background: "var(--moa-primary)", border: "none", borderRadius: "10px", fontSize: "13px", cursor: "pointer", fontWeight: "600", color: "white", fontFamily: "inherit" }}>확인</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 미리보기 배너 */}
            {previewingId && (() => {
                const pt = THEMES.find(t => t.id === previewingId)
                const owned = purchased.includes(previewingId)
                const isActive = activeId === previewingId
                return (
                    <div style={{ position: "fixed", top: "64px", left: 0, right: 0, zIndex: 250, background: pt.primary, color: "white", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                        <span style={{ fontSize: "13px", fontWeight: "700" }}>👁 {pt.emoji} {pt.name} 미리보기 중</span>
                        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                            <button onClick={cancelPreview} style={{ padding: "6px 14px", borderRadius: "100px", border: "1.5px solid rgba(255,255,255,0.7)", background: "transparent", color: "white", fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>취소</button>
                            {!isActive && (
                                owned
                                    ? <button onClick={() => handleApply(pt)} style={{ padding: "6px 14px", borderRadius: "100px", border: "none", background: "var(--moa-bg-card)", color: pt.primary, fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>적용하기</button>
                                    : <button onClick={async () => { await handleBuy(pt); handleApply(pt) }} disabled={seeds < pt.price || loading} style={{ padding: "6px 14px", borderRadius: "100px", border: "none", background: seeds >= pt.price ? "white" : "rgba(255,255,255,0.4)", color: seeds >= pt.price ? pt.primary : "white", fontSize: "12px", fontWeight: "700", cursor: seeds >= pt.price ? "pointer" : "default", fontFamily: "inherit" }}>{seeds < pt.price ? "씨앗 부족" : "구매 후 적용"}</button>
                            )}
                        </div>
                    </div>
                )
            })()}

            {/* 토스트 */}
            {toast && (
                <div style={{ position: "fixed", bottom: isMobile ? "90px" : "32px", left: "50%", transform: "translateX(-50%)", background: toast.type === "error" ? "#ff6b6b" : "#333", color: "white", padding: "10px 20px", borderRadius: "100px", fontSize: "13px", fontWeight: "600", zIndex: 999, whiteSpace: "nowrap" }}>
                    {toast.msg}
                </div>
            )}

            {/* 상단 GNB */}
            <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "64px", background: "var(--moa-bg-card)", borderBottom: "1px solid #eee", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", boxSizing: "border-box" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={onHome}>
                    <span style={{ fontSize: "28px" }}>🐷</span>
                    <span style={{ fontSize: "22px", fontWeight: "700", color: "var(--moa-primary)" }}>MOA</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--moa-light)", borderRadius: "20px", padding: "6px 14px", border: "1px solid var(--moa-border)" }}>
                    <span style={{ fontSize: "16px" }}>🌱</span>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--moa-primary)" }}>{seeds.toLocaleString()} 씨앗</span>
                </div>
            </div>

            {/* 사이드바 (PC) */}
            {!isMobile && (
                <div style={{ position: "fixed", top: "64px", left: 0, width: "72px", height: "calc(100vh - 64px)", background: "var(--moa-bg-card)", borderRight: "1px solid #eee", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0", gap: "12px", zIndex: 100 }}>
                    {navItems.map(item => (
                        <div key={item.key} onClick={item.onClick} style={{ width: "48px", height: "48px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", cursor: "pointer", background: current === item.key ? "var(--moa-light)" : "transparent", border: current === item.key ? `1.5px solid var(--moa-primary)` : "1.5px solid transparent", transition: "all 0.2s" }}>
                            {item.icon}
                        </div>
                    ))}
                </div>
            )}

            {/* 메인 영역 */}
            <div style={{ marginLeft: isMobile ? 0 : "72px", marginTop: "64px", width: isMobile ? "100%" : "calc(100vw - 72px)", padding: isMobile ? "20px 16px 100px" : "32px 40px", boxSizing: "border-box", overflowY: "auto", height: isMobile ? "auto" : "calc(100vh - 64px)" }}>

                <div style={{ marginBottom: "24px" }}>
                    <h2 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: "800", color: "var(--moa-text)" }}>🎨 테마 상점</h2>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--moa-text-sub)" }}>씨앗으로 테마를 구매하고 앱 색상을 바꿔보세요</p>
                </div>

                {/* 색약 접근성 테마 섹션 */}
                <div style={{ marginBottom: "28px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                        <span style={{ fontSize: "16px", fontWeight: "800", color: "var(--moa-text)" }}>♿ 색약 접근성 테마</span>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#27ae60", background: "#eafaf1", padding: "2px 8px", borderRadius: "100px", border: "1px solid #a9dfbf" }}>전부 무료</span>
                    </div>
                    <p style={{ margin: "0 0 14px", fontSize: "12px", color: "var(--moa-text-sub)", lineHeight: "1.6" }}>
                        색맹·색약이 있는 분들을 위해 구분하기 쉬운 색상 조합으로 만들었어요.<br />
                        🔵 블루 — 적녹 색약 / 🟡 앰버 — 청황 색약 / ⬛ 고대비 — 저시력
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: "16px" }}>
                        {THEMES.filter(t => t.colorblind).map(theme => {
                            const owned = purchased.includes(theme.id)
                            const active = activeId === theme.id
                            const previewing = previewingId === theme.id
                            return renderCard(theme, owned, active, previewing)
                        })}
                    </div>
                </div>

                <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--moa-text)", marginBottom: "12px" }}>✨ 일반 테마</div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: "16px" }}>
                    {THEMES.filter(t => !t.colorblind).map(theme => {
                        const owned = purchased.includes(theme.id)
                        const active = activeId === theme.id
                        const previewing = previewingId === theme.id
                        return renderCard(theme, owned, active, previewing)
                    })}
                </div>
            </div>

            {isMobile && <MobileBottomNav navItems={navItems} current={current} />}
        </div>
    )
}

export default ThemeShopPage
