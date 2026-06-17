import { useState } from "react"
import LoginPage from "./pages/LoginPage"
import MainPage from "./pages/MainPage"
import AddSpendPage from "./pages/AddSpendPage"
import SignupPage from "./pages/SignupPage"
import HistoryPage from "./pages/HistoryPage"
import AnalysisPage from "./pages/AnalysisPage"
import WishlistPage from "./pages/WishlistPage"
import CharacterPage from "./pages/CharacterPage"
import ChatPage from "./pages/ChatPage"
import ProfilePage from "./pages/ProfilePage"
import GamePage from "./pages/GamePage"

function App() {
    const [page, setPage] = useState("login")
    const [prevPage, setPrevPage] = useState("main")
    const [userId, setUserId] = useState(null)

    const handleLogin = () => {
        setUserId(localStorage.getItem("user_id"))
        setPage("main")
    }

    const handleLogout = () => {
        localStorage.clear()
        setUserId(null)
        setPage("login")
    }

    const goTo = (p) => {
        setPrevPage(page)
        setPage(p)
    }

    const nav = {
        onHome: () => goTo("main"),
        onHistory: () => goTo("history"),
        onAnalysis: () => goTo("analysis"),
        onWishlist: () => goTo("wishlist"),
        onChat: () => goTo("chat"),
        onProfile: () => goTo("profile"),
        onGame: () => goTo("game"),
        onLogout: handleLogout,
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
                <MainPage {...nav} onAddSpend={() => goTo("addSpend")} userId={userId} current="main" onLogout={handleLogout} onProfile={() => goTo("profile")} />
            )}
            {page === "addSpend" && (
                <AddSpendPage {...nav} onBack={() => setPage(prevPage)} current="main" />
            )}
            {page === "history" && (
                <HistoryPage {...nav} onAddSpend={() => goTo("addSpend")} current="history" />
            )}
            {page === "analysis" && (
                <AnalysisPage {...nav} current="analysis" />
            )}
            {page === "wishlist" && (
                <WishlistPage {...nav} current="wishlist" />
            )}
            {page === "chat" && (
                <ChatPage {...nav} onCharacter={() => goTo("character")} current="chat" />
            )}
            {page === "character" && (
                <CharacterPage {...nav} onBack={() => setPage("chat")} current="chat" />
            )}
            {page === "profile" && (
                <ProfilePage {...nav} onBack={() => setPage(prevPage)} onLogout={handleLogout} current="profile" />
            )}
            {page === "game" && (
                <GamePage {...nav} current="game" />
            )}
        </>
    )
}

export default App