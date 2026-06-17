import { useState, useEffect } from "react"
import { API } from "../config.js"

function GamePage({ onHome, onHistory, onAnalysis, onWishlist, onChat, onLogout, current }) {
    const userId = parseInt(localStorage.getItem("user_id"))
    const nickname = localStorage.getItem("nickname") || "사용자"

    const [status, setStatus] = useState(null)
    const [attendance, setAttendance] = useState(null)
    const [quest, setQuest] = useState(null)
    const [shopItems, setShopItems] = useState([])
    const [achievements, setAchievements] = useState([])
    const [inventory, setInventory] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("home") // home(거실) / quest / shop / achievement
    const [toast, setToast] = useState(null)

    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: "alert", message: "", onConfirm: null })

    const navItems = [
        { key: "main", icon: "🏠", onClick: onHome },
        { key: "history", icon: "📋", onClick: onHistory },
        { key: "analysis", icon: "📊", onClick: onAnalysis },
        { key: "wishlist", icon: "🛍️", onClick: onWishlist },
        { key: "chat", icon: "💬", onClick: onChat },
        { key: "logout", icon: "🚪", onClick: () => setModalConfig({
                isOpen: true, type: "confirm", message: "정말로 로그아웃 하시겠습니까? 🐷",
                onConfirm: () => { setModalConfig({ isOpen: false }); onLogout() }
            })},
    ]

    // 토스트 메시지
    const showToast = (msg, type = "success") => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    // 전체 데이터 로드
    const loadAll = async () => {
        if (!userId) { setLoading(false); return }
        try {
            const [statusRes, attRes, questRes, shopRes, achRes, invRes] = await Promise.all([
                fetch(`${API}/game/character-status/${userId}`),
                fetch(`${API}/game/attendance/${userId}`),
                fetch(`${API}/game/quest/${userId}`),
                fetch(`${API}/game/shop`),
                fetch(`${API}/game/achievements/${userId}`),
                fetch(`${API}/game/inventory/${userId}`)
            ])
            setStatus(await statusRes.json())
            setAttendance(await attRes.json())
            setQuest(await questRes.json())
            setShopItems(await shopRes.json())
            setAchievements(await achRes.json())
            setInventory(await invRes.json())
        } catch (e) {
            console.error(e)
        }
        setLoading(false)
    }

    useEffect(() => { loadAll() }, [])

    // 출석 체크
    const handleAttendance = async () => {
        if (attendance?.checked_today) {
            showToast("오늘은 이미 출석했어요! 내일 또 와요 🐷", "info")
            return
        }
        try {
            const res = await fetch(`${API}/game/attendance/${userId}`, { method: "POST" })
            const data = await res.json()
            if (data.already) {
                showToast("오늘은 이미 출석했어요!", "info")
            } else {
                showToast(`${data.streak}일 연속 출석! 씨앗 ${data.seeds_reward}개 획득! 🌱`, "success")
                if (data.new_achievements?.length > 0) {
                    setTimeout(() => showToast(`🏆 업적 해금: ${data.new_achievements.join(", ")}`, "achievement"), 1500)
                }
            }
            loadAll()
        } catch (e) { showToast("서버 오류가 발생했어요 😢", "error") }
    }

    // 퀘스트 완료
    const handleQuest = async (type) => {
        try {
            const res = await fetch(`${API}/game/quest/${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quest_type: type })
            })
            const data = await res.json()
            if (data.already_done) {
                showToast("이미 완료한 퀘스트예요!", "info")
            } else {
                showToast(data.message, "success")
                if (data.new_achievements?.length > 0) {
                    setTimeout(() => showToast(`🏆 업적 해금: ${data.new_achievements.join(", ")}`, "achievement"), 1500)
                }
            }
            loadAll()
        } catch (e) { showToast("서버 오류가 발생했어요 😢", "error") }
    }

    // 아이템 구매 (인벤토리에 추가)
    const handleBuy = async (item) => {
        setModalConfig({
            isOpen: true, type: "confirm",
            message: `${item.name}을 구매할까요?\n씨앗 ${item.price}개가 필요해요!`,
            onConfirm: async () => {
                setModalConfig({ isOpen: false })
                try {
                    const res = await fetch(`${API}/game/shop/buy`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ user_id: userId, item_id: item.id })
                    })
                    const data = await res.json()
                    if (res.ok) {
                        showToast(`${data.message} 남은 씨앗: ${data.remaining_seeds}개 🌱`, "success")
                        if (data.new_achievements?.length > 0) {
                            setTimeout(() => showToast(`🏆 업적 해금: ${data.new_achievements.join(", ")}`, "achievement"), 1500)
                        }
                        loadAll()
                    } else {
                        showToast("씨앗이 부족해요! 더 모아봐요 🌱", "error")
                    }
                } catch (e) { showToast("서버 오류가 발생했어요 😢", "error") }
            }
        })
    }

    // 거실: 아이템 사용 (먹이주기 / 놀아주기)
    const handleUseItem = async (item) => {
        try {
            const res = await fetch(`${API}/game/use-item`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, item_id: item.item_id })
            })
            const data = await res.json()
            if (res.ok) {
                showToast(data.message, "success")
                if (data.new_achievements?.length > 0) {
                    setTimeout(() => showToast(`🏆 업적 해금: ${data.new_achievements.join(", ")}`, "achievement"), 1500)
                }
                loadAll()
            } else {
                showToast(data.detail || "사용에 실패했어요 😢", "error")
            }
        } catch (e) { showToast("서버 오류가 발생했어요 😢", "error") }
    }

    // 캐릭터 이모지 (단계별)
    const getCharacterEmoji = (stage, hunger, mood) => {
        if (hunger < 20 || mood < 20) return "😵"
        if (hunger < 50 || mood < 50) return "😟"
        if (mood >= 80 && hunger >= 80) return "😄"
        const stageEmoji = { "알": "🥚", "유체": "🐣", "아성체": "🐥", "성체": "🐷" }
        return stageEmoji[stage] || "🐷"
    }

    const getStageColor = (stage) => {
        return { "알": "#ddd", "유체": "#ffe4b5", "아성체": "#ffd9e2", "성체": "#F4A7B9" }[stage] || "#F4A7B9"
    }

    const getExpPercent = (exp, stage) => {
        const thresholds = { "알": [0, 100], "유체": [100, 300], "아성체": [300, 700], "성체": [700, 700] }
        const [min, max] = thresholds[stage] || [0, 100]
        if (min === max) return 100
        return Math.min(Math.round(((exp - min) / (max - min)) * 100), 100)
    }

    // ── 탭: 거실 ──────────────────────────────────────
    const renderHome = () => {
        const feedItems = inventory.filter(i => i.item_type === "feed")
        const toyItems = inventory.filter(i => i.item_type === "toy")

        return (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", flex: 1, minHeight: 0 }}>

                {/* 왼쪽: 캐릭터 카드 + 출석 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <section style={{ ...card, flex: 1 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
                            {/* 캐릭터 */}
                            <div style={{
                                width: "130px", height: "130px", borderRadius: "50%",
                                background: `${getStageColor(status?.stage)}33`,
                                border: `4px solid ${getStageColor(status?.stage)}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "66px", margin: "0 auto 12px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)"
                            }}>
                                {getCharacterEmoji(status?.stage, status?.hunger, status?.mood)}
                            </div>

                            <p style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: "800", color: "#333" }}>
                                {status?.name || "MOA"}
                            </p>
                            <div style={{ display: "inline-flex", alignItems: "center", background: "#fff0f3", borderRadius: "20px", padding: "4px 14px", border: "1px solid #ffd9e2", marginBottom: "14px" }}>
                                <span style={{ fontSize: "12px", fontWeight: "700", color: "#F4A7B9" }}>{status?.stage || "알"} 단계</span>
                            </div>

                            {/* 경험치 바 */}
                            <div style={{ width: "100%", marginBottom: "12px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                                    <span style={{ fontSize: "11px", color: "#aaa" }}>경험치</span>
                                    <span style={{ fontSize: "11px", color: "#aaa" }}>{status?.exp || 0} / {status?.stage_next_exp || 100}</span>
                                </div>
                                <div style={{ background: "#f0f0f0", borderRadius: "999px", height: "8px", overflow: "hidden" }}>
                                    <div style={{ background: "linear-gradient(90deg, #F4A7B9, #ff6b9d)", borderRadius: "999px", height: "100%", width: `${getExpPercent(status?.exp, status?.stage)}%`, transition: "width 0.5s" }} />
                                </div>
                            </div>

                            {/* 씨앗 */}
                            <div style={{ background: "#f9f6e8", borderRadius: "12px", padding: "7px 16px", border: "1px solid #f0e68c", marginBottom: "16px" }}>
                                <span style={{ fontSize: "13px", fontWeight: "700", color: "#8b7500" }}>🌱 씨앗 {status?.seeds || 0}개</span>
                            </div>

                            {/* 배고픔 / 기분 */}
                            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
                                {[
                                    { label: "배고픔", value: status?.hunger ?? 0, color: "#ff9f43", emoji: "🍚" },
                                    { label: "기분",   value: status?.mood   ?? 0, color: "#54a0ff", emoji: "😊" },
                                ].map(({ label, value, color, emoji }) => (
                                    <div key={label}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                                            <span style={{ fontSize: "12px", color: "#555", fontWeight: "600" }}>{emoji} {label}</span>
                                            <span style={{ fontSize: "12px", fontWeight: "700", color: value < 30 ? "#e74c3c" : value < 60 ? "#f39c12" : color }}>
                                                {value}/100 {value < 30 ? "😵" : value < 60 ? "😟" : "😊"}
                                            </span>
                                        </div>
                                        <div style={{ background: "#f0f0f0", borderRadius: "999px", height: "9px", overflow: "hidden" }}>
                                            <div style={{ background: value < 30 ? "#e74c3c" : value < 60 ? "#f39c12" : color, borderRadius: "999px", height: "100%", width: `${value}%`, transition: "width 0.5s" }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* 출석 체크 */}
                    <section style={{ ...card, flexShrink: 0 }}>
                        <p style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "700", color: "#111" }}>📅 출석 체크</p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <p style={{ margin: "0 0 2px", fontSize: "13px", color: "#555" }}>
                                    연속 출석 <strong style={{ color: "#F4A7B9" }}>{attendance?.streak || 0}일</strong>
                                </p>
                                <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>
                                    {attendance?.checked_today ? "오늘 출석 완료! ✅" : "오늘 아직 출석 안 했어요!"}
                                </p>
                            </div>
                            <button onClick={handleAttendance} style={{
                                padding: "10px 20px", borderRadius: "12px", border: "none", cursor: "pointer",
                                background: attendance?.checked_today ? "#eee" : "#F4A7B9",
                                color: attendance?.checked_today ? "#aaa" : "white",
                                fontSize: "13px", fontWeight: "700", fontFamily: "inherit"
                            }}>
                                {attendance?.checked_today ? "완료 ✅" : "출석하기 🌱"}
                            </button>
                        </div>
                    </section>
                </div>

                {/* 오른쪽: 가방 (인벤토리) */}
                <section style={{ ...card, flex: 1 }}>
                    <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "700", color: "#111" }}>🎒 내 가방</p>
                    <p style={{ margin: "0 0 16px", fontSize: "11px", color: "#aaa" }}>상점에서 구매한 아이템을 여기서 사용해봐요</p>

                    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>

                        {/* 먹이 섹션 */}
                        <div>
                            <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: "700", color: "#ff9f43" }}>🍖 먹이</p>
                            {feedItems.length === 0 ? (
                                <div style={{ background: "#fafafa", borderRadius: "14px", padding: "18px", textAlign: "center", border: "1px solid #f0f0f0" }}>
                                    <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#ccc" }}>먹이가 없어요!</p>
                                    <button onClick={() => setActiveTab("shop")} style={{ background: "none", border: "none", fontSize: "12px", color: "#F4A7B9", cursor: "pointer", fontWeight: "700", fontFamily: "inherit" }}>
                                        상점에서 구매하기 →
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {feedItems.map(item => (
                                        <div key={item.item_id} style={{ background: "#fafafa", borderRadius: "14px", padding: "12px 16px", border: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#fff0e6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🍖</div>
                                                <div>
                                                    <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: "700", color: "#333" }}>{item.name}</p>
                                                    <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>{item.description} · <strong style={{ color: "#ff9f43" }}>{item.quantity}개</strong> 보유</p>
                                                </div>
                                            </div>
                                            <button onClick={() => handleUseItem(item)} style={{
                                                padding: "8px 16px", borderRadius: "10px", border: "none",
                                                background: "#ff9f43", color: "white",
                                                fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap"
                                            }}>먹이주기</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 장난감 섹션 */}
                        <div>
                            <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: "700", color: "#54a0ff" }}>🎮 장난감</p>
                            {toyItems.length === 0 ? (
                                <div style={{ background: "#fafafa", borderRadius: "14px", padding: "18px", textAlign: "center", border: "1px solid #f0f0f0" }}>
                                    <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#ccc" }}>장난감이 없어요!</p>
                                    <button onClick={() => setActiveTab("shop")} style={{ background: "none", border: "none", fontSize: "12px", color: "#F4A7B9", cursor: "pointer", fontWeight: "700", fontFamily: "inherit" }}>
                                        상점에서 구매하기 →
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {toyItems.map(item => (
                                        <div key={item.item_id} style={{ background: "#fafafa", borderRadius: "14px", padding: "12px 16px", border: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f0f0ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🎮</div>
                                                <div>
                                                    <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: "700", color: "#333" }}>{item.name}</p>
                                                    <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>{item.description} · <strong style={{ color: "#54a0ff" }}>{item.quantity}개</strong> 보유</p>
                                                </div>
                                            </div>
                                            <button onClick={() => handleUseItem(item)} style={{
                                                padding: "8px 16px", borderRadius: "10px", border: "none",
                                                background: "#54a0ff", color: "white",
                                                fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap"
                                            }}>놀아주기</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        )
    }

    // ── 탭: 퀘스트 ──────────────────────────────────
    const renderQuest = () => (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", flex: 1, minHeight: 0 }}>
            <section style={{ ...card, flex: 1 }}>
                <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "700", color: "#111" }}>📋 일간 퀘스트</p>
                <p style={{ margin: "0 0 16px", fontSize: "11px", color: "#aaa" }}>매일 자정에 초기화돼요</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, overflowY: "auto" }}>
                    {[
                        { key: "q_record",   label: "오늘의 소비 기록", emoji: "✏️", reward: 45, exp: 5,  hint: "내역 추가에서 지출/수입을 기록하면 자동 달성!" },
                        { key: "q_check",    label: "수입/지출 확인",   emoji: "👀", reward: 36, exp: 0,  hint: "📋 내역 탭을 방문하면 자동 달성!" },
                        { key: "q_category", label: "카테고리 정리",    emoji: "🗂️", reward: 20, exp: 5,  hint: "카테고리를 선택해 내역을 기록하면 자동 달성!" },
                        { key: "q_feed",     label: "캐릭터 돌보기",    emoji: "🍖", reward: 10, exp: 0,  hint: "🏠 거실에서 먹이주기 또는 놀아주기!" },
                    ].map(({ key, label, emoji, reward, exp, hint }) => (
                        <div key={key} style={{
                            background: quest?.[key] ? "#f0fff4" : "white",
                            borderRadius: "16px", padding: "14px 16px",
                            border: quest?.[key] ? "1px solid #b2dfdb" : "1px solid #eee",
                            display: "flex", alignItems: "center", justifyContent: "space-between"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: quest?.[key] ? "#e8f5e9" : "#fff0f3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                                    {quest?.[key] ? "✅" : emoji}
                                </div>
                                <div>
                                    <p style={{ margin: "0 0 3px", fontSize: "13px", fontWeight: "700", color: quest?.[key] ? "#aaa" : "#333", textDecoration: quest?.[key] ? "line-through" : "none" }}>{label}</p>
                                    <p style={{ margin: 0, fontSize: "11px", color: quest?.[key] ? "#b2dfdb" : "#bbb" }}>
                                        {quest?.[key] ? "달성 완료! 🎉" : hint}
                                    </p>
                                </div>
                            </div>
                            <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                                <span style={{ fontSize: "12px", color: quest?.[key] ? "#b2dfdb" : "#F4A7B9", fontWeight: "700" }}>🌱 {reward}</span>
                                {exp > 0 && <span style={{ fontSize: "11px", color: "#bbb" }}>+{exp} EXP</span>}
                            </div>
                        </div>
                    ))}
                </div>

                {/* 전체 완료 배너 */}
                {quest?.all_done && (
                    <div style={{ marginTop: "12px", background: "linear-gradient(135deg, #fff0f3, #ffe4ec)", borderRadius: "14px", padding: "14px", border: "1px solid #ffd9e2", textAlign: "center", flexShrink: 0 }}>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#e91e8c" }}>🎉 오늘 퀘스트 전부 완료! 씨앗 150개 추가 보상!</p>
                    </div>
                )}
            </section>

            {/* 주간 퀘스트 */}
            <section style={{ ...card, flex: 1 }}>
                <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "700", color: "#111" }}>📆 주간 퀘스트</p>
                <p style={{ margin: "0 0 16px", fontSize: "11px", color: "#aaa" }}>이번 주 목표를 달성해봐요!</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[
                        { label: "5일 이상 기록하기", desc: "일주일 중 5일 기록", emoji: "📝", reward: 200, exp: 80 },
                        { label: "카테고리 3개 이상 기록", desc: "식비/교통/취미 등 3종 이상", emoji: "🗂️", reward: 120, exp: 80 },
                        { label: "절약 성공", desc: "설정 예산 이하로 마감", emoji: "💰", reward: 400, exp: 100 },
                    ].map(({ label, desc, emoji, reward, exp }) => (
                        <div key={label} style={{ background: "#fafafa", borderRadius: "16px", padding: "14px 16px", border: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#fff0f3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                                    {emoji}
                                </div>
                                <div>
                                    <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: "700", color: "#333" }}>{label}</p>
                                    <p style={{ margin: 0, fontSize: "11px", color: "#bbb" }}>{desc}</p>
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <span style={{ fontSize: "12px", color: "#F4A7B9", fontWeight: "700", display: "block" }}>🌱 {reward}</span>
                                <span style={{ fontSize: "11px", color: "#aaa" }}>+{exp} EXP</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: "16px", background: "#fffbea", borderRadius: "12px", padding: "12px 14px", border: "1px solid #ffeaa7", flexShrink: 0 }}>
                    <p style={{ margin: 0, fontSize: "12px", color: "#8b7500" }}>💡 주간 퀘스트는 다음 업데이트에서 자동 달성 체크가 추가될 예정이에요!</p>
                </div>
            </section>
        </div>
    )

    // ── 탭: 상점 ──────────────────────────────────
    const renderShop = () => {
        const feeds = shopItems.filter(i => i.item_type === "feed")
        const toys = shopItems.filter(i => i.item_type === "toy")
        return (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", flex: 1, minHeight: 0 }}>
                <section style={{ ...card, flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexShrink: 0 }}>
                        <div>
                            <p style={{ margin: "0 0 2px", fontSize: "15px", fontWeight: "700", color: "#111" }}>🍖 먹이 상점</p>
                            <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>구매하면 거실 가방에 들어가요</p>
                        </div>
                        <div style={{ background: "#f9f6e8", borderRadius: "12px", padding: "6px 14px", border: "1px solid #f0e68c" }}>
                            <span style={{ fontSize: "13px", fontWeight: "700", color: "#8b7500" }}>🌱 {status?.seeds || 0}</span>
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, overflowY: "auto" }}>
                        {feeds.map(item => (
                            <div key={item.id} style={{ background: "#fafafa", borderRadius: "14px", padding: "12px 16px", border: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#fff0e6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🍖</div>
                                    <div>
                                        <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: "700", color: "#333" }}>{item.name}</p>
                                        <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>{item.description}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleBuy(item)} style={{
                                    padding: "7px 14px", borderRadius: "10px", border: "none",
                                    background: (status?.seeds || 0) >= item.price ? "#F4A7B9" : "#eee",
                                    color: (status?.seeds || 0) >= item.price ? "white" : "#aaa",
                                    fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit",
                                    whiteSpace: "nowrap"
                                }}>
                                    🌱 {item.price}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                <section style={{ ...card, flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexShrink: 0 }}>
                        <div>
                            <p style={{ margin: "0 0 2px", fontSize: "15px", fontWeight: "700", color: "#111" }}>🎮 장난감 상점</p>
                            <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>구매하면 거실 가방에 들어가요</p>
                        </div>
                        <div style={{ background: "#f9f6e8", borderRadius: "12px", padding: "6px 14px", border: "1px solid #f0e68c" }}>
                            <span style={{ fontSize: "13px", fontWeight: "700", color: "#8b7500" }}>🌱 {status?.seeds || 0}</span>
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, overflowY: "auto" }}>
                        {toys.map(item => (
                            <div key={item.id} style={{ background: "#fafafa", borderRadius: "14px", padding: "12px 16px", border: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f0f0ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🎮</div>
                                    <div>
                                        <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: "700", color: "#333" }}>{item.name}</p>
                                        <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>{item.description}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleBuy(item)} style={{
                                    padding: "7px 14px", borderRadius: "10px", border: "none",
                                    background: (status?.seeds || 0) >= item.price ? "#54a0ff" : "#eee",
                                    color: (status?.seeds || 0) >= item.price ? "white" : "#aaa",
                                    fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit",
                                    whiteSpace: "nowrap"
                                }}>
                                    🌱 {item.price}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        )
    }

    // ── 탭: 업적 ──────────────────────────────────
    const renderAchievement = () => {
        const unlocked = achievements.filter(a => a.unlocked)
        const locked = achievements.filter(a => !a.unlocked)
        return (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", flex: 1, minHeight: 0 }}>
                <section style={{ ...card, flex: 1 }}>
                    <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "700", color: "#111" }}>🏆 달성한 업적</p>
                    <p style={{ margin: "0 0 14px", fontSize: "11px", color: "#aaa" }}>{unlocked.length}개 달성</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, overflowY: "auto" }}>
                        {unlocked.length === 0 ? (
                            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <p style={{ color: "#bbb", fontSize: "13px" }}>아직 달성한 업적이 없어요!</p>
                            </div>
                        ) : unlocked.map(a => (
                            <div key={a.key} style={{ background: "linear-gradient(135deg, #fff0f3, #ffe4ec)", borderRadius: "14px", padding: "12px 16px", border: "1px solid #ffd9e2", display: "flex", alignItems: "center", gap: "12px" }}>
                                <span style={{ fontSize: "24px" }}>🏆</span>
                                <div>
                                    <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: "700", color: "#e91e8c" }}>{a.name}</p>
                                    <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>{a.desc}</p>
                                </div>
                                <span style={{ marginLeft: "auto", fontSize: "11px", color: "#F4A7B9", fontWeight: "700", whiteSpace: "nowrap" }}>🌱 {a.reward}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section style={{ ...card, flex: 1 }}>
                    <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "700", color: "#111" }}>🔒 미달성 업적</p>
                    <p style={{ margin: "0 0 14px", fontSize: "11px", color: "#aaa" }}>{locked.length}개 남음</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, overflowY: "auto" }}>
                        {locked.map(a => (
                            <div key={a.key} style={{ background: "#fafafa", borderRadius: "14px", padding: "12px 16px", border: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: "12px", opacity: 0.6 }}>
                                <span style={{ fontSize: "24px" }}>🔒</span>
                                <div>
                                    <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: "700", color: "#555" }}>{a.name}</p>
                                    <p style={{ margin: 0, fontSize: "11px", color: "#bbb" }}>{a.desc}</p>
                                </div>
                                <span style={{ marginLeft: "auto", fontSize: "11px", color: "#bbb", fontWeight: "700", whiteSpace: "nowrap" }}>🌱 {a.reward}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        )
    }

    const card = {
        background: "white", borderRadius: "24px", padding: "20px 24px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0",
        display: "flex", flexDirection: "column", overflow: "hidden"
    }

    const toastColors = {
        success: { bg: "#2ecc71", border: "#27ae60" },
        error: { bg: "#e74c3c", border: "#c0392b" },
        info: { bg: "#54a0ff", border: "#2e86de" },
        achievement: { bg: "#f9ca24", border: "#f0932b" }
    }

    return (
        <div style={{
            display: "flex", height: "100vh", width: "100vw",
            fontFamily: "'GriounPolice', cursive",
            backgroundImage: `linear-gradient(#e0e0e0 1px, transparent 1px), linear-gradient(90deg, #e0e0e0 1px, transparent 1px)`,
            backgroundSize: "28px 28px", backgroundColor: "#f5f5f5",
            overflow: "hidden", boxSizing: "border-box"
        }}>

            {/* 토스트 */}
            {toast && (
                <div style={{
                    position: "fixed", top: "80px", right: "24px", zIndex: 9999,
                    background: toastColors[toast.type]?.bg || "#333",
                    border: `1px solid ${toastColors[toast.type]?.border || "#555"}`,
                    color: "white", borderRadius: "14px", padding: "12px 20px",
                    fontSize: "13px", fontWeight: "700", fontFamily: "'GriounPolice', cursive",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)", maxWidth: "300px",
                    animation: "slideIn 0.3s ease"
                }}>
                    {toast.msg}
                </div>
            )}

            {/* 모달 */}
            {modalConfig.isOpen && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div style={{ background: "white", borderRadius: "20px", padding: "24px", width: "320px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", border: "1px solid #ffd9e2" }}>
                        <span style={{ fontSize: "36px", display: "block", marginBottom: "12px" }}>🐷</span>
                        <p style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: "600", color: "#333", whiteSpace: "pre-line" }}>{modalConfig.message}</p>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                            {modalConfig.type === "confirm" ? (
                                <>
                                    <button onClick={() => setModalConfig({ isOpen: false })} style={{ flex: 1, padding: "10px", background: "#eee", border: "none", borderRadius: "10px", fontSize: "13px", cursor: "pointer", fontWeight: "600", color: "#555", fontFamily: "inherit" }}>취소</button>
                                    <button onClick={modalConfig.onConfirm} style={{ flex: 1, padding: "10px", background: "#F4A7B9", border: "none", borderRadius: "10px", fontSize: "13px", cursor: "pointer", fontWeight: "600", color: "white", fontFamily: "inherit" }}>확인</button>
                                </>
                            ) : (
                                <button onClick={() => setModalConfig({ isOpen: false })} style={{ width: "120px", padding: "10px", background: "#F4A7B9", border: "none", borderRadius: "10px", fontSize: "13px", cursor: "pointer", fontWeight: "600", color: "white", fontFamily: "inherit" }}>확인</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 헤더 */}
            <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "64px", background: "white", borderBottom: "1px solid #eee", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", boxSizing: "border-box" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={onHome}>
                    <span style={{ fontSize: "28px" }}>🐷</span>
                    <span style={{ fontSize: "22px", fontWeight: "700", color: "#F4A7B9" }}>MOA</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f5f5f5", borderRadius: "20px", padding: "6px 12px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#F4A7B9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "white" }}>{nickname[0]}</div>
                    <span style={{ fontSize: "13px", color: "#333", fontWeight: "600" }}>{nickname}</span>
                </div>
            </div>

            {/* 사이드바 */}
            <div style={{ position: "fixed", top: "64px", left: 0, width: "72px", height: "calc(100vh - 64px)", background: "white", borderRight: "1px solid #eee", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0", gap: "12px", zIndex: 100 }}>
                {navItems.map(item => (
                    <div key={item.key} onClick={item.onClick} style={{ width: "48px", height: "48px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", cursor: "pointer", background: current === item.key ? "#fff0f3" : "transparent", border: current === item.key ? "1.5px solid #F4A7B9" : "1.5px solid transparent", transition: "all 0.2s" }}>
                        {item.icon}
                    </div>
                ))}
            </div>

            {/* 메인 */}
            <div style={{ marginLeft: "72px", marginTop: "64px", width: "calc(100vw - 72px)", height: "calc(100vh - 64px)", padding: "24px 32px", boxSizing: "border-box", display: "flex", flexDirection: "column", overflow: "hidden" }}>

                {/* 타이틀 + 탭 */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "24px" }}>🎮</span>
                        <span style={{ fontSize: "20px", fontWeight: "700", color: "#333" }}>캐릭터 키우기</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                        {[
                            { key: "home", label: "🏠 거실" },
                            { key: "quest", label: "📋 퀘스트" },
                            { key: "shop", label: "🛒 상점" },
                            { key: "achievement", label: "🏆 업적" },
                        ].map(tab => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                                padding: "8px 16px", borderRadius: "20px", border: "none", cursor: "pointer",
                                fontSize: "12px", fontWeight: "700", fontFamily: "inherit",
                                background: activeTab === tab.key ? "#F4A7B9" : "#f0f0f0",
                                color: activeTab === tab.key ? "white" : "#666",
                                transition: "all 0.2s"
                            }}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        <span style={{ fontSize: "48px" }}>🐷</span>
                        <p style={{ color: "#aaa", fontSize: "15px", marginTop: "16px" }}>불러오는 중...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === "home" && renderHome()}
                        {activeTab === "quest" && renderQuest()}
                        {activeTab === "shop" && renderShop()}
                        {activeTab === "achievement" && renderAchievement()}
                    </>
                )}
            </div>
        </div>
    )
}

export default GamePage