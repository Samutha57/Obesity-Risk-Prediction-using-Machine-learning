import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-emerald-600 text-white shadow'
      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
  }`

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <NavLink to="/" className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white text-xs shadow-md shadow-emerald-500/20">
            BMI
          </span>
          <span>Obesity Risk Predictor</span>
        </NavLink>
        <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/predict" className={linkClass}>
            Predict
          </NavLink>
          <NavLink to="/analysis" className={linkClass}>
            Analysis
          </NavLink>

          {user ? (
            <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-3 dark:border-slate-700">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </span>
              <span className="hidden text-xs font-semibold text-slate-700 dark:text-slate-300 md:inline">
                {user.name}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="ml-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500"
            >
              Sign In
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}
