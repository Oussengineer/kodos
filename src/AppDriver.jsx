import { BrowserRouter, Routes, Route } from "react-router-dom";
import DriverLayout from "./components/DriverLayout";
import DriverLogin from "./pages/DriverLogin";
import DriverDashboard from "./pages/DriverDashboard";
import DriverActiveDelivery from "./pages/DriverActiveDelivery";
import DriverHistory from "./pages/DriverHistory";

export default function AppDriver() {
  return (
    <BrowserRouter basename="/driver">
      <Routes>
        <Route path="/login" element={<DriverLogin />} />
        <Route element={<DriverLayout />}>
          <Route path="/" element={<DriverDashboard />} />
          <Route path="/active" element={<DriverActiveDelivery />} />
          <Route path="/history" element={<DriverHistory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
