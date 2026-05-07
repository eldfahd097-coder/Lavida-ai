import { Routes, Route } from 'react-router'
import Dashboard from './pages/Dashboard'
import LeadsPage from './pages/LeadsPage'
import CallsPage from './pages/CallsPage'
import MessagesPage from './pages/MessagesPage'
import SettingsPage from './pages/SettingsPage'
import Login from "./pages/Login"
import ChatPage from "./pages/ChatPage"
import NotFound from "./pages/NotFound"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/leads" element={<LeadsPage />} />
      <Route path="/calls" element={<CallsPage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
