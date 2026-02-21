import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";

const API_BASE = "http://10.0.2.2:3000";

// Recommended: show alerts even when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

export async function registerForPushAsync() {
  if (!Device.isDevice) {
    // Push notifications don’t work on emulators reliably
    throw new Error("Push notifications require a physical device.");
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    throw new Error("Notification permission not granted.");
  }

  // Expo push token
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

export async function syncPushSettingsToServer({ pushEnabled, safetyEnabled }) {
  const token = await SecureStore.getItemAsync("token");
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/api/notifications/preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ pushEnabled, safetyEnabled }),
  });

  const raw = await res.text();
  console.log("PREFS RAW:", raw);

  // If server returned HTML or an error status, throw with raw so you can see it
  if (!res.ok) {
    throw new Error(raw || `Request failed (${res.status})`);
  }

  // Parse JSON safely
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("Expected JSON but got non-JSON response.");
  }

  if (!data.success) {
    throw new Error(data?.message || "Failed to save notification preferences");
  }

  return true;
}

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

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("Expected JSON but got non-JSON response.");
  }

  if (!data.success) {
    throw new Error(data?.message || "Failed to register device token");
  }

  return true;
}