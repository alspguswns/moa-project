import { useState } from "react"
import LoginPage from "./pages/LoginPage"
import MainPage from "./pages/MainPage"
import AddSpendPage from "./pages/AddSpendPage"
import SignupPage from "./pages/SignupPage"
import HistoryPage from "./pages/HistoryPage"
import CalendarPage from "./pages/CalendarPage"

function App() {
    const [page, setPage] = useState("login")
    const [userId, setUserId] = useState(null)

    const handleLogin = () => {
        setUserId(localStorage.getItem("user_id"))
        setPage("main")
    }

    return (
        <>
            {page === "login" && (
                <LoginPage
                    onLogin={handleLogin}
                    onSignup={() => setPage("signup")}
                />
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
                <MainPage
                    onAddSpend={() => setPage("addSpend")}
                    onHistory={() => setPage("history")}
                    onCalendar={() => setPage("calendar")}
                    userId={userId}
                />
            )}
            {page === "addSpend" && <AddSpendPage onBack={() => setPage("main")} />}
            {page === "history" && <HistoryPage onBack={() => setPage("main")} />}
            {page === "calendar" && <CalendarPage onBack={() => setPage("main")} />}
        </>
    )
}

export default App