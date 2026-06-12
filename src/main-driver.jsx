import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppDriver from "./AppDriver";
import "./index.css";
import "./i18n";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppDriver />
  </StrictMode>
);
