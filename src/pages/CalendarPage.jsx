import { useState, useEffect } from "react"
import BottomNav from "../components/BottomNav"

function CalendarPage({ onHome, onHistory, onCalendar, onAnalysis, onWishlist, onChat, current }) {
    const today = new Date()
    const [year, setYear] = useState(today.getFullYear())
    const [month, setMonth] = useState(today.getMonth())
    const [transactions, setTransactions] = useState([])

    const days = ["일", "월", "화", "수", "목", "금", "토"]

    useEffect(() => {
        const userId = localStorage.getItem("user_id")
        if (!userId) return
        fetch(`http://127.0.0.1:8000/expense/${userId}`)
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

    const prevMonth = () => {
        if (month === 0) { setYear(y => y - 1); setMonth(11) }
        else setMonth(m => m - 1)
    }

    const nextMonth = () => {
        if (month === 11) { setYear(y => y + 1); setMonth(0) }
        else setMonth(m => m + 1)
    }

    const cells = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let i = 1; i <= lastDate; i++) cells.push(i)

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

                {/* 헤더 */}
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
                            color: i === 0 ? "#F4A7B9" : i === 6 ? "#7F77DD" : "#aaa",
                            padding: "4px 0"
                        }}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* 날짜 */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                    {cells.map((date, i) => {
                        if (!date) return <div key={`empty-${i}`} />
                        const isToday = date === today.getDate() && month === today.getMonth() && year === today.getFullYear()
                        const expense = getExpense(date)
                        const dayOfWeek = (firstDay + date - 1) % 7

                        return (
                            <div key={date} style={{
                                textAlign: "center",
                                padding: "6px 2px",
                                borderRadius: "8px",
                                fontSize: "13px",
                                cursor: "pointer",
                                background: isToday ? "#F4A7B9" : "transparent",
                                color: isToday ? "white" : dayOfWeek === 0 ? "#F4A7B9" : dayOfWeek === 6 ? "#7F77DD" : "#333"
                            }}>
                                <div>{date}</div>
                                {expense && (
                                    <div style={{
                                        fontSize: "8px",
                                        color: isToday ? "white" : "#F4A7B9",
                                        marginTop: "2px"
                                    }}>
                                        -{expense.toLocaleString()}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <BottomNav current={current} onHome={onHome} onHistory={onHistory} onCalendar={onCalendar} onAnalysis={onAnalysis} onWishlist={onWishlist} onChat={onChat} />
        </div>
    )
}

export default CalendarPage