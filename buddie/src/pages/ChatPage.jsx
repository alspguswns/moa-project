import { useState, useEffect, useRef } from "react"
import BottomNav from "../components/BottomNav"

function ChatPage({ onBack, onCharacter, onHome, onHistory, onCalendar, onAnalysis, onWishlist, onChat, current }) {
    const userId = localStorage.getItem("user_id")
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [character, setCharacter] = useState({ name: "MOA", profile_url: "" })
    const bottomRef = useRef(null)

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/character/${userId}`)
            .then(res => res.json())
            .then(data => setCharacter(data))
            .catch(e => console.error(e))
    }, [])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || loading) return

        const userMsg = { role: "user", content: input.trim() }
        setMessages(prev => [...prev, userMsg])
        setInput("")
        setLoading(true)

        try {
            const response = await fetch("http://127.0.0.1:8000/character/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: parseInt(userId),
                    message: input.trim()
                })
            })
            const data = await response.json()
            setMessages(prev => [...prev, { role: "ai", content: data.message }])
        } catch (e) {
            setMessages(prev => [...prev, { role: "ai", content: "연결에 실패했어요 😢" }])
        }
        setLoading(false)
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div style={{
            minHeight: "100vh",
            backgroundImage: `linear-gradient(#e0e0e0 1px, transparent 1px), linear-gradient(90deg, #e0e0e0 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
            backgroundColor: "#f5f5f5",
            display: "flex",
            flexDirection: "column",
            fontFamily: "'GriounPolice', cursive"
        }}>
            {/* 헤더 */}
            <div style={{
                maxWidth: "360px", width: "100%", margin: "0 auto",
                padding: "20px 20px 12px",
                display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {character.profile_url ? (
                        <img src={character.profile_url} alt="프로필" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", border: "2px solid #F4A7B9" }} />
                    ) : (
                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#F4A7B9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🐷</div>
                    )}
                    <div>
                        <p style={{ margin: 0, fontSize: "15px", fontWeight: "600" }}>{character.name}</p>
                        <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>나만의 가계부 AI</p>
                    </div>
                </div>
                <button onClick={onCharacter} style={{
                    background: "none", border: "1px solid #eee", borderRadius: "20px",
                    padding: "4px 12px", fontSize: "11px", color: "#aaa", cursor: "pointer",
                    fontFamily: "'GriounPolice', cursive"
                }}>⚙️ 설정</button>
            </div>

            {/* 채팅 영역 */}
            <div style={{
                flex: 1, maxWidth: "360px", width: "100%", margin: "0 auto",
                padding: "0 20px", overflowY: "auto",
                paddingBottom: "140px"
            }}>
                {messages.length === 0 && (
                    <div style={{ textAlign: "center", marginTop: "60px", color: "#aaa" }}>
                        <p style={{ fontSize: "40px" }}>💬</p>
                        <p style={{ fontSize: "14px" }}>{character.name}에게 소비 관련 뭐든 물어봐요!</p>
                        <p style={{ fontSize: "12px" }}>예: "이번달 얼마나 썼어?", "식비 줄이려면 어떻게 해?"</p>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} style={{
                        display: "flex",
                        justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                        marginBottom: "12px"
                    }}>
                        {msg.role === "ai" && (
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#F4A7B9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", marginRight: "8px", flexShrink: 0 }}>
                                {character.profile_url ? (
                                    <img src={character.profile_url} alt="" style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
                                ) : "🐷"}
                            </div>
                        )}
                        <div style={{
                            maxWidth: "240px", padding: "10px 14px",
                            borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                            background: msg.role === "user" ? "#F4A7B9" : "white",
                            color: msg.role === "user" ? "white" : "#333",
                            fontSize: "13px", lineHeight: "1.6",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#F4A7B9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", marginRight: "8px" }}>🐷</div>
                        <div style={{ background: "white", padding: "10px 14px", borderRadius: "16px 16px 16px 4px", fontSize: "13px", color: "#aaa", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                            입력 중...
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* 입력창 */}
            <div style={{
                position: "fixed", bottom: "60px", left: "50%",
                transform: "translateX(-50%)",
                width: "360px", background: "white",
                borderTop: "1px solid #eee",
                padding: "10px 16px",
                display: "flex", gap: "8px", alignItems: "center",
                boxSizing: "border-box"
            }}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="메시지를 입력해요..."
                    style={{
                        flex: 1, padding: "10px 14px", borderRadius: "20px",
                        border: "1px solid #eee", fontSize: "13px", outline: "none",
                        fontFamily: "'GriounPolice', cursive", background: "#f5f5f5",
                        color: "#333"  // ← 추가
                    }}
                />
                <button onClick={handleSend} disabled={loading} style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: "#F4A7B9", border: "none", cursor: "pointer",
                    fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center"
                }}>➤</button>
            </div>

            <BottomNav current={current} onHome={onHome} onHistory={onHistory} onCalendar={onCalendar} onAnalysis={onAnalysis} onWishlist={onWishlist} onChat={onChat} />
        </div>
    )
}

export default ChatPage