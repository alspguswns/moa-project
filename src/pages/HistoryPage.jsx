import { useState, useEffect } from "react"
import BottomNav from "../components/BottomNav"

function HistoryPage({ onBack, onHome, onHistory, onCalendar, onAnalysis, onWishlist, onChat, current }) {
    const [transactions, setTransactions] = useState([])
    const [filter, setFilter] = useState("전체")

    useEffect(() => {
        const userId = localStorage.getItem("user_id")
        if (!userId) return

        fetch(`http://127.0.0.1:8000/expense/${userId}`)
            .then((res) => res.json())
            .then((data) => {
                const list = Array.isArray(data) ? data : []
                setTransactions(list)
            })
            .catch((e) => console.error(e))
    }, [])

    const handleDelete = async (id) => {
        await fetch(`http://127.0.0.1:8000/expense/${id}`, { method: "DELETE" })
        setTransactions(prev => prev.filter(t => t.id !== id))
    }

    const filtered = transactions.filter((item) => {
        if (filter === "전체") return true
        return item.type === filter
    })

    return (
        <div style={{
            minHeight: "100vh",
            backgroundImage: `linear-gradient(#e0e0e0 1px, transparent 1px), linear-gradient(90deg, #e0e0e0 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
            backgroundColor: "#f5f5f5",
            padding: "24px 20px",
            boxSizing: "border-box",
            fontFamily: "'GriounPolice', cursive"
        }}>
            <div style={{ maxWidth: "360px", margin: "0 auto" }}>

                {/* 헤더 */}
                <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ margin: 0, fontSize: "20px" }}>📋 소비내역</h2>
                </div>

                {/* 필터 버튼 */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                    {["전체", "지출", "수입"].map((f) => (
                        <button key={f} onClick={() => setFilter(f)} style={{
                            padding: "6px 16px", borderRadius: "20px", border: "none",
                            background: filter === f ? "#F4A7B9" : "#f0f0f0",
                            color: filter === f ? "white" : "#888",
                            fontSize: "13px", cursor: "pointer",
                            fontFamily: "'GriounPolice', cursive"
                        }}>
                            {f}
                        </button>
                    ))}
                </div>

                {/* 내역 목록 */}
                <div style={{ marginBottom: "80px" }}>
                    {filtered.length === 0 ? (
                        <p style={{ textAlign: "center", color: "#aaa", marginTop: "40px" }}>내역이 없어요!</p>
                    ) : (
                        filtered.map((item) => (
                            <div key={item.id} style={{
                                background: "white", borderRadius: "14px",
                                padding: "16px", marginBottom: "10px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                display: "flex", justifyContent: "space-between", alignItems: "center"
                            }}>
                                <div>
                                    <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "500" }}>{item.memo}</p>
                                    <p style={{ margin: 0, fontSize: "12px", color: "#aaa" }}>{item.category} · {item.date}</p>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <p style={{
                                        margin: 0, fontSize: "16px", fontWeight: "600",
                                        color: item.type === "지출" ? "#F4A7B9" : "#7F77DD"
                                    }}>
                                        {item.type === "지출" ? "-" : "+"}{item.amount.toLocaleString()}원
                                    </p>
                                    <button onClick={() => handleDelete(item.id)} style={{
                                        background: "none", border: "none",
                                        fontSize: "16px", cursor: "pointer", color: "#ddd"
                                    }}>🗑️</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <BottomNav current={current} onHome={onHome} onHistory={onHistory} onCalendar={onCalendar} onAnalysis={onAnalysis} onWishlist={onWishlist} onChat={onChat} />
        </div>
    )
}

export default HistoryPage