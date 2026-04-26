function MainPage({ onAddSpend }) {
    return (
        <div style={{ maxWidth: "360px", margin: "0 auto", padding: "24px 20px" }}>
            <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>안녕하세요 👋</h2>
            <p style={{ color: "#888", fontSize: "14px", marginBottom: "24px" }}>이번달 지출을 확인해요!</p>

            <div style={{
                background: "#7F77DD", borderRadius: "20px",
                padding: "24px", color: "white", marginBottom: "20px"
            }}>
                <p style={{ margin: "0 0 8px", fontSize: "13px", opacity: 0.8 }}>이번달 지출</p>
                <p style={{ margin: 0, fontSize: "32px", fontWeight: "500" }}>0원</p>
            </div>

            <button onClick={onAddSpend} style={{
                width: "100%", padding: "14px", borderRadius: "12px",
                background: "#7F77DD", color: "white", border: "none",
                fontSize: "15px", fontWeight: "500", cursor: "pointer"
            }}>
                + 지출 추가하기
            </button>
        </div>
    )
}


export default MainPage