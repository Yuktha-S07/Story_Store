import React, { useContext, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { applyTheme, getStoredTheme } from './utils/theme'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import StoriesPage from './pages/StoriesPage'
import StoryDetailsPage from './pages/StoryDetailsPage'
import ReadingPage from './pages/ReadingPage'
import StoryEditorPage from './pages/StoryEditorPage'
import EditStoryDetailsPage from './pages/EditStoryDetailsPage'
import StoryChaptersPage from './pages/StoryChaptersPage'
import ChapterEditorPage from './pages/ChapterEditorPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import EditProfilePage from './pages/EditProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import BookmarksPage from './pages/BookmarksPage'
import MessagesPage from './pages/MessagesPage'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { AuthProvider, AuthContext } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Shell />
      </NotificationProvider>
    </AuthProvider>
  )
}

function Shell() {
  const location = useLocation()
  const { token } = useContext(AuthContext)
  const isAuthRoute = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(location.pathname)

  useEffect(() => {
    // Logged-out visitors always see light mode; once authenticated we restore
    // the theme they previously chose.
    if (isAuthRoute || !token) {
      applyTheme('light')
    } else {
      applyTheme(getStoredTheme())
    }
  }, [isAuthRoute, token])

  return (
    <div className={`min-h-screen flex flex-col ${isAuthRoute ? 'bg-[#fbf8f2] text-[#26231f] [color-scheme:light]' : 'text-gray-900'}`}>
      <Navbar />
      <main className="flex-grow w-full max-w-[90rem] mx-auto pt-4 pb-6 md:pt-8 md:pb-12 px-3 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/stories/:id" element={<StoryDetailsPage />} />
          <Route path="/read/:chapterId" element={<ProtectedRoute><ReadingPage /></ProtectedRoute>} />
          <Route path="/write" element={<ProtectedRoute><StoryEditorPage /></ProtectedRoute>} />
          <Route path="/stories/:id/edit" element={<ProtectedRoute><EditStoryDetailsPage /></ProtectedRoute>} />
          <Route path="/stories/:id/chapters" element={<ProtectedRoute><StoryChaptersPage /></ProtectedRoute>} />
          <Route path="/stories/:id/chapters/new" element={<ProtectedRoute><ChapterEditorPage /></ProtectedRoute>} />
          <Route path="/stories/:id/chapters/:chapterId" element={<ProtectedRoute><ChapterEditorPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/settings/profile" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
          <Route path="/settings/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/bookmarks" element={<ProtectedRoute><BookmarksPage /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/messages/:userId" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
