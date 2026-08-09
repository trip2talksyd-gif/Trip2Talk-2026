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
import DiscoverPage from './pages/public/DiscoverPage'
import ExperiencePage from './pages/public/ExperiencePage'
import WaiverPage from './pages/public/WaiverPage'
import BookingPage from './pages/public/BookingPage'
import WaitlistPage from './pages/public/WaitlistPage'
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
import StaffWaiverAssistPage from './pages/app/StaffWaiverAssistPage'
import OwnerDashboard from './pages/app/OwnerDashboard'
import TripManagerPage from './pages/app/TripManagerPage'
import TaxSummaryPage from './pages/app/TaxSummaryPage'
import ExpenseEntryPage from './pages/app/ExpenseEntryPage'
import ReceiptPage from './pages/app/ReceiptPage'
import StaffPaymentsPage from './pages/app/StaffPaymentsPage'
import InstallmentIncomePage from './pages/app/InstallmentIncomePage'
import OutboundQueuePage from './pages/app/OutboundQueuePage'
import PhotosDeliveryPage from './pages/app/PhotosDeliveryPage'
import RecentLoginsPage from './pages/app/RecentLoginsPage'
import StaffPinAdminPage from './pages/app/StaffPinAdminPage'
import SystemCheckPage from './pages/app/SystemCheckPage'
import ConfirmationSummaryPage from './pages/public/ConfirmationSummaryPage'
import ContentReview from './pages/admin/ContentReview'
import QuickPost from './pages/admin/QuickPost'
import RequireStaffRole from './components/app/RequireStaffRole'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="discover" element={<DiscoverPage />} />
          <Route path="experience" element={<ExperiencePage />} />
          <Route path="trips" element={<TripsPage />} />
          <Route path="trips/:tripCode" element={<TripDetailPage />} />
          <Route path="trips/:tripCode/prep" element={<TripPrepPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="waiver" element={<WaiverPage />} />
          <Route path="booking" element={<BookingPage />} />
          <Route path="booking/confirmation" element={<ConfirmationSummaryPage />} />
          <Route path="waitlist" element={<WaitlistPage />} />
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
            <RequireStaffRole allow={['CASHIER', 'OWNER', 'MANAGER']}>
              <CashierPOS />
            </RequireStaffRole>
          }
        />
        <Route
          path="app/waiver-assist"
          element={
            <RequireStaffRole allow={['OWNER', 'MANAGER', 'GUIDE', 'CASHIER']}>
              <StaffWaiverAssistPage />
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
          path="app/trips"
          element={
            <RequireStaffRole allow={['OWNER', 'MANAGER']}>
              <TripManagerPage />
            </RequireStaffRole>
          }
        />
        <Route
          path="app/tax-summary"
          element={
            <RequireStaffRole allow={['OWNER', 'MANAGER']}>
              <TaxSummaryPage />
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
          path="app/receipt"
          element={
            <RequireStaffRole allow={['CASHIER', 'OWNER', 'MANAGER']}>
              <ReceiptPage />
            </RequireStaffRole>
          }
        />
        <Route
          path="app/payments"
          element={
            <RequireStaffRole allow={['CASHIER', 'OWNER', 'MANAGER']}>
              <StaffPaymentsPage />
            </RequireStaffRole>
          }
        />
        <Route
          path="app/income"
          element={
            <RequireStaffRole allow={['OWNER']}>
              <InstallmentIncomePage />
            </RequireStaffRole>
          }
        />
        <Route
          path="app/outbound"
          element={
            <RequireStaffRole allow={['OWNER', 'MANAGER', 'GUIDE', 'CASHIER']}>
              <OutboundQueuePage />
            </RequireStaffRole>
          }
        />
        <Route
          path="app/photos"
          element={
            <RequireStaffRole allow={['OWNER', 'MANAGER', 'GUIDE']}>
              <PhotosDeliveryPage />
            </RequireStaffRole>
          }
        />
        <Route
          path="app/logins"
          element={
            <RequireStaffRole allow={['OWNER']}>
              <RecentLoginsPage />
            </RequireStaffRole>
          }
        />
        <Route
          path="app/staff-pins"
          element={
            <RequireStaffRole allow={['OWNER']}>
              <StaffPinAdminPage />
            </RequireStaffRole>
          }
        />

        <Route
          path="app/content-review"
          element={
            <RequireStaffRole allow={['OWNER']}>
              <ContentReview />
            </RequireStaffRole>
          }
        />
        <Route
          path="admin/content-review"
          element={
            <RequireStaffRole allow={['OWNER']}>
              <ContentReview />
            </RequireStaffRole>
          }
        />
        <Route
          path="app/quick-post"
          element={
            <RequireStaffRole allow={['OWNER']}>
              <QuickPost />
            </RequireStaffRole>
          }
        />
        <Route
          path="admin/quick-post"
          element={
            <RequireStaffRole allow={['OWNER']}>
              <QuickPost />
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
