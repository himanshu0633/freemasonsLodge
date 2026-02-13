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
import AdminEventDashboard from "./src/Screen/Attendance/adminevent";
import NotificationPage from "./src/Screen/Notification";


import {
  getMessaging,
  requestPermission,
  AuthorizationStatus,
} from "@react-native-firebase/messaging";
import { getApp } from "@react-native-firebase/app";
import { PermissionsAndroid, Platform } from "react-native";
import messaging from "@react-native-firebase/messaging";

import notifee, { AndroidImportance } from "@notifee/react-native";

const Stack = createNativeStackNavigator();

messaging().setBackgroundMessageHandler(async remoteMessage => {
  

  await notifee.displayNotification({
    title: remoteMessage.notification?.title || "Notification",
    body: remoteMessage.notification?.body || "",
    android: {
      channelId: "default",
      importance: AndroidImportance.HIGH,
    },
  });
});


/* ---------------- PERMISSION ---------------- */

export async function requestUserPermission() {
  try {
    // 🔔 ANDROID 13+
    if (Platform.OS === "android" && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log("❌ Android notification permission denied");
        return false;
      }
    }

    // 🔔 Firebase (required)
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    console.log("Notification permission:", enabled);
    return enabled;
  } catch (e) {
    console.log("Permission error:", e);
    return false;
  }
}

/* ---------------- ANDROID CHANNEL ---------------- */
async function createNotificationChannel() {
  if (Platform.OS === "android") {
    await notifee.createChannel({
      id: "default",
      name: "Default Notifications",
      importance: AndroidImportance.HIGH,
    });

    console.log("✅ Notification channel created");
  }
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
  if (!showSplash) {
    setTimeout(async () => {
      const granted = await requestUserPermission();
      if (granted) {
        await createNotificationChannel();
      }
    }, 500); // small delay ensures UI is visible
  }
}, [showSplash]);

  useEffect(() => {
  // 🔔 FOREGROUND NOTIFICATIONS
  const unsubscribe = messaging().onMessage(async remoteMessage => {
   

    await notifee.displayNotification({
      title: remoteMessage.notification?.title || "Notification",
      body: remoteMessage.notification?.body || "",
      android: {
        channelId: "default",
        importance: AndroidImportance.HIGH,
      },
    });
  });

  return unsubscribe;
}, []);



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
        />

        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={BottomNav} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
            <Stack.Screen name="AdminEvent" component={AdminEventDashboard} />
            <Stack.Screen name="NotificationPage" component={NotificationPage} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
