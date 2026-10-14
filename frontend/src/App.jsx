import { BrowserRouter, Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import Home from "./pages/Home"
import Tools from "./pages/Tools"
import Documentation from "./pages/Documentation"
import SensorDashboard from "./pages/SensorDashboard"

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-gray-100">
        <Header />
        <main>
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/tools"     element={<Tools />} />
            <Route path="/docs"      element={<Documentation />} />
            <Route path="/dashboard" element={<SensorDashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
