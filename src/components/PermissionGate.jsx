import { useState, useEffect } from "react";
import { requestNotifyPermission } from "../utils/notify";

const PERM_KEY = "kodos_permissions_granted";

function getPermissionState() {
  try {
    return localStorage.getItem(PERM_KEY) === "1";
  } catch {
    return false;
  }
}

export default function PermissionGate({ children }) {
  const [done, setDone] = useState(getPermissionState);
  const [step, setStep] = useState("idle");

  useEffect(() => {
    if (done) return;
    const timer = setTimeout(() => setStep("visible"), 1200);
    return () => clearTimeout(timer);
  }, [done]);

  const handleContinue = () => {
    setStep("requesting");
    requestNotifyPermission();
    localStorage.setItem(PERM_KEY, "1");
    setTimeout(() => setDone(true), 500);
  };

  if (done) return children;

  return (
    <>
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 99999,
          background: "#fff",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: 40, textAlign: "center",
          transition: "opacity 0.5s",
          opacity: step === "visible" || step === "requesting" ? 1 : 0,
        }}
      >
        <h2 style={{ margin: "0 0 12px", fontSize: 24, color: "#111" }}>
          Allow Permissions
        </h2>
        <p style={{ margin: "0 0 24px", fontSize: 15, color: "#555", lineHeight: 1.5, maxWidth: 300 }}>
          We need your permission to send you notifications
          about your order status and updates.
        </p>
        <button
          onClick={handleContinue}
          disabled={step === "requesting"}
          style={{
            background: step === "requesting" ? "#999" : "#111",
            color: "#fff", border: "none", borderRadius: 8,
            padding: "14px 48px", fontSize: 16, cursor: "pointer",
          }}
        >
          {step === "requesting" ? "Please allow..." : "Continue"}
        </button>
      </div>
      {children}
    </>
  );
}
