import { useState, useEffect } from "react"

function MainPage({ onHome, onHistory, onAnalysis, onWishlist, onChat, onAddSpend, onLogout, userId: propUserId, current }) {
    const nickname = localStorage.getItem("nickname") || "사용자"
    const [transactions, setTransactions] = useState([])
    const [totalIncome, setTotalIncome] = useState(0)
    const [totalExpense, setTotalExpense] = useState(0)
    const [aiMessage, setAiMessage] = useState("")
    const [aiLoading, setAiLoading] = useState(true)

    useEffect(() => {
        const userId = propUserId || localStorage.getItem("user_id")
        if (!userId) {
            setAiLoading(false)
            return
        }
        fetch(`http://127.0.0.1:8000/expense/${userId}`)
            .then(res => res.json())
            .then(data => {
                const list = Array.isArray(data) ? data : []
                setTransactions(list)
                setTotalIncome(list.filter(t => t.type === "수입").reduce((sum, t) => sum + t.amount, 0))
                setTotalExpense(list.filter(t => t.type === "지출").reduce((sum, t) => sum + t.amount, 0))
            })
            .catch(e => console.error(e))
        fetch(`http://127.0.0.1:8000/ai/${userId}`)
            .then(res => res.json())
            .then(data => {
                setAiMessage(data.message)
                setAiLoading(false)
            })
            .catch(() => {
                setAiMessage("AI 분석을 불러오지 못했어요 😢")
                setAiLoading(false)
            })
    }, [])

    const recent = transactions.slice(-5).reverse()
    const balance = totalIncome - totalExpense
    const balancePercent = totalIncome > 0 ? Math.min((balance / totalIncome) * 100, 100) : 0

    const navItems = [
        { key: "main", icon: "🏠", onClick: onHome },
        { key: "history", icon: "📋", onClick: onHistory },
        { key: "analysis", icon: "📊", onClick: onAnalysis },
        { key: "wishlist", icon: "🛍️", onClick: onWishlist },
        { key: "chat", icon: "💬", onClick: onChat },
        { key: "logout", icon: "🚪", onClick: onLogout },
    ]

    return (
        <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'GriounPolice', cursive", backgroundImage: `linear-gradient(#e0e0e0 1px, transparent 1px), linear-gradient(90deg, #e0e0e0 1px, transparent 1px)`, backgroundSize: "28px 28px", backgroundColor: "#f5f5f5" }}>
            <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "64px", background: "white", borderBottom: "1px solid #eee", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", boxSizing: "border-box" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={onHome}>
                    <span style={{ fontSize: "28px" }}>🐷</span>
                    <span style={{ fontSize: "22px", fontWeight: "700", color: "#F4A7B9" }}>MOA</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <span style={{ fontSize: "20px", cursor: "pointer" }}>🔔</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f5f5f5", borderRadius: "20px", padding: "6px 12px", cursor: "pointer" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#F4A7B9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "white" }}>
                            {nickname[0]}
                        </div>
                        <span style={{ fontSize: "13px", color: "#333", fontWeight: "600" }}>{nickname}</span>
                        <span style={{ fontSize: "11px", color: "#aaa" }}>▾</span>
                    </div>
                </div>
            </div>

            <div style={{ position: "fixed", top: "64px", left: 0, width: "72px", height: "calc(100vh - 64px)", background: "white", borderRight: "1px solid #eee", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0", gap: "12px", zIndex: 100 }}>
                {navItems.map(item => (
                    <div key={item.key} onClick={item.onClick} style={{ width: "48px", height: "48px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", cursor: "pointer", background: current === item.key ? "#fff0f3" : "transparent", border: current === item.key ? "1.5px solid #F4A7B9" : "1.5px solid transparent" }}>
                        {item.icon}
                    </div>
                ))}
            </div>

            <div style={{ marginLeft: "72px", marginTop: "64px", flex: 1, display: "flex", padding: "32px", gap: "28px", boxSizing: "border-box", minHeight: "calc(100vh - 64px)" }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#111", marginBottom: "24px" }}>
                        안녕하세요 {nickname}님 👋
                    </h2>

                    <div style={{ background: "#F4A7B9", borderRadius: "20px", padding: "24px", color: "white", marginBottom: "28px", boxShadow: "0 4px 10px rgba(244,167,185,0.3)" }}>
                        <p style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "600" }}>이번 달 요약</p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                            <div style={{ background: "white", borderRadius: "14px", padding: "16px", textAlign: "center" }}>
                                <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#333", fontWeight: "500" }}>Income</p>
                                <p style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "#111" }}>
                                    +{totalIncome.toLocaleString()}원
                                </p>
                            </div>
                            <div style={{ background: "white", borderRadius: "14px", padding: "16px", textAlign: "center" }}>
                                <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#333", fontWeight: "500" }}>Expense</p>
                                <p style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "#111" }}>
                                    -{totalExpense.toLocaleString()}원
                                </p>
                            </div>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.3)", borderRadius: "10px", padding: "12px 16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <span style={{ fontSize: "13px", fontWeight: "600" }}>Balance</span>
                                <span style={{ fontSize: "14px", fontWeight: "700" }}>+{balance.toLocaleString()}원</span>
                            </div>
                            <div style={{ background: "rgba(255,255,255,0.4)", borderRadius: "6px", height: "10px" }}>
                                <div style={{ width: `${balancePercent}%`, height: "10px", background: "#9b59b6", borderRadius: "6px", transition: "width 0.5s" }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ background: "white", borderRadius: "16px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                        <p style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "700", color: "#111" }}>최근 내역</p>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                            <thead>
                            <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                                {["Memo", "Category", "Date", "Amount"].map(h => (
                                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "#111", fontWeight: "600" }}>{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {recent.length === 0 ? (
                                <tr><td colSpan={4} style={{ textAlign: "center", padding: "20px", color: "#aaa" }}>내역이 없어요!</td></tr>
                            ) : (
                                recent.map(item => (
                                    <tr key={item.id} style={{ borderBottom: "1px solid #f9f9f9" }}>
                                        <td style={{ padding: "12px", color: "#111", fontWeight: "500" }}>{item.memo || "메모 없음"}</td>
                                        <td style={{ padding: "12px", color: "#555" }}>{item.category}</td>
                                        <td style={{ padding: "12px", color: "#555" }}>{item.date}</td>
                                        <td style={{ padding: "12px", fontWeight: "700", color: item.type === "지출" ? "#F4A7B9" : "#7F77DD" }}>
                                            {item.type === "지출" ? "-" : "+"}{item.amount.toLocaleString()}원
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                        <button onClick={onAddSpend} style={{
                            width: "100%", marginTop: "20px", padding: "16px", borderRadius: "12px",
                            background: "#F4A7B9", color: "white", border: "none",
                            fontSize: "15px", fontWeight: "700", cursor: "pointer",
                            fontFamily: "'GriounPolice', cursive"
                        }}>
                            + 지출 추가하기
                        </button>
                    </div>
                </div>

                <div style={{ width: "220px", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", paddingTop: "48px" }}>
                    <div style={{ background: "#fff0f3", borderRadius: "14px", padding: "14px 16px", width: "100%", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", border: "1px solid #F4A7B9", position: "relative" }}>
                        <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#333", fontWeight: "700" }}>🐷 MOA의 한마디</p>
                        <p style={{ margin: 0, fontSize: "13px", color: "#111", lineHeight: 1.6 }}>
                            {aiLoading ? "분석 중이에요..." : aiMessage}
                        </p>
                        <div style={{ position: "absolute", bottom: "-10px", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "10px solid #F4A7B9" }} />
                    </div>
                    <div style={{ width: "120px", height: "120px", borderRadius: "50%", background: "#fff0f3", border: "4px solid #F4A7B9", boxShadow: "0 0 20px rgba(244,167,185,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "64px", marginTop: "12px" }}>
                        🐷
                    </div>
                    <p style={{ margin: 0, fontSize: "16px", color: "#111", fontWeight: "700" }}>MOA Lv.1</p>
                </div>
            </div>
        </div>
    )
}

export default MainPage