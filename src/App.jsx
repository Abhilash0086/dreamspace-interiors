import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PINScreen from './studio/PINScreen'
import StudioDashboard from './studio/StudioDashboard'
import QuoteForm from './studio/QuoteForm'
import QuotePrint from './studio/QuotePrint'
import QuoteSummary from './studio/QuoteSummary'
import Masters from './studio/Masters'
import COPView from './studio/COPView'
import { isAuthenticated } from './lib/auth'

function Guard({ children }) {
  return isAuthenticated() ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PINScreen />} />
        <Route path="/studio" element={<Guard><StudioDashboard /></Guard>} />
        <Route path="/studio/masters" element={<Guard><Masters /></Guard>} />
        <Route path="/studio/masters/cop" element={<Guard><COPView /></Guard>} />
        <Route path="/studio/:id/summary" element={<Guard><QuoteSummary /></Guard>} />
        <Route path="/studio/:id/print" element={<Guard><QuotePrint /></Guard>} />
        <Route path="/studio/:id" element={<Guard><QuoteForm /></Guard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
