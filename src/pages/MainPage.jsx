import { useState, useEffect } from "react"
import BottomNav from "../components/BottomNav"

function MainPage({ onAddSpend, onHome, onHistory, onCalendar, onAnalysis, onWishlist, onLogout, userId: propUserId, current }) {
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
            .then((res) => res.json())
            .then((data) => {
                const list = Array.isArray(data) ? data : []
                setTransactions(list)
                const income = list.filter(t => t.type === "수입").reduce((sum, t) => sum + t.amount, 0)
                const expense = list.filter(t => t.type === "지출").reduce((sum, t) => sum + t.amount, 0)
                setTotalIncome(income)
                setTotalExpense(expense)
            })
            .catch((e) => console.error(e))

        fetch(`http://127.0.0.1:8000/ai/${userId}`)
            .then((res) => res.json())
            .then((data) => {
                setAiMessage(data.message)
                setAiLoading(false)
            })
            .catch((e) => {
                setAiMessage("AI 분석을 불러오지 못했어요 😢")
                setAiLoading(false)
            })
    }, [])

    const recent = transactions.slice(-3).reverse()

    return (
        <div style={{
            minHeight: "100vh",
            backgroundImage: `
        linear-gradient(#e0e0e0 1px, transparent 1px),
        linear-gradient(90deg, #e0e0e0 1px, transparent 1px)
      `,
            backgroundSize: "28px 28px",
            backgroundColor: "#f5f5f5",
            padding: "24px 20px",
            boxSizing: "border-box",
            fontFamily: "'GriounPolice', cursive"
        }}>
            <div style={{ maxWidth: "360px", margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <h2 style={{ fontSize: "20px", margin: 0, fontWeight: "500", color: "#888", fontFamily: "'GriounPolice', cursive" }}>
                        안녕하세요 {nickname}님 👋
                    </h2>
                    <button onClick={onLogout} style={{
                        background: "none", border: "none", fontSize: "12px",
                        color: "#ccc", cursor: "pointer", fontFamily: "'GriounPolice', cursive"
                    }}>로그아웃</button>
                </div>
                <p style={{ color: "#888", fontSize: "14px", marginBottom: "24px" }}>
                    이번달 지출을 확인해요!
                </p>

                {/* 소비 카드 */}
                <div style={{
                    background: "#F4A7B9", borderRadius: "20px",
                    padding: "24px", color: "white", marginBottom: "20px"
                }}>
                    <p style={{ margin: "0 0 8px", fontSize: "13px", opacity: 0.8 }}>이번달</p>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
                        <div>
                            <p style={{ margin: "0 0 4px", fontSize: "12px", opacity: 0.8 }}>수입</p>
                            <p style={{ margin: 0, fontSize: "22px", fontWeight: "500" }}>+{totalIncome.toLocaleString()}원</p>
                        </div>
                        <div>
                            <p style={{ margin: "0 0 4px", fontSize: "12px", opacity: 0.8 }}>지출</p>
                            <p style={{ margin: 0, fontSize: "22px", fontWeight: "500" }}>-{totalExpense.toLocaleString()}원</p>
                        </div>
                    </div>
                </div>

                {/* AI 멘트 카드 */}
                <div style={{
                    background: "white", borderRadius: "16px",
                    padding: "16px 20px", marginBottom: "20px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    borderLeft: "4px solid #F4A7B9"
                }}>
                    <p style={{ margin: "0 0 6px", fontSize: "12px", color: "#F4A7B9", fontWeight: "600" }}>🐷 MOA의 한마디</p>
                    <p style={{ margin: 0, fontSize: "13px", color: "#555", lineHeight: "1.6" }}>
                        {aiLoading ? "분석 중이에요..." : aiMessage}
                    </p>
                </div>

                {/* 최근 내역 */}
                <div style={{ marginBottom: "100px" }}>
                    <p style={{ fontSize: "14px", fontWeight: "500", marginBottom: "12px" }}>최근 내역</p>
                    {recent.length === 0 ? (
                        <p style={{ textAlign: "center", color: "#aaa", marginTop: "20px" }}>내역이 없어요!</p>
                    ) : (
                        recent.map((item) => (
                            <div key={item.id} style={{
                                background: "white", borderRadius: "12px",
                                padding: "12px 16px", marginBottom: "8px",
                                display: "flex", justifyContent: "space-between",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                            }}>
                                <div>
                                    <p style={{ margin: "0 0 2px", fontSize: "14px" }}>{item.memo}</p>
                                    <p style={{ margin: 0, fontSize: "12px", color: "#aaa" }}>{item.category}</p>
                                </div>
                                <p style={{
                                    margin: 0, fontSize: "14px", fontWeight: "600",
                                    color: item.type === "지출" ? "#F4A7B9" : "#7F77DD"
                                }}>
                                    {item.type === "지출" ? "-" : "+"}{item.amount.toLocaleString()}원
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {/* 지출 추가 버튼 */}
                <button onClick={onAddSpend} style={{
                    width: "100%", padding: "15px", borderRadius: "14px",
                    background: "#F4A7B9", color: "white", border: "none",
                    fontSize: "15px", fontWeight: "600", cursor: "pointer",
                    fontFamily: "'GriounPolice', cursive",
                    marginBottom: "80px"
                }}>
                    + 지출 추가하기
                </button>
            </div>

            <BottomNav current={current} onHome={onHome} onHistory={onHistory} onCalendar={onCalendar} onAnalysis={onAnalysis} onWishlist={onWishlist} />
        </div>
    )
}

export default MainPage