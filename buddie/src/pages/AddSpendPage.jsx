import { useState } from "react"
import BottomNav from "../components/BottomNav"

const CATEGORIES = [
    { label: "식비", emoji: "🍚" },
    { label: "카페", emoji: "☕" },
    { label: "교통", emoji: "🚌" },
    { label: "쇼핑", emoji: "🛍️" },
    { label: "의료", emoji: "💊" },
    { label: "문화", emoji: "🎬" },
    { label: "운동", emoji: "🏃" },
    { label: "미용", emoji: "💄" },
    { label: "구독", emoji: "📱" },
    { label: "기타", emoji: "📦" },
]

const INCOME_CATEGORIES = [
    { label: "급여", emoji: "💰" },
    { label: "알바", emoji: "💼" },
    { label: "용돈", emoji: "🎁" },
    { label: "부수입", emoji: "📈" },
    { label: "기타", emoji: "📦" },
]

function AddSpendPage({ onBack, onHome, onHistory, onAnalysis, onWishlist, onChat, current }) {
    const today = new Date()
    const [amount, setAmount] = useState("")
    const [category, setCategory] = useState("식비")
    const [memo, setMemo] = useState("")
    const [type, setType] = useState("지출")
    const [error, setError] = useState("")
    const [isRegular, setIsRegular] = useState(false)

    const [calYear, setCalYear] = useState(today.getFullYear())
    const [calMonth, setCalMonth] = useState(today.getMonth())
    const [selectedDate, setSelectedDate] = useState(
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    )
    const [showCal, setShowCal] = useState(false)

    const handleAmountChange = (e) => {
        const raw = e.target.value.replace(/,/g, "")
        if (!/^\d*$/.test(raw)) return
        setAmount(raw ? parseInt(raw).toLocaleString() : "")
    }

    const firstDay = new Date(calYear, calMonth, 1).getDay()
    const lastDate = new Date(calYear, calMonth + 1, 0).getDate()
    const prevLastDate = new Date(calYear, calMonth, 0).getDate()
    const cells = []
    for (let i = 0; i < firstDay; i++) cells.push({ date: prevLastDate - (firstDay - i - 1), cur: false })
    for (let i = 1; i <= lastDate; i++) cells.push({ date: i, cur: true })
    while (cells.length % 7 !== 0) cells.push({ date: cells.length - lastDate - firstDay + 1, cur: false })

    const handleCalPrev = () => {
        if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) }
        else setCalMonth(m => m - 1)
    }
    const handleCalNext = () => {
        if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) }
        else setCalMonth(m => m + 1)
    }

    const handleSelectDate = (date, cur) => {
        if (!cur) return
        const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`
        setSelectedDate(dateStr)
        setShowCal(false)
    }

    const formatDisplayDate = (dateStr) => {
        const d = new Date(dateStr + "T00:00:00")
        const dayNames = ["일", "월", "화", "수", "목", "금", "토"]
        return `${d.getMonth() + 1}월 ${d.getDate()}일 ${dayNames[d.getDay()]}요일`
    }

    async function handleSave() {
        const userId = localStorage.getItem("user_id")
        const rawAmount = amount.replace(/,/g, "")
        if (!rawAmount) { setError("금액을 입력해줘요!"); return }

        try {
            const response = await fetch("http://127.0.0.1:8000/expense/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: parseInt(userId),
                    type,
                    amount: parseInt(rawAmount),
                    category,
                    memo,
                    date: selectedDate
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

    const accentColor = type === "수입" ? "#7F77DD" : "#F4A7B9"

    return (
        <div style={{
            minHeight: "100vh",
            backgroundImage: `linear-gradient(#e0e0e0 1px, transparent 1px), linear-gradient(90deg, #e0e0e0 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
            backgroundColor: "#f5f5f5",
            padding: "24px 20px",
            boxSizing: "border-box",
            fontFamily: "'GriounPolice', cursive",
            color: "#333"
        }}>
            <div style={{ maxWidth: "360px", margin: "0 auto", paddingBottom: "100px" }}>

                {/* 헤더 */}
                <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
                    <button onClick={onBack} style={{
                        background: "none", border: "none", fontSize: "22px",
                        cursor: "pointer", marginRight: "12px", color: "#333"
                    }}>←</button>
                    <h2 style={{ margin: 0, fontSize: "20px" }}>✏️ 내역 추가</h2>
                </div>

                {/* 수입/지출 선택 */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                    {["지출", "수입"].map((t) => (
                        <button key={t} onClick={() => {
                            setType(t)
                            setCategory(t === "수입" ? "급여" : "식비")
                        }} style={{
                            padding: "10px 28px", borderRadius: "20px", border: "none",
                            background: type === t ? accentColor : "white",
                            color: type === t ? "white" : "#aaa",
                            fontSize: "14px", cursor: "pointer",
                            fontFamily: "'GriounPolice', cursive",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                            transition: "background 0.2s"
                        }}>
                            {t}
                        </button>
                    ))}
                </div>

                {/* 날짜 선택 */}
                <div style={{ marginBottom: "16px" }}>
                    <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>날짜</label>
                    <button onClick={() => setShowCal(!showCal)} style={{
                        width: "100%", padding: "12px 14px", borderRadius: "10px",
                        border: "1px solid #eee", background: "white",
                        fontSize: "14px", color: "#333", textAlign: "left",
                        cursor: "pointer", fontFamily: "'GriounPolice', cursive"
                    }}>
                        📅 {formatDisplayDate(selectedDate)}
                    </button>

                    {showCal && (
                        <div style={{
                            background: "white", borderRadius: "16px",
                            padding: "16px", marginTop: "8px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                <button onClick={handleCalPrev} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer" }}>‹</button>
                                <span style={{ fontSize: "14px", fontWeight: "700" }}>{calYear}년 {calMonth + 1}월</span>
                                <button onClick={handleCalNext} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer" }}>›</button>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "4px" }}>
                                {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
                                    <div key={d} style={{
                                        textAlign: "center", fontSize: "11px",
                                        color: i === 0 ? "#F4A7B9" : i === 6 ? "#7F77DD" : "#bbb",
                                        padding: "4px 0"
                                    }}>{d}</div>
                                ))}
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
                                {cells.map((cell, idx) => {
                                    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(cell.date).padStart(2, "0")}`
                                    const isSelected = dateStr === selectedDate && cell.cur
                                    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
                                    const isToday = dateStr === todayStr && cell.cur
                                    const col = idx % 7
                                    return (
                                        <div key={idx} onClick={() => handleSelectDate(cell.date, cell.cur)} style={{
                                            textAlign: "center", padding: "6px 0", borderRadius: "8px",
                                            cursor: cell.cur ? "pointer" : "default",
                                            background: isSelected ? accentColor : "transparent"
                                        }}>
                                            <span style={{
                                                fontSize: "13px",
                                                fontWeight: isSelected || isToday ? "700" : "400",
                                                color: isSelected ? "white" : !cell.cur ? "#ddd" : isToday ? accentColor : col === 0 ? "#F4A7B9" : col === 6 ? "#7F77DD" : "#333"
                                            }}>
                                                {cell.date}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* 금액 */}
                <div style={{ marginBottom: "16px" }}>
                    <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>금액</label>
                    <div style={{ position: "relative" }}>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            value={amount}
                            onChange={handleAmountChange}
                            style={{
                                width: "100%", padding: "12px 40px 12px 14px",
                                borderRadius: "10px", border: "1px solid #eee",
                                fontSize: "16px", boxSizing: "border-box",
                                fontFamily: "'GriounPolice', cursive", color: "#333",
                                outline: "none", background: "white"
                            }}
                        />
                        <span style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", color: "#aaa" }}>원</span>
                    </div>
                </div>

                {/* 카테고리 */}
                <div style={{ marginBottom: "16px" }}>
                    <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "8px" }}>카테고리</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}>
                        {(type === "수입" ? INCOME_CATEGORIES : CATEGORIES).map((cat) => (
                            <button key={cat.label} onClick={() => setCategory(cat.label)} style={{
                                padding: "10px 4px", borderRadius: "12px", border: "none",
                                background: category === cat.label ? accentColor : "white",
                                color: category === cat.label ? "white" : "#555",
                                fontSize: "11px", cursor: "pointer",
                                fontFamily: "'GriounPolice', cursive",
                                display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
                            }}>
                                <span style={{ fontSize: "18px" }}>{cat.emoji}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 정기 수입 토글 */}
                {type === "수입" && (
                    <div style={{
                        background: "white", borderRadius: "12px", padding: "14px 16px",
                        marginBottom: "16px", display: "flex", justifyContent: "space-between",
                        alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
                    }}>
                        <div>
                            <p style={{ margin: "0 0 2px", fontSize: "14px", color: "#333" }}>정기 수입으로 설정</p>
                            <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>매달 같은 날짜에 자동으로 추가돼요</p>
                        </div>
                        <div onClick={() => setIsRegular(prev => !prev)} style={{
                            width: "44px", height: "24px", borderRadius: "12px",
                            background: isRegular ? "#7F77DD" : "#ddd",
                            cursor: "pointer", position: "relative", transition: "background 0.2s",
                            flexShrink: 0
                        }}>
                            <div style={{
                                width: "20px", height: "20px", borderRadius: "50%",
                                background: "white", position: "absolute",
                                top: "2px", left: isRegular ? "22px" : "2px",
                                transition: "left 0.2s",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.2)"
                            }} />
                        </div>
                    </div>
                )}

                {/* 메모 */}
                <div style={{ marginBottom: "24px" }}>
                    <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>메모</label>
                    <input
                        type="text"
                        placeholder={type === "수입" ? "어디서 받았나요?" : "어디서 썼나요?"}
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        style={{
                            width: "100%", padding: "12px 14px", borderRadius: "10px",
                            border: "1px solid #eee", fontSize: "14px", boxSizing: "border-box",
                            fontFamily: "'GriounPolice', cursive", color: "#333",
                            outline: "none", background: "white"
                        }}
                    />
                </div>

                {/* 에러 */}
                {error && (
                    <p style={{ color: "#F4A7B9", fontSize: "12px", marginBottom: "10px", textAlign: "center" }}>{error}</p>
                )}

                {/* 저장 버튼 */}
                <button onClick={handleSave} style={{
                    width: "100%", padding: "15px", borderRadius: "14px",
                    background: accentColor, color: "white", border: "none",
                    fontSize: "16px", fontWeight: "600", cursor: "pointer",
                    fontFamily: "'GriounPolice', cursive"
                }}>
                    저장하기
                </button>
            </div>

            <BottomNav current={current} onHome={onHome} onHistory={onHistory} onAnalysis={onAnalysis} onWishlist={onWishlist} onChat={onChat} />
        </div>
    )
}

export default AddSpendPage