import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logout } from '../../store/slices/authSlice'

const AdminLayout = () => {
  const dispatch = useAppDispatch()
  const { admin, isAuthenticated } = useAppSelector((state) => state.auth)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/admin/login', { replace: true })
  }

  const menuItems = [
    {
      path: '/admin/dashboard',
      name: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      path: '/admin/users',
      name: 'Users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      path: '/admin/categories',
      name: 'Categories',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    },
    {
      path: '/admin/banners',
      name: 'Banners',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      path: '/admin/prompts',
      name: 'Prompts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )
    },
    {
      path: '/admin/faces',
      name: 'Models',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      path: '/admin/payments',
      name: 'Payment History',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      path: '/admin/explorer',
      name: 'Explorer',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    }
  ]

  if (!isAuthenticated || !admin) return null

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 h-screen bg-gradient-to-b from-gray-800/95 via-gray-800/90 to-gray-900/95 backdrop-blur-xl border-r border-gray-700/50 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="h-full flex flex-col relative">
          {/* Gradient Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
          
          {/* Logo */}
          <div className="h-20 flex items-center justify-center px-6 border-b border-gray-700/50 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/5 via-transparent to-[var(--color-primary)]/5"></div>
            <div className="relative z-10 w-full">
              <img src="https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/header-logo.png" alt="ProductSnap AI" className="w-full h-auto max-w-[160px] mx-auto" />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <div className="px-2 mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Navigation</p>
            </div>
            {menuItems.map((item) => {
              // Check if current path matches exactly or starts with the menu item path
              // This allows child routes (like /admin/users/edit/:id) to highlight parent menu items
              const isActive = location.pathname === item.path || 
                (location.pathname.startsWith(item.path + '/') && item.path !== '/admin/dashboard')
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'text-white shadow-lg shadow-[var(--color-primary)]/20'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {/* Active Background */}
                  {isActive && (
                    <>
                      <div className="absolute inset-0 bg-primary rounded-xl border border-[var(--color-primary)]/30"></div>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                    </>
                  )}
                  
                  {/* Hover Background */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-700/30 to-gray-700/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                  
                  {/* Icon */}
                  <div className={`relative z-10 mr-3 p-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-white text-primary'
                      : 'bg-gray-700/30 text-gray-400 group-hover:bg-gray-700/50 group-hover:text-white'
                  }`}>
                    <div className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`}>
                      {item.icon}
                    </div>
                  </div>
                  
                  {/* Label */}
                  <span className="relative z-10 flex-1">{item.name}</span>
                  
                  {/* Active Indicator Dot */}
                  {isActive && (
                    <div className="relative z-10 w-2 h-2 rounded-full bg-white animate-pulse"></div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-700/50 relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
            
            <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-gray-700/30 to-gray-800/30 backdrop-blur-sm border border-gray-700/50">
              <div className="flex items-center mb-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[var(--color-primary)]/20 border border-[var(--color-primary)]/30">
                    {admin.name?.[0] || admin.email[0].toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                </div>
                <div className="ml-3 flex-1 overflow-hidden">
                  <p className="text-sm font-semibold text-white truncate">{admin.name || 'Admin'}</p>
                  <p className="text-xs text-gray-400 truncate">{admin.email}</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="group w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-red-400 bg-red-400/10 rounded-xl border border-red-400/20 hover:bg-red-400/20 hover:border-red-400/30 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-[var(--color-primary)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <svg className="w-4 h-4 mr-2 relative z-10 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="relative z-10">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-72 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden bg-gradient-to-r from-gray-800/95 to-gray-800/90 backdrop-blur-xl border-b border-gray-700/50 flex items-center justify-between px-4 h-16 relative z-40">
          <img src="https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/header-logo.png" alt="ProductSnap AI" className="w-40 relative z-10" />
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="relative z-10 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 focus:outline-none transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 h-screen overflow-y-auto bg-gray-900 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default AdminLayout

