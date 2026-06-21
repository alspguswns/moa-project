import { useState, useEffect } from "react"
import BottomNav from "../components/BottomNav"
import { API } from "../config.js"

function CalendarPage({ onHome, onHistory, onCalendar, onAnalysis, onWishlist, onChat, current }) {
    const today = new Date()
    const [year, setYear] = useState(today.getFullYear())
    const [month, setMonth] = useState(today.getMonth())
    const [transactions, setTransactions] = useState([])
    const [selectedDate, setSelectedDate] = useState(null)

    const days = ["일", "월", "화", "수", "목", "금", "토"]

    useEffect(() => {
        const userId = localStorage.getItem("user_id")
        if (!userId) return
        fetch(`${API}/expense/${userId}`)
            .then((res) => res.json())
            .then((data) => setTransactions(Array.isArray(data) ? data : []))
            .catch((e) => console.error(e))
    }, [])

    const firstDay = new Date(year, month, 1).getDay()
    const lastDate = new Date(year, month + 1, 0).getDate()

    const getExpense = (date) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`
        const dayTransactions = transactions.filter(t => t.date === dateStr && t.type === "지출")
        const total = dayTransactions.reduce((sum, t) => sum + t.amount, 0)
        return total > 0 ? total : null
    }

    const getDateTransactions = (date) => {
        if (!date) return []
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`
        return transactions.filter(t => t.date === dateStr)
    }

    const prevMonth = () => {
        setSelectedDate(null)
        if (month === 0) { setYear(y => y - 1); setMonth(11) }
        else setMonth(m => m - 1)
    }

    const nextMonth = () => {
        setSelectedDate(null)
        if (month === 11) { setYear(y => y + 1); setMonth(0) }
        else setMonth(m => m + 1)
    }

    const handleDateClick = (date) => {
        setSelectedDate(prev => prev === date ? null : date)
    }

    const cells = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let i = 1; i <= lastDate; i++) cells.push(i)

    const selectedTransactions = getDateTransactions(selectedDate)
    const selectedDateStr = selectedDate
        ? `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDate).padStart(2, "0")}`
        : null

    return (
        <div style={{
            minHeight: "100vh",
            backgroundImage: `linear-gradient(#e0e0e0 1px, transparent 1px), linear-gradient(90deg, #e0e0e0 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
            backgroundColor: "var(--moa-bg)",
            padding: "24px 20px",
            boxSizing: "border-box",
            fontFamily: "'GriounPolice', cursive"
        }}>
            <div style={{ maxWidth: "360px", margin: "0 auto", paddingBottom: "80px" }}>

                <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
                    <h2 style={{ margin: 0, fontSize: "20px" }}>📅 캘린더</h2>
                </div>

                {/* 월 이동 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <button onClick={prevMonth} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>‹</button>
                    <span style={{ fontSize: "16px", fontWeight: "600" }}>{year}년 {month + 1}월</span>
                    <button onClick={nextMonth} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>›</button>
                </div>

                {/* 요일 헤더 */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "8px" }}>
                    {days.map((day, i) => (
                        <div key={day} style={{
                            textAlign: "center", fontSize: "12px",
                            color: i === 0 ? "var(--moa-primary)" : i === 6 ? "#7F77DD" : "#aaa",
                            padding: "4px 0"
                        }}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* 날짜 */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "20px" }}>
                    {cells.map((date, i) => {
                        if (!date) return <div key={`empty-${i}`} />
                        const isToday = date === today.getDate() && month === today.getMonth() && year === today.getFullYear()
                        const isSelected = date === selectedDate
                        const expense = getExpense(date)
                        const dayOfWeek = (firstDay + date - 1) % 7

                        return (
                            <div key={date} onClick={() => handleDateClick(date)} style={{
                                textAlign: "center",
                                padding: "6px 2px",
                                borderRadius: "8px",
                                fontSize: "13px",
                                cursor: "pointer",
                                background: isSelected ? "#7F77DD" : isToday ? "var(--moa-primary)" : "transparent",
                                color: isSelected ? "white" : isToday ? "white" : dayOfWeek === 0 ? "var(--moa-primary)" : dayOfWeek === 6 ? "#7F77DD" : "#333"
                            }}>
                                <div>{date}</div>
                                {expense && (
                                    <div style={{
                                        fontSize: "8px",
                                        color: isSelected || isToday ? "white" : "var(--moa-primary)",
                                        marginTop: "2px"
                                    }}>
                                        -{expense.toLocaleString()}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* 선택된 날짜 내역 */}
                {selectedDate && (
                    <div>
                        <p style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px", color: "var(--moa-text)" }}>
                            📋 {month + 1}월 {selectedDate}일 내역
                        </p>
                        {selectedTransactions.length === 0 ? (
                            <div style={{
                                background: "var(--moa-bg-card)", borderRadius: "14px",
                                padding: "24px", textAlign: "center",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                            }}>
                                <p style={{ margin: 0, color: "var(--moa-text-sub)", fontSize: "13px" }}>이날은 내역이 없어요!</p>
                            </div>
                        ) : (
                            selectedTransactions.map(item => (
                                <div key={item.id} style={{
                                    background: "var(--moa-bg-card)", borderRadius: "14px",
                                    padding: "14px 16px", marginBottom: "8px",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                    display: "flex", justifyContent: "space-between", alignItems: "center"
                                }}>
                                    <div>
                                        <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "500" }}>{item.memo || "메모 없음"}</p>
                                        <p style={{ margin: 0, fontSize: "12px", color: "var(--moa-text-sub)" }}>{item.category}</p>
                                    </div>
                                    <p style={{
                                        margin: 0, fontSize: "15px", fontWeight: "600",
                                        color: item.type === "지출" ? "var(--moa-primary)" : "#7F77DD"
                                    }}>
                                        {item.type === "지출" ? "-" : "+"}{item.amount.toLocaleString()}원
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <BottomNav current={current} onHome={onHome} onHistory={onHistory} onCalendar={onCalendar} onAnalysis={onAnalysis} onWishlist={onWishlist} onChat={onChat} />
        </div>
    )
}

export default CalendarPage