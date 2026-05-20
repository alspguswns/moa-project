import { useState } from "react"

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

// 수입 카테고리를 10가지 실용적인 항목들로 재구성
const INCOME_CATEGORIES = [
    { label: "급여", emoji: "💰" },
    { label: "알바", emoji: "💼" },
    { label: "용돈", emoji: "🎁" },
    { label: "부수입", emoji: "📈" },
    { label: "상여금", emoji: "💎" },
    { label: "금융소득", emoji: "🏦" },
    { label: "중고거래", emoji: "🤝" },
    { label: "캐시백", emoji: "🪙" },
    { label: "환급금", emoji: "💵" },
    { label: "기타", emoji: "📦" },
]

function AddSpendPage({ onBack, onHome, onHistory, onAnalysis, onWishlist, onChat, onLogout, current }) {
    const today = new Date()
    const nickname = localStorage.getItem("nickname") || "사용자"
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

    // 알림용 커스텀 모달 상태 관리
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: "alert", // "confirm" | "alert"
        message: "",
        confirmLabel: "확인",
        cancelLabel: "취소",
        onConfirm: null,
        onCancel: null
    })

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

    const handleCalPrev = (e) => {
        e.stopPropagation()
        if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) }
        else setCalMonth(m => m - 1)
    }
    const handleCalNext = (e) => {
        e.stopPropagation()
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
        if (!rawAmount) {
            setError("금액을 입력해줘요!")
            return
        }
        setError("")

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
                // 연속 입력 여부를 물어보는 confirm 모달 표출
                setModalConfig({
                    isOpen: true,
                    type: "confirm",
                    message: "작성하신 내역이 무사히 저장되었어요! 🐷\n추가로 다른 내역을 더 입력하시겠습니까?",
                    confirmLabel: "예",
                    cancelLabel: "아니오",
                    onConfirm: () => {
                        // '예'를 누르면 현재 화면을 유지하면서 인풋 데이터만 초기화함
                        setAmount("")
                        setMemo("")
                        setCategory(type === "수입" ? "급여" : "식비")
                        setIsRegular(false)
                        setModalConfig(prev => ({ ...prev, isOpen: false }))
                    },
                    onCancel: () => {
                        // '아니오'를 누르면 모달을 닫고 이전 화면(홈/내역 목록)으로 복귀
                        setModalConfig(prev => ({ ...prev, isOpen: false }))
                        onBack()
                    }
                })
            } else {
                setError(typeof data.detail === "string" ? data.detail : "저장에 실패했어요!")
            }
        } catch (e) {
            setError("서버 연결에 실패했어요!")
        }
    }

    // 사용자의 요청대로 색상 톤을 시그니처 핑크로 전면 통일
    const accentColor = "#F4A7B9"
    const accentBg = "#fff0f3"

    const navItems = [
        { key: "main", icon: "🏠", onClick: onHome },
        { key: "history", icon: "📋", onClick: onHistory },
        { key: "analysis", icon: "📊", onClick: onAnalysis },
        { key: "wishlist", icon: "🛍️", onClick: onWishlist },
        { key: "chat", icon: "💬", onClick: onChat },
        { key: "logout", icon: "🚪", onClick: () => {
                setModalConfig({
                    isOpen: true,
                    type: "confirm",
                    message: "정말로 로그아웃 하시겠습니까? 🐷",
                    confirmLabel: "확인",
                    cancelLabel: "취소",
                    onConfirm: () => {
                        setModalConfig({ isOpen: false })
                        onLogout()
                    },
                    onCancel: () => {
                        setModalConfig({ isOpen: false })
                    }
                })
            }},
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

            {/* 커스텀 모달 팝업 */}
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
                        border: `1.5px solid ${accentColor}`
                    }}>
                        <span style={{ fontSize: "36px", display: "block", marginBottom: "12px" }}>🐷</span>
                        <p style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: "600", color: "#333", lineHeight: "1.5", whiteSpace: "pre-line" }}>
                            {modalConfig.message}
                        </p>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                            {modalConfig.type === "confirm" ? (
                                <>
                                    <button
                                        onClick={() => {
                                            if (modalConfig.onCancel) {
                                                modalConfig.onCancel();
                                            } else {
                                                setModalConfig({ isOpen: false });
                                            }
                                        }}
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
                                        {modalConfig.cancelLabel || "취소"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (modalConfig.onConfirm) modalConfig.onConfirm();
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: "10px",
                                            background: accentColor,
                                            border: "none",
                                            borderRadius: "10px",
                                            fontSize: "13px",
                                            cursor: "pointer",
                                            fontWeight: "600",
                                            color: "white",
                                            fontFamily: "inherit"
                                        }}
                                    >
                                        {modalConfig.confirmLabel || "확인"}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => {
                                        setModalConfig({ isOpen: false });
                                        if (modalConfig.onConfirm) modalConfig.onConfirm();
                                    }}
                                    style={{
                                        width: "120px",
                                        padding: "10px",
                                        background: accentColor,
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

            {/* 상단 GNB 헤더 바 */}
            <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "64px",
                background: "white",
                borderBottom: "1px solid #eee",
                zIndex: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 32px",
                boxSizing: "border-box"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={onHome}>
                    <span style={{ fontSize: "28px" }}>🐷</span>
                    <span style={{ fontSize: "22px", fontWeight: "700", color: "#F4A7B9" }}>MOA</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <span style={{ fontSize: "20px", cursor: "pointer" }}>🔔</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f5f5f5", borderRadius: "20px", padding: "6px 12px" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#F4A7B9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "white" }}>
                            {nickname[0]}
                        </div>
                        <span style={{ fontSize: "13px", color: "#333", fontWeight: "600" }}>{nickname}</span>
                        <span style={{ fontSize: "11px", color: "#aaa" }}>▾</span>
                    </div>
                </div>
            </div>

            {/* 좌측 LNB 사이드바 */}
            <div style={{
                position: "fixed",
                top: "64px",
                left: 0,
                width: "72px",
                height: "calc(100vh - 64px)",
                background: "white",
                borderRight: "1px solid #eee",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "24px 0",
                gap: "12px",
                zIndex: 100,
                boxSizing: "border-box"
            }}>
                {navItems.map(item => (
                    <div
                        key={item.key}
                        onClick={item.onClick}
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "22px",
                            cursor: "pointer",
                            background: current === item.key ? "#fff0f3" : "transparent",
                            border: current === item.key ? "1.5px solid #F4A7B9" : "1.5px solid transparent",
                            transition: "all 0.2s"
                        }}
                    >
                        {item.icon}
                    </div>
                ))}
            </div>

            {/* 메인 콘텐츠 영역 */}
            <div style={{
                marginLeft: "72px",
                marginTop: "64px",
                width: "calc(100vw - 72px)",
                height: "calc(100vh - 64px)",
                padding: "24px 32px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden"
            }}>

                {/* 헤더 버튼 및 타이틀 */}
                <div style={{
                    width: "100%",
                    maxWidth: "840px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "16px",
                    flexShrink: 0
                }}>
                    <button
                        onClick={onBack}
                        style={{
                            background: "none",
                            border: "none",
                            fontSize: "24px",
                            cursor: "pointer",
                            color: "#888",
                            padding: "4px 8px",
                            display: "flex",
                            alignItems: "center"
                        }}
                    >
                        ←
                    </button>
                    <span style={{ fontSize: "20px", fontWeight: "700", color: "#333" }}>내역 추가</span>
                </div>

                {/* 중앙 폼 메인 카드 */}
                <div style={{
                    width: "100%",
                    maxWidth: "840px",
                    background: "white",
                    borderRadius: "24px",
                    padding: "32px 40px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                    border: "1px solid #f0f0f0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                    boxSizing: "border-box",
                    position: "relative",
                    overflowY: "auto",
                    maxHeight: "calc(100% - 60px)"
                }}>

                    {/* 지출 / 수입 선택 탭 */}
                    <div style={{
                        display: "flex",
                        borderBottom: "2px solid #f0f0f0",
                        marginBottom: "4px",
                        flexShrink: 0
                    }}>
                        {["지출", "수입"].map((t) => {
                            const isSelected = type === t;
                            return (
                                <button
                                    key={t}
                                    onClick={() => {
                                        setType(t)
                                        setCategory(t === "수입" ? "급여" : "식비")
                                    }}
                                    style={{
                                        padding: "12px 32px",
                                        border: "none",
                                        background: "transparent",
                                        color: isSelected ? accentColor : "#aaa",
                                        fontSize: "16px",
                                        fontWeight: "700",
                                        cursor: "pointer",
                                        fontFamily: "inherit",
                                        borderBottom: isSelected ? `3px solid ${accentColor}` : "3px solid transparent",
                                        marginBottom: "-2px",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    {t}
                                </button>
                            )
                        })}
                    </div>

                    {/* 날짜 선택 */}
                    <div style={{ position: "relative" }}>
                        <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>날짜</label>
                        <button
                            onClick={() => setShowCal(!showCal)}
                            style={{
                                width: "100%",
                                padding: "14px 16px",
                                borderRadius: "12px",
                                border: "1.5px solid #eee",
                                background: "#fafafa",
                                fontSize: "14.5px",
                                color: "#333",
                                textAlign: "left",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                outline: "none",
                                transition: "border-color 0.2s"
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = accentColor}
                            onBlur={e => e.currentTarget.style.borderColor = "#eee"}
                        >
                            📅 {formatDisplayDate(selectedDate)}
                        </button>

                        {/* 달력 오버레이 드롭다운 */}
                        {showCal && (
                            <div style={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                width: "100%",
                                maxWidth: "340px",
                                background: "white",
                                borderRadius: "16px",
                                padding: "16px",
                                marginTop: "8px",
                                boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                                border: "1px solid #f0f0f0",
                                zIndex: 10
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                    <button onClick={handleCalPrev} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#666" }}>‹</button>
                                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#333" }}>{calYear}년 {calMonth + 1}월</span>
                                    <button onClick={handleCalNext} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#666" }}>›</button>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "6px" }}>
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

                    {/* 금액 입력 */}
                    <div>
                        <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>금액</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="0"
                                value={amount}
                                onChange={handleAmountChange}
                                style={{
                                    width: "100%",
                                    padding: "14px 44px 14px 16px",
                                    borderRadius: "12px",
                                    border: "1.5px solid #eee",
                                    fontSize: "16px",
                                    boxSizing: "border-box",
                                    fontFamily: "inherit",
                                    color: "#333",
                                    outline: "none",
                                    background: "#fafafa",
                                    transition: "border-color 0.2s"
                                }}
                                onFocus={e => e.currentTarget.style.borderColor = accentColor}
                                onBlur={e => e.currentTarget.style.borderColor = "#eee"}
                            />
                            <span style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "15px", color: "#aaa", fontWeight: "600" }}>원</span>
                        </div>
                    </div>

                    {/* 카테고리 (2행 5열) */}
                    <div>
                        <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "8px" }}>카테고리</label>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(5, 1fr)",
                            gap: "10px"
                        }}>
                            {(type === "수입" ? INCOME_CATEGORIES : CATEGORIES).map((cat) => {
                                const isSelected = category === cat.label;
                                return (
                                    <button
                                        key={cat.label}
                                        onClick={() => setCategory(cat.label)}
                                        style={{
                                            padding: "14px 4px",
                                            borderRadius: "14px",
                                            border: isSelected ? `1.5px solid ${accentColor}` : "1.5px solid #f0f0f0",
                                            background: isSelected ? accentBg : "white",
                                            color: isSelected ? accentColor : "#555",
                                            fontSize: "12.5px",
                                            fontWeight: isSelected ? "700" : "500",
                                            cursor: "pointer",
                                            fontFamily: "inherit",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "6px",
                                            boxShadow: isSelected ? "0 4px 12px rgba(244,167,185,0.15)" : "0 1px 3px rgba(0,0,0,0.02)",
                                            transition: "all 0.15s"
                                        }}
                                    >
                                        <span style={{ fontSize: "20px" }}>{cat.emoji}</span>
                                        {cat.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* 정기 지출/수입 토글 (상시 노출) */}
                    <div style={{
                        background: "#fafafa",
                        borderRadius: "14px",
                        padding: "14px 20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        border: "1px solid #eee"
                    }}>
                        <div>
                            <p style={{ margin: "0 0 2px", fontSize: "13.5px", color: "#333", fontWeight: "600" }}>
                                {type === "지출" ? "정기 지출로 설정" : "정기 수입으로 설정"}
                            </p>
                            <p style={{ margin: 0, fontSize: "11px", color: "#999" }}>매달 같은 날짜에 자동으로 추가돼요</p>
                        </div>
                        <div onClick={() => setIsRegular(prev => !prev)} style={{
                            width: "44px", height: "24px", borderRadius: "12px",
                            background: isRegular ? accentColor : "#ddd",
                            cursor: "pointer", position: "relative", transition: "background 0.2s",
                            flexShrink: 0
                        }}>
                            <div style={{
                                width: "20px", height: "20px", borderRadius: "50%",
                                background: "white", position: "absolute",
                                top: "2px", left: isRegular ? "22px" : "2px",
                                transition: "left 0.2s",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.15)"
                            }} />
                        </div>
                    </div>

                    {/* 메모 입력 */}
                    <div>
                        <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>메모</label>
                        <input
                            type="text"
                            placeholder={type === "수입" ? "(메모)" : "(메모)"}
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "14px 16px",
                                borderRadius: "12px",
                                border: "1.5px solid #eee",
                                fontSize: "14.5px",
                                boxSizing: "border-box",
                                fontFamily: "inherit",
                                color: "#333",
                                outline: "none",
                                background: "#fafafa",
                                transition: "border-color 0.2s"
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = accentColor}
                            onBlur={e => e.currentTarget.style.borderColor = "#eee"}
                        />
                    </div>

                    {/* 에러 메세지 배너 */}
                    {error && (
                        <p style={{ color: "#F4A7B9", fontSize: "12.5px", margin: "0", textAlign: "center", fontWeight: "700" }}>⚠️ {error}</p>
                    )}

                    {/* 저장하기 버튼 */}
                    <button
                        onClick={handleSave}
                        style={{
                            width: "100%",
                            padding: "16px",
                            borderRadius: "14px",
                            background: accentColor,
                            color: "white",
                            border: "none",
                            fontSize: "16px",
                            fontWeight: "700",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            boxShadow: "0 4px 12px rgba(244,167,185,0.25)",
                            marginTop: "10px",
                            transition: "opacity 0.2s"
                        }}
                        onMouseOver={e => e.currentTarget.style.opacity = 0.9}
                        onMouseOut={e => e.currentTarget.style.opacity = 1}
                    >
                        저장하기 🐷
                    </button>

                </div>
            </div>
        </div>
    )
}

export default AddSpendPage