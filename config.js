export const API_URL = "https://community-app-ccmd.onrender.com";

import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export const saveItem = async (key, value) => {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

export const getItem = async (key) => {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
};