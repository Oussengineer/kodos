import { PushNotifications } from "@capacitor/push-notifications";
import client from "../api/client";

function isCapacitor() {
  return typeof window !== "undefined" && window.Capacitor?.isNativePlatform();
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

async function subscribeWebPush(swReg) {
  try {
    const resp = await client.get("/push/vapid-key");
    const { publicKey } = resp.data;
    if (!publicKey) return null;
    let sub = await swReg.pushManager.getSubscription();
    if (sub) return sub;
    sub = await swReg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
    return sub;
  } catch {
    return null;
  }
}

async function subscribeCapacitor() {
  try {
    let perm = await PushNotifications.requestPermissions();
    if (perm.receive !== "granted") return null;
    return new Promise((resolve) => {
      PushNotifications.register();
      PushNotifications.addListener("registration", (token) => {
        resolve(token.value);
      });
      PushNotifications.addListener("registrationError", () => resolve(null));
      setTimeout(() => resolve(null), 10000);
    });
  } catch {
    return null;
  }
}

export async function setupPushNotifications() {
  try {
    if (isCapacitor()) {
      const token = await subscribeCapacitor();
      if (token) {
        await client.post("/push/subscribe", {
          endpoint: token,
          keys: {},
          platform: "fcm",
        });
      }
    } else if ("serviceWorker" in navigator && "PushManager" in window) {
      const appPath = window.location.pathname.split("/").filter(Boolean)[0] || "";
      const scope = appPath ? `/${appPath}/push-scope/` : "/push-scope/";
      const swUrl = appPath ? `/${appPath}/push-sw.js` : "/push-sw.js";

      const existing = await navigator.serviceWorker.getRegistration(scope);
      if (existing) {
        const sub = await subscribeWebPush(existing);
        if (sub) {
          await client.post("/push/subscribe", {
            endpoint: sub.endpoint,
            keys: { p256dh: arrayBufferToBase64(sub.getKey("p256dh")), auth: arrayBufferToBase64(sub.getKey("auth")) },
            platform: "web",
          });
        }
        return;
      }

      const swReg = await navigator.serviceWorker.register(swUrl, { scope });
      const sub = await subscribeWebPush(swReg);
      if (sub) {
        await client.post("/push/subscribe", {
          endpoint: sub.endpoint,
          keys: { p256dh: arrayBufferToBase64(sub.getKey("p256dh")), auth: arrayBufferToBase64(sub.getKey("auth")) },
          platform: "web",
        });
      }
    }
  } catch {
    // silently fail — push is a best-effort feature
  }
}

function arrayBufferToBase64(buffer) {
  if (!buffer) return "";
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}