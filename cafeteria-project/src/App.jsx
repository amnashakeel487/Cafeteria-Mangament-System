import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import AdminRoute from './components/AdminRoute';
import Dashboard from './pages/admin/Dashboard';
import Login from './pages/admin/Login';
import Students from './pages/admin/Students';
import Cafeterias from './pages/admin/Cafeterias';
import Orders from './pages/admin/Orders';
import Profile from './pages/admin/Profile';
import CafeteriaRoute from './components/CafeteriaRoute';
import CafeteriaLayout from './components/CafeteriaLayout';
import CafeteriaLogin from './pages/cafeteria/Login';
import CafeteriaDashboard from './pages/cafeteria/Dashboard';
import CafeteriaMenu from './pages/cafeteria/Menu';
import CafeteriaPayments from './pages/cafeteria/Payments';
import CafeteriaOrders from './pages/cafeteria/Orders';
import CafeteriaHistory from './pages/cafeteria/History';
import CafeteriaProfile from './pages/cafeteria/Profile';

// Student Imports
import StudentLogin from './pages/student/Login';
import StudentRegister from './pages/student/Register';
import StudentRoute from './components/StudentRoute';
import StudentLayout from './components/StudentLayout';
import StudentCafeterias from './pages/student/Cafeterias';
import MenuBrowsing from './pages/student/MenuBrowsing';
import CartCheckout from './pages/student/CartCheckout';
import OrderTracking from './pages/student/OrderTracking';
import OrderHistory from './pages/student/OrderHistory';
import StudentProfile from './pages/student/StudentProfile';

import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
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

        {/* Cafeteria Staff Routes */}
        <Route path="/cafeteria/login" element={<CafeteriaLogin />} />
        <Route element={<CafeteriaRoute />}>
          <Route element={<CafeteriaLayout />}>
            <Route path="/cafeteria/dashboard" element={<CafeteriaDashboard />} />
            <Route path="/cafeteria/orders" element={<CafeteriaOrders />} />
            <Route path="/cafeteria/history" element={<CafeteriaHistory />} />
            <Route path="/cafeteria/payments" element={<CafeteriaPayments />} />
            <Route path="/cafeteria/menu" element={<CafeteriaMenu />} />
            <Route path="/cafeteria/profile" element={<CafeteriaProfile />} />
          </Route>
        </Route>

        {/* Student Routes */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/register" element={<StudentRegister />} />
        <Route element={<StudentRoute />}>
          <Route element={<StudentLayout />}>
             <Route path="/student/cafeterias" element={<StudentCafeterias />} />
             <Route path="/student/menu/:cafeteriaId" element={<MenuBrowsing />} />
             <Route path="/student/cart" element={<CartCheckout />} />
             <Route path="/student/track" element={<OrderTracking />} />
             <Route path="/student/orders" element={<OrderHistory />} />
             <Route path="/student/profile" element={<StudentProfile />} />
             <Route path="/student/home" element={<Navigate to="/student/cafeterias" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
    </CartProvider>
  );
}

export default App;
