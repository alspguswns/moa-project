function LoginPage({ onLogin }) {
    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundImage: `
        linear-gradient(#e0e0e0 1px, transparent 1px),
        linear-gradient(90deg, #e0e0e0 1px, transparent 1px)
      `,
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
                border: "1px solid #eee"
            }}>

                {/* 로고 */}
                <div style={{ textAlign: "center", marginBottom: "28px" }}>
                    <div style={{ fontSize: "56px", lineHeight: 1 }}>🐷</div>
                    <p style={{ margin: "8px 0 2px", fontSize: "12px", color: "#F4A7B9" }}>알뜰한 소비습관의 시작</p>
                    <h1 style={{ margin: 0, fontSize: "36px", fontWeight: "700", color: "#F4A7B9", letterSpacing: "4px" }}>MOA</h1>
                </div>

                {/* 이메일 */}
                <input
                    type="email"
                    placeholder="이메일"
                    style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        border: "none",
                        background: "#f0f0f0",
                        fontSize: "14px",
                        color: "#333",
                        boxSizing: "border-box",
                        marginBottom: "10px",
                        outline: "none"
                    }}
                />

                {/* 비밀번호 */}
                <input
                    type="password"
                    placeholder="비밀번호"
                    style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        border: "none",
                        background: "#f0f0f0",
                        fontSize: "14px",
                        boxSizing: "border-box",
                        marginBottom: "16px",
                        color: "#333",
                        outline: "none"
                    }}
                />

                {/* 로그인 버튼 */}
                <button onClick={onLogin} style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "10px",
                    background: "#F4A7B9",
                    color: "white",
                    border: "none",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    marginBottom: "12px"
                }}>
                    로그인
                </button>

                {/* 구분선 */}
                <div style={{ textAlign: "center", color: "#ccc", fontSize: "12px", margin: "12px 0" }}>
                    또는
                </div>

                {/* 카카오 버튼 */}
                <button style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: "10px",
                    background: "#FAE100",
                    color: "#3C1E1E",
                    border: "none",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer"
                }}>
                    💬 카카오로 시작하기
                </button>

                {/* 회원가입 */}
                <p style={{ textAlign: "center", fontSize: "12px", color: "#aaa", marginTop: "16px" }}>
                    계정이 없으신가요?{" "}
                    <span style={{ color: "#F4A7B9", fontWeight: "600", cursor: "pointer" }}>
            회원가입
          </span>
                </p>

            </div>
        </div>
    )
}

export default LoginPage