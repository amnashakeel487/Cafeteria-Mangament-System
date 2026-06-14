import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import AdminRoute from './components/AdminRoute';
import CafeteriaRoute from './components/CafeteriaRoute';
import CafeteriaLayout from './components/CafeteriaLayout';
import StudentRoute from './components/StudentRoute';
import StudentLayout from './components/StudentLayout';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import PWAUpdateNotification from './components/PWAUpdateNotification';
import PWAStart from './pages/PWAStart';
import PWAWelcome from './pages/PWAWelcome';
import PWAOnboarding from './pages/PWAOnboarding';

const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center bg-[#121222]">
    <span className="material-symbols-outlined animate-spin text-4xl text-[#FFB59D]">refresh</span>
  </div>
);

const LandingPage = lazy(() => import('./pages/LandingPage'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Students = lazy(() => import('./pages/admin/Students'));
const Cafeterias = lazy(() => import('./pages/admin/Cafeterias'));
const Orders = lazy(() => import('./pages/admin/Orders'));
const Profile = lazy(() => import('./pages/admin/Profile'));
const CafeteriaLogin = lazy(() => import('./pages/cafeteria/Login'));
const CafeteriaDashboard = lazy(() => import('./pages/cafeteria/Dashboard'));
const AnalyticsDashboard = lazy(() => import('./pages/cafeteria/AnalyticsDashboard'));
const CafeteriaMenu = lazy(() => import('./pages/cafeteria/Menu'));
const CafeteriaRatingsDashboard = lazy(() => import('./pages/cafeteria/RatingsDashboard'));
const CafeteriaDeals = lazy(() => import('./pages/cafeteria/Deals'));
const CafeteriaPayments = lazy(() => import('./pages/cafeteria/Payments'));
const CafeteriaOrders = lazy(() => import('./pages/cafeteria/Orders'));
const CafeteriaHistory = lazy(() => import('./pages/cafeteria/History'));
const CafeteriaProfile = lazy(() => import('./pages/cafeteria/Profile'));
const CafeteriaNotificationsPage = lazy(() => import('./pages/cafeteria/NotificationsPage'));
const StudentLogin = lazy(() => import('./pages/student/Login'));
const StudentRegister = lazy(() => import('./pages/student/Register'));
const PendingApproval = lazy(() => import('./pages/student/PendingApproval'));
const StudentCafeterias = lazy(() => import('./pages/student/Cafeterias'));
const MenuBrowsing = lazy(() => import('./pages/student/MenuBrowsing'));
const CartCheckout = lazy(() => import('./pages/student/CartCheckout'));
const OrderTracking = lazy(() => import('./pages/student/OrderTracking'));
const OrderHistory = lazy(() => import('./pages/student/OrderHistory'));
const FavoritesPage = lazy(() => import('./pages/student/FavoritesPage'));
const StudentProfile = lazy(() => import('./pages/student/StudentProfile'));
const StudentNotificationsPage = lazy(() => import('./pages/student/NotificationsPage'));
const SpecialsPage = lazy(() => import('./pages/SpecialsPage'));
const TodaysSpecialsPage = lazy(() => import('./pages/student/TodaysSpecialsPage'));
const DailySpecialsManager = lazy(() => import('./pages/cafeteria/DailySpecialsManager'));

function App() {
  return (
    <CartProvider>
      <FavoritesProvider>
        {/* PWA update toast — shown when a new version is deployed to Vercel */}
        <PWAUpdateNotification />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/specials" element={<SpecialsPage />} />
              <Route path="/admin/login" element={<Login />} />

              <Route path="/admin" element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="students" element={<Students />} />
                  <Route path="cafeterias" element={<Cafeterias />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
              </Route>

              <Route path="/cafeteria/login" element={<CafeteriaLogin />} />
              <Route element={<CafeteriaRoute />}>
                <Route element={<CafeteriaLayout />}>
                  <Route path="/cafeteria/dashboard" element={<CafeteriaDashboard />} />
                  <Route path="/cafeteria/analytics" element={<AnalyticsDashboard />} />
                  <Route path="/cafeteria/orders" element={<CafeteriaOrders />} />
                  <Route path="/cafeteria/history" element={<CafeteriaHistory />} />
                  <Route path="/cafeteria/payments" element={<CafeteriaPayments />} />
                  <Route path="/cafeteria/menu" element={<CafeteriaMenu />} />
                  <Route path="/cafeteria/ratings" element={<CafeteriaRatingsDashboard />} />
                  <Route path="/cafeteria/deals" element={<CafeteriaDeals />} />
                  <Route path="/cafeteria/profile" element={<CafeteriaProfile />} />
                  <Route path="/cafeteria/notifications" element={<CafeteriaNotificationsPage />} />
                  <Route path="/cafeteria/specials" element={<DailySpecialsManager />} />
                </Route>
              </Route>

              <Route path="/student/login" element={<StudentLogin />} />
              <Route path="/student/register" element={<StudentRegister />} />
              <Route path="/student/pending-approval" element={<PendingApproval />} />

              {/* PWA-only public routes — no auth guard */}
              <Route path="/pwa-start" element={<PWAStart />} />
              <Route path="/welcome" element={<PWAWelcome />} />
              <Route path="/pwa-onboarding" element={<PWAOnboarding />} />
              <Route element={<StudentRoute />}>
                <Route element={<StudentLayout />}>
                  <Route path="/student/cafeterias" element={<StudentCafeterias />} />
                  <Route path="/student/favorites" element={<FavoritesPage />} />
                  <Route path="/student/menu/:cafeteriaId" element={<MenuBrowsing />} />
                  <Route path="/student/cart" element={<CartCheckout />} />
                  <Route path="/student/track" element={<OrderTracking />} />
                  <Route path="/student/orders" element={<OrderHistory />} />
                  <Route path="/student/profile" element={<StudentProfile />} />
                  <Route path="/student/notifications" element={<StudentNotificationsPage />} />
                  <Route path="/student/specials" element={<TodaysSpecialsPage />} />
                  <Route path="/student/home" element={<Navigate to="/student/cafeterias" replace />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </FavoritesProvider>
    </CartProvider>
  );
}

export default App;
