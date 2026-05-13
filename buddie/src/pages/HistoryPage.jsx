import { useState, useEffect, useRef, useCallback } from "react"
import BottomNav from "../components/BottomNav"

const CATEGORY_EMOJI = {
    "식비": "🍚", "카페": "☕", "교통": "🚌", "쇼핑": "🛍️",
    "의료": "💊", "문화": "🎬", "운동": "🏃", "미용": "💄",
    "구독": "📱", "기타": "📦",
    "급여": "💰", "알바": "💼", "용돈": "🎁", "부수입": "📈",
}

const CATEGORIES = [
    { label: "식비", emoji: "🍚" }, { label: "카페", emoji: "☕" },
    { label: "교통", emoji: "🚌" }, { label: "쇼핑", emoji: "🛍️" },
    { label: "의료", emoji: "💊" }, { label: "문화", emoji: "🎬" },
    { label: "운동", emoji: "🏃" }, { label: "미용", emoji: "💄" },
    { label: "구독", emoji: "📱" }, { label: "기타", emoji: "📦" },
]

const INCOME_CATEGORIES = [
    { label: "급여", emoji: "💰" }, { label: "알바", emoji: "💼" },
    { label: "용돈", emoji: "🎁" }, { label: "부수입", emoji: "📈" },
    { label: "기타", emoji: "📦" },
]

function HistoryPage({ onHome, onHistory, onAnalysis, onWishlist, onChat, onAddSpend, current }) {
    const today = useRef(new Date()).current
    const [year, setYear] = useState(today.getFullYear())
    const [month, setMonth] = useState(today.getMonth())
    const [transactions, setTransactions] = useState([])
    const [search, setSearch] = useState("")
    const [activeWeekIndex, setActiveWeekIndex] = useState(0)
    const [selectedDate, setSelectedDate] = useState(today.getDate())
    const [fullDatesGrid, setFullDatesGrid] = useState([])
    const [editItem, setEditItem] = useState(null)
    const dateRefs = useRef({})
    const scrollRef = useRef(null)

    useEffect(() => {
        const userId = localStorage.getItem("user_id")
        if (!userId) return
        fetch(`http://127.0.0.1:8000/expense/${userId}`)
            .then(res => res.json())
            .then(data => setTransactions(Array.isArray(data) ? data : []))
            .catch(e => console.error(e))
    }, [])

    useEffect(() => {
        const firstDay = new Date(year, month, 1).getDay()
        const lastDate = new Date(year, month + 1, 0).getDate()
        const prevMonthLastDate = new Date(year, month, 0).getDate()
        let grid = [], currentDay = 1, nextDay = 1
        for (let i = 0; i < 6; i++) {
            let week = []
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < firstDay) week.push({ date: prevMonthLastDate - (firstDay - j - 1), isCurrentMonth: false })
                else if (currentDay > lastDate) week.push({ date: nextDay++, isCurrentMonth: false })
                else week.push({ date: currentDay++, isCurrentMonth: true })
            }
            grid.push(week)
            if (currentDay > lastDate && i >= 4) break
        }
        setFullDatesGrid(grid)
    }, [year, month])

    const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`
    const monthTransactions = transactions.filter(t => t.date.startsWith(monthStr))
    const filtered = monthTransactions.filter(t =>
        (t.memo && t.memo.includes(search)) || (t.category && t.category.includes(search))
    )

    const grouped = (() => {
        const groups = {}
        filtered.forEach(t => {
            if (!groups[t.date]) groups[t.date] = []
            groups[t.date].push(t)
        })
        return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
    })()

    useEffect(() => {
        if (fullDatesGrid.length === 0) return
        const isThisMonth = year === today.getFullYear() && month === today.getMonth()
        if (isThisMonth) {
            const targetDate = today.getDate()
            const weekIdx = fullDatesGrid.findIndex(week => week.some(d => d.date === targetDate && d.isCurrentMonth))
            setActiveWeekIndex(weekIdx !== -1 ? weekIdx : 0)
            setSelectedDate(targetDate)
        } else {
            setActiveWeekIndex(0)
            setSelectedDate(1)
        }
    }, [fullDatesGrid, year, month])

    const getDaySummary = (date) => {
        const dateStr = `${monthStr}-${String(date).padStart(2, "0")}`
        const dayList = monthTransactions.filter(t => t.date === dateStr)
        const income = dayList.filter(t => t.type === "수입").reduce((s, t) => s + t.amount, 0)
        const expense = dayList.filter(t => t.type === "지출").reduce((s, t) => s + t.amount, 0)
        return { income, expense }
    }

    const getDayLabel = (dateStr) => {
        const d = new Date(dateStr + "T00:00:00")
        const dayNames = ["일", "월", "화", "수", "목", "금", "토"]
        return `${d.getDate()}일 ${dayNames[d.getDay()]}요일`
    }

    const handleDateClick = (date) => {
        setSelectedDate(date)
        const targetDateStr = `${monthStr}-${String(date).padStart(2, "0")}`
        let el = dateRefs.current[targetDateStr]
        if (!el) {
            const availableDates = Object.keys(dateRefs.current).sort((a, b) => b.localeCompare(a))
            let closestDate = null
            for (const d of availableDates) {
                if (d <= targetDateStr) { closestDate = d; break }
            }
            if (!closestDate && availableDates.length > 0) closestDate = availableDates[availableDates.length - 1]
            if (closestDate) el = dateRefs.current[closestDate]
        }
        if (el) {
            const container = scrollRef.current
            if (container) {
                const containerTop = container.getBoundingClientRect().top
                const elTop = el.getBoundingClientRect().top
                const scrollPos = container.scrollTop + (elTop - containerTop) - 214
                container.scrollTo({ top: scrollPos, behavior: "smooth" })
            }
        }
    }

    const handleScroll = useCallback(() => {
        const container = scrollRef.current
        if (!container) return
        let closestDateStr = null
        let minDiff = Infinity
        const containerTop = container.getBoundingClientRect().top
        const triggerLine = containerTop + 240
        for (const [dateStr, el] of Object.entries(dateRefs.current)) {
            if (!el) continue
            const rect = el.getBoundingClientRect()
            const diff = Math.abs(rect.top - triggerLine)
            if (diff < minDiff) { minDiff = diff; closestDateStr = dateStr }
        }
        if (closestDateStr) {
            const d = parseInt(closestDateStr.split("-")[2], 10)
            setSelectedDate(prev => prev !== d ? d : prev)
            const weekIdx = fullDatesGrid.findIndex(week => week.some(day => day.date === d && day.isCurrentMonth))
            if (weekIdx !== -1) setActiveWeekIndex(prev => prev !== weekIdx ? weekIdx : prev)
        }
    }, [fullDatesGrid])

    useEffect(() => {
        const container = scrollRef.current
        if (!container) return
        container.addEventListener("scroll", handleScroll)
        return () => container.removeEventListener("scroll", handleScroll)
    }, [handleScroll])

    const prevMonth = () => {
        if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1)
    }
    const nextMonth = () => {
        if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1)
    }

    const totalExpense = monthTransactions.filter(t => t.type === "지출").reduce((s, t) => s + t.amount, 0)

    const handleDelete = async (id) => {
        const ok = window.confirm("정말로 삭제할까요?")
        if (!ok) return
        try {
            const res = await fetch(`http://127.0.0.1:8000/expense/${id}`, { method: "DELETE" })
            if (res.ok) {
                setTransactions(prev => prev.filter(t => t.id !== id))
                setEditItem(null)
            }
        } catch (e) { console.error(e) }
    }

    const handleEditSave = async () => {
        const rawAmount = editItem.amountStr.replace(/,/g, "")
        if (!rawAmount) return
        try {
            const res = await fetch(`http://127.0.0.1:8000/expense/${editItem.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: editItem.type,
                    amount: parseInt(rawAmount),
                    category: editItem.category,
                    memo: editItem.memo,
                    date: editItem.date
                })
            })
            if (res.ok) {
                setTransactions(prev => prev.map(t =>
                    t.id === editItem.id ? { ...t, ...editItem, amount: parseInt(rawAmount) } : t
                ))
                setEditItem(null)
            }
        } catch (e) { console.error(e) }
    }

    const accentColor = editItem?.type === "수입" ? "#7F77DD" : "#F4A7B9"

    return (
        <div style={{ height: "100dvh", minHeight: "100vh", display: "flex", flexDirection: "column", maxWidth: "360px", margin: "0 auto", background: "#f5f5f5", overscrollBehavior: "none" }}>
            <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", overflowX: "hidden", position: "relative", fontFamily: "'GriounPolice', cursive" }}>

                <div style={{ position: "sticky", top: 0, zIndex: 50, background: "white", boxSizing: "border-box" }}>
                    <div style={{ height: "54px", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <button onClick={prevMonth} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#333" }}>‹</button>
                            <span style={{ fontSize: "16px", fontWeight: "700", color: "#333" }}>{month + 1}월</span>
                            <button onClick={nextMonth} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#333" }}>›</button>
                        </div>
                        <button onClick={onAddSpend} style={{
                            background: "#F4A7B9", color: "white", border: "none",
                            borderRadius: "20px", padding: "6px 14px", fontSize: "13px",
                            cursor: "pointer", fontFamily: "'GriounPolice', cursive"
                        }}>+ 내역 추가</button>
                    </div>
                    <div style={{ height: "60px", padding: "10px 16px", boxSizing: "border-box" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f5f5f5", borderRadius: "12px", padding: "9px 14px", height: "100%", boxSizing: "border-box" }}>
                            <span style={{ fontSize: "13px", color: "#aaa" }}>🔍</span>
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="검색"
                                   style={{ border: "none", background: "none", outline: "none", fontSize: "14px", color: "#333", width: "100%", fontFamily: "'GriounPolice', cursive" }} />
                        </div>
                    </div>
                </div>

                <div style={{ padding: "10px 20px 20px", background: "white", position: "relative", zIndex: 10 }}>
                    <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#bbb" }}>{month + 1}월 지출</p>
                    <p style={{ margin: 0, fontSize: "26px", fontWeight: "700", color: "#333" }}>{totalExpense.toLocaleString()}원</p>
                </div>

                <div style={{ position: "sticky", top: "114px", zIndex: 45, background: "white", display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "0 12px", height: "32px", alignItems: "center" }}>
                    {["일", "월", "화", "수", "목", "금", "토"].map((day, i) => (
                        <div key={day} style={{ textAlign: "center", fontSize: "11px", color: i === 0 ? "#F4A7B9" : i === 6 ? "#7F77DD" : "#bbb" }}>{day}</div>
                    ))}
                </div>

                {fullDatesGrid.map((week, i) => {
                    const isActive = i === activeWeekIndex
                    return (
                        <div key={i} style={{
                            position: isActive ? "sticky" : "relative",
                            top: isActive ? "146px" : "auto",
                            zIndex: isActive ? 40 : 10,
                            background: "white",
                            display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
                            padding: "0 12px", height: "58px", boxSizing: "border-box",
                            boxShadow: isActive ? "0 4px 6px -4px rgba(0,0,0,0.05)" : "none"
                        }}>
                            {week.map((d, j) => {
                                const isSelected = d.isCurrentMonth && d.date === selectedDate
                                const isToday = d.isCurrentMonth && new Date(year, month, d.date).toDateString() === today.toDateString()
                                const { income, expense } = d.isCurrentMonth ? getDaySummary(d.date) : { income: 0, expense: 0 }
                                return (
                                    <div key={`${i}-${j}`} onClick={() => d.isCurrentMonth && handleDateClick(d.date)}
                                         style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 2px", borderRadius: "8px", cursor: d.isCurrentMonth ? "pointer" : "default" }}>
                                        <div style={{
                                            width: "26px", height: "26px", borderRadius: "50%",
                                            background: isSelected ? "#F4A7B9" : "transparent",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: "13px", fontWeight: isSelected || isToday ? "700" : "400",
                                            color: isSelected ? "white" : isToday ? "#F4A7B9" : !d.isCurrentMonth ? "#ddd" : j === 0 ? "#F4A7B9" : j === 6 ? "#7F77DD" : "#333",
                                            marginBottom: "2px"
                                        }}>{d.date}</div>
                                        {income > 0 && <div style={{ fontSize: "8px", color: "#7F77DD", lineHeight: 1.1 }}>+{income.toLocaleString()}</div>}
                                        {expense > 0 && <div style={{ fontSize: "8px", color: "#F4A7B9", lineHeight: 1.1 }}>-{expense.toLocaleString()}</div>}
                                    </div>
                                )
                            })}
                        </div>
                    )
                })}

                <div style={{
                    position: "relative", zIndex: 20, minHeight: "100dvh", padding: "20px 16px 80px",
                    backgroundImage: `linear-gradient(#e0e0e0 1px, transparent 1px), linear-gradient(90deg, #e0e0e0 1px, transparent 1px)`,
                    backgroundSize: "28px 28px", backgroundColor: "#f5f5f5"
                }}>
                    {grouped.length === 0 ? (
                        <p style={{ textAlign: "center", color: "#aaa", marginTop: "40px", fontSize: "14px" }}>내역이 없어요!</p>
                    ) : (
                        grouped.map(([dateStr, items]) => (
                            <div key={dateStr} ref={el => { if (el) dateRefs.current[dateStr] = el; else delete dateRefs.current[dateStr] }} style={{ marginBottom: "20px" }}>
                                <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#999", fontWeight: "600" }}>{getDayLabel(dateStr)}</p>
                                {items.map(item => (
                                    <div key={item.id} style={{
                                        background: "white", borderRadius: "14px", padding: "13px 14px", marginBottom: "8px",
                                        boxShadow: "0 1px 6px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "12px"
                                    }}>
                                        <div style={{
                                            width: "40px", height: "40px", borderRadius: "50%",
                                            background: item.type === "지출" ? "#fff0f3" : "#f0f0ff",
                                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0
                                        }}>
                                            {CATEGORY_EMOJI[item.category] || "📦"}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ margin: "0 0 2px", fontSize: "14px", fontWeight: "500", color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {item.memo || "메모 없음"}
                                            </p>
                                            <p style={{ margin: 0, fontSize: "12px", color: "#bbb" }}>{item.category}</p>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                                            <p style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: item.type === "지출" ? "#F4A7B9" : "#7F77DD" }}>
                                                {item.type === "지출" ? "-" : "+"}{item.amount.toLocaleString()}원
                                            </p>
                                            <button onClick={() => setEditItem({ ...item, amountStr: item.amount.toLocaleString() })} style={{
                                                background: "none", border: "none", fontSize: "15px", cursor: "pointer", color: "#ccc", padding: 0
                                            }}>✏️</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {editItem && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 200,
                    background: "rgba(0,0,0,0.4)",
                    display: "flex", alignItems: "flex-end", justifyContent: "center"
                }} onClick={(e) => { if (e.target === e.currentTarget) setEditItem(null) }}>
                    <div style={{
                        background: "white", borderRadius: "24px 24px 0 0",
                        width: "100%", maxWidth: "360px", padding: "24px 20px 40px",
                        maxHeight: "85vh", overflowY: "auto",
                        fontFamily: "'GriounPolice', cursive"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h3 style={{ margin: 0, fontSize: "18px" }}>✏️ 내역 수정</h3>
                            <button onClick={() => setEditItem(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#aaa" }}>✕</button>
                        </div>

                        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                            {["지출", "수입"].map(t => (
                                <button key={t} onClick={() => setEditItem(prev => ({
                                    ...prev, type: t, category: t === "수입" ? "급여" : "식비"
                                }))} style={{
                                    padding: "8px 24px", borderRadius: "20px", border: "none",
                                    background: editItem.type === t ? accentColor : "#f0f0f0",
                                    color: editItem.type === t ? "white" : "#888",
                                    fontSize: "13px", cursor: "pointer", fontFamily: "'GriounPolice', cursive"
                                }}>{t}</button>
                            ))}
                        </div>

                        <div style={{ marginBottom: "14px" }}>
                            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>날짜</label>
                            <input type="date" value={editItem.date} onChange={e => setEditItem(prev => ({ ...prev, date: e.target.value }))}
                                   style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #eee", fontSize: "14px", boxSizing: "border-box", fontFamily: "'GriounPolice', cursive", outline: "none", color: "#333" }} />
                        </div>

                        <div style={{ marginBottom: "14px" }}>
                            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>금액</label>
                            <div style={{ position: "relative" }}>
                                <input type="text" inputMode="numeric" value={editItem.amountStr}
                                       onChange={e => {
                                           const raw = e.target.value.replace(/,/g, "")
                                           if (!/^\d*$/.test(raw)) return
                                           setEditItem(prev => ({ ...prev, amountStr: raw ? parseInt(raw).toLocaleString() : "" }))
                                       }}
                                       style={{ width: "100%", padding: "11px 40px 11px 14px", borderRadius: "10px", border: "1px solid #eee", fontSize: "15px", boxSizing: "border-box", fontFamily: "'GriounPolice', cursive", outline: "none", color: "#333" }} />
                                <span style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "#aaa" }}>원</span>
                            </div>
                        </div>

                        <div style={{ marginBottom: "14px" }}>
                            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "8px" }}>카테고리</label>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px" }}>
                                {(editItem.type === "수입" ? INCOME_CATEGORIES : CATEGORIES).map(cat => (
                                    <button key={cat.label} onClick={() => setEditItem(prev => ({ ...prev, category: cat.label }))} style={{
                                        padding: "8px 4px", borderRadius: "10px", border: "none",
                                        background: editItem.category === cat.label ? accentColor : "#f5f5f5",
                                        color: editItem.category === cat.label ? "white" : "#555",
                                        fontSize: "10px", cursor: "pointer", fontFamily: "'GriounPolice', cursive",
                                        display: "flex", flexDirection: "column", alignItems: "center", gap: "3px"
                                    }}>
                                        <span style={{ fontSize: "16px" }}>{cat.emoji}</span>
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>메모</label>
                            <input type="text" value={editItem.memo || ""} onChange={e => setEditItem(prev => ({ ...prev, memo: e.target.value }))}
                                   placeholder="메모를 입력해줘요"
                                   style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #eee", fontSize: "14px", boxSizing: "border-box", fontFamily: "'GriounPolice', cursive", outline: "none", color: "#333" }} />
                        </div>

                        <button onClick={handleEditSave} style={{
                            width: "100%", padding: "14px", borderRadius: "12px",
                            background: accentColor, color: "white", border: "none",
                            fontSize: "15px", fontWeight: "600", cursor: "pointer",
                            fontFamily: "'GriounPolice', cursive", marginBottom: "12px"
                        }}>저장하기</button>

                        <button onClick={() => handleDelete(editItem.id)} style={{
                            width: "100%", padding: "14px", borderRadius: "12px",
                            background: "none", color: "#ff6b6b", border: "1px solid #ffcdd2",
                            fontSize: "15px", cursor: "pointer", fontFamily: "'GriounPolice', cursive"
                        }}>🗑️ 삭제하기</button>
                    </div>
                </div>
            )}

            <div style={{ position: "relative", zIndex: 999, flexShrink: 0, background: "white" }}>
                <BottomNav current={current} onHome={onHome} onHistory={onHistory} onAnalysis={onAnalysis} onWishlist={onWishlist} onChat={onChat} />
            </div>
        </div>
    )
}

export default HistoryPage