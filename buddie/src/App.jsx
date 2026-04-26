import { useState } from "react"
import LoginPage from "./pages/LoginPage"
import MainPage from "./pages/MainPage"
import AddSpendPage from "./pages/AddSpendPage"

function App() {
    const [page, setPage] = useState("login")

    return (
        <>
            {page === "login" && <LoginPage onLogin={() => setPage("main")} />}
            {page === "main" && <MainPage onAddSpend={() => setPage("addSpend")} />}
            {page === "addSpend" && <AddSpendPage onBack={() => setPage("main")} />}
        </>
    )
}

export default App