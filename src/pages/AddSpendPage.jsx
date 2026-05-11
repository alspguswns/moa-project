import { useState } from "react"
import BottomNav from "../components/BottomNav"

function AddSpendPage({ onBack, onHome, onHistory, onCalendar, onAnalysis, onWishlist, current }) {
    const [amount, setAmount] = useState("")
    const [category, setCategory] = useState("식비")
    const [memo, setMemo] = useState("")
    const [type, setType] = useState("지출")
    const [error, setError] = useState("")

    async function handleSave() {
        const userId = localStorage.getItem("user_id")
        if (!amount) {
            setError("금액을 입력해줘요!")
            return
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/expense/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: parseInt(userId),
                    type: type,
                    amount: parseInt(amount),
                    category: category,
                    memo: memo,
                    date: new Date().toISOString().split("T")[0]
                })
            })

            const data = await response.json()

            if (response.ok) {
                alert("저장 완료!")
                onBack()
            } else {
                setError(typeof data.detail === "string" ? data.detail : "저장에 실패했어요!")
            }
        } catch (e) {
            setError("서버 연결에 실패했어요!")
        }
    }

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
            <div style={{ maxWidth: "360px", margin: "0 auto", paddingBottom: "80px" }}>
                <h2 style={{ fontSize: "20px", marginBottom: "24px" }}>✏️ 지출 입력</h2>

                {/* 수입/지출 선택 */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                    {["지출", "수입"].map((t) => (
                        <button key={t} onClick={() => setType(t)} style={{
                            padding: "8px 24px", borderRadius: "20px", border: "none",
                            background: type === t ? "#F4A7B9" : "#f0f0f0",
                            color: type === t ? "white" : "#888",
                            fontSize: "13px", cursor: "pointer",
                            fontFamily: "'GriounPolice', cursive"
                        }}>
                            {t}
                        </button>
                    ))}
                </div>

                {/* 금액 */}
                <div style={{ marginBottom: "16px" }}>
                    <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>금액</label>
                    <input type="number" placeholder="0" value={amount}
                           onChange={(e) => setAmount(e.target.value)}
                           style={{
                               width: "100%", padding: "10px 12px", borderRadius: "10px",
                               border: "1px solid #eee", fontSize: "14px", boxSizing: "border-box",
                               fontFamily: "'GriounPolice', cursive", outline: "none",
                               background: "white"
                           }} />
                </div>

                {/* 카테고리 */}
                <div style={{ marginBottom: "16px" }}>
                    <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>카테고리</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}
                            style={{
                                width: "100%", padding: "10px 12px", borderRadius: "10px",
                                border: "1px solid #eee", fontSize: "14px", boxSizing: "border-box",
                                fontFamily: "'GriounPolice', cursive", outline: "none",
                                background: "white"
                            }}>
                        <option>식비</option>
                        <option>교통</option>
                        <option>쇼핑</option>
                        <option>의료</option>
                        <option>기타</option>
                    </select>
                </div>

                {/* 메모 */}
                <div style={{ marginBottom: "24px" }}>
                    <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>메모</label>
                    <input type="text" placeholder="어디서 썼나요?" value={memo}
                           onChange={(e) => setMemo(e.target.value)}
                           style={{
                               width: "100%", padding: "10px 12px", borderRadius: "10px",
                               border: "1px solid #eee", fontSize: "14px", boxSizing: "border-box",
                               fontFamily: "'GriounPolice', cursive", outline: "none",
                               background: "white"
                           }} />
                </div>

                {/* 에러 메시지 */}
                {error && (
                    <p style={{ color: "red", fontSize: "12px", marginBottom: "10px", textAlign: "center" }}>
                        {error}
                    </p>
                )}

                {/* 저장 버튼 */}
                <button onClick={handleSave} style={{
                    width: "100%", padding: "14px", borderRadius: "12px",
                    background: "#F4A7B9", color: "white", border: "none",
                    fontSize: "15px", fontWeight: "500", cursor: "pointer",
                    fontFamily: "'GriounPolice', cursive"
                }}>
                    저장하기
                </button>
            </div>

            <BottomNav current={current} onHome={onHome} onHistory={onHistory} onCalendar={onCalendar} onAnalysis={onAnalysis} onWishlist={onWishlist} />
        </div>
    )
}

export default AddSpendPage