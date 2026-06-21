import { useState, useEffect, useRef } from "react"
import { API } from "../config.js"
import MobileBottomNav from "../components/MobileBottomNav"

// 상위 은행 챗봇 스타일의 추천 질문 프리셋 목록
const QUICK_PROMPTS = [
    { text: "이번달 요약해줘 📊" },
    { text: "가장 많이 쓴 카테고리는? 🔍" },
    { text: "식비를 효과적으로 아끼려면? 💡" }
]

function ChatPage({ onBack, onCharacter, onHome, onHistory, onAnalysis, onWishlist, onChat, onGame, onShop, onFriends, onLogout, current, isMobile }) {
    const userId = localStorage.getItem("user_id")
    const nickname = localStorage.getItem("nickname") || "사용자"
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [character, setCharacter] = useState({ name: "MOA", profileImg: "" })
    const [showDisclaimer, setShowDisclaimer] = useState(() => localStorage.getItem("chat_disclaimer_closed") !== "1")
    const bottomRef = useRef(null)

    // 모달 알림 및 로그아웃용 커스텀 모달 상태
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: "alert", // "confirm" | "alert"
        message: "",
        onConfirm: null
    })

    useEffect(() => {
        if (!userId) return
        fetch(`${API}/character/${userId}`)
            .then(res => res.json())
            .then(data => setCharacter({ ...data, profileImg: data.profile_url || "" }))
            .catch(e => console.error(e))
    }, [userId])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, loading])

    // 일반 입력 전송과 추천 칩 원터치 클릭을 모두 지원하도록 개선
    const handleSend = async (directText = "") => {
        const textToSend = directText ? directText.trim() : input.trim()
        if (!textToSend || loading) return

        const userMsg = { role: "user", content: textToSend }
        setMessages(prev => [...prev, userMsg])

        // 직접 칩을 누른 게 아니라면 입력창을 비워줌
        if (!directText) {
            setInput("")
        }
        setLoading(true)

        try {
            const response = await fetch(`${API}/character/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: parseInt(userId),
                    message: textToSend
                })
            })
            const data = await response.json()
            setMessages(prev => [...prev, { role: "ai", content: data.message }])
        } catch (e) {
            setMessages(prev => [...prev, { role: "ai", content: "서버와 연결하지 못했어요 😢 다시 한번 말을 걸어보세요." }])
        }
        setLoading(false)
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const navItems = [
        { key: "main", icon: "🏠", onClick: onHome },
        { key: "history", icon: "📋", onClick: onHistory },
        { key: "analysis", icon: "📊", onClick: onAnalysis },
        { key: "wishlist", icon: "🛍️", onClick: onWishlist },
        { key: "chat", icon: "💬", onClick: onChat },
        { key: "game", icon: "🎮", onClick: onGame },
        { key: "shop", icon: "🎨", onClick: onShop },
        { key: "friends", icon: "👥", onClick: onFriends },
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
            backgroundImage: `linear-gradient(var(--moa-grid) 1px, transparent 1px), linear-gradient(90deg, var(--moa-grid) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
            backgroundColor: "var(--moa-bg)",
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
                        background: "var(--moa-bg-card)",
                        borderRadius: "20px",
                        padding: "24px",
                        width: "320px",
                        textAlign: "center",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                        border: "1px solid var(--moa-border)",
                        fontFamily: "inherit"
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
                                            color: "var(--moa-text)",
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
                                            background: "var(--moa-primary)",
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
                                        background: "var(--moa-primary)",
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

            {/* 상단 GNB 바 (라이트 테마 헤더) */}
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
                <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={onHome}>
                    <span style={{ fontSize: "28px" }}>🐷</span>
                    <span style={{ fontSize: "22px", fontWeight: "700", color: "var(--moa-primary)" }}>MOA</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <span style={{ fontSize: "20px", cursor: "pointer", color: "var(--moa-text)" }}>🔔</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f5f5f5", borderRadius: "20px", padding: "6px 12px" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--moa-primary)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "white" }}>
                            {localStorage.getItem("profileImg") ? (
        <img src={localStorage.getItem("profileImg")} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} onError={e => { e.target.style.display = "none" }} />
    ) : (
        nickname[0]
    )}
                        </div>
                        <span style={{ fontSize: "13px", color: "var(--moa-text)", fontWeight: "600" }}>{nickname}</span>
                        <span style={{ fontSize: "11px", color: "var(--moa-text-sub)" }}>▾</span>
                    </div>
                </div>
            </div>

            {/* 좌측 LNB 바 - PC only */}
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

            {/* 메인 작업 영역 */}
            <div style={{
                marginLeft: isMobile ? 0 : "72px",
                marginTop: "64px",
                width: isMobile ? "100%" : "calc(100vw - 72px)",
                height: isMobile ? "calc(100vh - 64px)" : "calc(100vh - 64px)",
                padding: isMobile ? "12px" : "20px 40px",
                paddingBottom: isMobile ? "70px" : "20px",
                boxSizing: "border-box",
                display: "flex",
                justifyContent: "center",
                alignItems: isMobile ? "stretch" : "center",
                overflow: "hidden",
                zIndex: 5
            }}>

                {/* 중앙 단독 채팅 보드 카드 */}
                <div style={{
                    width: "100%",
                    maxWidth: "920px",
                    height: "100%",
                    maxHeight: "840px",
                    background: "var(--moa-bg-card)",
                    borderRadius: "24px",
                    border: "1px solid #eee",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden"
                }}>

                    {/* 상단 헤더 영역 */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "18px 28px",
                        borderBottom: "1px solid #f1f1f1",
                        background: "#fafafa",
                        flexShrink: 0
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                            <button
                                onClick={onBack}
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: "20px",
                                    color: "var(--moa-text-sub)",
                                    cursor: "pointer",
                                    padding: "4px 8px",
                                    marginLeft: "-8px",
                                    display: "flex",
                                    alignItems: "center"
                                }}
                            >
                                ◀
                            </button>
                            {character.profileImg ? (
                                <img src={character.profileImg} alt="" style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover", border: "1.5px solid var(--moa-primary)" }} />
                            ) : (
                                <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "var(--moa-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", color: "white" }}>🐷</div>
                            )}
                            <div>
                                <span style={{ fontSize: "16px", fontWeight: "700", color: "var(--moa-text)", display: "block" }}>{character.name}</span>
                                <span style={{ fontSize: "11px", color: "var(--moa-text-sub)" }}>나만을 위한 AI 자산관리사</span>
                            </div>
                        </div>

                        <button
                            onClick={onCharacter}
                            style={{
                                background: "var(--moa-light)",
                                border: "1.5px solid var(--moa-primary)",
                                borderRadius: "20px",
                                padding: "6px 14px",
                                fontSize: "12px",
                                color: "var(--moa-primary)",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                fontWeight: "700",
                                transition: "all 0.2s"
                            }}
                            onMouseOver={e => { e.currentTarget.style.background = "var(--moa-primary)"; e.currentTarget.style.color = "white" }}
                            onMouseOut={e => { e.currentTarget.style.background = "var(--moa-light)"; e.currentTarget.style.color = "var(--moa-primary)" }}
                        >
                            ⚙️ 성격 튜닝
                        </button>
                    </div>

                    {/* 무한 스크롤되는 와이드 대화 목록 피드 */}
                    <div style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: "32px 40px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "24px",
                        background: "var(--moa-bg-card)"
                    }}>
                        {messages.length === 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", gap: "14px" }}>
                                <span style={{ fontSize: "64px" }}>💬</span>
                                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "var(--moa-text)" }}>{character.name}와 대화를 시작해 보세요</h3>
                                <p style={{ margin: 0, fontSize: "13px", color: "var(--moa-text-sub)", textAlign: "center", lineHeight: "1.6" }}>
                                    "이번달 지출 추세 보고서 요약해줘 📈"<br />
                                    "어떻게 해야 위시리스트의 아이템을 더 빨리 모을 수 있어? 💰"<br />
                                    금융에 관련된 무언가든 먼저 말을 걸어보세요!
                                </p>
                            </div>
                        ) : (
                            messages.map((msg, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: "flex",
                                        justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                                        alignItems: "flex-start",
                                        width: "100%"
                                    }}
                                >
                                    {msg.role === "ai" && (
                                        <div style={{
                                            width: "40px",
                                            height: "40px",
                                            borderRadius: "50%",
                                            background: "var(--moa-light)",
                                            border: "1.5px solid var(--moa-primary)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "20px",
                                            marginRight: "14px",
                                            flexShrink: 0,
                                            overflow: "hidden"
                                        }}>
                                            {character.profileImg ? (
                                                <img src={character.profileImg} alt="봇" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            ) : "🐷"}
                                        </div>
                                    )}
                                    <div style={{
                                        maxWidth: "70%",
                                        padding: "14px 20px",
                                        borderRadius: msg.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                                        background: msg.role === "user" ? "var(--moa-primary)" : "#f1f3f5",
                                        color: msg.role === "user" ? "white" : "#333",
                                        fontSize: "14px",
                                        lineHeight: "1.7",
                                        boxShadow: msg.role === "user" ? "0 4px 12px rgba(244,167,185,0.25)" : "none",
                                        border: msg.role === "user" ? "none" : "1px solid #eee",
                                        wordBreak: "break-all"
                                    }}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))
                        )}

                        {loading && (
                            <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", width: "100%" }}>
                                <div style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    background: "var(--moa-light)",
                                    border: "1.5px solid var(--moa-primary)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "20px",
                                    marginRight: "14px",
                                    flexShrink: 0,
                                    overflow: "hidden"
                                }}>
                                    {character.profileImg ? (
                                        <img src={character.profileImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : "🐷"}
                                </div>
                                <div style={{
                                    background: "#fafafa",
                                    border: "1px solid #eee",
                                    padding: "12px 18px",
                                    borderRadius: "20px 20px 20px 4px",
                                    fontSize: "13px",
                                    color: "var(--moa-text-sub)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px"
                                }}>
                                    <span>{character.name}가 답변을 구상하는 중</span>
                                    <span style={{ animation: "bounce 1s infinite" }}>💭</span>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* 추천 질문 가이드 및 일체형 라운드 하단 대화 필캡슐 */}
                    <div style={{
                        padding: "16px 32px 24px",
                        background: "var(--moa-bg-card)",
                        borderTop: "1px solid #f1f1f1",
                        flexShrink: 0
                    }}>

                        {/* 챗봇 스타일 추천 질문 가이드 칩 */}
                        <div style={{
                            display: "flex",
                            gap: "8px",
                            marginBottom: "14px",
                            flexWrap: "wrap",
                            justifyContent: "center"
                        }}>
                            {QUICK_PROMPTS.map((prompt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(prompt.text)}
                                    disabled={loading}
                                    style={{
                                        background: "var(--moa-light)",
                                        border: "1.5px solid var(--moa-border)",
                                        borderRadius: "100px",
                                        padding: "8px 16px",
                                        fontSize: "12.5px",
                                        color: "var(--moa-primary)",
                                        fontWeight: "700",
                                        cursor: loading ? "default" : "pointer",
                                        fontFamily: "inherit",
                                        transition: "all 0.25s",
                                        boxShadow: "0 2px 6px rgba(244,167,185,0.08)",
                                        outline: "none"
                                    }}
                                    onMouseOver={e => {
                                        if (!loading) {
                                            e.currentTarget.style.background = "var(--moa-primary)"
                                            e.currentTarget.style.color = "white"
                                            e.currentTarget.style.borderColor = "var(--moa-primary)"
                                        }
                                    }}
                                    onMouseOut={e => {
                                        if (!loading) {
                                            e.currentTarget.style.background = "var(--moa-light)"
                                            e.currentTarget.style.color = "var(--moa-primary)"
                                            e.currentTarget.style.borderColor = "var(--moa-border)"
                                        }
                                    }}
                                >
                                    {prompt.text}
                                </button>
                            ))}
                        </div>

                        {/* AI 주의사항 캡션 */}
                        {showDisclaimer && (
                        <div style={{
                            background: "#fffbf0",
                            border: "1px solid #ffe8a1",
                            borderRadius: "12px",
                            padding: "10px 14px",
                            marginBottom: "12px",
                            fontSize: "11px",
                            color: "var(--moa-text-sub)",
                            lineHeight: "1.7",
                            position: "relative"
                        }}>
                            <div style={{ fontWeight: "700", color: "#c8a200", marginBottom: "4px", fontSize: "11.5px" }}>⚠️ AI 이용 전 꼭 확인해 주세요</div>
                            <ul style={{ margin: 0, paddingLeft: "16px" }}>
                                <li>내용은 꼭 직접 확인하고, 민감한 정보는 입력하지 마세요.</li>
                                <li>답변은 AI가 생성하기 때문에 부정확하거나 부적절할 수 있어요.</li>
                                <li>AI를 비윤리적으로 이용하지 말아 주세요. 허점을 악용한 사례를 공유하는 등 운영정책 위반이 확인되면 이용 제한이나 법적 조치가 취해질 수 있어요.</li>
                                <li>본 서비스는 투자 조언이나 법률 자문을 제공하지 않으며, 전문적 판단이 필요한 경우 전문가와 상담하시기 바랍니다.</li>
                                <li>대화 내용은 서비스 개선을 위해 수집·이용될 수 있어요. (<span style={{ textDecoration: "underline", cursor: "pointer", color: "var(--moa-primary)" }}>개인정보 처리방침</span>)</li>
                            </ul>
                            <button
                                onClick={() => { setShowDisclaimer(false); localStorage.setItem("chat_disclaimer_closed", "1") }}
                                style={{
                                    position: "absolute", top: "8px", right: "10px",
                                    background: "none", border: "none", cursor: "pointer",
                                    fontSize: "14px", color: "var(--moa-text-sub)", lineHeight: 1, padding: "2px"
                                }}
                            >✕</button>
                        </div>
                        )}

                        {/* 메시지 인풋 필드 캡슐 */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            background: "#fafafa",
                            borderRadius: "100px",
                            padding: "8px 10px 8px 12px",
                            border: "1.5px solid #eee",
                            transition: "all 0.25s",
                            gap: "8px"
                        }}
                             onFocusCapture={e => e.currentTarget.style.borderColor = "var(--moa-primary)"}
                             onBlurCapture={e => e.currentTarget.style.borderColor = "#eee"}
                        >
                            {/* 아바타 아이콘 */}
                            <div style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                background: "var(--moa-light)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "16px",
                                flexShrink: 0
                            }}>
                                🐽
                            </div>

                            {/* 실제 인풋 */}
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={`${character.name}에게 궁금한 금융 소식을 물어보세요...`}
                                style={{
                                    flex: 1,
                                    background: "transparent",
                                    border: "none",
                                    outline: "none",
                                    color: "var(--moa-text)",
                                    fontSize: "14px",
                                    fontFamily: "inherit",
                                    padding: "4px 8px"
                                }}
                            />

                            {/* 전송 원형 아이콘 */}
                            <button
                                onClick={() => handleSend()}
                                disabled={loading || !input.trim()}
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "50%",
                                    background: (loading || !input.trim()) ? "#eee" : "var(--moa-primary)",
                                    border: "none",
                                    color: (loading || !input.trim()) ? "#aaa" : "white",
                                    cursor: (loading || !input.trim()) ? "default" : "pointer",
                                    fontSize: "16px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "all 0.2s"
                                }}
                            >
                                ➤
                            </button>
                        </div>
                    </div>

                </div>
            </div>
            {isMobile && <MobileBottomNav navItems={navItems} current={current} />}
        </div>
    )
}

export default ChatPage