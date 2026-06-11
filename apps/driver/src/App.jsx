import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DriverLayout from "./components/DriverLayout";
import DriverLogin from "./pages/DriverLogin";
import DriverDashboard from "./pages/DriverDashboard";
import DriverActiveDelivery from "./pages/DriverActiveDelivery";
import DriverHistory from "./pages/DriverHistory";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<DriverLogin />} />
        <Route element={<DriverLayout />}>
          <Route path="/" element={<DriverDashboard />} />
          <Route path="/driver" element={<DriverDashboard />} />
          <Route path="/driver/active" element={<DriverActiveDelivery />} />
          <Route path="/driver/history" element={<DriverHistory />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
