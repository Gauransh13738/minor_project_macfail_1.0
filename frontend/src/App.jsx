import { BrowserRouter, Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import Banner from "./components/Banner"
import Home from "./pages/Home"
import Tools from "./pages/Tools"
import Docs from "./pages/Docs"

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-white">
        <Header />
        <Banner />

        <main className="max-w-7xl mx-auto p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/docs" element={<Docs />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App

