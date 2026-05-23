import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import StoryDetailsPage from './pages/StoryDetailsPage'
import StoryEditorPage from './pages/StoryEditorPage'
import ReadingPage from './pages/ReadingPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import BookmarksPage from './pages/BookmarksPage'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import ProtectedRoute from './components/ProtectedRoute'
import StoriesPage from './pages/StoriesPage'

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="min-h-screen text-gray-900 flex flex-col">
          <Navbar />
          <main className="flex-grow w-full">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/stories" element={<StoriesPage />} />
              <Route path="/stories/:id" element={<StoryDetailsPage />} />
              <Route path="/read/:chapterId" element={<ProtectedRoute><ReadingPage /></ProtectedRoute>} />
              <Route path="/write" element={<ProtectedRoute><StoryEditorPage /></ProtectedRoute>} />
              <Route path="/stories/:id/edit" element={<ProtectedRoute><StoryEditorPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/profile/:userId" element={<ProfilePage />} />
              <Route path="/bookmarks" element={<ProtectedRoute><BookmarksPage /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </NotificationProvider>
    </AuthProvider>
  )
}
