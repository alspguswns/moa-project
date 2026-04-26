function AddSpendPage({ onBack }) {
    return (
        <div style={{ maxWidth: "360px", margin: "0 auto", padding: "24px 20px" }}>
            <button onClick={onBack} style={{
                background: "none", border: "none",
                fontSize: "24px", cursor: "pointer", marginBottom: "16px"
            }}>←</button>

            <h2 style={{ fontSize: "20px", marginBottom: "24px" }}>지출 입력</h2>

            <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>금액</label>
                <input type="number" placeholder="0" style={{
                    width: "100%", padding: "10px 12px", borderRadius: "10px",
                    border: "1px solid #eee", fontSize: "14px", boxSizing: "border-box"
                }} />
            </div>

            <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>카테고리</label>
                <select style={{
                    width: "100%", padding: "10px 12px", borderRadius: "10px",
                    border: "1px solid #eee", fontSize: "14px", boxSizing: "border-box"
                }}>
                    <option>식비</option>
                    <option>교통</option>
                    <option>쇼핑</option>
                    <option>의료</option>
                    <option>기타</option>
                </select>
            </div>

            <div style={{ marginBottom: "24px" }}>
                <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>메모</label>
                <input type="text" placeholder="어디서 썼나요?" style={{
                    width: "100%", padding: "10px 12px", borderRadius: "10px",
                    border: "1px solid #eee", fontSize: "14px", boxSizing: "border-box"
                }} />
            </div>

            <button style={{
                width: "100%", padding: "14px", borderRadius: "12px",
                background: "#7F77DD", color: "white", border: "none",
                fontSize: "15px", fontWeight: "500", cursor: "pointer"
            }}>
                저장하기
            </button>
        </div>
    )
}

export default AddSpendPage