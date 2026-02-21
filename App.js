// App.js
import * as React from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native";

import { ThemeProvider, useTheme } from "./context/ThemeContext";

import RegisterScreen from "./screens/RegisterScreen";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import NoticeBoardScreen from "./screens/NoticeBoardScreen";
import MarketPlaceScreen from "./screens/MarketPlaceScreen";
import SettingsScreen from "./screens/SettingsScreen";
import CreateListingScreen from "./screens/CreateListingScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { isDarkMode } = useTheme();

  // You can keep the header green (accent) even in dark mode
  const headerBg = "#85FF27";

  const tabBg = isDarkMode ? "#121212" : "#ffffff";
  const tabBorder = isDarkMode ? "#333" : "transparent";
  const inactive = isDarkMode ? "#9a9a9a" : "gray";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? "#121212" : "#ffffff" }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === "Home") iconName = "home";
            else if (route.name === "Notice Board") iconName = "notifications";
            else if (route.name === "Market Place") iconName = "cart";
            else if (route.name === "Settings") iconName = "settings";
            return <Ionicons name={iconName} size={size} color={color} />;
          },

          tabBarActiveTintColor: "#85FF27",
          tabBarInactiveTintColor: inactive,

          tabBarStyle: {
            backgroundColor: tabBg,
            borderTopWidth: 1,
            borderTopColor: tabBorder,
            elevation: isDarkMode ? 0 : 5,
            height: 110,
            paddingBottom: 20,
            paddingTop: 10,
          },

          headerStyle: {
            backgroundColor: headerBg, // keep accent
          },
          headerTintColor: "#000000ff",

          // Optional: make header title a bit bolder consistently
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: "bold",
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen
          name="Notice Board"
          component={NoticeBoardScreen}
          options={{ title: "Notice Board" }}
        />
        <Tab.Screen
          name="Market Place"
          component={MarketPlaceScreen}
          options={{ title: "Market Place" }}
        />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

function AppNavigator() {
  const { isDarkMode } = useTheme();

  // React Navigation theme (affects some defaults like background behind screens)
  const navTheme = isDarkMode ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="CreateListing"
          component={CreateListingScreen}
          options={{
            headerShown: true,
            title: "Create Listing",
            // This Stack header should also match your theme.
            headerStyle: { backgroundColor: "#85FF27" },
            headerTintColor: "#000",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}