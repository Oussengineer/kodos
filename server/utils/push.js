import webpush from "web-push";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const SUBS_PATH = new URL("../data/push-subs.json", import.meta.url);
const VAPID_KEYS_PATH = new URL("../data/vapid-keys.json", import.meta.url);

let VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
let VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  try {
    const saved = JSON.parse(await readFile(VAPID_KEYS_PATH, "utf-8"));
    VAPID_PUBLIC_KEY = saved.publicKey;
    VAPID_PRIVATE_KEY = saved.privateKey;
  } catch {
    const keys = webpush.generateVAPIDKeys();
    VAPID_PUBLIC_KEY = keys.publicKey;
    VAPID_PRIVATE_KEY = keys.privateKey;
    await writeFile(VAPID_KEYS_PATH, JSON.stringify(keys, null, 2)).catch(() => {});
    console.log("Generated VAPID keys for Web Push. Add to .env to persist:");
    console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
    console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
  }
}

webpush.setVapidDetails("mailto:admin@kodos.com", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

export function getVapidPublicKey() {
  return VAPID_PUBLIC_KEY;
}

async function getSubs() {
  try {
    return JSON.parse(await readFile(SUBS_PATH, "utf-8"));
  } catch {
    return [];
  }
}

async function saveSubs(subs) {
  await writeFile(SUBS_PATH, JSON.stringify(subs, null, 2));
}

export async function addSubscription({ userId, role, endpoint, keys, platform }) {
  const subs = await getSubs();
  const existing = subs.findIndex((s) => s.endpoint === endpoint);
  const entry = { userId, role, endpoint, keys, platform, createdAt: new Date().toISOString() };
  if (existing >= 0) {
    subs[existing] = entry;
  } else {
    subs.push(entry);
  }
  await saveSubs(subs);
}

export async function removeSubscription(endpoint) {
  const subs = await getSubs();
  const filtered = subs.filter((s) => s.endpoint !== endpoint);
  await saveSubs(filtered);
}

export async function sendPushToRoles(roles, title, body, url) {
  const subs = await getSubs();
  const targets = subs.filter((s) => roles.includes(s.role));
  const results = [];
  for (const sub of targets) {
    if (sub.platform === "fcm") continue;
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        JSON.stringify({ title, body, url, timestamp: Date.now() })
      );
      results.push({ endpoint: sub.endpoint, status: "ok" });
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        await removeSubscription(sub.endpoint);
      }
      results.push({ endpoint: sub.endpoint, status: "failed" });
    }
  }
  return results;
}

export async function sendFcmToRoles(roles, title, body) {
  const subs = await getSubs();
  const targets = subs.filter((s) => roles.includes(s.role) && s.platform === "fcm");
  if (targets.length === 0) return [];
  const results = [];

  // Try firebase-admin (service account)
  try {
    const admin = await import("firebase-admin");
    if (!admin.apps.length) {
      try {
        admin.initializeApp({ credential: admin.credential.applicationDefault() });
      } catch {
        throw new Error("no service account");
      }
    }
    for (const sub of targets) {
      try {
        await admin.messaging().send({
          token: sub.endpoint,
          notification: { title, body },
          android: { priority: "high", notification: { sound: "default", channelId: "orders" } },
        });
        results.push({ endpoint: sub.endpoint, status: "ok" });
      } catch {
        results.push({ endpoint: sub.endpoint, status: "failed" });
      }
    }
    return results;
  } catch {
    // Fallback to legacy HTTP API with server key
  }

  // Legacy FCM HTTP API fallback
  const serverKey = process.env.FCM_SERVER_KEY;
  if (!serverKey) {
    console.warn("FCM not configured: set GOOGLE_APPLICATION_CREDENTIALS or FCM_SERVER_KEY");
    return results;
  }

  for (const sub of targets) {
    try {
      const res = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          "Authorization": `key=${serverKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: sub.endpoint,
          notification: { title, body, sound: "default" },
          android: { priority: "high", notification: { channelId: "orders" } },
        }),
      });
      if (res.ok) {
        results.push({ endpoint: sub.endpoint, status: "ok" });
      } else {
        results.push({ endpoint: sub.endpoint, status: "failed" });
      }
    } catch {
      results.push({ endpoint: sub.endpoint, status: "failed" });
    }
  }
  return results;
}

export async function notifyNewOrder(order) {
  const title = "New Order!";
  const body = `Order #${order.id} — ${order.total?.toFixed(2)} TND`;
  const url = "/orders";
  await Promise.all([
    sendPushToRoles(["admin", "restaurant"], title, body, url),
    sendFcmToRoles(["admin", "restaurant"], title, body),
  ]);
}

export async function notifyDeliveryAvailable(order) {
  const title = "Delivery Available!";
  const body = `Order #${order.id} — ${order.total?.toFixed(2)} TND — Ready for pickup`;
  const url = "/";
  await Promise.all([
    sendPushToRoles(["driver"], title, body, url),
    sendFcmToRoles(["driver"], title, body),
  ]);
}

export async function notifyDeliveryAssigned(order) {
  const title = "Delivery Assigned!";
  const body = `Order #${order.id} — ${order.total?.toFixed(2)} TND`;
  const url = "/active";
  await Promise.all([
    sendPushToRoles(["driver"], title, body, url),
    sendFcmToRoles(["driver"], title, body),
  ]);
}