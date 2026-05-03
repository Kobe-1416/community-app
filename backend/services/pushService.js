const { Expo } = require("expo-server-sdk");
const expo = new Expo();

async function sendExpoPush(tokens, message) {
  // tokens: array of expo tokens
  const chunks = expo.chunkPushNotifications(
    tokens
      .filter(Expo.isExpoPushToken)
      .map((to) => ({ to, ...message }))
  );

  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (e) {
      console.error("Expo push error:", e);
    }
  }
}

module.exports = { sendExpoPush };