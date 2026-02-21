import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_KEY = "theme_isDarkMode_v1";

const ThemeContext = createContext({
  isDarkMode: false,
  setIsDarkMode: () => {},
  toggleDarkMode: () => {},
  isReady: false,
});

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // load saved value once
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_KEY);
        if (stored !== null) setIsDarkMode(stored === "true");
      } catch (e) {
        // ignore, fallback to default
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  // persist when changed
  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(THEME_KEY, String(isDarkMode)).catch(() => {});
  }, [isDarkMode, isReady]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode, toggleDarkMode, isReady }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}