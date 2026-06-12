import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DriverLayout from "./components/DriverLayout";
import DriverLogin from "./pages/DriverLogin";
import DriverDashboard from "./pages/DriverDashboard";
import DriverActiveDelivery from "./pages/DriverActiveDelivery";
import DriverHistory from "./pages/DriverHistory";
import SplashScreen from "./components/SplashScreen";
import PermissionGate from "./components/PermissionGate";

const basename = window.Capacitor ? "" : (import.meta.env.PROD ? "/driver" : "");

export default function AppDriver() {
  return (
    <SplashScreen>
      <BrowserRouter basename={basename}>
        <PermissionGate>
        <Routes>
          <Route path="/login" element={<DriverLogin />} />
          <Route element={<DriverLayout />}>
            <Route path="/" element={<DriverDashboard />} />
            <Route path="/active" element={<DriverActiveDelivery />} />
            <Route path="/history" element={<DriverHistory />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        </PermissionGate>
      </BrowserRouter>
    </SplashScreen>
  );
}
