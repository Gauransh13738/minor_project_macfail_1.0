import { Link } from "react-router-dom"
import { useState } from "react"

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-gray-900 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Left: Logo + Site Name */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-red-600 flex items-center justify-center font-bold text-white rounded">
            AI
          </div>
          <span className="text-xl font-semibold text-white">
            INDUSTRA AI
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8 text-gray-300">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <Link to="/tools" className="hover:text-white transition">Tools</Link>
          <Link to="/docs" className="hover:text-white transition">Documentation</Link>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-gray-300"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-700 px-6 py-4 space-y-4">
          <Link to="/" className="block text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/tools" className="block text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>Tools</Link>
          <Link to="/docs" className="block text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>Documentation</Link>
        </div>
      )}
    </header>
  )
}

export default Header


