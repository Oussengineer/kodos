import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import AdminProducts from "./pages/admin/Products";
import AdminProductForm from "./pages/admin/ProductForm";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminRestaurants from "./pages/admin/Restaurants";
import SplashScreen from "./components/SplashScreen";

export default function AppAdmin() {
  return (
    <SplashScreen>
      <BrowserRouter basename="/admin">
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route element={<AdminLayout />}>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/orders" element={<AdminOrders />} />
            <Route path="/products" element={<AdminProducts />} />
            <Route path="/products/new" element={<AdminProductForm />} />
            <Route path="/products/edit/:id" element={<AdminProductForm />} />
            <Route path="/restaurants" element={<AdminRestaurants />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SplashScreen>
  );
}
