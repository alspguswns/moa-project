import { useState, useEffect, useRef } from "react"
import { API } from "../config.js"

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

    // 우측 내역 스크롤 컨테이너를 제어하기 위한 ref 선언
    const listContainerRef = useRef(null)

    // 커스텀 모달 알림 및 확인 시스템 상태 (alert, confirm 브라우저 팝업 완전 제거)
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: "confirm", // "confirm" | "alert"
        message: "",
        onConfirm: null
    })

    useEffect(() => {
        const userId = localStorage.getItem("user_id")
        if (!userId) return
        fetch(`${API}/expense/${userId}`)
            .then(res => res.json())
            .then(data => setTransactions(Array.isArray(data) ? data : []))
            .catch(e => console.error(e))

        // 내역 화면 방문 퀘스트 자동 완료 (fire-and-forget)
        fetch(`${API}/game/quest/${userId}`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quest_type: "check" })
        }).catch(() => {})
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
        // 토스 스타일 구현을 위해 날짜 고정 필터링을 제외하고 전체 리스트를 활성화해 둡니다.
        return matchSearch && matchFilter
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

    const handleDateClick = (dateNum) => {
        setSelectedDate(dateNum)
        const targetDateStr = `${monthStr}-${String(dateNum).padStart(2, "0")}`

        // DOM 갱신 시간을 약간 두어 스크롤 오차가 없도록 처리
        setTimeout(() => {
            const targetEl = document.getElementById(`group-${targetDateStr}`)
            const containerEl = listContainerRef.current
            if (targetEl && containerEl) {
                const containerTop = containerEl.getBoundingClientRect().top
                const targetTop = targetEl.getBoundingClientRect().top
                // 전체 브라우저 스크롤을 건드리지 않고, 해당 스크롤 박스 내부의 scrollTop만 유연하게 이동
                const relativeTop = targetTop - containerTop + containerEl.scrollTop

                containerEl.scrollTo({
                    top: relativeTop - 15, // 상단 여유 패딩 보정
                    behavior: "smooth"
                })
            }
        }, 50)
    }

    const handleDeleteClick = (id) => {
        setModalConfig({
            isOpen: true,
            type: "confirm",
            message: "정말로 이 내역을 삭제할까요? 🐷",
            onConfirm: () => executeDelete(id)
        })
    }

    const executeDelete = async (id) => {
        try {
            const res = await fetch(`${API}/expense/${id}`, { method: "DELETE" })
            if (res.ok) {
                setTransactions(prev => prev.filter(t => t.id !== id))
                setEditItem(null)
                setModalConfig({ isOpen: false })
            } else {
                setModalConfig({
                    isOpen: true,
                    type: "alert",
                    message: "삭제에 실패했습니다. 다시 시도해주세요."
                })
            }
        } catch (e) {
            console.error(e)
            setModalConfig({
                isOpen: true,
                type: "alert",
                message: "서버와의 연결이 원활하지 않습니다."
            })
        }
    }

    const handleEditSave = async () => {
        const rawAmount = editItem.amountStr.replace(/,/g, "")
        if (!rawAmount) return
        try {
            const res = await fetch(`${API}/expense/${editItem.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: editItem.type, amount: parseInt(rawAmount), category: editItem.category, memo: editItem.memo, date: editItem.date })
            })
            if (res.ok) {
                setTransactions(prev => prev.map(t => t.id === editItem.id ? { ...t, ...editItem, amount: parseInt(rawAmount) } : t))
                setEditItem(null)
            } else {
                setModalConfig({
                    isOpen: true,
                    type: "alert",
                    message: "수정에 실패했습니다. 다시 확인해주세요."
                })
            }
        } catch (e) {
            console.error(e)
            setModalConfig({
                isOpen: true,
                type: "alert",
                message: "네트워크 오류가 발생했습니다."
            })
        }
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
        <div style={{
            display: "flex",
            height: "100vh",
            width: "100vw",
            fontFamily: "'GriounPolice', cursive",
            backgroundImage: `linear-gradient(#e0e0e0 1px, transparent 1px), linear-gradient(90deg, #e0e0e0 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
            backgroundColor: "#f5f5f5",
            overflow: "hidden",
            boxSizing: "border-box"
        }}>

            {/* Custom Interactive Modal Box */}
            {modalConfig.isOpen && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(0, 0, 0, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    backdropFilter: "blur(2px)"
                }}>
                    <div style={{
                        background: "white",
                        borderRadius: "20px",
                        padding: "24px",
                        width: "320px",
                        textAlign: "center",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                        border: "1px solid #ffd9e2"
                    }}>
                        <span style={{ fontSize: "36px", display: "block", marginBottom: "12px" }}>🐷</span>
                        <p style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: "600", color: "#333", lineHeight: "1.5" }}>
                            {modalConfig.message}
                        </p>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                            {modalConfig.type === "confirm" ? (
                                <>
                                    <button
                                        onClick={() => setModalConfig({ isOpen: false })}
                                        style={{
                                            flex: 1,
                                            padding: "10px",
                                            background: "#eee",
                                            border: "none",
                                            borderRadius: "10px",
                                            fontSize: "13px",
                                            cursor: "pointer",
                                            fontWeight: "600",
                                            color: "#555",
                                            fontFamily: "inherit"
                                        }}
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={modalConfig.onConfirm}
                                        style={{
                                            flex: 1,
                                            padding: "10px",
                                            background: "#F4A7B9",
                                            border: "none",
                                            borderRadius: "10px",
                                            fontSize: "13px",
                                            cursor: "pointer",
                                            fontWeight: "600",
                                            color: "white",
                                            fontFamily: "inherit"
                                        }}
                                    >
                                        확인
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setModalConfig({ isOpen: false })}
                                    style={{
                                        width: "120px",
                                        padding: "10px",
                                        background: "#F4A7B9",
                                        border: "none",
                                        borderRadius: "10px",
                                        fontSize: "13px",
                                        cursor: "pointer",
                                        fontWeight: "600",
                                        color: "white",
                                        fontFamily: "inherit"
                                    }}
                                >
                                    확인
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {}
            {/* Top Bar */}
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

            {/* Side Bar */}
            <div style={{ position: "fixed", top: "64px", left: 0, width: "72px", height: "calc(100vh - 64px)", background: "white", borderRight: "1px solid #eee", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0", gap: "12px", zIndex: 100 }}>
                {navItems.map(item => (
                    <div key={item.key} onClick={item.onClick} style={{ width: "48px", height: "48px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", cursor: "pointer", background: current === item.key ? "#fff0f3" : "transparent", border: current === item.key ? "1.5px solid #F4A7B9" : "1.5px solid transparent" }}>
                        {item.icon}
                    </div>
                ))}
            </div>

            {/* Main Area Container */}
            <div style={{
                marginLeft: "72px",
                marginTop: "64px",
                width: "calc(100vw - 72px)",
                height: "calc(100vh - 64px)",
                padding: "24px 32px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
            }}>
                {/* Month Picker Controller */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexShrink: 0 }}>
                    <button onClick={prevMonth} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#666" }}>‹</button>
                    <span style={{ fontSize: "20px", fontWeight: "700", color: "#333" }}>{month + 1}월 내역</span>
                    <button onClick={nextMonth} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#666" }}>›</button>
                </div>

                {/* 2-Column Grid filling the remaining heights exactly */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "24px",
                    flex: 1,
                    minHeight: 0,
                    width: "100%"
                }}>

                    {/* Left Column: Search & Add Spend -> Total Expense -> Calendar Card */}
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                        height: "100%",
                        minHeight: 0
                    }}>
                        {/* Row 1: Search & CTA Button */}
                        <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                            <div style={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                background: "white",
                                borderRadius: "12px",
                                padding: "10px 14px",
                                border: "1px solid #eee",
                                height: "42px",
                                boxSizing: "border-box"
                            }}>
                                <span style={{ color: "#aaa" }}>🔍</span>
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="검색"
                                    style={{ border: "none", outline: "none", fontSize: "14px", color: "#333", width: "100%", fontFamily: "inherit", background: "none" }}
                                />
                            </div>
                            <button
                                onClick={onAddSpend}
                                style={{
                                    background: "#F4A7B9",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "12px",
                                    padding: "0 18px",
                                    fontSize: "13px",
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    whiteSpace: "nowrap",
                                    height: "42px"
                                }}
                            >
                                + 내역 추가
                            </button>
                        </div>

                        {/* Row 2: Total Expense Box */}
                        <div style={{ background: "white", borderRadius: "14px", padding: "14px 20px", border: "1px solid #eee", flexShrink: 0 }}>
                            <p style={{ margin: "0 0 2px", fontSize: "12px", color: "#bbb" }}>{month + 1}월 전체 지출 금액</p>
                            <p style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "#333" }}>{totalExpense.toLocaleString()}원</p>
                        </div>

                        {}
                        {/* Row 3: Calendar Card (Stretched to fill the remaining area beautifully without empty spaces) */}
                        <div style={{
                            background: "white",
                            borderRadius: "16px",
                            padding: "20px",
                            border: "1px solid #eee",
                            display: "flex",
                            flexDirection: "column",
                            flex: 1,
                            minHeight: 0,
                            overflow: "hidden",
                            boxSizing: "border-box"
                        }}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "12px", flexShrink: 0 }}>
                                {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
                                    <div key={d} style={{ textAlign: "center", fontSize: "12px", fontWeight: "600", color: i === 0 ? "#F4A7B9" : i === 6 ? "#7F77DD" : "#bbb", padding: "4px 0" }}>{d}</div>
                                ))}
                            </div>

                            {/* Calendar Body: Flex column where each week stretches evenly */}
                            <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: "6px", minHeight: 0 }}>
                                {fullDatesGrid.map((week, i) => (
                                    <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", flex: 1, minHeight: 0, gap: "4px" }}>
                                        {week.map((d, j) => {
                                            const isToday = d.isCurrentMonth && new Date(year, month, d.date).toDateString() === today.toDateString()
                                            const isSelected = d.isCurrentMonth && d.date === selectedDate
                                            const { income, expense } = d.isCurrentMonth ? getDaySummary(d.date) : { income: 0, expense: 0 }
                                            return (
                                                <div
                                                    key={`${i}-${j}`}
                                                    onClick={() => d.isCurrentMonth && handleDateClick(d.date)}
                                                    style={{
                                                        textAlign: "center",
                                                        borderRadius: "10px",
                                                        cursor: d.isCurrentMonth ? "pointer" : "default",
                                                        background: isSelected ? "#F4A7B9" : "transparent",
                                                        transition: "all 0.15s ease-in-out",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        justifyContent: "space-between",
                                                        padding: "6px 2px",
                                                        height: "100%",
                                                        boxSizing: "border-box",
                                                        border: isToday && !isSelected ? "1.5px solid #F4A7B9" : "1.5px solid transparent"
                                                    }}
                                                >
                                                    <div style={{
                                                        fontSize: "13px",
                                                        fontWeight: isToday ? "700" : "400",
                                                        color: isSelected ? "white" : isToday ? "#F4A7B9" : !d.isCurrentMonth ? "#ddd" : j === 0 ? "#F4A7B9" : j === 6 ? "#7F77DD" : "#333",
                                                        marginTop: "2px"
                                                    }}>
                                                        {d.date}
                                                    </div>
                                                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", flexGrow: 1, gap: "1px", marginBottom: "2px" }}>
                                                        {income > 0 && <div style={{ fontSize: "9px", fontWeight: "700", color: isSelected ? "white" : "#7F77DD", lineHeight: 1 }}>+{income.toLocaleString()}</div>}
                                                        {expense > 0 && <div style={{ fontSize: "9px", fontWeight: "700", color: isSelected ? "white" : "#F4A7B9", lineHeight: 1 }}>-{expense.toLocaleString()}</div>}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Selected Info & Filter Dropdown -> Transaction List Card */}
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                        height: "100%",
                        minHeight: 0
                    }}>
                        {/* Row 1: Selected Date & Filter Options */}
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexShrink: 0,
                            height: "42px"
                        }}>
                            <div style={{
                                background: "white",
                                borderRadius: "12px",
                                padding: "0 16px",
                                border: "1px solid #eee",
                                fontSize: "14px",
                                color: "#333",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                boxSizing: "border-box"
                            }}>
                                {selectedDate ? `${month + 1}월 ${selectedDate}일 상세` : `${month + 1}월 전체 상세`}
                            </div>
                            <div style={{ position: "relative", height: "100%" }}>
                                <button
                                    onClick={() => setFilterOpen(prev => !prev)}
                                    style={{
                                        background: "white",
                                        border: "1px solid #eee",
                                        borderRadius: "12px",
                                        padding: "0 16px",
                                        fontSize: "14px",
                                        cursor: "pointer",
                                        fontFamily: "inherit",
                                        color: "#333",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        height: "100%",
                                        boxSizing: "border-box"
                                    }}
                                >
                                    {filter} ▾
                                </button>
                                {filterOpen && (
                                    <div style={{ position: "absolute", right: 0, top: "46px", background: "white", borderRadius: "12px", border: "1px solid #eee", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 50, overflow: "hidden", minWidth: "100px" }}>
                                        {["전체", "입금", "출금"].map(f => (
                                            <div key={f} onClick={() => { setFilter(f); setFilterOpen(false) }} style={{ padding: "12px 20px", cursor: "pointer", fontSize: "14px", color: filter === f ? "#F4A7B9" : "#333", background: filter === f ? "#fff0f3" : "transparent", fontWeight: filter === f ? "700" : "400" }}>{f}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {}
                        {/* Row 2: Detailed Transaction Records Box */}
                        <div
                            ref={listContainerRef}
                            style={{
                                background: "white",
                                borderRadius: "16px",
                                padding: "20px",
                                border: "1px solid #eee",
                                flex: 1,
                                minHeight: 0,
                                overflowY: "auto",
                                boxSizing: "border-box",
                                scrollBehavior: "smooth"
                            }}
                        >
                            {grouped.length === 0 ? (
                                <p style={{ textAlign: "center", color: "#aaa", padding: "40px 0", fontSize: "14px" }}>내역이 없어요!</p>
                            ) : (
                                grouped.map(([dateStr, items]) => {
                                    const isTargetGroup = selectedDate && dateStr === `${monthStr}-${String(selectedDate).padStart(2, "0")}`;
                                    return (
                                        <div
                                            key={dateStr}
                                            id={`group-${dateStr}`}
                                            style={{
                                                marginBottom: "20px",
                                                borderRadius: "14px",
                                                transition: "all 0.3s ease"
                                            }}
                                        >
                                            <p style={{
                                                margin: "0 0 10px",
                                                fontSize: "13px",
                                                color: isTargetGroup ? "#F4A7B9" : "#999",
                                                fontWeight: "600",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                transition: "color 0.3s ease"
                                            }}>
                                                {getDayLabel(dateStr)}
                                                {isTargetGroup && <span style={{ fontSize: "11px", background: "#fff0f3", padding: "2px 6px", borderRadius: "4px" }}>📍 클릭됨</span>}
                                            </p>
                                            {items.map(item => (
                                                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", borderRadius: "12px", marginBottom: "8px", background: "#fafafa", border: isTargetGroup ? "1.5px solid #ffd9e2" : "1px solid #f0f0f0", transition: "all 0.3s ease" }}>
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
                                    )
                                })
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {}
            {/* Slide-over or Central Overlay Card for Edit Actions */}
            {editItem && (
                <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={(e) => { if (e.target === e.currentTarget) setEditItem(null) }}>
                    <div style={{ background: "white", borderRadius: "20px", padding: "28px", width: "480px", maxHeight: "85vh", overflowY: "auto", fontFamily: "inherit" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h3 style={{ margin: 0, fontSize: "18px" }}>✏️ 내역 수정</h3>
                            <button onClick={() => setEditItem(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#aaa" }}>✕</button>
                        </div>
                        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                            {["지출", "수입"].map(t => (
                                <button key={t} onClick={() => setEditItem(prev => ({ ...prev, type: t, category: t === "수입" ? "급여" : "식비" }))} style={{ padding: "8px 24px", borderRadius: "20px", border: "none", background: editItem.type === t ? accentColor : "#f0f0f0", color: editItem.type === t ? "white" : "#888", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>{t}</button>
                            ))}
                        </div>
                        <div style={{ marginBottom: "14px" }}>
                            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>날짜</label>
                            <input type="date" value={editItem.date} onChange={e => setEditItem(prev => ({ ...prev, date: e.target.value }))} style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #eee", fontSize: "14px", boxSizing: "border-box", fontFamily: "inherit", outline: "none", color: "#333" }} />
                        </div>
                        <div style={{ marginBottom: "14px" }}>
                            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>금액</label>
                            <div style={{ position: "relative" }}>
                                <input type="text" inputMode="numeric" value={editItem.amountStr} onChange={e => { const raw = e.target.value.replace(/,/g, ""); if (!/^\d*$/.test(raw)) return; setEditItem(prev => ({ ...prev, amountStr: raw ? parseInt(raw).toLocaleString() : "" })) }} style={{ width: "100%", padding: "11px 40px 11px 14px", borderRadius: "10px", border: "1px solid #eee", fontSize: "15px", boxSizing: "border-box", fontFamily: "inherit", outline: "none", color: "#333" }} />
                                <span style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "#aaa" }}>원</span>
                            </div>
                        </div>
                        <div style={{ marginBottom: "14px" }}>
                            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "8px" }}>카테고리</label>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px" }}>
                                {(editItem.type === "수입" ? INCOME_CATEGORIES : CATEGORIES).map(cat => (
                                    <button key={cat.label} onClick={() => setEditItem(prev => ({ ...prev, category: cat.label }))} style={{ padding: "8px 4px", borderRadius: "10px", border: "none", background: editItem.category === cat.label ? accentColor : "#f5f5f5", color: editItem.category === cat.label ? "white" : "#555", fontSize: "10px", cursor: "pointer", fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                                        <span style={{ fontSize: "16px" }}>{cat.emoji}</span>
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>메모</label>
                            <input type="text" value={editItem.memo || ""} onChange={e => setEditItem(prev => ({ ...prev, memo: e.target.value }))} placeholder="메모를 입력해줘요" style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid #eee", fontSize: "14px", boxSizing: "border-box", fontFamily: "inherit", outline: "none", color: "#333" }} />
                        </div>
                        <button onClick={handleEditSave} style={{ width: "100%", padding: "14px", borderRadius: "12px", background: accentColor, color: "white", border: "none", fontSize: "15px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", marginBottom: "12px" }}>저장하기</button>
                        <button onClick={() => handleDeleteClick(editItem.id)} style={{ width: "100%", padding: "14px", borderRadius: "12px", background: "none", color: "#ff6b6b", border: "1px solid #ffcdd2", fontSize: "15px", cursor: "pointer", fontFamily: "inherit" }}>🗑️ 삭제하기</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default HistoryPage