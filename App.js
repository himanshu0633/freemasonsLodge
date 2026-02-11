import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "react-native";

import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import BottomNav from "./src/Components/layout/BottomNav";
import LoginScreen from "./src/Screen/Login";
import ChatScreen from "./src/Screen/Chat/chatScreen";
import SplashScreen from "./src/Screen/Splash";

const Stack = createNativeStackNavigator();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <SafeAreaProvider>
        <PaperProvider>
          <StatusBar
            barStyle="light-content"
            backgroundColor="#1A237E"
            translucent={false}
          />
          <SplashScreen onAnimationComplete={() => setShowSplash(false)} />
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#fff"
          translucent={false}
          hidden={false}
        />

        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={BottomNav} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}