import { useState } from "react"
import LoginPage from "./pages/LoginPage"
import MainPage from "./pages/MainPage"
import AddSpendPage from "./pages/AddSpendPage"
import SignupPage from "./pages/SignupPage"
import HistoryPage from "./pages/HistoryPage"
import CalendarPage from "./pages/CalendarPage"
import AnalysisPage from "./pages/AnalysisPage"
import WishlistPage from "./pages/WishlistPage"
import CharacterPage from "./pages/CharacterPage"
import ChatPage from "./pages/ChatPage"

function App() {
    const [page, setPage] = useState("login")
    const [userId, setUserId] = useState(null)

    const handleLogin = () => {
        setUserId(localStorage.getItem("user_id"))
        setPage("main")
    }

    const nav = {
        onHome: () => setPage("main"),
        onHistory: () => setPage("history"),
        onCalendar: () => setPage("calendar"),
        onAnalysis: () => setPage("analysis"),
        onWishlist: () => setPage("wishlist"),
        onChat: () => setPage("chat"),
    }

    const handleLogout = () => {
        localStorage.clear()
        setUserId(null)
        setPage("login")
    }

    return (
        <>
            {page === "login" && (
                <LoginPage onLogin={handleLogin} onSignup={() => setPage("signup")} />
            )}
            {page === "signup" && (
                <SignupPage
                    onSignup={() => {
                        setUserId(localStorage.getItem("user_id"))
                        setPage("main")
                    }}
                    onBack={() => setPage("login")}
                />
            )}
            {page === "main" && (
                <MainPage {...nav} onAddSpend={() => setPage("addSpend")} userId={userId} current="main" onLogout={handleLogout} />
            )}
            {page === "addSpend" && (
                <AddSpendPage {...nav} onBack={() => setPage("main")} current="main" />
            )}
            {page === "history" && (
                <HistoryPage {...nav} onBack={() => setPage("main")} current="history" />
            )}
            {page === "calendar" && (
                <CalendarPage {...nav} onBack={() => setPage("main")} current="calendar" />
            )}
            {page === "analysis" && (
                <AnalysisPage {...nav} onBack={() => setPage("main")} current="analysis" />
            )}
            {page === "wishlist" && (
                <WishlistPage {...nav} onBack={() => setPage("main")} current="wishlist" />
            )}
            {page === "chat" && (
                <ChatPage {...nav} onBack={() => setPage("main")} onCharacter={() => setPage("character")} current="chat" />
            )}
            {page === "character" && (
                <CharacterPage {...nav} onBack={() => setPage("chat")} current="chat" />
            )}
        </>
    )
}

export default App