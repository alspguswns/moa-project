function CalendarPage({ onBack }) {
    const days = ["일", "월", "화", "수", "목", "금", "토"]
    const dates = Array.from({ length: 30 }, (_, i) => i + 1)

    return (
        <div style={{ maxWidth: "360px", margin: "0 auto", padding: "24px 20px", fontFamily: "'GriounPolice', cursive" }}>

            {/* 헤더 */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
                <button onClick={onBack} style={{
                    background: "none", border: "none",
                    fontSize: "24px", cursor: "pointer", marginRight: "12px"
                }}>←</button>
                <h2 style={{ margin: 0, fontSize: "20px" }}>📅 2026년 4월</h2>
            </div>

            {/* 요일 헤더 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "8px" }}>
                {days.map((day) => (
                    <div key={day} style={{ textAlign: "center", fontSize: "12px", color: "#aaa", padding: "4px 0" }}>
                        {day}
                    </div>
                ))}
            </div>

            {/* 날짜 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                {dates.map((date) => (
                    <div key={date} style={{
                        textAlign: "center",
                        padding: "8px 4px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        cursor: "pointer",
                        background: date === 26 ? "#F4A7B9" : "transparent",
                        color: date === 26 ? "white" : "#333"
                    }}>
                        {date}
                    </div>
                ))}
            </div>

        </div>
    )
}

export default CalendarPage