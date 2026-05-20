import { useState, useEffect } from "react"

const CATEGORY_EMOJI = {
    "식비": "🍚", "카페": "☕", "교통": "🚌", "쇼핑": "🛍️",
    "의료": "💊", "문화": "🎬", "운동": "🏃", "미용": "💄",
    "구독": "📱", "기타": "📦",
    "급여": "💰", "알바": "💼", "용돈": "🎁", "부수입": "📈",
}

function AnalysisPage({ onHome, onHistory, onAnalysis, onWishlist, onChat, onLogout, current }) {
    const nickname = localStorage.getItem("nickname") || "사용자"
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    // 브라우저 팝업을 완전히 대체하는 일관된 디자인의 모달 구성
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: "confirm", // "confirm" | "alert"
        message: "",
        onConfirm: null
    })

    useEffect(() => {
        const userId = localStorage.getItem("user_id")
        if (!userId) {
            setLoading(false)
            return
        }

        fetch(`http://127.0.0.1:8000/ai/${userId}`)
            .then((res) => res.json())
            .then((res) => {
                setData(res)
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
            })
    }, [])

    const diff = data ? data.this_month_total - data.last_month_total : 0
    const hasCategorySummary = data && data.category_summary && Object.entries(data.category_summary).length > 0

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

            {}
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

            {}
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

            {}
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

                {/* Header Title section */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexShrink: 0 }}>
                    <span style={{ fontSize: "24px" }}>📊</span>
                    <span style={{ fontSize: "20px", fontWeight: "700", color: "#333" }}>AI 소비 분석 보고서</span>
                </div>

                {loading ? (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        <span style={{ fontSize: "48px", animation: "bounce 1s infinite" }}>🐷</span>
                        <p style={{ color: "#aaa", fontSize: "15px", marginTop: "16px" }}>MOA가 꼼꼼히 가계부를 들여다보고 있어요...</p>
                    </div>
                ) : !data ? (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        <span style={{ fontSize: "48px" }}>😢</span>
                        <p style={{ color: "#aaa", fontSize: "15px", marginTop: "16px" }}>소비 데이터를 불러오지 못했어요. 지출 내역을 먼저 등록해보세요!</p>
                    </div>
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1.2fr 1fr",
                        gap: "24px",
                        flex: 1,
                        minHeight: 0,
                        width: "100%",
                        boxSizing: "border-box"
                    }}>

                        {/* LEFT COLUMN: MOA Opinion & Month Comparison */}
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                            height: "100%",
                            minHeight: 0
                        }}>

                            {/* Card 1: MOA's detailed commentary (with internal vertical scroll if text is long) */}
                            <section style={{
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
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", flexShrink: 0 }}>
                                    <div style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "14px",
                                        background: "#fff0f3",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "22px"
                                    }}>
                                        🐷
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#111" }}>MOA의 소비 처방전</p>
                                        <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#aaa" }}>AI가 심도있게 분석해 드려요</p>
                                    </div>
                                </div>

                                <div style={{
                                    background: "#fff0f3",
                                    borderRadius: "18px",
                                    padding: "20px",
                                    border: "1px solid #ffd9e2",
                                    textAlign: "left",
                                    flex: 1,
                                    overflowY: "auto"
                                }}>
                                    <p style={{
                                        margin: 0,
                                        fontSize: "14px",
                                        color: "#333",
                                        lineHeight: 1.7,
                                        fontWeight: "400",
                                        whiteSpace: "pre-line"
                                    }}>
                                        {data.message}
                                    </p>
                                </div>
                            </section>

                            {}
                            <section style={{
                                background: "white",
                                borderRadius: "24px",
                                padding: "24px",
                                boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                                border: "1px solid #f0f0f0",
                                flexShrink: 0
                            }}>
                                <p style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: "700", color: "#111" }}>📊 지난달과의 소비 비교</p>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                                    <div style={{ background: "#fafafa", borderRadius: "16px", padding: "14px", border: "1px solid #f1f1f1", textAlign: "center" }}>
                                        <p style={{ margin: "0 0 6px", fontSize: "12px", color: "#999", fontWeight: "600" }}>지난달 전체 지출</p>
                                        <p style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#555" }}>
                                            {data.last_month_total.toLocaleString()}원
                                        </p>
                                    </div>
                                    <div style={{ background: "#fff0f3", borderRadius: "16px", padding: "14px", border: "1px solid #ffd9e2", textAlign: "center" }}>
                                        <p style={{ margin: "0 0 6px", fontSize: "12px", color: "#F4A7B9", fontWeight: "700" }}>이번달 전체 지출</p>
                                        <p style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#111" }}>
                                            {data.this_month_total.toLocaleString()}원
                                        </p>
                                    </div>
                                </div>

                                <div style={{
                                    background: diff > 0 ? "#FFF0F3" : diff < 0 ? "#EAFaf1" : "#F5f5f5",
                                    borderRadius: "14px",
                                    padding: "14px 18px",
                                    textAlign: "center",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    border: diff > 0 ? "1px solid #ffd9e2" : diff < 0 ? "1px solid #cceadd" : "1px solid #eee",
                                    color: diff > 0 ? "#F4A7B9" : diff < 0 ? "#2ecc71" : "#777"
                                }}>
                                    {diff > 0 ? (
                                        <span>지난달보다 <strong>{diff.toLocaleString()}원</strong> 더 썼어요! 🐷 조절이 조금 필요해요</span>
                                    ) : diff < 0 ? (
                                        <span>지난달보다 <strong>{Math.abs(diff).toLocaleString()}원</strong>이나 절약했어요! 대단해요 🎉</span>
                                    ) : (
                                        <span>지난달이랑 기가 막히게 똑같이 쓰는 중이에요! 👏</span>
                                    )}
                                </div>
                            </section>
                        </div>

                        {}
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            minHeight: 0
                        }}>
                            <section style={{
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
                                <div style={{ flexShrink: 0, marginBottom: "16px" }}>
                                    <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "700", color: "#111" }}>🗂️ 카테고리별 지출 순위</p>
                                    <p style={{ margin: 0, fontSize: "12px", color: "#aaa" }}>이번달 지출 비율이 큰 항목 순서예요</p>
                                </div>

                                <div style={{
                                    flex: 1,
                                    overflowY: "auto",
                                    paddingRight: "6px"
                                }}>
                                    {!hasCategorySummary ? (
                                        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <p style={{ color: "#bbb", fontSize: "13px" }}>이번달 카테고리 소비 지출 통계가 아직 없어요!</p>
                                        </div>
                                    ) : (
                                        Object.entries(data.category_summary)
                                            .sort((a, b) => b[1] - a[1])
                                            .map(([category, amount]) => {
                                                const total = data.this_month_total || 1
                                                const percent = Math.round((amount / total) * 100)
                                                const emoji = CATEGORY_EMOJI[category] || "📦"

                                                return (
                                                    <div key={category} style={{
                                                        background: "#fafafa",
                                                        borderRadius: "16px",
                                                        padding: "12px 16px",
                                                        marginBottom: "12px",
                                                        border: "1px solid #f1f1f1"
                                                    }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                                <span style={{ fontSize: "18px" }}>{emoji}</span>
                                                                <span style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}>{category}</span>
                                                                <span style={{ fontSize: "11px", color: "#aaa", background: "#f0f0f0", padding: "1px 6px", borderRadius: "4px" }}>
                                                                    {percent}%
                                                                </span>
                                                            </div>
                                                            <span style={{ fontSize: "14px", fontWeight: "700", color: "#111" }}>
                                                                {amount.toLocaleString()}원
                                                            </span>
                                                        </div>
                                                        <div style={{ background: "#eef1f6", borderRadius: "999px", height: "8px", overflow: "hidden" }}>
                                                            <div style={{
                                                                background: "#F4A7B9",
                                                                borderRadius: "999px",
                                                                height: "100%",
                                                                width: `${percent}%`,
                                                                boxShadow: "0 0 8px rgba(244,167,185,0.4)"
                                                            }} />
                                                        </div>
                                                    </div>
                                                )
                                            })
                                    )}
                                </div>
                            </section>
                        </div>

                    </div>
                )}

            </div>
        </div>
    )
}

export default AnalysisPage