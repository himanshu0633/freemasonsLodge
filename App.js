import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar, Platform } from "react-native";

import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import BottomNav from "./src/Components/layout/BottomNav";
import LoginScreen from "./src/Screen/Login";
import ChatScreen from "./src/Screen/Chat/chatScreen";
import SplashScreen from "./src/Screen/Splash";
import AdminEventDashboard from "./src/Screen/Attendance/adminevent";
import NotificationPage from "./src/Screen/Notification";
import messaging from "@react-native-firebase/messaging";


import {
  getMessaging,
  requestPermission,
  AuthorizationStatus,
} from "@react-native-firebase/messaging";
import { getApp } from "@react-native-firebase/app";

import notifee, { AndroidImportance } from "@notifee/react-native";

const Stack = createNativeStackNavigator();

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log("📩 FCM Background Message:", remoteMessage);

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
    const app = getApp();
    const messagingInstance = getMessaging(app);

    const authStatus = await requestPermission(messagingInstance);

    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    console.log(
      enabled
        ? "✅ Notification permission enabled"
        : "❌ Notification permission not granted"
    );

    return enabled;
  } catch (error) {
    console.log("❌ Permission request error:", error);
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

/* ---------------- TEST NOTIFICATION ---------------- */
async function showTestNotification() {
  if (Platform.OS === "android") {
    await notifee.displayNotification({
      title: "Notifications Enabled 🎉",
      body: "You will now receive notifications",
      android: {
        channelId: "default",
      },
    });

    console.log("✅ Test notification shown");
  }
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    (async () => {
      const granted = await requestUserPermission();
      if (granted) {
        await createNotificationChannel();
        await showTestNotification(); // 🔥 THIS flips system toggle ON
      }
    })();
  }, []);
  useEffect(() => {
  // 🔔 FOREGROUND NOTIFICATIONS
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log("📩 FCM Foreground Message:", remoteMessage);

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


useEffect(() => {
  messaging()
    .getToken()
    .then(token => {
      console.log("🔥 DEVICE FCM TOKEN:", token);
    });
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
