import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './LandingPage'
import StudioDashboard from './studio/StudioDashboard'
import QuoteForm from './studio/QuoteForm'
import QuotePrint from './studio/QuotePrint'
import QuoteSummary from './studio/QuoteSummary'
import Masters from './studio/Masters'
import COPView from './studio/COPView'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/studio" element={<StudioDashboard />} />
        <Route path="/studio/masters" element={<Masters />} />
        <Route path="/studio/masters/cop" element={<COPView />} />
        <Route path="/studio/:id/summary" element={<QuoteSummary />} />
        <Route path="/studio/:id/print" element={<QuotePrint />} />
        <Route path="/studio/:id" element={<QuoteForm />} />
      </Routes>
    </BrowserRouter>
  )
}
