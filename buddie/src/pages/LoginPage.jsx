import { useState } from "react"
import { API } from "../config.js"

function LoginPage({ onLogin, onSignup }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            alert("이메일과 비밀번호를 입력해주세요.")
            return
        }
        try {
            const response = await fetch(`${API}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password: password.trim() })
            })
            const data = await response.json()
            if (!response.ok) {
                alert(data.detail || "로그인에 실패했어요.")
                return
            }
            localStorage.setItem("token", data.token)
            localStorage.setItem("nickname", data.nickname)
            localStorage.setItem("user_id", data.user_id)
            onLogin()
        } catch (e) {
            alert("서버에 연결할 수 없어요. 백엔드가 켜져 있는지 확인해줘요!")
        }
    }

    return (
        <div style={{
            width: "100vw",
            height: "100vh",
            fontFamily: "'GriounPolice', cursive",
            backgroundColor: "#f5f5f5",
            display: "flex",
            flexDirection: "column"
        }}>
            {/* 상단바 */}
            <header style={{
                width: "100%",
                height: "64px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 8vw",
                backgroundColor: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ fontSize: "36px" }}>🐷</div>
                    <h1 style={{ margin: 0, fontSize: "28px", color: "#F4A7B9" }}>MOA</h1>
                </div>
                <nav style={{ display: "flex", gap: "24px", fontSize: "14px", fontWeight: 500 }}>
                    <span style={{ cursor: "pointer" }}>MOA 소개</span>
                    <span style={{ cursor: "pointer" }}>기능</span>
                    <span style={{ cursor: "pointer" }}>가이드</span>
                    <span style={{ cursor: "pointer" }}>커뮤니티</span>
                    <span style={{ cursor: "pointer" }}>리소스</span>
                </nav>
                <div style={{ display: "flex", gap: "12px" }}>
                    <button style={{
                        padding: "6px 14px",
                        borderRadius: "6px",
                        border: "1px solid #F4A7B9",
                        background: "white",
                        color: "#F4A7B9",
                        cursor: "pointer",
                        fontWeight: 600
                    }}>영업팀 문의</button>
                    <button style={{
                        padding: "6px 14px",
                        borderRadius: "6px",
                        border: "none",
                        background: "#F4A7B9",
                        color: "white",
                        cursor: "pointer",
                        fontWeight: 600
                    }}>MOA 시작하기</button>
                </div>
            </header>

            {/* 메인 레이아웃 */}
            <main style={{
                flex: 1,
                display: "grid",
                gridTemplateColumns: "1fr 400px",
                gap: "6vw",
                padding: "48px 8vw",
                boxSizing: "border-box"
            }}>
                {/* 왼쪽 이미지 영역 */}
                <section style={{
                    width: "100%",
                    height: "100%",
                    background: "url('/images/mockup.png') center/cover no-repeat",
                    borderRadius: "0",  // 네모 박스 제거
                }} />

                {/* 오른쪽 로그인/문구 영역 */}
                <section style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }}>
                    {/* 상단 문구 변경 */}
                    <h2 style={{
                        fontSize: "28px",
                        fontWeight: 700,
                        color: "#F4A7B9",
                        textAlign: "center",
                        marginBottom: "12px"
                    }}>
                        나의 소비를 한 눈에,
                    </h2>
                    <p style={{
                        fontSize: "16px",
                        color: "#555",
                        textAlign: "center",
                        marginBottom: "36px"
                    }}>
                        복잡한 소비내역은 잊으세요.
                    </p>

                    <p style={{
                        fontSize: "16px",
                        color: "#555",
                        textAlign: "left",
                        width: "100%",  // ← 추가
                        marginBottom: "10px"
                    }}>
                        이메일
                    </p>
                    {/* 이메일/비밀번호 */}
                    <input type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)}
                           style={{ width: "100%", marginBottom: "14px", padding: "13px 14px", borderRadius: "8px", border: "1px solid #d9e1f0", background: "#eef3fb" }} />
                    <p style={{
                        fontSize: "16px",
                        color: "#555",
                        textAlign: "left",
                        width: "100%",  // ← 추가
                        marginBottom: "10px"
                    }}>
                        비밀번호
                    </p>
                    <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)}
                           style={{ width: "100%", marginBottom: "26px", padding: "13px 14px", borderRadius: "8px", border: "1px solid #d9e1f0", background: "#eef3fb" }} />


                    <button onClick={handleLogin} style={{
                        width: "100%",
                        padding: "15px",
                        borderRadius: "8px",
                        background: "#F4A7B9",
                        color: "white",
                        border: "none",
                        fontWeight: 700,
                        marginBottom: "22px",
                        cursor: "pointer"
                    }}>로그인</button>

                    <div style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", marginBottom: "22px" }}>
                        <div style={{ flex: 1, height: "1px", background: "#e5e5e5" }} />
                        <span style={{ fontSize: "13px", color: "#bbb" }}>또는</span>
                        <div style={{ flex: 1, height: "1px", background: "#e5e5e5" }} />
                    </div>

                    <button style={{
                        width: "100%",
                        padding: "14px",
                        borderRadius: "8px",
                        background: "#FAE100",
                        color: "#3C1E1E",
                        border: "none",
                        fontWeight: 700
                    }}>● 카카오로 시작하기</button>

                    <p style={{ textAlign: "center", fontSize: "12px", color: "#aaa", marginTop: "20px" }}>
                        계정이 없으신가요? <span onClick={onSignup} style={{ color: "#F4A7B9", cursor: "pointer", fontWeight: 700 }}>회원가입</span>
                    </p>
                </section>
            </main>
        </div>
    )
}

export default LoginPage