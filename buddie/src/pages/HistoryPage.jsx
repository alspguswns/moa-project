import { useState, useEffect } from "react"

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

function HistoryPage({ onHome, onHistory, onAnalysis, onWishlist, onChat, onAddSpend, onLogout, current }) {
    const today = new Date()
    const [year, setYear] = useState(today.getFullYear())
    const [month, setMonth] = useState(today.getMonth())
    const [transactions, setTransactions] = useState([])
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState("전체")
    const [filterOpen, setFilterOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState(null)
    const [fullDatesGrid, setFullDatesGrid] = useState([])
    const [editItem, setEditItem] = useState(null)

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
        setSelectedDate(null)
    }, [year, month])

    const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`
    const monthTransactions = transactions.filter(t => t.date.startsWith(monthStr))

    const filtered = monthTransactions.filter(t => {
        const matchSearch = (t.memo && t.memo.includes(search)) || (t.category && t.category.includes(search))
        const matchFilter = filter === "전체" || (filter === "입금" && t.type === "수입") || (filter === "출금" && t.type === "지출")
        const matchDate = !selectedDate || t.date === `${monthStr}-${String(selectedDate).padStart(2, "0")}`
        return matchSearch && matchFilter && matchDate
    })

    const grouped = (() => {
        const groups = {}
        filtered.forEach(t => {
            if (!groups[t.date]) groups[t.date] = []
            groups[t.date].push(t)
        })
        return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
    })()

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

    const totalExpense = monthTransactions.filter(t => t.type === "지출").reduce((s, t) => s + t.amount, 0)

    const prevMonth = () => {
        if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1)
    }
    const nextMonth = () => {
        if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1)
    }

    const handleDelete = async (id) => {
        const ok = window.confirm("정말로 삭제할까요?")
        if (!ok) return
        try {
            const res = await fetch(`http://127.0.0.1:8000/expense/${id}`, { method: "DELETE" })
            if (res.ok) { setTransactions(prev => prev.filter(t => t.id !== id)); setEditItem(null) }
        } catch (e) { console.error(e) }
    }

    const handleEditSave = async () => {
        const rawAmount = editItem.amountStr.replace(/,/g, "")
        if (!rawAmount) return
        try {
            const res = await fetch(`http://127.0.0.1:8000/expense/${editItem.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: editItem.type, amount: parseInt(rawAmount), category: editItem.category, memo: editItem.memo, date: editItem.date })
            })
            if (res.ok) {
                setTransactions(prev => prev.map(t => t.id === editItem.id ? { ...t, ...editItem, amount: parseInt(rawAmount) } : t))
                setEditItem(null)
            }
        } catch (e) { console.error(e) }
    }

    const accentColor = editItem?.type === "수입" ? "#7F77DD" : "#F4A7B9"

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
                    <span style={{ fontSize: "20px" }}>🔔</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f5f5f5", borderRadius: "20px", padding: "6px 12px" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#F4A7B9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "white" }}>
                            {(localStorage.getItem("nickname") || "U")[0]}
                        </div>
                        <span style={{ fontSize: "13px", color: "#333" }}>{localStorage.getItem("nickname") || "사용자"}</span>
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

            <div style={{ marginLeft: "72px", marginTop: "64px", flex: 1, padding: "28px 32px", boxSizing: "border-box", display: "flex", flexDirection: "column", height: "calc(100vh - 64px)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", flexShrink: 0 }}>
                    <button onClick={prevMonth} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer" }}>‹</button>
                    <span style={{ fontSize: "20px", fontWeight: "700", color: "#333" }}>{month + 1}월</span>
                    <button onClick={nextMonth} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer" }}>›</button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "16px", flexShrink: 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px", background: "white", borderRadius: "12px", padding: "10px 14px", border: "1px solid #eee" }}>
                                <span style={{ color: "#aaa" }}>🔍</span>
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="검색" style={{ border: "none", outline: "none", fontSize: "14px", color: "#333", width: "100%", fontFamily: "'GriounPolice', cursive", background: "none" }} />
                            </div>
                            <button onClick={onAddSpend} style={{ background: "#F4A7B9", color: "white", border: "none", borderRadius: "12px", padding: "10px 16px", fontSize: "13px", cursor: "pointer", fontFamily: "'GriounPolice', cursive", whiteSpace: "nowrap" }}>+ 내역 추가</button>
                        </div>
                        <div style={{ background: "white", borderRadius: "14px", padding: "16px 20px", border: "1px solid #eee" }}>
                            <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#bbb" }}>{month + 1}월 전체 지출 금액</p>
                            <p style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#333" }}>{totalExpense.toLocaleString()}원</p>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ background: "white", borderRadius: "12px", padding: "8px 16px", border: "1px solid #eee", fontSize: "14px", color: "#333" }}>
                                {selectedDate ? `${month + 1}월 ${selectedDate}일` : `${month + 1}월 전체`}
                            </div>
                            <div style={{ position: "relative" }}>
                                <button onClick={() => setFilterOpen(prev => !prev)} style={{ background: "white", border: "1px solid #eee", borderRadius: "12px", padding: "8px 16px", fontSize: "14px", cursor: "pointer", fontFamily: "'GriounPolice', cursive", color: "#333", display: "flex", alignItems: "center", gap: "6px" }}>
                                    {filter} ▾
                                </button>
                                {filterOpen && (
                                    <div style={{ position: "absolute", right: 0, top: "44px", background: "white", borderRadius: "12px", border: "1px solid #eee", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 50, overflow: "hidden", minWidth: "100px" }}>
                                        {["전체", "입금", "출금"].map(f => (
                                            <div key={f} onClick={() => { setFilter(f); setFilterOpen(false) }} style={{ padding: "12px 20px", cursor: "pointer", fontSize: "14px", color: filter === f ? "#F4A7B9" : "#333", background: filter === f ? "#fff0f3" : "transparent", fontWeight: filter === f ? "700" : "400" }}>{f}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", flex: 1, minHeight: 0 }}>
                    <div style={{ background: "white", borderRadius: "16px", padding: "20px", border: "1px solid #eee", display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box", overflowY: "auto" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "8px", flexShrink: 0 }}>
                            {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
                                <div key={d} style={{ textAlign: "center", fontSize: "12px", color: i === 0 ? "#F4A7B9" : i === 6 ? "#7F77DD" : "#bbb", padding: "4px 0" }}>{d}</div>
                            ))}
                        </div>
                        {fullDatesGrid.map((week, i) => (
                            <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "4px", flexShrink: 0 }}>
                                {week.map((d, j) => {
                                    const isToday = d.isCurrentMonth && new Date(year, month, d.date).toDateString() === today.toDateString()
                                    const isSelected = d.isCurrentMonth && d.date === selectedDate
                                    const { income, expense } = d.isCurrentMonth ? getDaySummary(d.date) : { income: 0, expense: 0 }
                                    return (
                                        <div key={`${i}-${j}`} onClick={() => d.isCurrentMonth && setSelectedDate(prev => prev === d.date ? null : d.date)} style={{ textAlign: "center", padding: "6px 2px", borderRadius: "8px", cursor: d.isCurrentMonth ? "pointer" : "default", background: isSelected ? "#F4A7B9" : "transparent" }}>
                                            <div style={{ fontSize: "13px", fontWeight: isToday ? "700" : "400", color: isSelected ? "white" : isToday ? "#F4A7B9" : !d.isCurrentMonth ? "#ddd" : j === 0 ? "#F4A7B9" : j === 6 ? "#7F77DD" : "#333" }}>
                                                {d.date}
                                            </div>
                                            {income > 0 && <div style={{ fontSize: "9px", color: isSelected ? "white" : "#7F77DD" }}>+{income.toLocaleString()}</div>}
                                            {expense > 0 && <div style={{ fontSize: "9px", color: isSelected ? "white" : "#F4A7B9" }}>-{expense.toLocaleString()}</div>}
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>

                    <div style={{ background: "white", borderRadius: "16px", padding: "20px", border: "1px solid #eee", height: "100%", boxSizing: "border-box", overflowY: "auto" }}>
                        {grouped.length === 0 ? (
                            <p style={{ textAlign: "center", color: "#aaa", padding: "40px 0", fontSize: "14px" }}>내역이 없어요!</p>
                        ) : (
                            grouped.map(([dateStr, items]) => (
                                <div key={dateStr} style={{ marginBottom: "20px" }}>
                                    <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#999", fontWeight: "600" }}>{getDayLabel(dateStr)}</p>
                                    {items.map(item => (
                                        <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", borderRadius: "12px", marginBottom: "8px", background: "#fafafa", border: "1px solid #f0f0f0" }}>
                                            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: item.type === "지출" ? "#fff0f3" : "#f0f0ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                                                {CATEGORY_EMOJI[item.category] || "📦"}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ margin: "0 0 2px", fontSize: "14px", fontWeight: "500", color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.memo || "메모 없음"}</p>
                                                <p style={{ margin: 0, fontSize: "12px", color: "#bbb" }}>{item.category}</p>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                                                <p style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: item.type === "지출" ? "#F4A7B9" : "#7F77DD" }}>
                                                    {item.type === "지출" ? "-" : "+"}{item.amount.toLocaleString()}원
                                                </p>
                                                <button onClick={() => setEditItem({ ...item, amountStr: item.amount.toLocaleString() })} style={{ background: "none", border: "none", fontSize: "15px", cursor: "pointer", color: "#ccc", padding: 0 }}>✏️</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {editItem && (
                <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={(e) => { if (e.target === e.currentTarget) setEditItem(null) }}>
                    <div style={{ background: "white", borderRadius: "20px", padding: "28px", width: "480px", maxHeight: "85vh", overflowY: "auto", fontFamily: "'GriounPolice', cursive" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h3 style={{ margin: 0, fontSize: "18px" }}>✏️ 내역 수정</h3>
                            <button onClick={() => setEditItem(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#aaa" }}>✕</button>
                        </div>
                        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                            {["지출", "수입"].map(t => (
                                <button key={t} onClick={() => setEditItem(prev => ({ ...prev, type: t, category: t === "수입" ? "급여" : "식비" }))} style={{ padding: "8px 24px", borderRadius: "20px", border: "none", background: editItem.type === t ? accentColor : "#f0f0f0", color: editItem.type === t ? "white" : "#888", fontSize: "13px", cursor: "pointer", fontFamily: "'GriounPolice', cursive" }}>{t}</button>
                            ))}
                        </div>
                        <div style={{ marginBottom: "14px" }}>
                            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>날짜</label>
                            <input type="date" value={editItem.date} onChange={e => setEditItem(prev => ({ ...prev, date: e.target.value }))} style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #eee", fontSize: "14px", boxSizing: "border-box", fontFamily: "'GriounPolice', cursive", outline: "none", color: "#333" }} />
                        </div>
                        <div style={{ marginBottom: "14px" }}>
                            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>금액</label>
                            <div style={{ position: "relative" }}>
                                <input type="text" inputMode="numeric" value={editItem.amountStr} onChange={e => { const raw = e.target.value.replace(/,/g, ""); if (!/^\d*$/.test(raw)) return; setEditItem(prev => ({ ...prev, amountStr: raw ? parseInt(raw).toLocaleString() : "" })) }} style={{ width: "100%", padding: "11px 40px 11px 14px", borderRadius: "10px", border: "1px solid #eee", fontSize: "15px", boxSizing: "border-box", fontFamily: "'GriounPolice', cursive", outline: "none", color: "#333" }} />
                                <span style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "#aaa" }}>원</span>
                            </div>
                        </div>
                        <div style={{ marginBottom: "14px" }}>
                            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "8px" }}>카테고리</label>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px" }}>
                                {(editItem.type === "수입" ? INCOME_CATEGORIES : CATEGORIES).map(cat => (
                                    <button key={cat.label} onClick={() => setEditItem(prev => ({ ...prev, category: cat.label }))} style={{ padding: "8px 4px", borderRadius: "10px", border: "none", background: editItem.category === cat.label ? accentColor : "#f5f5f5", color: editItem.category === cat.label ? "white" : "#555", fontSize: "10px", cursor: "pointer", fontFamily: "'GriounPolice', cursive", display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                                        <span style={{ fontSize: "16px" }}>{cat.emoji}</span>
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>메모</label>
                            <input type="text" value={editItem.memo || ""} onChange={e => setEditItem(prev => ({ ...prev, memo: e.target.value }))} placeholder="메모를 입력해줘요" style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #eee", fontSize: "14px", boxSizing: "border-box", fontFamily: "'GriounPolice', cursive", outline: "none", color: "#333" }} />
                        </div>
                        <button onClick={handleEditSave} style={{ width: "100%", padding: "14px", borderRadius: "12px", background: accentColor, color: "white", border: "none", fontSize: "15px", fontWeight: "600", cursor: "pointer", fontFamily: "'GriounPolice', cursive", marginBottom: "12px" }}>저장하기</button>
                        <button onClick={() => handleDelete(editItem.id)} style={{ width: "100%", padding: "14px", borderRadius: "12px", background: "none", color: "#ff6b6b", border: "1px solid #ffcdd2", fontSize: "15px", cursor: "pointer", fontFamily: "'GriounPolice', cursive" }}>🗑️ 삭제하기</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default HistoryPage