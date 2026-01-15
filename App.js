// App.js
import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native";

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
  return (
    <SafeAreaView style={{flex: 1}}>
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
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopWidth: 0,
            elevation: 5,
            height: 110,
            paddingBottom: 20,
            paddingTop: 10,
          },
          headerStyle: { 
            backgroundColor: "#85FF27",
            fontSize: 30,
            fontWeight: "bold",
          },
          headerTintColor: "#000000ff",
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Notice Board" component={NoticeBoardScreen} options={{ title: "Notice Board" }} />
        <Tab.Screen name="Market Place" component={MarketPlaceScreen} options={{ title: "Market Place" }} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen 
          name="CreateListing" 
          component={CreateListingScreen} 
          options={{ headerShown: true, title: 'Create Listing' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
