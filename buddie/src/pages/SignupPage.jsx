import { useState } from "react"
import { API } from "../config.js"

function SignupPage({ onSignup, onBack }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [nickname, setNickname] = useState("")

    const handleSignup = async () => {
        if (!email.trim()) {
            alert("이메일을 입력해주세요.")
            return
        }
        if (!password.trim()) {
            alert("비밀번호를 입력해주세요.")
            return
        }
        if (!nickname.trim()) {
            alert("닉네임을 입력해주세요.")
            return
        }

        try {
            const response = await fetch(`${API}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.trim(),
                    password: password.trim(),
                    nickname: nickname.trim()
                })
            })

            const data = await response.json()

            if (!response.ok) {
                alert(data.detail || "회원가입에 실패했어요.")
                return
            }

            localStorage.setItem("token", data.token)
            localStorage.setItem("nickname", data.nickname)
            localStorage.setItem("user_id", data.user_id)
            onSignup(data.nickname)

        } catch (e) {
            alert("서버에 연결할 수 없어요. 백엔드가 켜져 있는지 확인해줘요!")
        }
    }

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundImage: `
            linear-gradient(#e0e0e0 1px, transparent 1px),
             linear-gradient(90deg, #e0e0e0 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
            backgroundColor: "#f5f5f5",
            fontFamily: "'GriounPolice', cursive"
        }}>
            <div style={{
                background: "white",
                borderRadius: "24px",
                padding: "40px 32px",
                width: "300px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                border: "1px solid #eee",
            }}>
                <div style={{ textAlign: "center", marginBottom: "28px" }}>
                    <div style={{ fontSize: "56px", lineHeight: 1 }}>🐷</div>
                    <p style={{ margin: "8px 0 2px", fontSize: "12px", color: "#F4A7B9" }}>회원가입</p>
                    <h1 style={{ margin: 0, fontSize: "36px", fontWeight: "700", color: "#F4A7B9", letterSpacing: "4px" }}>MOA</h1>
                </div>

                <input
                    type="email"
                    placeholder="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                />

                <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle}
                />

                <input
                    type="text"
                    placeholder="닉네임"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    style={inputStyle}
                />

                <button onClick={handleSignup} style={buttonStyle}>
                    회원가입
                </button>

                <p
                    onClick={onBack}
                    style={{ textAlign: "center", fontSize: "12px", color: "#aaa", marginTop: "16px", cursor: "pointer" }}
                >
                    로그인으로 돌아가기
                </p>
            </div>
        </div>
    )
}

const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "none",
    background: "#f0f0f0",
    fontSize: "14px",
    color: "#333",
    boxSizing: "border-box",
    marginBottom: "10px",
    outline: "none",
    fontFamily: "'GriounPolice', cursive"
}

const buttonStyle = {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    background: "#F4A7B9",
    color: "white",
    border: "none",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'GriounPolice', cursive"
}

export default SignupPage