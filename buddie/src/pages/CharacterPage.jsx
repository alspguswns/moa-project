import { useState, useEffect, useRef } from "react"
import { API } from "../config.js"

function CharacterPage({ onBack, onHome, onHistory, onAnalysis, onWishlist, onChat, onLogout, onEditProfile, current }) {
    const userId = localStorage.getItem("user_id")
    const nickname = localStorage.getItem("nickname") || "사용자"
    const [name, setName] = useState("MOA")
    const [style, setStyle] = useState("친근하고 귀엽게")
    const [profileUrl, setProfileUrl] = useState("")
    const [systemPrompt, setSystemPrompt] = useState("")
    const [loading, setLoading] = useState(true)

    // 프로필 우측 드롭다운 팝오버 상태 및 DOM 참조용 ref
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)

    // 저장 알림 및 화면 이동을 위한 커스텀 모달 상태
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: "alert", // "confirm" | "alert"
        message: "",
        confirmLabel: "확인",
        cancelLabel: "취소",
        onConfirm: null,
        onCancel: null
    })

    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return
        }
        setLoading(true)
        fetch(`${API}/character/${userId}`)
            .then(res => res.json())
            .then(data => {
                setName(data.name || "MOA")
                setStyle(data.style || "친근하고 귀엽게")
                setProfileUrl(data.profile_url || "")
                setSystemPrompt(data.system_prompt || "")
                setLoading(false)
            })
            .catch(e => {
                console.error(e)
                setLoading(false)
            })
    }, [userId])

    // 은행/금융 앱처럼 드롭다운 메뉴 밖의 다른 영역 클릭 시 팝오버창이 자동으로 수축 차단되는 리스너 등록
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const handleSave = async () => {
        try {
            const res = await fetch(`${API}/character/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: parseInt(userId),
                    name: name.trim() || "MOA",
                    style,
                    profile_url: profileUrl.trim(),
                    system_prompt: systemPrompt.trim()
                })
            })

            if (res.ok) {
                setModalConfig({
                    isOpen: true,
                    type: "confirm",
                    message: `[${name}]의 성격 튜닝을 무사히 마쳤어요! 🎨✨\n지금 바로 피그톡으로 돌아가 대화를 나눠보시겠어요?`,
                    confirmLabel: "예, 대화할래요",
                    cancelLabel: "여기 더 있을래요",
                    onConfirm: () => {
                        setModalConfig(prev => ({ ...prev, isOpen: false }))
                        onBack()
                    },
                    onCancel: () => {
                        setModalConfig(prev => ({ ...prev, isOpen: false }))
                    }
                })
            } else {
                setModalConfig({
                    isOpen: true,
                    type: "alert",
                    message: "설정을 저장하지 못했습니다. 다시 한 번 시도해주세요."
                })
            }
        } catch (e) {
            console.error(e)
            setModalConfig({
                isOpen: true,
                type: "alert",
                message: "서버와 연결을 확인해주세요 😢"
            })
        }
    }

    // [청소 완료]: 기존 요구사항대로 사이드바 navItems에서 logout 항목을 영구 청소 삭제함!
    const navItems = [
        { key: "main", icon: "🏠", onClick: onHome },
        { key: "history", icon: "📋", onClick: onHistory },
        { key: "analysis", icon: "📊", onClick: onAnalysis },
        { key: "wishlist", icon: "🛍️", onClick: onWishlist },
        { key: "chat", icon: "💬", onClick: onChat },
    ]

    // 공통 사용 로그아웃 트리거 함수
    const triggerLogoutModal = () => {
        setIsDropdownOpen(false)
        setModalConfig({
            isOpen: true,
            type: "confirm",
            message: "정말로 로그아웃 하시겠습니까? 🐷",
            confirmLabel: "로그아웃",
            cancelLabel: "취소",
            onConfirm: () => {
                setModalConfig({ isOpen: false })
                onLogout()
            },
            onCancel: () => {
                setModalConfig({ isOpen: false })
            }
        })
    }

    return (
        <div style={{
            display: "flex",
            height: "100vh",
            width: "100vw",
            fontFamily: "'GriounPolice', cursive",
            backgroundImage: `linear-gradient(#e0e0e0 1px, transparent 1px), linear-gradient(90deg, #e0e0e0 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
            backgroundColor: "#f5f5f5",
            overflow: "hidden",
            boxSizing: "border-box"
        }}>

            {/* 커스텀 모달 */}
            {modalConfig.isOpen && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(0, 0, 0, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    backdropFilter: "blur(2px)"
                }}>
                    <div style={{
                        background: "white",
                        borderRadius: "20px",
                        padding: "24px",
                        width: "320px",
                        textAlign: "center",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                        border: "1px solid #ffd9e2"
                    }}>
                        <span style={{ fontSize: "36px", display: "block", marginBottom: "12px" }}>🐷</span>
                        <p style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: "600", color: "#333", lineHeight: "1.5", whiteSpace: "pre-line" }}>
                            {modalConfig.message}
                        </p>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                            {modalConfig.type === "confirm" ? (
                                <>
                                    <button
                                        onClick={() => {
                                            if (modalConfig.onCancel) modalConfig.onCancel();
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: "10px",
                                            background: "#eee",
                                            border: "none",
                                            borderRadius: "10px",
                                            fontSize: "13px",
                                            cursor: "pointer",
                                            fontWeight: "600",
                                            color: "#555",
                                            fontFamily: "inherit"
                                        }}
                                    >
                                        {modalConfig.cancelLabel || "취소"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (modalConfig.onConfirm) modalConfig.onConfirm();
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: "10px",
                                            background: "#F4A7B9",
                                            border: "none",
                                            borderRadius: "10px",
                                            fontSize: "13px",
                                            cursor: "pointer",
                                            fontWeight: "600",
                                            color: "white",
                                            fontFamily: "inherit"
                                        }}
                                    >
                                        {modalConfig.confirmLabel || "확인"}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => {
                                        setModalConfig({ isOpen: false });
                                        if (modalConfig.onConfirm) modalConfig.onConfirm();
                                    }}
                                    style={{
                                        width: "120px",
                                        padding: "10px",
                                        background: "#F4A7B9",
                                        border: "none",
                                        borderRadius: "10px",
                                        fontSize: "13px",
                                        cursor: "pointer",
                                        fontWeight: "600",
                                        color: "white",
                                        fontFamily: "inherit"
                                    }}
                                >
                                    확인
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 상단 GNB 바 (우측 프로필 드롭다운 팝오버 탑재) */}
            <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "64px",
                background: "white",
                borderBottom: "1px solid #eee",
                zIndex: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 32px",
                boxSizing: "border-box"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={onHome}>
                    <span style={{ fontSize: "28px" }}>🐷</span>
                    <span style={{ fontSize: "22px", fontWeight: "700", color: "#F4A7B9" }}>MOA</span>
                </div>

                {/* 우측 알림 및 컨텍스츄얼 프로필 영역 */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative" }} ref={dropdownRef}>
                    <span style={{ fontSize: "20px", cursor: "pointer" }}>🔔</span>

                    {/* 프로필 터치 클릭 버튼 캡슐 */}
                    <div
                        onClick={() => setIsOpen => setIsDropdownOpen(prev => !prev)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            background: isDropdownOpen ? "#fff0f3" : "#f5f5f5",
                            borderRadius: "20px",
                            padding: "6px 12px",
                            cursor: "pointer",
                            userSelect: "none",
                            border: isDropdownOpen ? "1px solid #ffd9e2" : "1px solid transparent",
                            transition: "all 0.2s"
                        }}
                    >
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#F4A7B9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "white" }}>
                            {nickname[0]}
                        </div>
                        <span style={{ fontSize: "13px", color: "#333", fontWeight: "600" }}>{nickname}</span>
                        <span style={{
                            fontSize: "11px",
                            color: "#aaa",
                            transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s",
                            display: "inline-block"
                        }}>
                            ▾
                        </span>
                    </div>

                    {/* ✨ 전문 드롭다운 메뉴 (Dropdown Menu 레이어 카드) */}
                    {isDropdownOpen && (
                        <div style={{
                            position: "absolute",
                            top: "52px",
                            right: 0,
                            width: "180px",
                            background: "white",
                            borderRadius: "14px",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                            border: "1px solid #f0f0f0",
                            padding: "6px 0",
                            zIndex: 250,
                            display: "flex",
                            flexDirection: "column",
                            animation: "fadeIn 0.15s ease"
                        }}>
                            {/* 메뉴 1: 프로필 수정 / 내정보 닉네임 변경 */}
                            <div
                                onClick={() => {
                                    setIsDropdownOpen(false);
                                    if(onEditProfile) onEditProfile();
                                    else alert("닉네임 변경 화면 연동 준비 중! (부모 액션 연결 필요)");
                                }}
                                style={{
                                    padding: "12px 16px",
                                    fontSize: "13px",
                                    color: "#444",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    transition: "background 0.15s"
                                }}
                                onMouseOver={e => e.currentTarget.style.background = "#fff0f3"}
                                onMouseOut={e => e.currentTarget.style.background = "transparent"}
                            >
                                <span>👤</span> 프로필 / 닉네임 수정
                            </div>

                            {/* 메뉴 구별 분할선 */}
                            <div style={{ height: "1px", background: "#f5f5f5", margin: "4px 0" }} />

                            {/* 메뉴 2: 로그아웃 (사이드바에서 완벽 수집 및 이동 완료) */}
                            <div
                                onClick={triggerLogoutModal}
                                style={{
                                    padding: "12px 16px",
                                    fontSize: "13px",
                                    color: "#ff6b6b", // 로그아웃 경고성 레드 핑크 포인트
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    transition: "background 0.15s"
                                }}
                                onMouseOver={e => e.currentTarget.style.background = "#fff0f3"}
                                onMouseOut={e => e.currentTarget.style.background = "transparent"}
                            >
                                <span>🚪</span> 로그아웃
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 좌측 LNB 사이드바 */}
            <div style={{
                position: "fixed",
                top: "64px",
                left: 0,
                width: "72px",
                height: "calc(100vh - 64px)",
                background: "white",
                borderRight: "1px solid #eee",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "24px 0",
                gap: "12px",
                zIndex: 100,
                boxSizing: "border-box"
            }}>
                {navItems.map(item => (
                    <div
                        key={item.key}
                        onClick={item.onClick}
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "22px",
                            cursor: "pointer",
                            background: current === item.key ? "#fff0f3" : "transparent",
                            border: current === item.key ? "1.5px solid #F4A7B9" : "1.5px solid transparent",
                            transition: "all 0.2s"
                        }}
                    >
                        {item.icon}
                    </div>
                ))}
            </div>

            {/* 메인 작업 영역 */}
            <div style={{
                marginLeft: "72px",
                marginTop: "64px",
                width: "calc(100vw - 72px)",
                height: "calc(100vh - 64px)",
                padding: "24px 32px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
            }}>

                {/* 헤더 */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexShrink: 0 }}>
                    <button
                        onClick={onBack}
                        style={{
                            background: "none",
                            border: "none",
                            fontSize: "24px",
                            cursor: "pointer",
                            marginRight: "4px",
                            color: "#888",
                            display: "flex",
                            alignItems: "center"
                        }}
                    >
                        ←
                    </button>
                    <span style={{ fontSize: "20px", fontWeight: "700", color: "#333" }}>AI 캐릭터 성격 설정</span>
                </div>

                {/* 2단 메인 레이아웃 (좌: 실시간 렌더 프로필, 우: 설정 변경 폼) */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1.4fr",
                    gap: "24px",
                    flex: 1,
                    minHeight: 0,
                    width: "100%",
                    boxSizing: "border-box"
                }}>

                    {/* LEFT COLUMN: 실시간 프로필 여권형 카드 */}
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        minHeight: 0
                    }}>
                        <div style={{
                            background: "white",
                            borderRadius: "24px",
                            padding: "32px 24px",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                            border: "1px solid #f0f0f0",
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center"
                        }}>
                            {loading ? (
                                <div style={{ fontSize: "14px", color: "#aaa" }}>동기화 로딩 중...</div>
                            ) : (
                                <>
                                    <div style={{
                                        width: "120px",
                                        height: "120px",
                                        borderRadius: "50%",
                                        background: "#fff0f3",
                                        border: "4px solid #F4A7B9",
                                        boxShadow: "0 8px 20px rgba(244,167,185,0.3)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "56px",
                                        marginBottom: "20px",
                                        overflow: "hidden"
                                    }}>
                                        {profileUrl ? (
                                            <img src={profileUrl} alt="프로필 사진" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : "🐷"}
                                    </div>

                                    <h3 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: "800", color: "#333" }}>
                                        {name || "MOA"}
                                    </h3>

                                    <div style={{
                                        background: "#fff0f3",
                                        border: "1px solid #ffd9e2",
                                        padding: "4px 14px",
                                        borderRadius: "100px",
                                        fontSize: "12px",
                                        color: "#F4A7B9",
                                        fontWeight: "700",
                                        marginBottom: "24px"
                                    }}>
                                        말투: {style}
                                    </div>

                                    <div style={{
                                        borderTop: "1.5px dashed #f0f0f0",
                                        width: "100%",
                                        paddingTop: "24px",
                                        textAlign: "left",
                                        paddingLeft: "12px",
                                        paddingRight: "12px"
                                    }}>
                                        <p style={{ margin: "0 0 8px", fontSize: "11px", color: "#aaa" }}>지정된 추가 성격 지침</p>
                                        <p style={{
                                            margin: 0,
                                            fontSize: "13px",
                                            color: systemPrompt ? "#555" : "#bbb",
                                            lineHeight: "1.6",
                                            fontStyle: systemPrompt ? "normal" : "italic"
                                        }}>
                                            {systemPrompt ? `"${systemPrompt}"` : "입력된 세부 지침이 아직 없습니다. 오른쪽 지침 상자를 기입해주세요!"}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: 설정 입력 폼 */}
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        minHeight: 0
                    }}>
                        <div style={{
                            background: "white",
                            borderRadius: "24px",
                            padding: "32px",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                            border: "1px solid #f0f0f0",
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            overflowY: "auto"
                        }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <p style={{ margin: "0 0 4px", fontSize: "14.5px", fontWeight: "700", color: "#333" }}>⚙️ 세부 세팅 튜닝하기</p>

                                <div>
                                    <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>AI 이름</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        style={inputStyle}
                                        placeholder="AI의 이름을 지어주세요 (예: 분홍이)"
                                    />
                                </div>

                                <div>
                                    <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>말투 스타일</label>
                                    <select
                                        value={style}
                                        onChange={e => setStyle(e.target.value)}
                                        style={inputStyle}
                                    >
                                        <option>친근하고 귀엽게</option>
                                        <option>차갑고 쿨하게</option>
                                        <option>다정하고 따뜻하게</option>
                                        <option>재밌고 유머있게</option>
                                        <option>진지하고 전문적으로</option>
                                        <option>츤데레하게</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>프로필 사진 이미지 URL</label>
                                    <input
                                        type="text"
                                        value={profileUrl}
                                        onChange={e => setProfileUrl(e.target.value)}
                                        style={inputStyle}
                                        placeholder="https://images.unsplash.com/... 처럼 이미지 링크를 넣어주세요"
                                    />
                                </div>

                                <div>
                                    <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>추가 프롬프트 성격 묘사 (선택)</label>
                                    <textarea
                                        value={systemPrompt}
                                        onChange={e => setSystemPrompt(e.target.value)}
                                        placeholder="AI의 특징이나 특별한 기믹을 지시해 보세요 (예: 항상 반말로 애교 넘치게 대답해줘, 가끔 돼지 소리 '꿀꿀'을 문장 끝에 붙여줘 등)"
                                        style={{
                                            ...inputStyle,
                                            height: "120px",
                                            resize: "none"
                                        }}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                style={{
                                    width: "100%",
                                    padding: "16px",
                                    borderRadius: "14px",
                                    background: "#F4A7B9",
                                    color: "white",
                                    border: "none",
                                    fontSize: "15px",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    boxShadow: "0 4px 12px rgba(244,167,185,0.3)",
                                    marginTop: "20px"
                                }}
                            >
                                튜닝 정보 저장하기 🐷
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "10px",
    border: "1px solid #eee",
    fontSize: "14px",
    boxSizing: "border-box",
    marginBottom: "4px",
    fontFamily: "inherit",
    outline: "none",
    background: "#fafafa",
    color: "#333",
    transition: "border-color 0.2s"
}

export default CharacterPage