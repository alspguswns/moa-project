import { useState, useEffect } from "react"

// 카테고리별 우선순위 배지 설정
const PRIORITY_STYLES = {
    1: { text: "1순위 ⭐⭐⭐", color: "#F4A7B9", bg: "#fff0f3" },
    2: { text: "2순위 ⭐⭐", color: "#FFB347", bg: "#fffcf0" },
    3: { text: "3순위 ⭐", color: "#95A5A6", bg: "#f5f7f8" },
}

function WishlistPage({ onHome, onHistory, onAnalysis, onWishlist, onChat, onLogout, current }) {
    const userId = localStorage.getItem("user_id")
    const nickname = localStorage.getItem("nickname") || "사용자"
    const [items, setItems] = useState([])
    const [name, setName] = useState("")
    const [price, setPrice] = useState("")
    const [priority, setPriority] = useState("1")
    const [memo, setMemo] = useState("")
    const [loading, setLoading] = useState(true)

    // 브라우저 팝업(alert/confirm)을 대체하기 위한 커스텀 모달 상태
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: "alert", // "confirm" | "alert"
        message: "",
        onConfirm: null
    })

    const fetchItems = () => {
        if (!userId) {
            setLoading(false)
            return
        }
        setLoading(true)
        fetch(`http://127.0.0.1:8000/wishlist/${userId}`)
            .then(res => res.json())
            .then(data => {
                setItems(Array.isArray(data) ? data : [])
                setLoading(false)
            })
            .catch(e => {
                console.error(e)
                setLoading(false)
            })
    }

    useEffect(() => {
        fetchItems()
    }, [])

    const handleAdd = async () => {
        if (!name.trim()) {
            setModalConfig({
                isOpen: true,
                type: "alert",
                message: "갖고 싶은 물건의 이름을 입력해줘요! 🐷"
            })
            return
        }
        const numericPrice = parseInt(price.toString().replace(/,/g, ""))
        if (isNaN(numericPrice) || numericPrice <= 0) {
            setModalConfig({
                isOpen: true,
                type: "alert",
                message: "정확한 가격을 입력해줘요! 💸"
            })
            return
        }

        try {
            const res = await fetch("http://127.0.0.1:8000/wishlist/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: parseInt(userId),
                    name: name.trim(),
                    price: numericPrice,
                    priority: parseInt(priority),
                    memo: memo.trim()
                })
            })

            if (res.ok) {
                setName("")
                setPrice("")
                setPriority("1")
                setMemo("")
                fetchItems()
                setModalConfig({
                    isOpen: true,
                    type: "alert",
                    message: "위시리스트에 무사히 추가되었어요! 🎉"
                })
            } else {
                setModalConfig({
                    isOpen: true,
                    type: "alert",
                    message: "추가에 실패했어요. 입력 내용을 다시 확인해 주세요."
                })
            }
        } catch (e) {
            console.error(e)
            setModalConfig({
                isOpen: true,
                type: "alert",
                message: "서버와 통신할 수 없습니다. 잠시 후 다시 시도해 주세요."
            })
        }
    }

    const handleDeleteClick = (id, itemName) => {
        setModalConfig({
            isOpen: true,
            type: "confirm",
            message: `[${itemName}]을(를) 위시리스트에서 정말 삭제할까요?`,
            onConfirm: () => executeDelete(id)
        })
    }

    const executeDelete = async (id) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/wishlist/${id}`, { method: "DELETE" })
            if (res.ok) {
                setItems(prev => prev.filter(item => item.id !== id))
                setModalConfig({
                    isOpen: true,
                    type: "alert",
                    message: "성공적으로 삭제되었습니다!"
                })
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
                message: "서버 네트워크 통신에 오류가 발생했습니다."
            })
        }
    }

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
                    onConfirm: () => {
                        setModalConfig({ isOpen: false })
                        onLogout()
                    }
                })
            }},
    ]

    // 통계 계산
    const totalWishCount = items.length
    const totalWishPrice = items.reduce((sum, item) => sum + item.price, 0)

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

            {/* 커스텀 팝업 모달 */}
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
                                        onClick={() => {
                                            if (modalConfig.onConfirm) modalConfig.onConfirm();
                                        }}
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

            {/* 상단 GNB 바 */}
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

            {/* 좌측 사이드 LNB 바 */}
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
                overflow: "hidden"
            }}>

                {/* 헤더 타이틀 */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexShrink: 0 }}>
                    <span style={{ fontSize: "24px" }}>🛍️</span>
                    <span style={{ fontSize: "20px", fontWeight: "700", color: "#333" }}>위시리스트</span>
                </div>

                {/* 2단 메인 레이아웃 (좌: 독립 스크롤 위시 목록, 우: 요약 통계 및 추가 폼) */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1.5fr 1.2fr", // 도면처럼 위시 목록(좌)을 더 넓게 배치
                    gap: "24px",
                    flex: 1,
                    minHeight: 0,
                    width: "100%",
                    boxSizing: "border-box"
                }}>

                    {/* LEFT COLUMN: 위시리스트 아이템 스크롤 목록 */}
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        minHeight: 0
                    }}>
                        <div style={{
                            background: "white",
                            borderRadius: "24px",
                            padding: "24px",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                            border: "1px solid #f0f0f0",
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexShrink: 0 }}>
                                <span style={{ fontSize: "14px", fontWeight: "700", color: "#111" }}>📝 위시 목록</span>
                                <span style={{ fontSize: "11px", color: "#aaa" }}></span>
                            </div>

                            {/* 세로 스크롤 영역 */}
                            <div style={{
                                flex: 1,
                                overflowY: "auto",
                                paddingRight: "4px"
                            }}>
                                {loading ? (
                                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%" }}>
                                        <span style={{ fontSize: "36px", animation: "bounce 1s infinite" }}>🐷</span>
                                        <p style={{ color: "#aaa", fontSize: "13px", marginTop: "12px" }}>위시 목록을 정리하는 중...</p>
                                    </div>
                                ) : items.length === 0 ? (
                                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", gap: "12px" }}>
                                        <span style={{ fontSize: "48px" }}>🛍️</span>
                                        <p style={{ color: "#aaa", fontSize: "14px", textAlign: "center" }}>
                                            위시리스트가 텅 비어있어요!<br />갖고 싶은 소망을 채워볼까요?
                                        </p>
                                    </div>
                                ) : (
                                    items
                                        .sort((a, b) => a.priority - b.priority) // 우선순위 높은 순 정렬
                                        .map(item => {
                                            const badge = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES[3]
                                            return (
                                                <div
                                                    key={item.id}
                                                    style={{
                                                        background: "#fafafa",
                                                        borderRadius: "18px",
                                                        padding: "16px 20px",
                                                        marginBottom: "12px",
                                                        border: "1px solid #f1f1f1",
                                                        borderLeft: `5px solid ${badge.color}`,
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        transition: "all 0.2s"
                                                    }}
                                                >
                                                    <div style={{ minWidth: 0, flex: 1 }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                                                            <span style={{
                                                                fontSize: "10px",
                                                                color: badge.color,
                                                                background: badge.bg,
                                                                padding: "3px 8px",
                                                                borderRadius: "6px",
                                                                fontWeight: "700"
                                                            }}>
                                                                {badge.text}
                                                            </span>
                                                        </div>
                                                        <h4 style={{ margin: "0 0 4px", fontSize: "15px", color: "#333", fontWeight: "700", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                            {item.name}
                                                        </h4>
                                                        <p style={{ margin: 0, fontSize: "14px", color: "#F4A7B9", fontWeight: "800" }}>
                                                            {item.price.toLocaleString()}원
                                                        </p>
                                                        {item.memo && (
                                                            <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#999", lineHeight: "1.4" }}>
                                                                💭 {item.memo}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={() => handleDeleteClick(item.id, item.name)}
                                                        style={{
                                                            background: "none",
                                                            border: "none",
                                                            fontSize: "18px",
                                                            cursor: "pointer",
                                                            color: "#bbb",
                                                            padding: "8px",
                                                            borderRadius: "8px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            transition: "all 0.2s"
                                                        }}
                                                        onMouseOver={e => { e.currentTarget.style.background = "#fff0f3"; e.currentTarget.style.color = "#ff6b6b" }}
                                                        onMouseOut={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#bbb" }}
                                                        title="위시리스트 삭제"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            )
                                        })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: 나의 위시 요약 정보 및 새 위시 추가 폼 */}
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        height: "100%",
                        minHeight: 0
                    }}>

                        {/* 위시 요약 카드 */}
                        <div style={{
                            background: "white",
                            borderRadius: "24px",
                            padding: "20px 24px",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                            border: "1px solid #f0f0f0",
                            flexShrink: 0
                        }}>
                            <p style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "700", color: "#111" }}>📊 나의 위시 요약</p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                <div style={{ background: "#fafafa", borderRadius: "16px", padding: "14px", border: "1px solid #f1f1f1", textAlign: "center" }}>
                                    <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#999" }}>위시 아이템</p>
                                    <p style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#555" }}>
                                        {totalWishCount}개
                                    </p>
                                </div>
                                <div style={{ background: "#fff0f3", borderRadius: "16px", padding: "14px", border: "1px solid #ffd9e2", textAlign: "center" }}>
                                    <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#F4A7B9" }}>필요한 예산</p>
                                    <p style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#111" }}>
                                        {totalWishPrice.toLocaleString()}원
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 새 위시 추가 폼 입력 상자 */}
                        <div style={{
                            background: "white",
                            borderRadius: "24px",
                            padding: "24px",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                            border: "1px solid #f0f0f0",
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            overflowY: "auto"
                        }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                <p style={{ margin: "0 0 2px", fontSize: "14px", fontWeight: "700", color: "#111" }}>➕ 새 위시 추가하기</p>

                                <div>
                                    <label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "6px" }}>위시 이름</label>
                                    <input
                                        type="text"
                                        placeholder="어떤 것을 갖고 싶나요?"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        style={inputStyle}
                                    />
                                </div>

                                <div>
                                    <label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "6px" }}>가격 (원)</label>
                                    <div style={{ position: "relative" }}>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="가격을 입력하세요"
                                            value={price ? parseInt(price.toString().replace(/,/g, "")).toLocaleString() : ""}
                                            onChange={e => {
                                                const raw = e.target.value.replace(/,/g, "");
                                                if (/^\d*$/.test(raw)) setPrice(raw);
                                            }}
                                            style={{ ...inputStyle, paddingRight: "40px", marginBottom: 0 }}
                                        />
                                        <span style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "#aaa" }}>원</span>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "6px" }}>우선순위</label>
                                    <select
                                        value={priority}
                                        onChange={e => setPriority(e.target.value)}
                                        style={{ ...inputStyle, marginBottom: 0 }}
                                    >
                                        <option value="1">1순위 ⭐⭐⭐ (우선적으로 저축)</option>
                                        <option value="2">2순위 ⭐⭐ (여유 자금으로 구매)</option>
                                        <option value="3">3순위 ⭐ (언젠가는 사고 말 거야)</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "6px" }}>한마디 메모 (선택)</label>
                                    <input
                                        type="text"
                                        placeholder="구매 목적이나 다짐을 기록해보세요"
                                        value={memo}
                                        onChange={e => setMemo(e.target.value)}
                                        style={{ ...inputStyle, marginBottom: 0 }}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleAdd}
                                style={{
                                    width: "100%",
                                    padding: "14px",
                                    borderRadius: "14px",
                                    background: "#F4A7B9",
                                    color: "white",
                                    border: "none",
                                    fontSize: "14px",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    marginTop: "20px",
                                    boxShadow: "0 4px 12px rgba(244,167,185,0.3)"
                                }}
                            >
                                위시리스트에 담기 🐷
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "10px",
    border: "1px solid #eee",
    fontSize: "14px",
    boxSizing: "border-box",
    marginBottom: "14px",
    fontFamily: "inherit",
    outline: "none",
    color: "#333"
}

export default WishlistPage