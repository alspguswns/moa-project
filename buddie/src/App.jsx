import { useState } from "react"
import LoginPage from "./pages/LoginPage"
import MainPage from "./pages/MainPage"
import AddSpendPage from "./pages/AddSpendPage"
import SignupPage from "./pages/SignupPage"

function App() {
    const [page, setPage] = useState("login")

    return (
        <>
            {page === "login" && (
                <LoginPage
                    onLogin={() => setPage("main")}
                    onSignup={() => setPage("signup")}
                />
            )}
            {page === "signup" && (
                <SignupPage
                    onSignup={() => setPage("main")}
                    onBack={() => setPage("login")}
                />
            )}
            {page === "main" && <MainPage onAddSpend={() => setPage("addSpend")} />}
            {page === "addSpend" && <AddSpendPage onBack={() => setPage("main")} />}
        </>
    )
}

export default App