const { Expo } = require("expo-server-sdk");
const expo = new Expo();

async function sendExpoPush(tokens, message) {
  // ✅ validate + filter once
  const validTokens = tokens.filter(token => {
    if (!Expo.isExpoPushToken(token)) {
      console.warn("Invalid Expo token:", token);
      return false;
    }
    return true;
  });

  const messages = validTokens.map((to) => ({
    to,
    ...message,
  }));

  const chunks = expo.chunkPushNotifications(messages);

  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (e) {
      console.error("Expo push error:", e);
    }
  }
}

module.exports = { sendExpoPush };