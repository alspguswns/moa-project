function BottomNav({ current, onHome, onHistory, onCalendar, onAnalysis, onWishlist }) {
    const items = [
        { key: "main", label: "🏠 홈", onClick: onHome },
        { key: "history", label: "📋 내역", onClick: onHistory },
        { key: "calendar", label: "📅 캘린더", onClick: onCalendar },
        { key: "analysis", label: "📊 분석", onClick: onAnalysis },
        { key: "wishlist", label: "🛍️ 위시", onClick: onWishlist },
    ]

    return (
        <div style={{
            position: "fixed", bottom: 0, left: "50%",
            transform: "translateX(-50%)",
            width: "360px", background: "white",
            borderTop: "1px solid #eee",
            display: "flex", justifyContent: "space-around",
            padding: "12px 0"
        }}>
            {items.map(item => (
                <button key={item.key} onClick={item.onClick} style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: "11px",
                    color: current === item.key ? "#F4A7B9" : "#aaa",
                    fontFamily: "'GriounPolice', cursive"
                }}>
                    {item.label}
                </button>
            ))}
        </div>
    )
}

export default BottomNav