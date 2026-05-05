function MainPage({ onAddSpend }) {
    const nickname = localStorage.getItem("nickname") || "사용자"

    return (
        <div style={{
            minHeight: "100vh",
            backgroundImage: `
                linear-gradient(#e0e0e0 1px, transparent 1px),
                linear-gradient(90deg, #e0e0e0 1px, transparent 1px)
            `,
            backgroundSize: "28px 28px",
            backgroundColor: "#f5f5f5",
            padding: "24px 20px",
            boxSizing: "border-box",
            fontFamily: "'GriounPolice', cursive"
        }}>
            <div style={{ maxWidth: "360px", margin: "0 auto" }}>
                <h2 style={{
                    fontSize: "20px",
                    marginBottom: "4px",
                    fontFamily: "'GriounPolice', cursive",
                    fontWeight: "500"
                }}>
                    안녕하세요 {nickname}님
                </h2>

                <p style={{
                    color: "#888",
                    fontSize: "14px",
                    marginBottom: "24px"
                }}>
                    이번달 지출을 확인해요!
                </p>

                <div style={{
                    background: "#F4A7B9",
                    borderRadius: "20px",
                    padding: "24px",
                    color: "white",
                    marginBottom: "20px",
                }}>
                    <p style={{
                        margin: "0 0 8px",
                        fontSize: "13px",
                        opacity: 0.8
                    }}>
                        이번달
                    </p>

                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "12px"
                    }}>
                        <div>
                            <p style={{
                                margin: "0 0 4px",
                                fontSize: "12px",
                                opacity: 0.8
                            }}>
                                수입
                            </p>

                            <p style={{
                                margin: 0,
                                fontSize: "22px",
                                fontWeight: "500"
                            }}>
                                +0원
                            </p>
                        </div>

                        <div>
                            <p style={{
                                margin: "0 0 4px",
                                fontSize: "12px",
                                opacity: 0.8
                            }}>
                                지출
                            </p>

                            <p style={{
                                margin: 0,
                                fontSize: "22px",
                                fontWeight: "500"
                            }}>
                                -0원
                            </p>
                        </div>
                    </div>
                </div>

                {/* 최근 내역 */}
                <div style={{ marginBottom: "20px" }}>
                    <p style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        marginBottom: "12px"
                    }}>
                        최근 내역
                    </p>

                    {[
                        { memo: "점심", category: "식비", amount: 8000, type: "지출" },
                        { memo: "버스", category: "교통", amount: 1500, type: "지출" },
                        { memo: "용돈", category: "수입", amount: 50000, type: "수입" },
                    ].map((item, index) => (
                        <div key={index} style={{
                            background: "white",
                            borderRadius: "12px",
                            padding: "12px 16px",
                            marginBottom: "8px",
                            display: "flex",
                            justifyContent: "space-between",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                        }}>
                            <div>
                                <p style={{
                                    margin: "0 0 2px",
                                    fontSize: "14px"
                                }}>
                                    {item.memo}
                                </p>

                                <p style={{
                                    margin: 0,
                                    fontSize: "12px",
                                    color: "#aaa"
                                }}>
                                    {item.category}
                                </p>
                            </div>

                            <p style={{
                                margin: 0,
                                fontSize: "14px",
                                fontWeight: "600",
                                color: item.type === "지출" ? "#F4A7B9" : "#7F77DD"
                            }}>
                                {item.type === "지출" ? "-" : "+"}
                                {item.amount.toLocaleString()}원
                            </p>
                        </div>
                    ))}
                    {/* 하단 네비게이션 */}
                    <div style={{
                        position: "fixed", bottom: 0, left: "50%",
                        transform: "translateX(-50%)",
                        width: "360px", background: "white",
                        borderTop: "1px solid #eee",
                        display: "flex", justifyContent: "space-around",
                        padding: "12px 0"
                    }}>
                        <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "#F4A7B9" }}>
                            🏠 홈
                        </button>
                        <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "#aaa" }}>
                            📋 내역
                        </button>
                        <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "#aaa" }}>
                            📅 캘린더
                        </button>
                    </div>
                </div>

                <button
                    onClick={onAddSpend}
                    style={{
                        width: "100%",
                        padding: "15px",
                        borderRadius: "14px",
                        background: "#F4A7B9",
                        color: "white",
                        border: "none",
                        fontSize: "15px",
                        fontWeight: "600",
                        cursor: "pointer",
                        fontFamily: "'GriounPolice', cursive"
                    }}
                >
                    + 지출 추가하기
                </button>
            </div>
        </div>
    )
}

export default MainPage