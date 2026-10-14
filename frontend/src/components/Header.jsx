import { Link, NavLink } from "react-router-dom"

const LINKS = [
  { to: "/",          label: "Home",      end: true },
  { to: "/tools",     label: "Tools"      },
  { to: "/dashboard", label: "Dashboard"  },
  { to: "/docs",      label: "Docs"       },
]

// The mark is a reading on a track, crossing a limit: the same picture the diagnosis page draws.
function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#102235" />
      <path d="M6 22h20" stroke="#284664" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 22h11" stroke="#5BD1F5" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 9v14" stroke="#F6B73C" strokeWidth="2" strokeLinecap="round" />
      <circle cx="17" cy="22" r="3" fill="#E8EEF4" />
    </svg>
  )
}

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-800 bg-gray-950/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5 rounded-md" aria-label="Industra AI home">
          <Mark />
          <span className="hidden text-lg font-semibold tracking-tight text-gray-50 sm:inline">Industra AI</span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1">
          {LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-gray-800 text-gray-50" : "text-gray-400 hover:text-gray-100"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
