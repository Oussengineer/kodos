import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import AdminProducts from "./pages/admin/Products";
import AdminProductForm from "./pages/admin/ProductForm";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminRestaurants from "./pages/admin/Restaurants";
import AdminRestaurantForm from "./pages/admin/RestaurantForm";
import RestaurantUserForm from "./pages/admin/RestaurantUserForm";
import DriverUserForm from "./pages/admin/DriverUserForm";
import RestaurantOrders from "./pages/admin/RestaurantOrders";
import { useAuthStore } from "./store/useAuthStore";
import SplashScreen from "./components/SplashScreen";
import PermissionGate from "./components/PermissionGate";

function AdminHome() {
  const user = useAuthStore((s) => s.user);
  if (user?.role === "restaurant") return <RestaurantOrders />;
  return <AdminDashboard />;
}

const basename = window.Capacitor ? "" : (import.meta.env.PROD ? "/admin" : "");

export default function AppAdmin() {
  return (
    <SplashScreen>
      <BrowserRouter basename={basename}>
        <PermissionGate>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route element={<AdminLayout />}>
            <Route path="/" element={<AdminHome />} />
            <Route path="/orders" element={<AdminOrders />} />
            <Route path="/products" element={<AdminProducts />} />
            <Route path="/products/new" element={<AdminProductForm />} />
            <Route path="/products/edit/:id" element={<AdminProductForm />} />
            <Route path="/restaurants" element={<AdminRestaurants />} />
            <Route path="/restaurants/new" element={<AdminRestaurantForm />} />
            <Route path="/restaurants/edit/:id" element={<AdminRestaurantForm />} />
            <Route path="/restaurants/account/new" element={<RestaurantUserForm />} />
            <Route path="/drivers/new" element={<DriverUserForm />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        </PermissionGate>
      </BrowserRouter>
    </SplashScreen>
  );
}
