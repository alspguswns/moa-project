import { useState } from "react"

function Header({ onHome, onHistory, onAnalysis, onWishlist, onChat, current, onLogout }) {
    const [menuOpen, setMenuOpen] = useState(false)

    const navItems = [
        { key: "main", label: "🏠 홈", onClick: onHome },
        { key: "history", label: "📋 내역", onClick: onHistory },
        { key: "analysis", label: "📊 분석", onClick: onAnalysis },
        { key: "wishlist", label: "🛍️ 위시", onClick: onWishlist },
        { key: "chat", label: "💬 AI", onClick: onChat },
    ]

    return (
        <header style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
            background: "var(--moa-bg-card)", borderBottom: "1px solid #eee",
            padding: "0 32px", height: "60px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            fontFamily: "'GriounPolice', cursive"
        }}>
            {/* 로고 */}
            <div onClick={onHome} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <span style={{ fontSize: "24px" }}>🐷</span>
                <span style={{ fontSize: "20px", fontWeight: "700", color: "var(--moa-primary)" }}>MOA</span>
            </div>

            {/* 우측 버튼들 */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative" }}>
                {/* 프로필 */}
                <div style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: "var(--moa-light)", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "18px", cursor: "pointer",
                    border: "1px solid var(--moa-primary)"
                }}>
                    👤
                </div>

                {/* 메뉴 버튼 */}
                <div onClick={() => setMenuOpen(prev => !prev)} style={{
                    width: "36px", height: "36px", borderRadius: "8px",
                    background: "#f5f5f5", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "20px", cursor: "pointer",
                    border: "1px solid #eee"
                }}>
                    ☰
                </div>

                {/* 드롭다운 메뉴 */}
                {menuOpen && (
                    <div style={{
                        position: "absolute", top: "48px", right: 0,
                        background: "var(--moa-bg-card)", borderRadius: "14px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        border: "1px solid #eee", padding: "8px",
                        minWidth: "160px", zIndex: 100
                    }}>
                        {navItems.map(item => (
                            <div key={item.key} onClick={() => { item.onClick(); setMenuOpen(false) }} style={{
                                padding: "10px 16px", borderRadius: "8px", cursor: "pointer",
                                fontSize: "14px", color: current === item.key ? "var(--moa-primary)" : "#333",
                                background: current === item.key ? "var(--moa-light)" : "transparent",
                                fontWeight: current === item.key ? "700" : "400"
                            }}>
                                {item.label}
                            </div>
                        ))}
                        <div style={{ borderTop: "1px solid #eee", marginTop: "4px", paddingTop: "4px" }}>
                            <div onClick={onLogout} style={{
                                padding: "10px 16px", borderRadius: "8px", cursor: "pointer",
                                fontSize: "14px", color: "var(--moa-text-sub)"
                            }}>
                                🚪 로그아웃
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}

export default Header