function MobileBottomNav({ navItems, current }) {
    const labels = {
        main: "홈", history: "내역", analysis: "분석",
        wishlist: "위시", chat: "AI", game: "게임", shop: "테마", friends: "친구", logout: "로그아웃"
    }
    return (
        <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0,
            background: "var(--moa-bg-card)", borderTop: "2px solid var(--moa-border)",
            display: "flex", justifyContent: "space-around", alignItems: "center",
            padding: "8px 0 max(8px, env(safe-area-inset-bottom))",
            zIndex: 300
        }}>
            {navItems.map(item => (
                <button key={item.key} onClick={item.onClick} style={{
                    background: "none", border: "none", cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: "2px", padding: "4px 6px", minWidth: "40px"
                }}>
                    <span style={{ fontSize: "20px", lineHeight: 1 }}>{item.icon}</span>
                    <span style={{
                        fontSize: "9px", fontFamily: "'GriounPolice', cursive",
                        color: current === item.key ? "var(--moa-primary)" : "#aaa",
                        fontWeight: current === item.key ? "700" : "400"
                    }}>
                        {labels[item.key] || ""}
                    </span>
                </button>
            ))}
        </div>
    )
}

export default MobileBottomNav
