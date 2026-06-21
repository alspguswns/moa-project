import { useState, useEffect } from "react"
import { API } from "../config.js"
import MobileBottomNav from "../components/MobileBottomNav"

const CATEGORY_EMOJI = {
    "식비": "🍚", "교통": "🚌", "쇼핑": "🛍️", "문화": "🎬",
    "의료": "💊", "교육": "📚", "여가": "🎮", "기타": "📦"
}

function FriendsPage({ onHome, onHistory, onAnalysis, onWishlist, onChat, onGame, onShop, onFriends, onLogout, current, isMobile }) {
    const userId = parseInt(localStorage.getItem("user_id"))
    const [myCode, setMyCode] = useState("")
    const [friends, setFriends] = useState([])
    const [inputCode, setInputCode] = useState("")
    const [comparing, setComparing] = useState(null) // { me, friend, friendId, friendNickname }
    const [toast, setToast] = useState(null)
    const [loading, setLoading] = useState(false)
    const [modalConfig, setModalConfig] = useState({ isOpen: false, message: "", onConfirm: null })

    const navItems = [
        { key: "main",    icon: "🏠", onClick: onHome },
        { key: "history", icon: "📋", onClick: onHistory },
        { key: "analysis",icon: "📊", onClick: onAnalysis },
        { key: "wishlist",icon: "🛍️", onClick: onWishlist },
        { key: "chat",    icon: "💬", onClick: onChat },
        { key: "game",    icon: "🎮", onClick: onGame },
        { key: "shop",    icon: "🎨", onClick: onShop },
        { key: "friends", icon: "👥", onClick: onFriends },
        { key: "logout",  icon: "🚪", onClick: () => setModalConfig({
            isOpen: true, message: "정말로 로그아웃 하시겠습니까? 🐷",
            onConfirm: () => { setModalConfig({ isOpen: false }); onLogout() }
        })},
    ]

    const showToast = (msg, type = "success") => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 2500)
    }

    const loadData = async () => {
        if (!userId) return
        try {
            const [codeRes, listRes] = await Promise.all([
                fetch(`${API}/friends/my-code/${userId}`),
                fetch(`${API}/friends/list/${userId}`)
            ])
            const codeData = await codeRes.json()
            const listData = await listRes.json()
            setMyCode(codeData.invite_code || "")
            setFriends(Array.isArray(listData) ? listData : [])
        } catch { showToast("데이터를 불러오지 못했어요", "error") }
    }

    useEffect(() => { loadData() }, [userId])

    const handleAdd = async () => {
        if (!inputCode.trim()) return
        setLoading(true)
        try {
            const res = await fetch(`${API}/friends/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, invite_code: inputCode.trim() })
            })
            const data = await res.json()
            if (!res.ok) { showToast(data.detail || "추가 실패", "error"); return }
            showToast(data.message)
            setInputCode("")
            loadData()
        } catch { showToast("서버 오류가 발생했어요", "error") }
        finally { setLoading(false) }
    }

    const handleRemove = (friend) => {
        setModalConfig({
            isOpen: true,
            message: `${friend.nickname}님을 친구 목록에서 삭제할까요?`,
            onConfirm: async () => {
                setModalConfig({ isOpen: false })
                await fetch(`${API}/friends/${userId}/${friend.id}`, { method: "DELETE" })
                showToast(`${friend.nickname}님을 삭제했어요`)
                if (comparing?.friendId === friend.id) setComparing(null)
                loadData()
            }
        })
    }

    const handleCompare = async (friend) => {
        try {
            const res = await fetch(`${API}/friends/compare/${userId}/${friend.id}`)
            const data = await res.json()
            setComparing({ ...data, friendId: friend.id, friendNickname: friend.nickname })
        } catch { showToast("비교 데이터를 불러오지 못했어요", "error") }
    }

    const copyCode = () => {
        navigator.clipboard.writeText(myCode)
            .then(() => showToast("초대 코드를 복사했어요!"))
            .catch(() => showToast("복사에 실패했어요", "error"))
    }

    const stageEmoji = { "알": "🥚", "유체": "🐣", "아성체": "🐥", "성체": "🐷", "특수": "✨" }

    return (
        <div style={{
            display: "flex", height: isMobile ? "auto" : "100vh", minHeight: "100vh",
            width: "100vw", fontFamily: "'GriounPolice', cursive",
            backgroundImage: `linear-gradient(var(--moa-grid) 1px, transparent 1px), linear-gradient(90deg, var(--moa-grid) 1px, transparent 1px)`,
            backgroundSize: "28px 28px", backgroundColor: "var(--moa-bg)",
            overflow: isMobile ? "auto" : "hidden", boxSizing: "border-box"
        }}>

            {/* 모달 */}
            {modalConfig.isOpen && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(2px)" }}>
                    <div style={{ background: "var(--moa-bg-card)", borderRadius: "20px", padding: "24px", width: "320px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", border: "1px solid var(--moa-border)" }}>
                        <span style={{ fontSize: "36px", display: "block", marginBottom: "12px" }}>🐷</span>
                        <p style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: "600", color: "var(--moa-text)" }}>{modalConfig.message}</p>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button onClick={() => setModalConfig({ isOpen: false })} style={{ flex: 1, padding: "10px", background: "var(--moa-bg)", border: "none", borderRadius: "10px", fontSize: "13px", cursor: "pointer", fontWeight: "600", color: "var(--moa-text-sub)", fontFamily: "inherit" }}>취소</button>
                            <button onClick={modalConfig.onConfirm} style={{ flex: 1, padding: "10px", background: "var(--moa-primary)", border: "none", borderRadius: "10px", fontSize: "13px", cursor: "pointer", fontWeight: "600", color: "white", fontFamily: "inherit" }}>확인</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 토스트 */}
            {toast && (
                <div style={{ position: "fixed", bottom: isMobile ? "90px" : "32px", left: "50%", transform: "translateX(-50%)", background: toast.type === "error" ? "#ff6b6b" : "#333", color: "white", padding: "10px 20px", borderRadius: "100px", fontSize: "13px", fontWeight: "600", zIndex: 999, whiteSpace: "nowrap" }}>
                    {toast.msg}
                </div>
            )}

            {/* 상단 GNB */}
            <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "64px", background: "var(--moa-bg-card)", borderBottom: "1px solid var(--moa-divider)", zIndex: 200, display: "flex", alignItems: "center", padding: "0 32px", boxSizing: "border-box" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={onHome}>
                    <span style={{ fontSize: "28px" }}>🐷</span>
                    <span style={{ fontSize: "22px", fontWeight: "700", color: "var(--moa-primary)" }}>MOA</span>
                </div>
            </div>

            {/* 사이드바 (PC) */}
            {!isMobile && (
                <div style={{ position: "fixed", top: "64px", left: 0, width: "72px", height: "calc(100vh - 64px)", background: "var(--moa-bg-card)", borderRight: "1px solid var(--moa-divider)", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0", gap: "12px", zIndex: 100 }}>
                    {navItems.map(item => (
                        <div key={item.key} onClick={item.onClick} style={{ width: "48px", height: "48px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", cursor: "pointer", background: current === item.key ? "var(--moa-light)" : "transparent", border: current === item.key ? "1.5px solid var(--moa-primary)" : "1.5px solid transparent", transition: "all 0.2s" }}>
                            {item.icon}
                        </div>
                    ))}
                </div>
            )}

            {/* 메인 영역 */}
            <div style={{ marginLeft: isMobile ? 0 : "72px", marginTop: "64px", width: isMobile ? "100%" : "calc(100vw - 72px)", height: isMobile ? "auto" : "calc(100vh - 64px)", display: "flex", gap: "24px", padding: isMobile ? "20px 16px 100px" : "32px 40px", boxSizing: "border-box", overflowY: "auto", flexDirection: isMobile ? "column" : "row" }}>

                {/* 왼쪽: 코드 + 친구 목록 */}
                <div style={{ flex: "0 0 auto", width: isMobile ? "100%" : "320px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "var(--moa-text)" }}>👥 친구</h2>

                    {/* 내 초대 코드 */}
                    <div style={{ background: "var(--moa-bg-card)", borderRadius: "20px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid var(--moa-divider)" }}>
                        <p style={{ margin: "0 0 10px", fontSize: "12px", color: "var(--moa-text-sub)", fontWeight: "700" }}>내 초대 코드</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ flex: 1, background: "var(--moa-light)", borderRadius: "12px", padding: "12px 16px", fontSize: "22px", fontWeight: "800", letterSpacing: "6px", color: "var(--moa-primary)", textAlign: "center" }}>
                                {myCode || "로딩중..."}
                            </div>
                            <button onClick={copyCode} style={{ padding: "10px 14px", background: "var(--moa-primary)", color: "white", border: "none", borderRadius: "12px", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>복사</button>
                        </div>
                    </div>

                    {/* 친구 추가 */}
                    <div style={{ background: "var(--moa-bg-card)", borderRadius: "20px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid var(--moa-divider)" }}>
                        <p style={{ margin: "0 0 10px", fontSize: "12px", color: "var(--moa-text-sub)", fontWeight: "700" }}>친구 추가</p>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <input
                                value={inputCode}
                                onChange={e => setInputCode(e.target.value.toUpperCase())}
                                onKeyDown={e => e.key === "Enter" && handleAdd()}
                                placeholder="초대 코드 6자리"
                                maxLength={6}
                                style={{ flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1.5px solid var(--moa-border)", background: "var(--moa-bg)", color: "var(--moa-text)", fontSize: "14px", fontFamily: "inherit", outline: "none", letterSpacing: "3px" }}
                            />
                            <button onClick={handleAdd} disabled={loading || inputCode.length < 6} style={{ padding: "10px 16px", background: inputCode.length >= 6 ? "var(--moa-primary)" : "var(--moa-bg)", color: inputCode.length >= 6 ? "white" : "var(--moa-text-sub)", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: inputCode.length >= 6 ? "pointer" : "default", fontFamily: "inherit" }}>추가</button>
                        </div>
                    </div>

                    {/* 친구 목록 */}
                    <div style={{ background: "var(--moa-bg-card)", borderRadius: "20px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid var(--moa-divider)", flex: 1 }}>
                        <p style={{ margin: "0 0 14px", fontSize: "12px", color: "var(--moa-text-sub)", fontWeight: "700" }}>친구 목록 ({friends.length}명)</p>
                        {friends.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--moa-text-sub)", fontSize: "13px" }}>
                                <div style={{ fontSize: "40px", marginBottom: "8px" }}>👥</div>
                                아직 친구가 없어요!<br />초대 코드를 공유해 보세요
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {friends.map(f => (
                                    <div key={f.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "14px", background: comparing?.friendId === f.id ? "var(--moa-light)" : "var(--moa-bg)", border: comparing?.friendId === f.id ? "1.5px solid var(--moa-primary)" : "1.5px solid transparent", transition: "all 0.2s" }}>
                                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--moa-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0, overflow: "hidden", border: "1.5px solid var(--moa-border)" }}>
                                            {f.character_profile ? <img src={f.character_profile} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : stageEmoji[f.character_stage] || "🐷"}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--moa-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.nickname}</div>
                                            <div style={{ fontSize: "11px", color: "var(--moa-text-sub)" }}>{f.character_name} · {f.character_stage}</div>
                                        </div>
                                        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                                            <button onClick={() => handleCompare(f)} style={{ padding: "6px 10px", background: "var(--moa-primary)", color: "white", border: "none", borderRadius: "8px", fontSize: "11px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>비교</button>
                                            <button onClick={() => handleRemove(f)} style={{ padding: "6px 10px", background: "var(--moa-bg)", color: "var(--moa-text-sub)", border: "1px solid var(--moa-divider)", borderRadius: "8px", fontSize: "11px", cursor: "pointer", fontFamily: "inherit" }}>삭제</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 오른쪽: 비교 패널 */}
                {comparing ? (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "var(--moa-text)" }}>📊 {comparing.friendNickname}님과 비교</h3>
                            <button onClick={() => setComparing(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--moa-text-sub)" }}>✕</button>
                        </div>

                        {/* 캐릭터 비교 */}
                        <div style={{ background: "var(--moa-bg-card)", borderRadius: "20px", padding: "20px", border: "1px solid var(--moa-divider)" }}>
                            <p style={{ margin: "0 0 16px", fontSize: "12px", fontWeight: "700", color: "var(--moa-text-sub)" }}>🐷 캐릭터</p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "12px", alignItems: "center" }}>
                                {[comparing.me, comparing.friend].map((side, i) => (
                                    <>
                                        {i === 1 && <div style={{ textAlign: "center", color: "var(--moa-text-sub)", fontSize: "12px", fontWeight: "700" }}>VS</div>}
                                        <div key={i} style={{ textAlign: "center" }}>
                                            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "var(--moa-light)", border: "2px solid var(--moa-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", margin: "0 auto 8px", overflow: "hidden" }}>
                                                {side.character.profile_url ? <img src={side.character.profile_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : stageEmoji[side.character.stage] || "🐷"}
                                            </div>
                                            <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--moa-text)" }}>{side.nickname}</div>
                                            <div style={{ fontSize: "11px", color: "var(--moa-text-sub)", marginTop: "2px" }}>{side.character.name} · {side.character.stage}</div>
                                            <div style={{ fontSize: "11px", color: "var(--moa-primary)", fontWeight: "700", marginTop: "4px" }}>EXP {side.character.exp}</div>
                                        </div>
                                    </>
                                ))}
                            </div>
                        </div>

                        {/* 이번달 소비 비교 */}
                        <div style={{ background: "var(--moa-bg-card)", borderRadius: "20px", padding: "20px", border: "1px solid var(--moa-divider)" }}>
                            <p style={{ margin: "0 0 16px", fontSize: "12px", fontWeight: "700", color: "var(--moa-text-sub)" }}>💸 이번달 지출</p>
                            {[comparing.me, comparing.friend].map((side, i) => {
                                const max = Math.max(comparing.me.this_month_total, comparing.friend.this_month_total, 1)
                                const pct = Math.round((side.this_month_total / max) * 100)
                                return (
                                    <div key={i} style={{ marginBottom: i === 0 ? "12px" : 0 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                            <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--moa-text)" }}>{side.nickname}</span>
                                            <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--moa-primary)" }}>{side.this_month_total.toLocaleString()}원</span>
                                        </div>
                                        <div style={{ height: "10px", background: "var(--moa-bg)", borderRadius: "100px", overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: `${pct}%`, background: "var(--moa-primary)", borderRadius: "100px", transition: "width 0.5s" }} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* 카테고리 비교 */}
                        <div style={{ background: "var(--moa-bg-card)", borderRadius: "20px", padding: "20px", border: "1px solid var(--moa-divider)" }}>
                            <p style={{ margin: "0 0 16px", fontSize: "12px", fontWeight: "700", color: "var(--moa-text-sub)" }}>🗂️ 카테고리별 지출</p>
                            {(() => {
                                const allCats = [...new Set([...Object.keys(comparing.me.categories), ...Object.keys(comparing.friend.categories)])]
                                if (allCats.length === 0) return <p style={{ color: "var(--moa-text-sub)", fontSize: "13px", textAlign: "center" }}>이번달 지출 내역이 없어요</p>
                                return allCats.map(cat => {
                                    const myAmt = comparing.me.categories[cat] || 0
                                    const frAmt = comparing.friend.categories[cat] || 0
                                    const max = Math.max(myAmt, frAmt, 1)
                                    return (
                                        <div key={cat} style={{ marginBottom: "14px" }}>
                                            <div style={{ fontSize: "12px", color: "var(--moa-text)", fontWeight: "700", marginBottom: "6px" }}>{CATEGORY_EMOJI[cat] || "📦"} {cat}</div>
                                            {[{ label: comparing.me.nickname, amt: myAmt }, { label: comparing.friend.nickname, amt: frAmt }].map((row, i) => (
                                                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                                    <span style={{ fontSize: "11px", color: "var(--moa-text-sub)", width: "60px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>{row.label}</span>
                                                    <div style={{ flex: 1, height: "8px", background: "var(--moa-bg)", borderRadius: "100px", overflow: "hidden" }}>
                                                        <div style={{ height: "100%", width: `${Math.round((row.amt / max) * 100)}%`, background: i === 0 ? "var(--moa-primary)" : "#74b9ff", borderRadius: "100px" }} />
                                                    </div>
                                                    <span style={{ fontSize: "11px", color: "var(--moa-text-sub)", width: "60px", textAlign: "right", flexShrink: 0 }}>{row.amt.toLocaleString()}원</span>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                })
                            })()}
                        </div>

                        {/* 업적 / 씨앗 비교 */}
                        <div style={{ background: "var(--moa-bg-card)", borderRadius: "20px", padding: "20px", border: "1px solid var(--moa-divider)" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                {[
                                    { emoji: "🏆", label: "달성 업적", key: "achievements_count", suffix: "개" },
                                    { emoji: "🌱", label: "씨앗 보유", key: "seeds", suffix: "개" },
                                ].map(({ emoji, label, key, suffix }) => (
                                    <div key={key} style={{ background: "var(--moa-bg)", borderRadius: "14px", padding: "14px", textAlign: "center" }}>
                                        <div style={{ fontSize: "12px", color: "var(--moa-text-sub)", marginBottom: "8px" }}>{emoji} {label}</div>
                                        <div style={{ display: "flex", justifyContent: "space-around" }}>
                                            {[comparing.me, comparing.friend].map((side, i) => (
                                                <div key={i}>
                                                    <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--moa-primary)" }}>{side[key]}{suffix}</div>
                                                    <div style={{ fontSize: "10px", color: "var(--moa-text-sub)", marginTop: "2px" }}>{side.nickname}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    !isMobile && (
                        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px", color: "var(--moa-text-sub)" }}>
                            <span style={{ fontSize: "64px" }}>👥</span>
                            <p style={{ margin: 0, fontSize: "14px" }}>친구를 선택해 비교해 보세요</p>
                        </div>
                    )
                )}
            </div>

            {isMobile && <MobileBottomNav navItems={navItems} current={current} />}
        </div>
    )
}

export default FriendsPage
