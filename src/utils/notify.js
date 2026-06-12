import { LocalNotifications } from "@capacitor/local-notifications";

function isCapacitor() {
  return typeof window !== "undefined" && window.Capacitor?.isNativePlatform();
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
            id: Date.now(),
            schedule: { at: new Date() },
            sound: "default",
            smallIcon: "ic_stat_icon_default",
            iconColor: "#111111",
          },
        ],
      });
    } catch {
      // fallback
    }
    return;
  }
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon: "/favicon.svg" });
  } catch {
    // fallback for older browsers
  }
}
