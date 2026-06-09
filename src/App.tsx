// import { useState, useEffect, useRef } from 'react'
// import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom'
// import { Provider } from 'react-redux'
// import { gsap } from 'gsap'
// import { ScrollTrigger } from 'gsap/ScrollTrigger'
// import { ToastContainer } from 'react-toastify'
// import 'react-toastify/dist/ReactToastify.css'
// import Navbar from './components/Navbar'
// import Footer from './components/Footer'
// import Home from './components/Home'
// import AIImageGenerator from './components/AIImageGenerator'
// import MyGenerations from './components/MyGenerations'
// import Settings from './components/Settings'
// import AuthModal from './components/AuthModal'
// import AdminLogin from './components/admin/AdminLogin'
// import AdminLayout from './components/admin/AdminLayout'
// import AdminDashboard from './components/admin/AdminDashboard'
// import UserList from './components/admin/UserList'
// import EditUser from './components/admin/EditUser'
// import CategoryList from './components/admin/CategoryList'
// import AddCategory from './components/admin/AddCategory'
// import EditCategory from './components/admin/EditCategory'
// import BannerList from './components/admin/BannerList'
// import AddBanner from './components/admin/AddBanner'
// import EditBanner from './components/admin/EditBanner'
// import PromptList from './components/admin/PromptList'
// import AddPrompt from './components/admin/AddPrompt'
// import EditPrompt from './components/admin/EditPrompt'
// import FaceList from './components/admin/FaceList'
// import AddFace from './components/admin/AddFace'
// import EditFace from './components/admin/EditFace'
// import PaymentHistory from './components/admin/PaymentHistory'
// import ExplorerList from './components/admin/ExplorerList'
// import AddExplorer from './components/admin/AddExplorer'
// import Explore from './components/Explore'
// import TryOnMe from './components/TryOnMe'
// import TryOnProduct from './components/TryOnProduct.tsx'
// import SaaSLandingPage from './components/SaaSLandingPage'
// import NotFound from './components/NotFound'
// import PrivacyPolicy from './components/PrivacyPolicy'
// import ContactUs from './components/ContactUs'
// import ShippingPolicy from './components/ShippingPolicy'
// import TermsAndConditions from './components/TermsAndConditions'
// import CancellationsAndRefunds from './components/CancellationsAndRefunds'
// import PaymentResult from './components/PaymentResult'
// import ProtectedRoute from './components/ProtectedRoute'
// import ScrollToTop from './components/ScrollToTop'
// import { useSmoothScroll } from './hooks/useSmoothScroll'
// import { store } from './store/store'
// import type { User } from './services/api'
// import OpenStudio from "./components/openstudio/OpenStudio";
// import Avatar from "./components/openstudio/AvatarPage.tsx";
// import { trackPageView, setAnalyticsUserId, trackLogin } from './utils/analytics'
// import { setOneSignalUser, clearOneSignalUser } from './utils/onesignal'

// gsap.registerPlugin(ScrollTrigger)

// function App() {
//   const location = useLocation()
//   const navigate = useNavigate()
//   const isAdminRoute = location.pathname.startsWith('/admin')
//   const isAppRoute = location.pathname === '/app'
//   const isGalleryRoute = location.pathname === '/gallery'
//   const isSettingsRoute = location.pathname === '/settings'
//   const isTryOnMeRoute = location.pathname === '/try-on-me'
//     const isOpenStudioRoute = location.pathname === "/openstudio";
//   const isTryOnProductRoute = location.pathname === '/try-on-product'
//   const [showAuthModal, setShowAuthModal] = useState(false)
//   const [isAuthenticated, setIsAuthenticated] = useState(false)
//   const [user, setUser] = useState<User | null>(null)
//   const [authChecked, setAuthChecked] = useState(false)
//   const loginSuccessRef = useRef(false)

//   // Initialize smooth scroll for non-admin routes
//   useSmoothScroll()

//   // Load auth state from localStorage on mount
//   useEffect(() => {
//     const savedUser = localStorage.getItem('user')
//     if (savedUser) {
//       try {
//         const userData = JSON.parse(savedUser)
//         // Map picture to avatar if avatar doesn't exist
//         if (userData.picture && !userData.avatar) {
//           userData.avatar = userData.picture
//         }
//         setUser(userData)
//         setIsAuthenticated(true)
//         loginSuccessRef.current = true
//         // Set OneSignal user if already logged in
//         if (userData.email) {
//           setOneSignalUser(userData.email).catch(console.error)
//         }
//       } catch (error) {
//         // Invalid data, clear it
//         localStorage.removeItem('user')
//       }
//     }
//     // Mark auth as checked after loading from localStorage
//     setAuthChecked(true)
//   }, [])

//   // Track page views with Firebase Analytics
//   useEffect(() => {
//     const pageTitle = document.title || location.pathname
//     trackPageView(location.pathname + location.search, pageTitle)
//   }, [location])

//   // Set user ID for analytics when authenticated
//   useEffect(() => {
//     if (isAuthenticated && user?.id) {
//       setAnalyticsUserId(user.id.toString())
//     }
//   }, [isAuthenticated, user])

//   // Close modal when authentication state changes to true
//   useEffect(() => {
//     if (isAuthenticated && showAuthModal) {
//       setShowAuthModal(false)
//     }
//   }, [isAuthenticated, showAuthModal])

//   const handleLoginSuccess = async (userData: User, loginMethod?: string) => {
//     // Map picture to avatar if avatar doesn't exist
//     const userWithAvatar = {
//       ...userData,
//       avatar: userData.avatar || userData.picture
//     }
//     // Save user to localStorage and state
//     localStorage.setItem('user', JSON.stringify(userWithAvatar))
//     setUser(userWithAvatar)
//     setIsAuthenticated(true)
//     loginSuccessRef.current = true
//     // Track login event
//     if (loginMethod) {
//       trackLogin(loginMethod)
//     }
    
//     // Set OneSignal user email and tag
//     if (userData.email) {
//       setOneSignalUser(userData.email).catch(console.error)
//     }
    
//     // Close modal immediately
//     setShowAuthModal(false)
    
//     // If user is already on a try-on page, stay there; otherwise go to /app
//     if (!location.pathname.startsWith('/try-on')) {
//       navigate('/app')
//     }
//   }

//   const handleLogout = async () => {
//     localStorage.removeItem('user')
//     setIsAuthenticated(false)
//     setUser(null)
//     // Clear OneSignal user data
//     clearOneSignalUser().catch(console.error)
//   }

//   return (
//     <Provider store={store}>
//       <div className="min-h-screen flex flex-col">
//         {!isAdminRoute &&
//           !isAppRoute &&
//           !isGalleryRoute &&
//           !isSettingsRoute &&
//           !isTryOnMeRoute &&
//           !isTryOnProductRoute &&
//           !isOpenStudioRoute && (
//             <Navbar
//               isAuthenticated={isAuthenticated}
//               user={user}
//               onLogoutClick={handleLogout}
//             />
//           )}
//         <ScrollToTop />
//         <Routes>
//           <Route
//             path="/"
//             element={<Home onLoginClick={() => setShowAuthModal(true)} />}
//           />
//           <Route
//             path="/openstudio"
//             element={
//               <OpenStudio
//                 isAuthenticated={isAuthenticated}
//                 user={user}
//                 onLoginClick={() => setShowAuthModal(true)}
//               />
//             }
//           />
//           <Route path="/avatar" element={<Avatar />} />
//           <Route path="/saas" element={<SaaSLandingPage />} />
//           <Route
//             path="/app"
//             element={
//               <ProtectedRoute
//                 isAuthenticated={isAuthenticated}
//                 authChecked={authChecked}
//                 onLoginRequired={() => setShowAuthModal(true)}
//               >
//                 <AIImageGenerator />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/settings"
//             element={
//               <ProtectedRoute
//                 isAuthenticated={isAuthenticated}
//                 authChecked={authChecked}
//                 onLoginRequired={() => setShowAuthModal(true)}
//               >
//                 <Settings />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/gallery"
//             element={
//               <ProtectedRoute
//                 isAuthenticated={isAuthenticated}
//                 authChecked={authChecked}
//                 onLoginRequired={() => setShowAuthModal(true)}
//               >
//                 <MyGenerations />
//               </ProtectedRoute>
//             }
//           />
//           <Route path="/admin/login" element={<AdminLogin />} />

//           {/* Admin Routes */}
//           <Route path="/admin" element={<AdminLayout />}>
//             <Route index element={<Navigate to="dashboard" replace />} />
//             <Route path="dashboard" element={<AdminDashboard />} />
//             <Route path="users" element={<UserList />} />
//             <Route path="users/edit/:userId" element={<EditUser />} />
//             <Route path="categories" element={<CategoryList />} />
//             <Route path="categories/add" element={<AddCategory />} />
//             <Route
//               path="categories/edit/:categoryId"
//               element={<EditCategory />}
//             />
//             <Route path="banners" element={<BannerList />} />
//             <Route path="banners/add" element={<AddBanner />} />
//             <Route path="banners/edit/:bannerId" element={<EditBanner />} />
//             <Route path="prompts" element={<PromptList />} />
//             <Route path="prompts/add" element={<AddPrompt />} />
//             <Route path="prompts/edit/:promptId" element={<EditPrompt />} />
//             <Route path="faces" element={<FaceList />} />
//             <Route path="faces/add" element={<AddFace />} />
//             <Route path="faces/edit/:faceId" element={<EditFace />} />
//             <Route path="payments" element={<PaymentHistory />} />
//             <Route path="explorer" element={<ExplorerList />} />
//             <Route path="explorer/add" element={<AddExplorer />} />
//           </Route>

//           <Route path="/privacy-policy" element={<PrivacyPolicy />} />
//           <Route path="/contact-us" element={<ContactUs />} />
//           <Route path="/shipping-policy" element={<ShippingPolicy />} />
//           <Route
//             path="/terms-and-conditions"
//             element={<TermsAndConditions />}
//           />
//           <Route
//             path="/cancellations-and-refunds"
//             element={<CancellationsAndRefunds />}
//           />
//           <Route path="/explore" element={<Explore />} />
//           <Route
//             path="/try-on-me"
//             element={
//               <ProtectedRoute
//                 isAuthenticated={isAuthenticated}
//                 authChecked={authChecked}
//                 onLoginRequired={() => setShowAuthModal(true)}
//               >
//                 <TryOnMe />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/try-on-product"
//             element={
//               <ProtectedRoute
//                 isAuthenticated={isAuthenticated}
//                 authChecked={authChecked}
//                 onLoginRequired={() => setShowAuthModal(true)}
//               >
//                 <TryOnProduct />
//               </ProtectedRoute>
//             }
//           />
//           <Route path="/payment-result" element={<PaymentResult />} />
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//         {!isAdminRoute &&
//           !isAppRoute &&
//           !isGalleryRoute &&
//           !isSettingsRoute &&
//           !isTryOnMeRoute &&
//           !isTryOnProductRoute && <Footer />}
//         {showAuthModal && (
//           <AuthModal
//             onClose={() => setShowAuthModal(false)}
//             onSuccess={handleLoginSuccess}
//           />
//         )}
//         <ToastContainer
//           position="top-right"
//           autoClose={3000}
//           hideProgressBar={false}
//           newestOnTop={false}
//           closeOnClick
//           rtl={false}
//           pauseOnFocusLoss
//           draggable
//           pauseOnHover
//           theme="dark"
//         />
//       </div>
//     </Provider>
//   );
// }

// export default App

import { useState, useEffect, useRef } from 'react'
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './components/Home'
import AIImageGenerator from './components/AIImageGenerator'
import MyGenerations from './components/MyGenerations'
import Settings from './components/Settings'
import AuthModal from './components/AuthModal'
import AdminLogin from './components/admin/AdminLogin'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './components/admin/AdminDashboard'
import UserList from './components/admin/UserList'
import EditUser from './components/admin/EditUser'
import CategoryList from './components/admin/CategoryList'
import AddCategory from './components/admin/AddCategory'
import EditCategory from './components/admin/EditCategory'
import BannerList from './components/admin/BannerList'
import AddBanner from './components/admin/AddBanner'
import EditBanner from './components/admin/EditBanner'
import PromptList from './components/admin/PromptList'
import AddPrompt from './components/admin/AddPrompt'
import EditPrompt from './components/admin/EditPrompt'
import FaceList from './components/admin/FaceList'
import AddFace from './components/admin/AddFace'
import EditFace from './components/admin/EditFace'
import PaymentHistory from './components/admin/PaymentHistory'
import ExplorerList from './components/admin/ExplorerList'
import AddExplorer from './components/admin/AddExplorer'
import Explore from './components/Explore'
import TryOnMe from './components/TryOnMe'
import TryOnProduct from './components/TryOnProduct.tsx'
import SaaSLandingPage from './components/SaaSLandingPage'
import OpenStudio from './components/openstudio/OpenStudio'
import Avatar from './components/openstudio/AvatarPage.tsx'
import NotFound from './components/NotFound'
import PrivacyPolicy from './components/PrivacyPolicy'
import ContactUs from './components/ContactUs'
import ShippingPolicy from './components/ShippingPolicy'
import TermsAndConditions from './components/TermsAndConditions'
import CancellationsAndRefunds from './components/CancellationsAndRefunds'
import PaymentResult from './components/PaymentResult'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { store } from './store/store'
import type { User } from './services/api'
import { trackPageView, setAnalyticsUserId, trackLogin } from './utils/analytics'
import { setOneSignalUser, clearOneSignalUser } from './utils/onesignal'

gsap.registerPlugin(ScrollTrigger)

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isAppRoute = location.pathname === '/app'
  const isGalleryRoute = location.pathname === '/gallery'
  const isSettingsRoute = location.pathname === '/settings'
  const isTryOnMeRoute = location.pathname === '/try-on-me'
  const isTryOnProductRoute = location.pathname === '/try-on-product'
  const isOpenStudioRoute = location.pathname === '/openstudio'
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const loginSuccessRef = useRef(false)

  // Initialize smooth scroll for non-admin routes
  useSmoothScroll()

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        // Map picture to avatar if avatar doesn't exist
        if (userData.picture && !userData.avatar) {
          userData.avatar = userData.picture
        }
        setUser(userData)
        setIsAuthenticated(true)
        loginSuccessRef.current = true
        // Set OneSignal user if already logged in
        if (userData.email) {
          setOneSignalUser(userData.email).catch(console.error)
        }
      } catch (error) {
        // Invalid data, clear it
        localStorage.removeItem('user')
      }
    }
    // Mark auth as checked after loading from localStorage
    setAuthChecked(true)
  }, [])

  // Track page views with Firebase Analytics
  useEffect(() => {
    const pageTitle = document.title || location.pathname
    trackPageView(location.pathname + location.search, pageTitle)
  }, [location])

  // Set user ID for analytics when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      setAnalyticsUserId(user.id.toString())
    }
  }, [isAuthenticated, user])

  // Close modal when authentication state changes to true
  useEffect(() => {
    if (isAuthenticated && showAuthModal) {
      setShowAuthModal(false)
    }
  }, [isAuthenticated, showAuthModal])

  const handleLoginSuccess = async (userData: User, loginMethod?: string) => {
    // Map picture to avatar if avatar doesn't exist
    const userWithAvatar = {
      ...userData,
      avatar: userData.avatar || userData.picture
    }
    // Save user to localStorage and state
    localStorage.setItem('user', JSON.stringify(userWithAvatar))
    setUser(userWithAvatar)
    setIsAuthenticated(true)
    loginSuccessRef.current = true
    // Track login event
    if (loginMethod) {
      trackLogin(loginMethod)
    }
    
    // Set OneSignal user email and tag
    if (userData.email) {
      setOneSignalUser(userData.email).catch(console.error)
    }
    
    // Close modal immediately
    setShowAuthModal(false)
    
    // If user is already on a try-on page, stay there; otherwise go to /app
    if (!location.pathname.startsWith('/try-on')) {
      navigate('/app')
    }
  }

  const handleLogout = async () => {
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
    // Clear OneSignal user data
    clearOneSignalUser().catch(console.error)
  }

  return (
    <Provider store={store}>
      <div className="min-h-screen flex flex-col">
        {!isAdminRoute && !isAppRoute && !isGalleryRoute && !isSettingsRoute && !isTryOnMeRoute && !isTryOnProductRoute && !isOpenStudioRoute && (
          <Navbar
            isAuthenticated={isAuthenticated}
            user={user}
            onLogoutClick={handleLogout}
          />
        )}
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home onLoginClick={() => setShowAuthModal(true)}/>} />
          <Route path="/saas" element={<SaaSLandingPage />} />
          <Route path="/openstudio" element={<OpenStudio isAuthenticated={isAuthenticated} user={user} onLoginClick={() => setShowAuthModal(true)} />} />
          <Route path="/avatar" element={<Avatar />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                authChecked={authChecked}
                onLoginRequired={() => setShowAuthModal(true)}
              >
                <AIImageGenerator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                authChecked={authChecked}
                onLoginRequired={() => setShowAuthModal(true)}
              >
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gallery"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                authChecked={authChecked}
                onLoginRequired={() => setShowAuthModal(true)}
              >
                <MyGenerations />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserList />} />
            <Route path="users/edit/:userId" element={<EditUser />} />
            <Route path="categories" element={<CategoryList />} />
            <Route path="categories/add" element={<AddCategory />} />
            <Route path="categories/edit/:categoryId" element={<EditCategory />} />
            <Route path="banners" element={<BannerList />} />
            <Route path="banners/add" element={<AddBanner />} />
            <Route path="banners/edit/:bannerId" element={<EditBanner />} />
            <Route path="prompts" element={<PromptList />} />
            <Route path="prompts/add" element={<AddPrompt />} />
            <Route path="prompts/edit/:promptId" element={<EditPrompt />} />
            <Route path="faces" element={<FaceList />} />
            <Route path="faces/add" element={<AddFace />} />
            <Route path="faces/edit/:faceId" element={<EditFace />} />
            <Route path="payments" element={<PaymentHistory />} />
            <Route path="explorer" element={<ExplorerList />} />
            <Route path="explorer/add" element={<AddExplorer />} />
          </Route>

          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/cancellations-and-refunds" element={<CancellationsAndRefunds />} />
          <Route path="/explore" element={<Explore />} />
          <Route
            path="/try-on-me"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                authChecked={authChecked}
                onLoginRequired={() => setShowAuthModal(true)}
              >
                <TryOnMe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/try-on-product"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                authChecked={authChecked}
                onLoginRequired={() => setShowAuthModal(true)}
              >
                <TryOnProduct />
              </ProtectedRoute>
            }
          />
          <Route path="/payment-result" element={<PaymentResult />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        {!isAdminRoute && !isAppRoute && !isGalleryRoute && !isSettingsRoute && !isTryOnMeRoute && !isTryOnProductRoute && !isOpenStudioRoute && <Footer />}
        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onSuccess={handleLoginSuccess}
          />
        )}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </div>
    </Provider>
  )
}

export default App;