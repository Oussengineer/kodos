import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppAdmin from "./AppAdmin";
import "./index.css";
import "./i18n";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppAdmin />
  </StrictMode>
);
