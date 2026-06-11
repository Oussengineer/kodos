import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppCustomer from "./AppCustomer";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppCustomer />
  </StrictMode>
);
