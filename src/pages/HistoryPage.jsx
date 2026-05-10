import { useState, useEffect } from "react"

function HistoryPage({ onBack }) {
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

    const filtered = transactions.filter((item) => {
        if (filter === "전체") return true
        return item.type === filter
    })

    return (
        <div style={{ maxWidth: "360px", margin: "0 auto", padding: "24px 20px", fontFamily: "'GriounPolice', cursive" }}>

            {/* 헤더 */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                <button onClick={onBack} style={{
                    background: "none", border: "none",
                    fontSize: "24px", cursor: "pointer", marginRight: "12px"
                }}>←</button>
                <h2 style={{ margin: 0, fontSize: "20px" }}>소비내역</h2>
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
                        <p style={{
                            margin: 0, fontSize: "16px", fontWeight: "600",
                            color: item.type === "지출" ? "#F4A7B9" : "#7F77DD"
                        }}>
                            {item.type === "지출" ? "-" : "+"}{item.amount.toLocaleString()}원
                        </p>
                    </div>
                ))
            )}
        </div>
    )
}

export default HistoryPage