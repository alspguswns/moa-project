import { useState } from "react"
import { API } from "../config.js"
import { useIsMobile } from "../hooks/useIsMobile"

function LoginPage({ onLogin, onSignup }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const isMobile = useIsMobile()

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
            minHeight: "100vh",
            fontFamily: "'GriounPolice', cursive",
            backgroundColor: "var(--moa-bg)",
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
                padding: "0 5vw",
                backgroundColor: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                boxSizing: "border-box"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ fontSize: isMobile ? "28px" : "36px" }}>🐷</div>
                    <h1 style={{ margin: 0, fontSize: isMobile ? "22px" : "28px", color: "var(--moa-primary)" }}>MOA</h1>
                </div>
                {!isMobile && (
                    <nav style={{ display: "flex", gap: "24px", fontSize: "14px", fontWeight: 500 }}>
                        <span style={{ cursor: "pointer" }}>MOA 소개</span>
                        <span style={{ cursor: "pointer" }}>기능</span>
                        <span style={{ cursor: "pointer" }}>가이드</span>
                        <span style={{ cursor: "pointer" }}>커뮤니티</span>
                        <span style={{ cursor: "pointer" }}>리소스</span>
                    </nav>
                )}
                {!isMobile && (
                    <div style={{ display: "flex", gap: "12px" }}>
                        <button style={{
                            padding: "6px 14px", borderRadius: "6px",
                            border: "1px solid var(--moa-primary)", background: "var(--moa-bg-card)",
                            color: "var(--moa-primary)", cursor: "pointer", fontWeight: 600
                        }}>영업팀 문의</button>
                        <button style={{
                            padding: "6px 14px", borderRadius: "6px",
                            border: "none", background: "var(--moa-primary)",
                            color: "white", cursor: "pointer", fontWeight: 600
                        }}>MOA 시작하기</button>
                    </div>
                )}
            </header>

            {/* 메인 레이아웃 */}
            <main style={{
                flex: 1,
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? "0" : "6vw",
                padding: isMobile ? "24px 20px" : "48px 8vw",
                boxSizing: "border-box",
                alignItems: isMobile ? "stretch" : "stretch"
            }}>
                {/* 왼쪽 이미지 영역 (PC만) */}
                {!isMobile && (
                    <section style={{
                        flex: 1,
                        minHeight: "400px",
                        background: "url('/images/mockup.png') center/cover no-repeat",
                        borderRadius: "0",
                    }} />
                )}

                {/* 모바일 상단 문구 */}
                {isMobile && (
                    <div style={{ textAlign: "center", marginBottom: "24px" }}>
                        <div style={{ fontSize: "64px", marginBottom: "12px" }}>🐷</div>
                        <h2 style={{
                            fontSize: "24px", fontWeight: 700, color: "var(--moa-primary)",
                            margin: "0 0 8px"
                        }}>나의 소비를 한 눈에,</h2>
                        <p style={{ fontSize: "14px", color: "var(--moa-text)", margin: 0 }}>
                            복잡한 소비내역은 잊으세요.
                        </p>
                    </div>
                )}

                {/* 오른쪽 로그인/문구 영역 */}
                <section style={{
                    width: isMobile ? "100%" : "400px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }}>
                    {!isMobile && (
                        <>
                            <h2 style={{
                                fontSize: "28px", fontWeight: 700, color: "var(--moa-primary)",
                                textAlign: "center", marginBottom: "12px"
                            }}>
                                나의 소비를 한 눈에,
                            </h2>
                            <p style={{
                                fontSize: "16px", color: "var(--moa-text)",
                                textAlign: "center", marginBottom: "36px"
                            }}>
                                복잡한 소비내역은 잊으세요.
                            </p>
                        </>
                    )}

                    <p style={{
                        fontSize: "16px", color: "var(--moa-text)",
                        textAlign: "left", width: "100%", marginBottom: "10px"
                    }}>이메일</p>
                    <input type="email" placeholder="이메일" value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{
                            width: "100%", marginBottom: "14px",
                            padding: "13px 14px", borderRadius: "8px",
                            border: "1px solid #d9e1f0", background: "#eef3fb",
                            fontSize: "14px", boxSizing: "border-box"
                        }} />

                    <p style={{
                        fontSize: "16px", color: "var(--moa-text)",
                        textAlign: "left", width: "100%", marginBottom: "10px"
                    }}>비밀번호</p>
                    <input type="password" placeholder="비밀번호" value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleLogin()}
                        style={{
                            width: "100%", marginBottom: "26px",
                            padding: "13px 14px", borderRadius: "8px",
                            border: "1px solid #d9e1f0", background: "#eef3fb",
                            fontSize: "14px", boxSizing: "border-box"
                        }} />

                    <button onClick={handleLogin} style={{
                        width: "100%", padding: "15px", borderRadius: "8px",
                        background: "var(--moa-primary)", color: "white", border: "none",
                        fontWeight: 700, marginBottom: "22px", cursor: "pointer",
                        fontSize: "15px", fontFamily: "'GriounPolice', cursive"
                    }}>로그인</button>

                    <div style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", marginBottom: "22px" }}>
                        <div style={{ flex: 1, height: "1px", background: "#e5e5e5" }} />
                        <span style={{ fontSize: "13px", color: "var(--moa-text-sub)" }}>또는</span>
                        <div style={{ flex: 1, height: "1px", background: "#e5e5e5" }} />
                    </div>

                    <button style={{
                        width: "100%", padding: "14px", borderRadius: "8px",
                        background: "#FAE100", color: "#3C1E1E", border: "none",
                        fontWeight: 700, fontSize: "14px", cursor: "pointer",
                        fontFamily: "'GriounPolice', cursive"
                    }}>● 카카오로 시작하기</button>

                    <p style={{ textAlign: "center", fontSize: "12px", color: "var(--moa-text-sub)", marginTop: "20px" }}>
                        계정이 없으신가요?{" "}
                        <span onClick={onSignup} style={{ color: "var(--moa-primary)", cursor: "pointer", fontWeight: 700 }}>
                            회원가입
                        </span>
                    </p>
                </section>
            </main>
        </div>
    )
}

export default LoginPage
