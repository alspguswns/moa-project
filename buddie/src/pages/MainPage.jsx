import { useState, useEffect } from "react"
import { API } from "../config.js"
import MobileBottomNav from "../components/MobileBottomNav"

function MainPage({ onHome, onHistory, onAnalysis, onWishlist, onChat, onAddSpend, onLogout, onProfile, onGame, onShop, onFriends, userId: propUserId, current, isMobile }) {    const nickname = localStorage.getItem("nickname") || "사용자"
    const [transactions, setTransactions] = useState([])
    const [totalIncome, setTotalIncome] = useState(0)
    const [totalExpense, setTotalExpense] = useState(0)
    const [aiMessage, setAiMessage] = useState("")
    const [aiLoading, setAiLoading] = useState(true)

    // 커스텀 모달 시스템 상태 (alert 및 confirm 대체)
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: "confirm", // "confirm" | "alert"
        message: "",
        onConfirm: null
    })

    // 데이터를 기반으로 수입/지출 합계를 계산하는 공통 함수
    const calculateTotals = (list) => {
        setTotalIncome(list.filter(t => t.type === "수입").reduce((sum, t) => sum + t.amount, 0))
        setTotalExpense(list.filter(t => t.type === "지출").reduce((sum, t) => sum + t.amount, 0))
    }

    useEffect(() => {
        const userId = propUserId || localStorage.getItem("user_id")
        if (!userId) {
            setAiLoading(false)
            return
        }

        fetch(`${API}/expense/${userId}`)
            .then(res => res.json())
            .then(data => {
                const list = Array.isArray(data) ? data : []
                setTransactions(list)
                calculateTotals(list)
            })
            .catch(e => console.error(e))

        fetch(`${API}/ai/${userId}`)
            .then(res => res.json())
            .then(data => {
                setAiMessage(data.message)
                setAiLoading(false)
            })
            .catch(() => {
                setAiMessage("AI 분석을 불러오지 못했어요 😢")
                setAiLoading(false)
            })
    }, [propUserId])

    const handleDeleteClick = (id) => {
        setModalConfig({
            isOpen: true,
            type: "confirm",
            message: "이 기록을 삭제하시겠습니까?",
            onConfirm: () => executeDelete(id)
        })
    }

    const executeDelete = (id) => {
        fetch(`${API}/expense/${id}`, {
            method: "DELETE",
        })
            .then(res => {
                if (res.ok) {
                    const updatedList = transactions.filter(item => item.id !== id)
                    setTransactions(updatedList)
                    calculateTotals(updatedList)
                    setModalConfig({ isOpen: false })
                } else {
                    setModalConfig({
                        isOpen: true,
                        type: "alert",
                        message: "삭제에 실패했습니다. 다시 시도해주세요."
                    })
                }
            })
            .catch(e => {
                console.error(e)
                setModalConfig({
                    isOpen: true,
                    type: "alert",
                    message: "서버 통신 오류가 발생했습니다."
                })
            })
    }

    const recent = [...transactions].reverse()
    const balance = totalIncome - totalExpense
    const balancePercent = totalIncome > 0 ? Math.min((balance / totalIncome) * 100, 100) : 0

    const navItems = [
        { key: "main", icon: "🏠", onClick: onHome },
        { key: "history", icon: "📋", onClick: onHistory },
        { key: "analysis", icon: "📊", onClick: onAnalysis },
        { key: "wishlist", icon: "🛍️", onClick: onWishlist },
        { key: "chat", icon: "💬", onClick: onChat },
        { key: "game", icon: "🎮", onClick: onGame },
        { key: "shop", icon: "🎨", onClick: onShop },
        { key: "friends", icon: "👥", onClick: onFriends },
        { key: "logout", icon: "🚪", onClick: onLogout },
    ]

    return (
        <div style={{
            display: "flex",
            height: isMobile ? "auto" : "100vh",
            minHeight: "100vh",
            width: "100vw",
            fontFamily: "'Pretendard', -apple-system, 'GriounPolice', sans-serif",
            backgroundImage: `linear-gradient(var(--moa-grid) 1px, transparent 1px), linear-gradient(90deg, var(--moa-grid) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
            backgroundColor: "var(--moa-bg)",
            overflow: isMobile ? "auto" : "hidden",
            boxSizing: "border-box"
        }}>

            {/* Custom Modal Popup */}
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
                        background: "var(--moa-bg-card)",
                        borderRadius: "20px",
                        padding: "24px",
                        width: "320px",
                        textAlign: "center",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                        border: "1px solid var(--moa-border)"
                    }}>
                        <span style={{ fontSize: "36px", display: "block", marginBottom: "12px" }}>🐷</span>
                        <p style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: "600", color: "var(--moa-text)", lineHeight: "1.5" }}>
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
                                            color: "var(--moa-text)"
                                        }}
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={modalConfig.onConfirm}
                                        style={{
                                            flex: 1,
                                            padding: "10px",
                                            background: "var(--moa-primary)",
                                            border: "none",
                                            borderRadius: "10px",
                                            fontSize: "13px",
                                            cursor: "pointer",
                                            fontWeight: "600",
                                            color: "white"
                                        }}
                                    >
                                        확인
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setModalConfig({ isOpen: false })}
                                    style={{
                                        width: "100px",
                                        padding: "10px",
                                        background: "var(--moa-primary)",
                                        border: "none",
                                        borderRadius: "10px",
                                        fontSize: "13px",
                                        cursor: "pointer",
                                        fontWeight: "600",
                                        color: "white"
                                    }}
                                >
                                    확인
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* top bar */}
            {}
            <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "64px",
                background: "var(--moa-bg-card)",
                borderBottom: "1px solid #eee",
                zIndex: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 32px",
                boxSizing: "border-box"
            }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer"
                }} onClick={onHome}>
                    <span style={{ fontSize: "28px" }}>🐷</span>
                    <span style={{
                        fontSize: "22px",
                        fontWeight: "700",
                        color: "var(--moa-primary)"
                    }}>
                        MOA
                    </span>
                </div>

                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px"
                }}>
                    <span style={{ fontSize: "20px", cursor: "pointer" }}>🔔</span>

                    <div onClick={onProfile} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "#f5f5f5",
                        borderRadius: "20px",
                        padding: "6px 12px",
                        cursor: "pointer"
                    }}>
                        
                        <div style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: "var(--moa-primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            color: "white",
                            fontWeight: "bold"
                        }}>
                            {localStorage.getItem("profileImg") ? (
        <img src={localStorage.getItem("profileImg")} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} onError={e => { e.target.style.display = "none" }} />
    ) : (
        nickname[0]
    )}
                        </div>

                        <span style={{
                            fontSize: "13px",
                            color: "var(--moa-text)",
                            fontWeight: "600"
                        }}>
                            {nickname}
                        </span>

                        <span style={{
                            fontSize: "11px",
                            color: "var(--moa-text-sub)"
                        }}>
                            ▾
                        </span>
                    </div>
                </div>
            </div>

            {/* side bar - PC only */}
            {!isMobile && (
            <div style={{
                position: "fixed",
                top: "64px",
                left: 0,
                width: "72px",
                height: "calc(100vh - 64px)",
                background: "var(--moa-bg-card)",
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
                            background: current === item.key ? "var(--moa-light)" : "transparent",
                            border: current === item.key ? "1.5px solid var(--moa-primary)" : "1.5px solid transparent",
                            transition: "all 0.2s"
                        }}
                    >
                        {item.icon}
                    </div>
                ))}
            </div>
            )}

            {/* main area */}
            {}
            <div style={{
                marginLeft: isMobile ? 0 : "72px",
                marginTop: "64px",
                width: isMobile ? "100%" : "calc(100vw - 72px)",
                height: isMobile ? "auto" : "calc(100vh - 64px)",
                padding: isMobile ? "16px" : "24px 32px",
                paddingBottom: isMobile ? "80px" : "24px",
                boxSizing: "border-box",
                overflow: isMobile ? "auto" : "hidden"
            }}>
                <div style={{
                    maxWidth: "1480px",
                    height: isMobile ? "auto" : "100%",
                    margin: "0 auto",
                    display: "flex",
                    flexDirection: "column"
                }}>
                    {/* dashboard grid */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "1fr 340px",
                        gap: "16px",
                        alignItems: "stretch",
                        height: isMobile ? "auto" : "100%",
                        width: "100%",
                        boxSizing: "border-box"
                    }}>
                        {/* left content */}
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                            height: isMobile ? "auto" : "100%",
                            overflow: isMobile ? "visible" : "hidden"
                        }}>
                            {/* summary card */}
                            <section style={{
                                background: "var(--moa-bg-card)",
                                borderRadius: "24px",
                                padding: "20px 24px",
                                boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                                border: "1px solid #f0f0f0",
                                flexShrink: 0 // 줄어들지 않도록 설정
                            }}>
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "16px"
                                }}>
                                    <div>
                                        <p style={{
                                            margin: "0 0 4px",
                                            fontSize: "16px",
                                            fontWeight: "700",
                                            color: "var(--moa-text)"
                                        }}>
                                            이번 달 요약
                                        </p>

                                        <p style={{
                                            margin: 0,
                                            fontSize: "12px",
                                            color: "var(--moa-text-sub)"
                                        }}>
                                            수입, 지출, 잔액을 한눈에 확인해요.
                                        </p>
                                    </div>

                                    <div style={{
                                        padding: "6px 12px",
                                        borderRadius: "999px",
                                        background: "var(--moa-light)",
                                        color: "var(--moa-primary)",
                                        fontSize: "11px",
                                        fontWeight: "700"
                                    }}>
                                        Monthly
                                    </div>
                                </div>

                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(3, 1fr)",
                                    gap: "12px",
                                    marginBottom: "16px"
                                }}>
                                    <div style={{
                                        background: "#fafafa",
                                        borderRadius: "16px",
                                        padding: "14px 18px",
                                        border: "1px solid #f1f1f1"
                                    }}>
                                        <p style={{
                                            margin: "0 0 6px",
                                            fontSize: "12px",
                                            color: "var(--moa-text-sub)",
                                            fontWeight: "600"
                                        }}>
                                            수익
                                        </p>

                                        <p style={{
                                            margin: 0,
                                            fontSize: "18px",
                                            fontWeight: "600",
                                            color: "var(--moa-text)"
                                        }}>
                                            +{totalIncome.toLocaleString()}원
                                        </p>
                                    </div>

                                    <div style={{
                                        background: "#fafafa",
                                        borderRadius: "16px",
                                        padding: "14px 18px",
                                        border: "1px solid #f1f1f1"
                                    }}>
                                        <p style={{
                                            margin: "0 0 6px",
                                            fontSize: "12px",
                                            color: "var(--moa-text-sub)",
                                            fontWeight: "600"
                                        }}>
                                            지출
                                        </p>

                                        <p style={{
                                            margin: 0,
                                            fontSize: "18px",
                                            fontWeight: "600",
                                            color: "var(--moa-primary)"
                                        }}>
                                            -{totalExpense.toLocaleString()}원
                                        </p>
                                    </div>

                                    <div style={{
                                        background: "var(--moa-light)",
                                        borderRadius: "16px",
                                        padding: "14px 18px",
                                        border: "1px solid var(--moa-border)"
                                    }}>
                                        <p style={{
                                            margin: "0 0 6px",
                                            fontSize: "12px",
                                            color: "var(--moa-primary)",
                                            fontWeight: "700"
                                        }}>
                                            합계
                                        </p>

                                        <p style={{
                                            margin: 0,
                                            fontSize: "18px",
                                            fontWeight: "600",
                                            color: "var(--moa-text)"
                                        }}>
                                            {balance >= 0 ? "+" : "-"}{Math.abs(balance).toLocaleString()}원
                                        </p>
                                    </div>
                                </div>

                                <div style={{
                                    background: "#fafafa",
                                    borderRadius: "14px",
                                    padding: "12px 16px",
                                    border: "1px solid #f1f1f1"
                                }}>
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}>

                                        <span style={{
                                            fontSize: "14px",
                                            fontWeight: "700",
                                            color: balance >= 0 ? "#111" : "var(--moa-primary)"
                                        }}>
                                            {balance >= 0 ? "" : "-"}{Math.abs(balance).toLocaleString()}원
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {/* recent history */}
                            {}
                            <section style={{
                                background: "var(--moa-bg-card)",
                                borderRadius: "24px",
                                padding: "20px 24px",
                                boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                                border: "1px solid #f0f0f0",
                                flex: isMobile ? "0 0 auto" : "1 1 0%",
                                display: "flex",
                                flexDirection: "column",
                                overflow: isMobile ? "visible" : "hidden",
                                minHeight: isMobile ? "200px" : undefined
                            }}>
                                <div style={{
                                    fontSize: "14px",
                                    fontWeight: "700",
                                    color: "var(--moa-text)",
                                    marginBottom: "12px"
                                }}>
                                    최근 소비 및 수입 내역
                                </div>

                                <div style={{
                                    flex: 1,
                                    overflowY: isMobile ? "visible" : "auto",
                                    paddingRight: "4px"
                                }}>
                                    <table style={{
                                        width: "100%",
                                        borderCollapse: "collapse",
                                        fontSize: "13px"
                                    }}>
                                        <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                                        <tr style={{ background: "#f8fafc" }}>
                                            <th style={{ padding: "10px 12px", borderRadius: "10px 0 0 10px", textAlign: "left", color: "var(--moa-text-sub)", fontWeight: "700" }}>Memo</th>
                                            {!isMobile && <th style={{ padding: "10px 12px", textAlign: "left", color: "var(--moa-text-sub)", fontWeight: "700" }}>Category</th>}
                                            {!isMobile && <th style={{ padding: "10px 12px", textAlign: "left", color: "var(--moa-text-sub)", fontWeight: "700" }}>Date</th>}
                                            <th style={{ padding: "10px 12px", textAlign: "left", color: "var(--moa-text-sub)", fontWeight: "700" }}>Amount</th>
                                            <th style={{ padding: "10px 12px", borderRadius: "0 10px 10px 0", textAlign: "center", color: "var(--moa-text-sub)", fontWeight: "700", width: "50px" }}>Del</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {recent.length === 0 ? (
                                            <tr>
                                                <td colSpan={isMobile ? 3 : 5} style={{ textAlign: "center", padding: "38px 20px", color: "var(--moa-text-sub)" }}>
                                                    아직 내역이 없어요! 아래 버튼으로 첫 기록을 추가해보세요.
                                                </td>
                                            </tr>
                                        ) : (
                                            recent.map(item => (
                                                <tr key={item.id} style={{ borderBottom: "1px solid #f7f7f7" }}>
                                                    <td style={{ padding: "11px 12px", color: "var(--moa-text)", fontWeight: "600", maxWidth: isMobile ? "100px" : "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                        {item.memo || "메모 없음"}
                                                        {isMobile && <div style={{ fontSize: "10px", color: "var(--moa-text-sub)", fontWeight: "400" }}>{item.category} · {item.date}</div>}
                                                    </td>
                                                    {!isMobile && <td style={{ padding: "11px 12px", color: "var(--moa-text)" }}>{item.category}</td>}
                                                    {!isMobile && <td style={{ padding: "11px 12px", color: "var(--moa-text-sub)" }}>{item.date}</td>}
                                                    <td style={{ padding: "11px 12px", fontWeight: "800", color: item.type === "지출" ? "var(--moa-primary)" : "#7F77DD", whiteSpace: "nowrap" }}>
                                                        {item.type === "지출" ? "-" : "+"}{item.amount.toLocaleString()}원
                                                    </td>
                                                    <td style={{ padding: "11px 12px", textAlign: "center" }}>
                                                        <button
                                                            onClick={() => handleDeleteClick(item.id)}
                                                            style={{
                                                                background: "none",
                                                                border: "none",
                                                                cursor: "pointer",
                                                                fontSize: "12px",
                                                                padding: "4px 8px",
                                                                borderRadius: "6px",
                                                                transition: "background 0.2s"
                                                            }}
                                                            title="삭제"
                                                        >
                                                            ❌
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {/* Add Spend CTA button card */}
                            <section style={{
                                background: "var(--moa-bg-card)",
                                borderRadius: "24px",
                                padding: "12px 24px",
                                boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                                border: "1px solid #f0f0f0",
                                flexShrink: 0
                            }}>
                                <button
                                    onClick={onAddSpend}
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        background: "var(--moa-light)",
                                        color: "var(--moa-primary)",
                                        border: "1.5px solid var(--moa-primary)",
                                        borderRadius: "14px",
                                        fontWeight: "700",
                                        fontSize: "13px",
                                        cursor: "pointer",
                                        transition: "all 0.2s"
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.background = "var(--moa-primary)"
                                        e.currentTarget.style.color = "white"
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.background = "var(--moa-light)"
                                        e.currentTarget.style.color = "var(--moa-primary)"
                                    }}
                                >
                                    소비/수입 내역 추가하기
                                </button>
                            </section>
                        </div>

                        {/* right content - merged card */}
                        {}
                        <aside style={{
                            display: "flex",
                            height: isMobile ? "auto" : "100%"
                        }}>
                            <section style={{
                                width: "100%",
                                height: isMobile ? "auto" : "100%",
                                background: "var(--moa-bg-card)",
                                borderRadius: "24px",
                                padding: "24px 20px",
                                boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                                border: "1px solid #f0f0f0",
                                textAlign: "center",
                                boxSizing: "border-box",
                                display: "flex",
                                flexDirection: isMobile ? "column-reverse" : "column",
                                justifyContent: "space-between",
                                gap: "16px"
                            }}>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    flex: 1,
                                    overflow: "hidden"
                                }}>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        marginBottom: "14px",
                                        textAlign: "left",
                                        flexShrink: 0
                                    }}>
                                        <div style={{
                                            width: "36px",
                                            height: "36px",
                                            borderRadius: "12px",
                                            background: "var(--moa-light)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "20px"
                                        }}>
                                            🐷
                                        </div>

                                        <div>
                                            <p style={{
                                                margin: 0,
                                                fontSize: "14px",
                                                fontWeight: "800",
                                                color: "var(--moa-text)"
                                            }}>
                                                MOA의 한마디
                                            </p>

                                            <p style={{
                                                margin: "2px 0 0",
                                                fontSize: "11px",
                                                color: "var(--moa-text-sub)"
                                            }}>
                                                오늘의 소비 코멘트
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{
                                        background: "var(--moa-light)",
                                        borderRadius: "16px",
                                        padding: "14px 16px",
                                        border: "1px solid var(--moa-border)",
                                        textAlign: "left",
                                        flex: isMobile ? "0 0 auto" : 1,
                                        overflowY: isMobile ? "visible" : "auto"
                                    }}>
                                        <p style={{
                                            margin: 0,
                                            fontSize: "13px",
                                            color: "var(--moa-text)",
                                            lineHeight: 1.6,
                                            fontWeight: "400"
                                        }}>
                                            {aiLoading ? "분석 중이에요..." : aiMessage}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ flexShrink: 0, marginTop: "8px" }}>
                                    <div style={{
                                        width: "100px",
                                        height: "100px",
                                        borderRadius: "50%",
                                        background: "var(--moa-light)",
                                        border: "3px solid var(--moa-primary)",
                                        boxShadow: "0 0 16px rgba(244,167,185,0.35)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "52px",
                                        margin: "0 auto 14px"
                                    }}>
                                        🐷
                                    </div>

                                    <p style={{
                                        margin: "0 0 4px",
                                        fontSize: "16px",
                                        color: "var(--moa-text)",
                                        fontWeight: "800"
                                    }}>
                                        MOA Lv.1
                                    </p>

                                    <p style={{
                                        margin: "0 0 14px",
                                        fontSize: "11px",
                                        color: "var(--moa-text-sub)",
                                        lineHeight: 1.5
                                    }}>
                                        기록을 쌓을수록 MOA가 성장해요.
                                    </p>

                                    <div style={{
                                        width: "100%",
                                        height: "8px",
                                        borderRadius: "999px",
                                        background: "#f0f0f0",
                                        overflow: "hidden"
                                    }}>
                                        <div style={{
                                            width: "28%",
                                            height: "100%",
                                            borderRadius: "999px",
                                            background: "var(--moa-primary)"
                                        }} />
                                    </div>
                                </div>
                            </section>
                        </aside>
                    </div>
                </div>
            </div>
            {isMobile && <MobileBottomNav navItems={navItems} current={current} />}
        </div>
    )
}

export default MainPage