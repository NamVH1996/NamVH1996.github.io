import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import AlertList from './pages/AlertList'
import AlertDetail from './pages/AlertDetail'
import AlertCreate from './pages/AlertCreate'
import Dashboard from './pages/Dashboard'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="alerts" element={<AlertList />} />
          <Route path="alerts/create" element={<AlertCreate />} />
          <Route path="alerts/:id" element={<AlertDetail />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
