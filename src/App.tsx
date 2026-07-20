import { BrowserRouter, Route, Routes } from 'react-router-dom'
import PublicLayout from './components/layout/PublicLayout'
import ScrollToTop from './components/layout/ScrollToTop'
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
import FavoritesPage from './pages/public/FavoritesPage'
import MyTripPage from './pages/public/MyTripPage'
import AccountPage from './pages/public/AccountPage'
import PhotoGuideHubPage from './pages/public/PhotoGuideHubPage'
import PosingGuidePage from './pages/public/PosingGuidePage'
import CameraGuidePage from './pages/public/CameraGuidePage'
import MobileGuidePage from './pages/public/MobileGuidePage'
import {
  CancellationPage,
  HelpSupportPage,
  NotFoundPage,
  NotificationsPage,
  PaymentMethodsPage,
  PrivacyPage,
  TermsPage,
  WriteReviewPage,
} from './pages/public/LegalSupportPages'
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
      <ScrollToTop />
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
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="my-trip" element={<MyTripPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="photo-guide" element={<PhotoGuideHubPage />} />
          <Route path="photo-guide/posing" element={<PosingGuidePage />} />
          <Route path="photo-guide/camera" element={<CameraGuidePage />} />
          <Route path="photo-guide/mobile" element={<MobileGuidePage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="cancellation" element={<CancellationPage />} />
          <Route path="payment-methods" element={<PaymentMethodsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="help" element={<HelpSupportPage />} />
          <Route path="review" element={<WriteReviewPage />} />
          <Route path="*" element={<NotFoundPage />} />
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
      </Routes>
    </BrowserRouter>
  )
}
