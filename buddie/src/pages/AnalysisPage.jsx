import { useState, useEffect } from "react"
import { API } from "../config.js"

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
    const [activeTab, setActiveTab] = useState("dashboard")

    const cardStyle = {
        background: "white", borderRadius: "24px", padding: "20px 24px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0",
        display: "flex", flexDirection: "column", overflow: "hidden"
    }
    const iconBoxStyle = {
        width: "38px", height: "38px", borderRadius: "12px",
        background: "#fff0f3", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "20px", flexShrink: 0
    }

    const [modalConfig, setModalConfig] = useState({
        isOpen: false, type: "confirm", message: "", onConfirm: null
    })

    useEffect(() => {
        const userId = localStorage.getItem("user_id")
        if (!userId) { setLoading(false); return }
        fetch(`${API}/ai/${userId}`)
            .then(res => res.json())
            .then(res => { setData(res); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    const diff = data ? (data.this_month_total ?? 0) - (data.last_month_total ?? 0) : 0

    const navItems = [
        { key: "main", icon: "🏠", onClick: onHome },
        { key: "history", icon: "📋", onClick: onHistory },
        { key: "analysis", icon: "📊", onClick: onAnalysis },
        { key: "wishlist", icon: "🛍️", onClick: onWishlist },
        { key: "chat", icon: "💬", onClick: onChat },
        { key: "logout", icon: "🚪", onClick: () => setModalConfig({
                isOpen: true, type: "confirm", message: "정말로 로그아웃 하시겠습니까? 🐷",
                onConfirm: () => { setModalConfig({ isOpen: false }); onLogout() }
            })},
    ]

    const renderDashboard = () => (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px", flex: 1, minHeight: 0 }}>

            {/* 왼쪽 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", minHeight: 0 }}>

                {/* 소비 처방전 */}
                <section style={{ ...cardStyle, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px", flexShrink: 0 }}>
                        <div style={iconBoxStyle}>🐷</div>
                        <div>
                            <p style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#111" }}>MOA의 소비 처방전</p>
                            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#aaa" }}>AI가 심도있게 분석해 드려요</p>
                        </div>
                    </div>
                    <div style={{ background: "#fff0f3", borderRadius: "16px", padding: "18px", border: "1px solid #ffd9e2", flex: 1, overflowY: "auto" }}>
                        <p style={{ margin: 0, fontSize: "14px", color: "#333", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                            {data?.message}
                        </p>
                    </div>
                </section>

                {/* 소비 유형 */}
                {data?.consumer_type && (
                    <section style={{ ...cardStyle, flexShrink: 0 }}>
                        <p style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "700", color: "#111" }}>🎯 나의 소비 유형</p>
                        <div style={{
                            background: "linear-gradient(135deg, #fff0f3, #ffe4ec)",
                            borderRadius: "16px", padding: "16px 20px",
                            border: "1px solid #ffd9e2", display: "flex", alignItems: "center", gap: "16px"
                        }}>
                            <span style={{ fontSize: "40px" }}>{data.consumer_type.emoji}</span>
                            <div>
                                <p style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: "800", color: "#e91e8c" }}>
                                    {data.consumer_type.type}
                                </p>
                                <p style={{ margin: 0, fontSize: "12px", color: "#666", lineHeight: 1.5 }}>
                                    {data.consumer_type.description}
                                </p>
                            </div>
                        </div>
                    </section>
                )}
            </div>

            {/* 오른쪽 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", minHeight: 0 }}>

                {/* 카테고리 순위 */}
                <section style={{ ...cardStyle, flex: 1 }}>
                    <div style={{ flexShrink: 0, marginBottom: "14px" }}>
                        <p style={{ margin: "0 0 2px", fontSize: "14px", fontWeight: "700", color: "#111" }}>🗂️ 카테고리별 지출 순위</p>
                        <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>이번달 지출 비율이 큰 항목 순서예요</p>
                    </div>
                    <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
                        {!data?.category_summary || Object.entries(data.category_summary).length === 0 ? (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                                <p style={{ color: "#bbb", fontSize: "13px" }}>이번달 지출 내역이 없어요!</p>
                            </div>
                        ) : (
                            Object.entries(data.category_summary)
                                .sort((a, b) => b[1] - a[1])
                                .map(([category, amount]) => {
                                    const total = data.this_month_total || 1
                                    const percent = Math.round((amount / total) * 100)
                                    return (
                                        <div key={category} style={{ background: "#fafafa", borderRadius: "14px", padding: "10px 14px", marginBottom: "10px", border: "1px solid #f1f1f1" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <span style={{ fontSize: "16px" }}>{CATEGORY_EMOJI[category] || "📦"}</span>
                                                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}>{category}</span>
                                                    <span style={{ fontSize: "10px", color: "#aaa", background: "#f0f0f0", padding: "1px 5px", borderRadius: "4px" }}>{percent}%</span>
                                                </div>
                                                <span style={{ fontSize: "13px", fontWeight: "700", color: "#111" }}>{amount.toLocaleString()}원</span>
                                            </div>
                                            <div style={{ background: "#eef1f6", borderRadius: "999px", height: "7px", overflow: "hidden" }}>
                                                <div style={{ background: "#F4A7B9", borderRadius: "999px", height: "100%", width: `${percent}%` }} />
                                            </div>
                                        </div>
                                    )
                                })
                        )}
                    </div>
                </section>

                {/* 위시리스트 달성 예측 */}
                {data?.wish_prediction && data.wish_prediction.length > 0 && (
                    <section style={{ ...cardStyle, flexShrink: 0 }}>
                        <p style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "700", color: "#111" }}>🌟 위시리스트 달성 예측</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto", maxHeight: "200px" }}>
                            {data.wish_prediction.map((wish, idx) => (
                                <div key={idx} style={{ background: "#f0f7ff", borderRadius: "14px", padding: "12px 16px", border: "1px solid #d0e8ff" }}>
                                    <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: "700", color: "#1a73e8" }}>
                                        🎯 {wish.name} ({wish.price.toLocaleString()}원)
                                    </p>
                                    {wish.months_needed ? (
                                        <p style={{ margin: 0, fontSize: "12px", color: "#333" }}>
                                            약 <span style={{ color: "#e91e8c", fontWeight: "700" }}>{wish.months_needed}개월</span> 후 구매 가능
                                            <span style={{ color: "#aaa", marginLeft: "6px" }}>(월 절약 {wish.monthly_saving.toLocaleString()}원)</span>
                                        </p>
                                    ) : (
                                        <p style={{ margin: 0, fontSize: "12px", color: "#e53935" }}>
                                            지출이 수입보다 많아요! 조금만 아껴봐요 😢
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )

    const renderCompare = () => (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", flex: 1, minHeight: 0 }}>
            <section style={cardStyle}>
                <p style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: "700", color: "#111" }}>📊 지난달 vs 이번달 비교</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                    <div style={{ background: "#fafafa", borderRadius: "14px", padding: "14px", border: "1px solid #f1f1f1", textAlign: "center" }}>
                        <p style={{ margin: "0 0 6px", fontSize: "11px", color: "#999", fontWeight: "600" }}>지난달 지출</p>
                        <p style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#555" }}>{(data?.last_month_total ?? 0).toLocaleString()}원</p>
                    </div>
                    <div style={{ background: "#fff0f3", borderRadius: "14px", padding: "14px", border: "1px solid #ffd9e2", textAlign: "center" }}>
                        <p style={{ margin: "0 0 6px", fontSize: "11px", color: "#F4A7B9", fontWeight: "700" }}>이번달 지출</p>
                        <p style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#111" }}>{(data?.this_month_total ?? 0).toLocaleString()}원</p>
                    </div>
                </div>
                <div style={{
                    background: diff > 0 ? "#fff0f3" : diff < 0 ? "#eafaf1" : "#f5f5f5",
                    borderRadius: "12px", padding: "14px 18px", textAlign: "center",
                    fontSize: "13px", fontWeight: "600",
                    border: diff > 0 ? "1px solid #ffd9e2" : diff < 0 ? "1px solid #cceadd" : "1px solid #eee",
                    color: diff > 0 ? "#F4A7B9" : diff < 0 ? "#2ecc71" : "#777"
                }}>
                    {diff > 0
                        ? `지난달보다 ${diff.toLocaleString()}원 더 썼어요! 🐷 조절이 필요해요`
                        : diff < 0
                            ? `지난달보다 ${Math.abs(diff).toLocaleString()}원 절약했어요! 🎉`
                            : "지난달이랑 똑같이 쓰는 중이에요! 👏"}
                </div>
                {data?.last_month_total > 0 && (
                    <div style={{ marginTop: "14px", background: "#f9f9f9", borderRadius: "12px", padding: "12px 16px", border: "1px solid #eee" }}>
                        <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#aaa" }}>증감률</p>
                        <p style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: diff > 0 ? "#F4A7B9" : "#2ecc71" }}>
                            {diff > 0 ? "+" : ""}{Math.round((diff / data.last_month_total) * 100)}%
                        </p>
                    </div>
                )}
            </section>

            <section style={{ ...cardStyle, gap: "14px" }}>
                <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "700", color: "#111" }}>🤖 AI 비교 분석</p>
                <div style={{ background: "#fff0f3", borderRadius: "16px", padding: "18px", border: "1px solid #ffd9e2", flex: 1, overflowY: "auto" }}>
                    <p style={{ margin: 0, fontSize: "14px", color: "#333", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                        {data?.message}
                    </p>
                </div>
                {data?.consumer_type && (
                    <div style={{ background: "linear-gradient(135deg, #fff0f3, #ffe4ec)", borderRadius: "14px", padding: "14px 16px", border: "1px solid #ffd9e2", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                        <span style={{ fontSize: "32px" }}>{data.consumer_type.emoji}</span>
                        <div>
                            <p style={{ margin: "0 0 2px", fontSize: "14px", fontWeight: "800", color: "#e91e8c" }}>{data.consumer_type.type}</p>
                            <p style={{ margin: 0, fontSize: "11px", color: "#666" }}>{data.consumer_type.description}</p>
                        </div>
                    </div>
                )}
            </section>
        </div>
    )

    const renderReport = () => (
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
            <section style={{ ...cardStyle, flex: 1 }}>
                <p style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: "700", color: "#111" }}>📋 AI 소비 분석 리포트</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px", flexShrink: 0 }}>
                    <div style={{ background: "#fff0f3", borderRadius: "14px", padding: "16px", border: "1px solid #ffd9e2", textAlign: "center" }}>
                        <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#F4A7B9", fontWeight: "600" }}>이번달 지출</p>
                        <p style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#111" }}>{(data?.this_month_total ?? 0).toLocaleString()}원</p>
                    </div>
                    <div style={{ background: "#f0f7ff", borderRadius: "14px", padding: "16px", border: "1px solid #d0e8ff", textAlign: "center" }}>
                        <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#1a73e8", fontWeight: "600" }}>지난달 대비</p>
                        <p style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: diff > 0 ? "#F4A7B9" : "#2ecc71" }}>
                            {diff > 0 ? "+" : ""}{diff.toLocaleString()}원
                        </p>
                    </div>
                    <div style={{ background: "#f0fff4", borderRadius: "14px", padding: "16px", border: "1px solid #c3e6cb", textAlign: "center" }}>
                        <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#2ecc71", fontWeight: "600" }}>최다 지출</p>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "#111" }}>
                            {data?.category_summary && Object.entries(data.category_summary).length > 0
                                ? Object.entries(data.category_summary).sort((a, b) => b[1] - a[1])[0][0]
                                : "-"}
                        </p>
                    </div>
                </div>

                <div style={{ background: "#fff0f3", borderRadius: "16px", padding: "20px", border: "1px solid #ffd9e2", marginBottom: "14px", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                        <span style={{ fontSize: "20px" }}>🐷</span>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#333" }}>MOA의 종합 소비 평가</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "14px", color: "#333", lineHeight: 1.7, whiteSpace: "pre-line" }}>{data?.message}</p>
                </div>

                {data?.wish_prediction && data.wish_prediction.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
                        <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: "700", color: "#1a73e8" }}>🌟 위시리스트 달성 예측</p>
                        {data.wish_prediction.map((wish, idx) => (
                            <div key={idx} style={{ background: "#f0f7ff", borderRadius: "14px", padding: "14px 16px", border: "1px solid #d0e8ff" }}>
                                <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: "700", color: "#1a73e8" }}>🎯 {wish.name} ({wish.price.toLocaleString()}원)</p>
                                {wish.months_needed ? (
                                    <p style={{ margin: 0, fontSize: "13px", color: "#333" }}>
                                        약 <strong style={{ color: "#e91e8c" }}>{wish.months_needed}개월</strong> 후 구매 가능
                                        <span style={{ color: "#aaa", marginLeft: "6px" }}>(월 절약 {wish.monthly_saving.toLocaleString()}원)</span>
                                    </p>
                                ) : (
                                    <p style={{ margin: 0, fontSize: "13px", color: "#e53935" }}>현재 지출이 수입을 초과하고 있어요 😢</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )

    return (
        <div style={{
            display: "flex", height: "100vh", width: "100vw",
            fontFamily: "'GriounPolice', cursive",
            backgroundImage: `linear-gradient(#e0e0e0 1px, transparent 1px), linear-gradient(90deg, #e0e0e0 1px, transparent 1px)`,
            backgroundSize: "28px 28px", backgroundColor: "#f5f5f5",
            overflow: "hidden", boxSizing: "border-box"
        }}>

            {/* 모달 */}
            {modalConfig.isOpen && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div style={{ background: "white", borderRadius: "20px", padding: "24px", width: "320px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", border: "1px solid #ffd9e2" }}>
                        <span style={{ fontSize: "36px", display: "block", marginBottom: "12px" }}>🐷</span>
                        <p style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: "600", color: "#333" }}>{modalConfig.message}</p>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                            {modalConfig.type === "confirm" ? (
                                <>
                                    <button onClick={() => setModalConfig({ isOpen: false })} style={{ flex: 1, padding: "10px", background: "#eee", border: "none", borderRadius: "10px", fontSize: "13px", cursor: "pointer", fontWeight: "600", color: "#555", fontFamily: "inherit" }}>취소</button>
                                    <button onClick={modalConfig.onConfirm} style={{ flex: 1, padding: "10px", background: "#F4A7B9", border: "none", borderRadius: "10px", fontSize: "13px", cursor: "pointer", fontWeight: "600", color: "white", fontFamily: "inherit" }}>확인</button>
                                </>
                            ) : (
                                <button onClick={() => setModalConfig({ isOpen: false })} style={{ width: "120px", padding: "10px", background: "#F4A7B9", border: "none", borderRadius: "10px", fontSize: "13px", cursor: "pointer", fontWeight: "600", color: "white", fontFamily: "inherit" }}>확인</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 헤더 */}
            <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "64px", background: "white", borderBottom: "1px solid #eee", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", boxSizing: "border-box" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={onHome}>
                    <span style={{ fontSize: "28px" }}>🐷</span>
                    <span style={{ fontSize: "22px", fontWeight: "700", color: "#F4A7B9" }}>MOA</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f5f5f5", borderRadius: "20px", padding: "6px 12px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#F4A7B9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "white" }}>{nickname[0]}</div>
                    <span style={{ fontSize: "13px", color: "#333", fontWeight: "600" }}>{nickname}</span>
                </div>
            </div>

            {/* 사이드바 */}
            <div style={{ position: "fixed", top: "64px", left: 0, width: "72px", height: "calc(100vh - 64px)", background: "white", borderRight: "1px solid #eee", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0", gap: "12px", zIndex: 100 }}>
                {navItems.map(item => (
                    <div key={item.key} onClick={item.onClick} style={{ width: "48px", height: "48px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", cursor: "pointer", background: current === item.key ? "#fff0f3" : "transparent", border: current === item.key ? "1.5px solid #F4A7B9" : "1.5px solid transparent", transition: "all 0.2s" }}>
                        {item.icon}
                    </div>
                ))}
            </div>

            {/* 메인 콘텐츠 */}
            <div style={{ marginLeft: "72px", marginTop: "64px", width: "calc(100vw - 72px)", height: "calc(100vh - 64px)", padding: "24px 32px", boxSizing: "border-box", display: "flex", flexDirection: "column", overflow: "hidden" }}>

                {/* 타이틀 + 탭 */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "24px" }}>📊</span>
                        <span style={{ fontSize: "20px", fontWeight: "700", color: "#333" }}>소비 분석</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                        {[
                            { key: "dashboard", label: "📈 이번달 현황" },
                            { key: "compare", label: "🔄 지난달 비교" },
                            { key: "report", label: "📋 분석 리포트" }
                        ].map(tab => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                                padding: "8px 16px", borderRadius: "20px", border: "none", cursor: "pointer",
                                fontSize: "12px", fontWeight: "700", fontFamily: "inherit",
                                background: activeTab === tab.key ? "#F4A7B9" : "#f0f0f0",
                                color: activeTab === tab.key ? "white" : "#666",
                                transition: "all 0.2s"
                            }}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        <span style={{ fontSize: "48px" }}>🐷</span>
                        <p style={{ color: "#aaa", fontSize: "15px", marginTop: "16px" }}>MOA가 꼼꼼히 분석하고 있어요...</p>
                    </div>
                ) : !data ? (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        <span style={{ fontSize: "48px" }}>😢</span>
                        <p style={{ color: "#aaa", fontSize: "15px", marginTop: "16px" }}>소비 데이터를 불러오지 못했어요!</p>
                    </div>
                ) : (
                    <>
                        {activeTab === "dashboard" && renderDashboard()}
                        {activeTab === "compare" && renderCompare()}
                        {activeTab === "report" && renderReport()}
                    </>
                )}
            </div>
        </div>
    )
}

export default AnalysisPage