import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import RestaurantDetail from "./pages/RestaurantDetail";
import Grocery from "./pages/Grocery";
import SplashScreen from "./components/SplashScreen";
import PermissionGate from "./components/PermissionGate";

const basename = window.Capacitor ? "" : "/customer";

export default function AppCustomer() {
  return (
    <SplashScreen>
      <BrowserRouter basename={basename}>
        <PermissionGate>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/restaurant/:id" element={<RestaurantDetail />} />
            <Route path="/grocery/:id" element={<Grocery />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        </PermissionGate>
      </BrowserRouter>
    </SplashScreen>
  );
}
