import { LocalNotifications } from "@capacitor/local-notifications";

let notifIdCounter = 1;

function isCapacitor() {
  return typeof window !== "undefined" && window.Capacitor?.isNativePlatform();
}

function playNotificationSound() {
  try {
    const audio = new Audio();
    audio.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch {}
}

export async function requestNotifyPermission() {
  if (isCapacitor()) {
    const perm = await LocalNotifications.requestPermissions();
    return perm.display === "granted";
  }
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export async function sendNotification(title, body) {
  if (isCapacitor()) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: notifIdCounter++,
            schedule: { at: new Date() },
            sound: "default",
            smallIcon: "ic_stat_icon_default",
            iconColor: "#111111",
            actionTypeId: "OPEN_APP",
          },
        ],
      });
    } catch {
      // fallback
    }
    return;
  }
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  playNotificationSound();
  try {
    new Notification(title, { body, icon: "/favicon.svg" });
  } catch {
    // fallback for older browsers
  }
}
