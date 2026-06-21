import { useState, useEffect } from "react"
import { API } from "../config.js"
import MobileBottomNav from "../components/MobileBottomNav"

function ProfilePage({ onHome, onHistory, onAnalysis, onWishlist, onChat, onProfile, onBack, onGame, onShop, onFriends, onLogout, current, isMobile }) {
    const [nickname, setNickname] = useState(localStorage.getItem("nickname") || "")
    const [bio, setBio] = useState(localStorage.getItem("bio") || "")
    const [profileImg, setProfileImg] = useState(localStorage.getItem("profileImg") || "")
    const [currentPw, setCurrentPw] = useState("")
    const [newPw, setNewPw] = useState("")
    const [confirmPw, setConfirmPw] = useState("")
    const [saved, setSaved] = useState(false)
    const [pwMsg, setPwMsg] = useState("")
    const [deleteModal, setDeleteModal] = useState(false)

    const navItems = [
        { key: "main", icon: "🏠", onClick: onHome },
        { key: "history", icon: "📋", onClick: onHistory },
        { key: "analysis", icon: "📊", onClick: onAnalysis },
        { key: "wishlist", icon: "🛍️", onClick: onWishlist },
        { key: "chat", icon: "💬", onClick: onChat },
        { key: "game", icon: "🎮", onClick: onGame },
        { key: "shop", icon: "🎨", onClick: onShop },
        { key: "friends", icon: "👥", onClick: onFriends },
        { key: "logout", icon: "🚪", onClick: onLogout },
    ]

    const handleSaveProfile = () => {
        localStorage.setItem("nickname", nickname)
        localStorage.setItem("bio", bio)
        localStorage.setItem("profileImg", profileImg)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    const handleChangePw = async () => {
        if (!currentPw || !newPw || !confirmPw) { setPwMsg("모든 항목을 입력해줘요!"); return }
        if (newPw !== confirmPw) { setPwMsg("새 비밀번호가 일치하지 않아요!"); return }

        const userId = localStorage.getItem("user_id")
        const token = localStorage.getItem("token")
        try {
            const res = await fetch(`${API}/auth/change-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ current_password: currentPw, new_password: newPw })
            })
            if (res.ok) {
                setPwMsg("비밀번호가 변경됐어요!")
                setCurrentPw(""); setNewPw(""); setConfirmPw("")
            } else {
                setPwMsg("현재 비밀번호가 틀렸어요!")
            }
        } catch {
            setPwMsg("서버 연결에 실패했어요!")
        }
    }

    return (
        <div style={{
            display: "flex", height: isMobile ? "auto" : "100vh", minHeight: "100vh", width: "100vw",
            fontFamily: "'Pretendard', -apple-system, 'GriounPolice', sans-serif",
            backgroundImage: `linear-gradient(var(--moa-grid) 1px, transparent 1px), linear-gradient(90deg, var(--moa-grid) 1px, transparent 1px)`,
            backgroundSize: "28px 28px", backgroundColor: "var(--moa-bg)",
            overflow: isMobile ? "auto" : "hidden", boxSizing: "border-box"
        }}>

            {/* 삭제 확인 모달 */}
            {deleteModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div style={{ background: "var(--moa-bg-card)", borderRadius: "20px", padding: "28px", width: "320px", textAlign: "center", border: "1px solid var(--moa-border)" }}>
                        <span style={{ fontSize: "36px", display: "block", marginBottom: "12px" }}>🐷</span>
                        <p style={{ margin: "0 0 8px", fontSize: "15px", fontWeight: "700", color: "var(--moa-text)" }}>정말로 탈퇴할까요?</p>
                        <p style={{ margin: "0 0 20px", fontSize: "13px", color: "var(--moa-text-sub)" }}>모든 데이터가 삭제되고 복구할 수 없어요.</p>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button onClick={() => setDeleteModal(false)} style={{ flex: 1, padding: "10px", background: "#eee", border: "none", borderRadius: "10px", fontSize: "13px", cursor: "pointer", fontWeight: "600" }}>취소</button>
                            <button onClick={() => { localStorage.clear(); onLogout() }} style={{ flex: 1, padding: "10px", background: "#ff6b6b", border: "none", borderRadius: "10px", fontSize: "13px", cursor: "pointer", fontWeight: "600", color: "white" }}>탈퇴하기</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 상단 헤더 */}
            <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "64px", background: "var(--moa-bg-card)", borderBottom: "1px solid #eee", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", boxSizing: "border-box" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={onHome}>
                    <span style={{ fontSize: "28px" }}>🐷</span>
                    <span style={{ fontSize: "22px", fontWeight: "700", color: "var(--moa-primary)" }}>MOA</span>
                </div>
                <button onClick={onBack} style={{ background: "none", border: "none", fontSize: "14px", color: "var(--moa-text-sub)", cursor: "pointer" }}>← 돌아가기</button>
            </div>

            {/* 사이드바 - PC only */}
            {!isMobile && (
            <div style={{ position: "fixed", top: "64px", left: 0, width: "72px", height: "calc(100vh - 64px)", background: "var(--moa-bg-card)", borderRight: "1px solid #eee", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0", gap: "12px", zIndex: 100 }}>
                {navItems.map(item => (
                    <div key={item.key} onClick={item.onClick} style={{ width: "48px", height: "48px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", cursor: "pointer", background: current === item.key ? "var(--moa-light)" : "transparent", border: current === item.key ? "1.5px solid var(--moa-primary)" : "1.5px solid transparent" }}>
                        {item.icon}
                    </div>
                ))}
            </div>
            )}

            {/* 메인 콘텐츠 */}
            <div style={{ marginLeft: isMobile ? 0 : "72px", marginTop: "64px", width: isMobile ? "100%" : "calc(100vw - 72px)", height: isMobile ? "auto" : "calc(100vh - 64px)", padding: isMobile ? "16px" : "32px", paddingBottom: isMobile ? "80px" : "32px", boxSizing: "border-box", overflowY: isMobile ? "visible" : "auto" }}>
                <div style={{ maxWidth: "720px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

                    <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "var(--moa-text)" }}>👤 프로필 설정</h2>

                    {/* 프로필 정보 카드 */}
                    <section style={{ background: "var(--moa-bg-card)", borderRadius: "24px", padding: "28px", border: "1px solid #f0f0f0", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
                        <p style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: "700", color: "var(--moa-text)" }}>기본 정보</p>

                        {/* 프로필 사진 */}
                        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
                            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--moa-light)", border: "3px solid var(--moa-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", overflow: "hidden", flexShrink: 0 }}>
                                {profileImg ? <img src={profileImg} alt="프로필" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🐷"}
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: "12px", color: "var(--moa-text-sub)", display: "block", marginBottom: "6px" }}>프로필 사진 URL</label>
                                <input value={profileImg} onChange={e => setProfileImg(e.target.value)} placeholder="https://..." style={inputStyle} />
                            </div>
                        </div>

                        {/* 닉네임 */}
                        <div style={{ marginBottom: "14px" }}>
                            <label style={{ fontSize: "12px", color: "var(--moa-text-sub)", display: "block", marginBottom: "6px" }}>닉네임</label>
                            <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="닉네임을 입력해줘요" style={inputStyle} />
                        </div>

                        {/* 한 줄 소개 */}
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ fontSize: "12px", color: "var(--moa-text-sub)", display: "block", marginBottom: "6px" }}>한 줄 목표</label>
                            <input value={bio} onChange={e => setBio(e.target.value)} placeholder="예: 이번 달 10만원 절약하기!" style={inputStyle} />
                        </div>

                        <button onClick={handleSaveProfile} style={{ padding: "12px 28px", background: saved ? "#aaa" : "var(--moa-primary)", color: "white", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
                            {saved ? "저장됐어요 ✓" : "저장하기"}
                        </button>
                    </section>

                    {/* 비밀번호 변경 카드 */}
                    <section style={{ background: "var(--moa-bg-card)", borderRadius: "24px", padding: "28px", border: "1px solid #f0f0f0", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
                        <p style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: "700", color: "var(--moa-text)" }}>비밀번호 변경</p>

                        <div style={{ marginBottom: "12px" }}>
                            <label style={{ fontSize: "12px", color: "var(--moa-text-sub)", display: "block", marginBottom: "6px" }}>현재 비밀번호</label>
                            <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="현재 비밀번호" style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: "12px" }}>
                            <label style={{ fontSize: "12px", color: "var(--moa-text-sub)", display: "block", marginBottom: "6px" }}>새 비밀번호</label>
                            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="새 비밀번호" style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: "16px" }}>
                            <label style={{ fontSize: "12px", color: "var(--moa-text-sub)", display: "block", marginBottom: "6px" }}>새 비밀번호 확인</label>
                            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="새 비밀번호 확인" style={inputStyle} />
                        </div>

                        {pwMsg && <p style={{ margin: "0 0 12px", fontSize: "13px", color: pwMsg.includes("변경") ? "#7F77DD" : "#ff6b6b" }}>{pwMsg}</p>}

                        <button onClick={handleChangePw} style={{ padding: "12px 28px", background: "#7F77DD", color: "white", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
                            변경하기
                        </button>
                    </section>

                    {/* 계정 관리 카드 */}
                    <section style={{ background: "var(--moa-bg-card)", borderRadius: "24px", padding: "28px", border: "1px solid #f0f0f0", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
                        <p style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: "700", color: "var(--moa-text)" }}>계정 관리</p>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button onClick={onLogout} style={{ padding: "12px 28px", background: "#f5f5f5", color: "var(--moa-text)", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
                                🚪 로그아웃
                            </button>
                            <button onClick={() => setDeleteModal(true)} style={{ padding: "12px 28px", background: "none", color: "#ff6b6b", border: "1px solid #ffcdd2", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
                                회원탈퇴
                            </button>
                        </div>
                    </section>

                </div>
            </div>
            {isMobile && <MobileBottomNav navItems={navItems} current={current} />}
        </div>
    )
}

const inputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: "10px",
    border: "1px solid #eee", fontSize: "14px", boxSizing: "border-box",
    outline: "none", color: "var(--moa-text)", background: "var(--moa-bg-card)"
}

export default ProfilePage