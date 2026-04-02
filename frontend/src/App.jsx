import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Campaigns from './pages/Campaigns'
import UploadSurvey from './pages/UploadSurvey'
import Mentors from './pages/Mentors'
import Courses from './pages/Courses'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)' }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: 'auto' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/upload-survey" element={<UploadSurvey />} />
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/courses" element={<Courses />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}