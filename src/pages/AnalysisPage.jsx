import { useState, useEffect } from "react"
import BottomNav from "../components/BottomNav"

function AnalysisPage({ onHome, onHistory, onCalendar, onAnalysis, onWishlist, onChat, current }) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const userId = localStorage.getItem("user_id")
        if (!userId) return

        fetch(`http://127.0.0.1:8000/ai/${userId}`)
            .then((res) => res.json())
            .then((res) => {
                setData(res)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    const diff = data ? data.this_month_total - data.last_month_total : 0

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
                    <h2 style={{ margin: 0, fontSize: "20px" }}>🐷 AI 소비 분석</h2>
                </div>

                {loading ? (
                    <p style={{ textAlign: "center", color: "#aaa", marginTop: "60px" }}>분석 중이에요...</p>
                ) : !data ? (
                    <p style={{ textAlign: "center", color: "#aaa", marginTop: "60px" }}>데이터를 불러오지 못했어요 😢</p>
                ) : (
                    <>
                        {/* AI 멘트 */}
                        <div style={{
                            background: "white", borderRadius: "16px",
                            padding: "20px", marginBottom: "16px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                            borderLeft: "4px solid #F4A7B9"
                        }}>
                            <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#F4A7B9", fontWeight: "600" }}>MOA의 한마디</p>
                            <p style={{ margin: 0, fontSize: "13px", color: "#555", lineHeight: "1.7" }}>{data.message}</p>
                        </div>

                        {/* 이번달 vs 지난달 */}
                        <div style={{
                            background: "white", borderRadius: "16px",
                            padding: "20px", marginBottom: "16px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                        }}>
                            <p style={{ margin: "0 0 16px", fontSize: "13px", fontWeight: "600", color: "#555" }}>📊 지난달 비교</p>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                                <div style={{ textAlign: "center" }}>
                                    <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#aaa" }}>지난달</p>
                                    <p style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#333" }}>{data.last_month_total.toLocaleString()}원</p>
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#aaa" }}>이번달</p>
                                    <p style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#F4A7B9" }}>{data.this_month_total.toLocaleString()}원</p>
                                </div>
                            </div>
                            <div style={{
                                background: diff > 0 ? "#FFF0F3" : "#F0FFF4",
                                borderRadius: "10px", padding: "10px",
                                textAlign: "center", fontSize: "13px",
                                color: diff > 0 ? "#F4A7B9" : "#4CAF50"
                            }}>
                                {diff > 0 ? `지난달보다 ${diff.toLocaleString()}원 더 썼어요 😅` : diff < 0 ? `지난달보다 ${Math.abs(diff).toLocaleString()}원 절약했어요 🎉` : "지난달이랑 똑같이 썼어요!"}
                            </div>
                        </div>

                        {/* 카테고리별 */}
                        <div style={{
                            background: "white", borderRadius: "16px",
                            padding: "20px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                        }}>
                            <p style={{ margin: "0 0 16px", fontSize: "13px", fontWeight: "600", color: "#555" }}>🗂️ 카테고리별 지출</p>
                            {Object.entries(data.category_summary).length === 0 ? (
                                <p style={{ textAlign: "center", color: "#aaa", fontSize: "13px" }}>이번달 지출이 없어요!</p>
                            ) : (
                                Object.entries(data.category_summary)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([category, amount]) => {
                                        const percent = Math.round((amount / data.this_month_total) * 100)
                                        return (
                                            <div key={category} style={{ marginBottom: "12px" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                                    <span style={{ fontSize: "13px", color: "#333" }}>{category}</span>
                                                    <span style={{ fontSize: "13px", color: "#F4A7B9", fontWeight: "600" }}>{amount.toLocaleString()}원</span>
                                                </div>
                                                <div style={{ background: "#f0f0f0", borderRadius: "4px", height: "6px" }}>
                                                    <div style={{ background: "#F4A7B9", borderRadius: "4px", height: "6px", width: `${percent}%` }} />
                                                </div>
                                            </div>
                                        )
                                    })
                            )}
                        </div>
                    </>
                )}
            </div>

            <BottomNav current={current} onHome={onHome} onHistory={onHistory} onCalendar={onCalendar} onAnalysis={onAnalysis} onWishlist={onWishlist} onChat={onChat} />
        </div>
    )
}

export default AnalysisPage