import { useState, useEffect } from "react"
import BottomNav from "../components/BottomNav"

function CharacterPage({ onBack, onHome, onHistory, onAnalysis, onWishlist, onChat, current }) {
    const userId = localStorage.getItem("user_id")
    const [name, setName] = useState("MOA")
    const [style, setStyle] = useState("친근하고 귀엽게")
    const [profileUrl, setProfileUrl] = useState("")
    const [systemPrompt, setSystemPrompt] = useState("")
    const [saved, setSaved] = useState(false)
    const [isRegular, setIsRegular] = useState(false)

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/character/${userId}`)
            .then(res => res.json())
            .then(data => {
                setName(data.name || "MOA")
                setStyle(data.style || "친근하고 귀엽게")
                setProfileUrl(data.profile_url || "")
                setSystemPrompt(data.system_prompt || "")
            })
            .catch(e => console.error(e))
    }, [])

    const handleSave = async () => {
        await fetch("http://127.0.0.1:8000/character/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: parseInt(userId),
                name, style,
                profile_url: profileUrl,
                system_prompt: systemPrompt
            })
        })
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

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
                    <button onClick={onBack} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", marginRight: "12px" }}>←</button>
                    <h2 style={{ margin: 0, fontSize: "20px" }}>🎨 AI 캐릭터 설정</h2>
                </div>

                {/* 프로필 미리보기 */}
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                    {profileUrl ? (
                        <img src={profileUrl} alt="프로필" style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "3px solid #F4A7B9" }} />
                    ) : (
                        <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#F4A7B9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", margin: "0 auto" }}>🐷</div>
                    )}
                    <p style={{ margin: "8px 0 0", fontSize: "16px", fontWeight: "600", color: "#F4A7B9" }}>{name}</p>
                </div>

                {/* 설정 폼 */}
                <div style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>

                    <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>AI 이름</label>
                    <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="예: 하람이" />

                    <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>말투 스타일</label>
                    <select value={style} onChange={e => setStyle(e.target.value)} style={inputStyle}>
                        <option>친근하고 귀엽게</option>
                        <option>차갑고 쿨하게</option>
                        <option>다정하고 따뜻하게</option>
                        <option>재밌고 유머있게</option>
                        <option>진지하고 전문적으로</option>
                        <option>츤데레하게</option>
                    </select>

                    <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>프로필 사진 URL</label>
                    <input value={profileUrl} onChange={e => setProfileUrl(e.target.value)} style={inputStyle} placeholder="https://..." />

                    <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>추가 프롬프트 (선택)</label>
                    <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)}
                              placeholder="예: 항상 반말로 대화해줘. 이름은 하람이야. 소비를 칭찬해줘."
                              style={{
                                  ...inputStyle,
                                  height: "100px", resize: "none"
                              }} />

                    <button onClick={handleSave} style={{
                        width: "100%", padding: "14px", borderRadius: "10px",
                        background: saved ? "#aaa" : "#F4A7B9", color: "white", border: "none",
                        fontSize: "15px", fontWeight: "600", cursor: "pointer",
                        fontFamily: "'GriounPolice', cursive"
                    }}>
                        {saved ? "저장됐어요 ✓" : "저장하기"}
                    </button>
                </div>
            </div>

            <BottomNav current={current} onHome={onHome} onHistory={onHistory} onCalendar={onCalendar} onAnalysis={onAnalysis} onWishlist={onWishlist} onChat={onChat} />
        </div>
    )
}

const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: "10px",
    border: "1px solid #eee", fontSize: "14px", boxSizing: "border-box",
    marginBottom: "14px", fontFamily: "'GriounPolice', cursive", outline: "none",
    background: "white", color: "#333"  // ← color 추가
}

export default CharacterPage