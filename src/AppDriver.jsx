import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DriverLayout from "./components/DriverLayout";
import DriverLogin from "./pages/DriverLogin";
import DriverDashboard from "./pages/DriverDashboard";
import DriverActiveDelivery from "./pages/DriverActiveDelivery";
import DriverHistory from "./pages/DriverHistory";
import SplashScreen from "./components/SplashScreen";

const basename = window.Capacitor ? "" : "/driver";

export default function AppDriver() {
  return (
    <SplashScreen>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/login" element={<DriverLogin />} />
          <Route element={<DriverLayout />}>
            <Route path="/" element={<DriverDashboard />} />
            <Route path="/active" element={<DriverActiveDelivery />} />
            <Route path="/history" element={<DriverHistory />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SplashScreen>
  );
}
