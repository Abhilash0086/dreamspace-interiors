import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './LandingPage'
import StudioDashboard from './studio/StudioDashboard'
import QuoteForm from './studio/QuoteForm'
import QuotePrint from './studio/QuotePrint'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/studio" element={<StudioDashboard />} />
        <Route path="/studio/:id" element={<QuoteForm />} />
        <Route path="/studio/:id/print" element={<QuotePrint />} />
      </Routes>
    </BrowserRouter>
  )
}
