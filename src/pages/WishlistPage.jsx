import { useState, useEffect } from "react"
import BottomNav from "../components/BottomNav"

function WishlistPage({ onHome, onHistory, onCalendar, onAnalysis, onWishlist, current }) {
    const userId = localStorage.getItem("user_id")
    const [items, setItems] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [name, setName] = useState("")
    const [price, setPrice] = useState("")
    const [priority, setPriority] = useState("1")
    const [memo, setMemo] = useState("")

    const fetchItems = () => {
        fetch(`http://127.0.0.1:8000/wishlist/${userId}`)
            .then(res => res.json())
            .then(data => setItems(Array.isArray(data) ? data : []))
            .catch(e => console.error(e))
    }

    useEffect(() => {
        fetchItems()
    }, [])

    const handleAdd = async () => {
        if (!name.trim() || !price) {
            alert("이름과 금액을 입력해줘요!")
            return
        }
        await fetch("http://127.0.0.1:8000/wishlist/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: parseInt(userId),
                name: name.trim(),
                price: parseInt(price),
                priority: parseInt(priority),
                memo: memo.trim()
            })
        })
        setName(""); setPrice(""); setPriority("1"); setMemo("")
        setShowForm(false)
        fetchItems()
    }

    const handleDelete = async (id) => {
        await fetch(`http://127.0.0.1:8000/expense/${id}`, { method: "DELETE" })
        setTransactions(prev => prev.filter(t => t.id !== id))
    }

    const priorityLabel = (p) => {
        if (p === 1) return { text: "1순위", color: "#F4A7B9" }
        if (p === 2) return { text: "2순위", color: "#FFB347" }
        return { text: "3순위+", color: "#aaa" }
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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                    <h2 style={{ margin: 0, fontSize: "20px" }}>🛍️ 위시리스트</h2>
                    <button onClick={() => setShowForm(!showForm)} style={{
                        background: "#F4A7B9", color: "white", border: "none",
                        borderRadius: "20px", padding: "6px 16px", fontSize: "13px",
                        cursor: "pointer", fontFamily: "'GriounPolice', cursive"
                    }}>
                        {showForm ? "취소" : "+ 추가"}
                    </button>
                </div>

                {/* 추가 폼 */}
                {showForm && (
                    <div style={{
                        background: "white", borderRadius: "16px",
                        padding: "20px", marginBottom: "16px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                    }}>
                        <input placeholder="갖고 싶은 것" value={name}
                               onChange={e => setName(e.target.value)}
                               style={inputStyle} />
                        <input type="number" placeholder="가격 (원)" value={price}
                               onChange={e => setPrice(e.target.value)}
                               style={inputStyle} />
                        <select value={priority} onChange={e => setPriority(e.target.value)} style={inputStyle}>
                            <option value="1">1순위 ⭐⭐⭐</option>
                            <option value="2">2순위 ⭐⭐</option>
                            <option value="3">3순위 ⭐</option>
                        </select>
                        <input placeholder="메모 (선택)" value={memo}
                               onChange={e => setMemo(e.target.value)}
                               style={inputStyle} />
                        <button onClick={handleAdd} style={{
                            width: "100%", padding: "12px", borderRadius: "10px",
                            background: "#F4A7B9", color: "white", border: "none",
                            fontSize: "14px", cursor: "pointer",
                            fontFamily: "'GriounPolice', cursive"
                        }}>추가하기</button>
                    </div>
                )}

                {/* 위시리스트 목록 */}
                {items.length === 0 ? (
                    <p style={{ textAlign: "center", color: "#aaa", marginTop: "60px" }}>위시리스트가 비어있어요! 갖고 싶은 걸 추가해봐요 🛍️</p>
                ) : (
                    items.map(item => {
                        const label = priorityLabel(item.priority)
                        return (
                            <div key={item.id} style={{
                                background: "white", borderRadius: "14px",
                                padding: "16px", marginBottom: "10px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                borderLeft: `4px solid ${label.color}`
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <span style={{
                                            fontSize: "10px", color: label.color,
                                            fontWeight: "600", marginBottom: "4px", display: "block"
                                        }}>{label.text}</span>
                                        <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "600" }}>{item.name}</p>
                                        <p style={{ margin: 0, fontSize: "14px", color: "#F4A7B9", fontWeight: "600" }}>{item.price.toLocaleString()}원</p>
                                        {item.memo && <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#aaa" }}>{item.memo}</p>}
                                    </div>
                                    <button onClick={() => handleDelete(item.id)} style={{
                                        background: "none", border: "none",
                                        fontSize: "18px", cursor: "pointer", color: "#ddd"
                                    }}>🗑️</button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            <BottomNav current={current} onHome={onHome} onHistory={onHistory} onCalendar={onCalendar} onAnalysis={onAnalysis} onWishlist={onWishlist} />
        </div>
    )
}

const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: "10px",
    border: "1px solid #eee", fontSize: "14px", boxSizing: "border-box",
    marginBottom: "10px", fontFamily: "'GriounPolice', cursive", outline: "none"
}

export default WishlistPage