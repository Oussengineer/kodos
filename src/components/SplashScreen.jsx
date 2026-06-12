import { useState, useEffect, useRef } from "react";

const SPLASH_KEY = "kodos_splash_shown";

function getSplashState() {
  try {
    return sessionStorage.getItem(SPLASH_KEY) ? "done" : "splash";
  } catch {
    return "splash";
  }
}

export default function SplashScreen({ children }) {
  const [phase, setPhase] = useState(getSplashState);
  const [fade, setFade] = useState(false);
  const videoRef = useRef(null);

  const finish = () => {
    setFade(true);
    setTimeout(() => {
      try { sessionStorage.setItem(SPLASH_KEY, "1"); } catch {}
      setPhase("done");
    }, 500);
  };

  useEffect(() => {
    if (phase !== "splash") return;
    const timer = setTimeout(finish, 3500);
    return () => clearTimeout(timer);
  }, [phase]);

  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    finish();
  };

  return (
    <>
      {phase !== "done" && (
        <div
          onClick={handleSkip}
          style={{
            position: "fixed", inset: 0, zIndex: 99999,
            background: "#000",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: fade ? 0 : 1,
            transition: "opacity 0.5s",
          }}
        >
          <video
            ref={videoRef}
            autoPlay muted playsInline
            onEnded={finish}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          >
            <source src="/splash.mp4" type="video/mp4" />
          </video>
        </div>
      )}
      {children}
    </>
  );
}
