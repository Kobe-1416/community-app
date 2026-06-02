import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { API_URL } from "../config";

  const API_BASE = `${API_URL}`;

  // Foreground behavior
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: true,
    }),
  });

// 1️⃣ Get Expo Push Token
export async function getExpoPushToken() {
    if (!Device.isDevice) {
      throw new Error("Push notifications require a physical device.");
    }

    // ✅ ADD IT HERE (very early)
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } =
        await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      throw new Error("Notification permission not granted.");
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId; // ✅ fix added

    if (!projectId) {
      throw new Error("Missing projectId in app config.");
    }

    const token = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;

    console.log("TOKEN:", token);

    return token;
  }

// 2️⃣ Register token with backend
export async function registerDeviceTokenWithServer(expoPushToken) {
  const token = await SecureStore.getItemAsync("token");
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/api/notifications/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ expoPushToken }),
  });

  const raw = await res.text();
  console.log("REGISTER RAW:", raw);

  if (!res.ok) {
    throw new Error(raw || `Request failed (${res.status})`);
  }

  const data = JSON.parse(raw);

  if (!data.success) {
    throw new Error(data?.message || "Failed to register device token");
  }

  return true;
}

// 3️⃣ Preferences
  export async function syncPushSettingsToServer({
    pushEnabled,
    safetyEnabled,
    marketplaceEnabled,
  }) {
  const token = await SecureStore.getItemAsync("token");
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/api/notifications/preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      pushEnabled,
      safetyEnabled,
      marketplaceEnabled,
    }),
  });

  const raw = await res.text();
  console.log("PREFS RAW:", raw);

  if (!res.ok) {
    throw new Error(raw || `Request failed (${res.status})`);
  }

  const data = JSON.parse(raw);

  if (!data.success) {
    throw new Error(
      data?.message || "Failed to save notification preferences"
    );
  }

  return true;
}

// 4️⃣ Single entry point
export async function setupPushNotifications() {
  // Step A: ensure auth is valid
  const token = await SecureStore.getItemAsync("token");
  if (!token) throw new Error("Not authenticated");

  const meRes = await fetch(`${API_BASE}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (meRes.status !== 200) {
    throw new Error("Auth not ready");
  }

  // Step B: get Expo token
  const expoPushToken = await getExpoPushToken();

  // Step C: register with backend
  await registerDeviceTokenWithServer(expoPushToken);

  return expoPushToken;
}