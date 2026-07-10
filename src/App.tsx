import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import PublicLayout from './components/layout/PublicLayout'
import HomePage from './pages/public/HomePage'
import TripsPage from './pages/public/TripsPage'
import TripDetailPage from './pages/public/TripDetailPage'
import TripPrepPage from './pages/public/TripPrepPage'
import CalendarPage from './pages/public/CalendarPage'
import GalleryPage from './pages/public/GalleryPage'
import PricingPage from './pages/public/PricingPage'
import AboutPage from './pages/public/AboutPage'
import WaiverPage from './pages/public/WaiverPage'
import BookingPage from './pages/public/BookingPage'
import PinGatePage from './pages/app/PinGatePage'
import StaffDashboard from './pages/app/StaffDashboard'
import CashierPOS from './pages/app/CashierPOS'
import OwnerDashboard from './pages/app/OwnerDashboard'
import ExpenseEntryPage from './pages/app/ExpenseEntryPage'
import SystemCheckPage from './pages/app/SystemCheckPage'
import RequireStaffRole from './components/app/RequireStaffRole'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="trips" element={<TripsPage />} />
          <Route path="trips/:tripCode" element={<TripDetailPage />} />
          <Route path="trips/:tripCode/prep" element={<TripPrepPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="waiver" element={<WaiverPage />} />
          <Route path="booking" element={<BookingPage />} />
        </Route>

        <Route path="app" element={<PinGatePage />} />
        <Route
          path="app/staff"
          element={
            <RequireStaffRole allow={['MANAGER', 'GUIDE', 'OWNER']}>
              <StaffDashboard />
            </RequireStaffRole>
          }
        />
        <Route
          path="app/cashier"
          element={
            <RequireStaffRole allow={['CASHIER', 'OWNER']}>
              <CashierPOS />
            </RequireStaffRole>
          }
        />
        <Route
          path="app/owner"
          element={
            <RequireStaffRole allow={['OWNER']}>
              <OwnerDashboard />
            </RequireStaffRole>
          }
        />
        <Route
          path="app/expenses/new"
          element={
            <RequireStaffRole allow={['OWNER', 'MANAGER']}>
              <ExpenseEntryPage />
            </RequireStaffRole>
          }
        />

        <Route
          path="app/system-check"
          element={
            <RequireStaffRole allow={['OWNER', 'MANAGER', 'GUIDE', 'CASHIER']}>
              <SystemCheckPage />
            </RequireStaffRole>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
