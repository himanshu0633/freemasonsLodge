import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar, PermissionsAndroid, Platform } from "react-native";

import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import BottomNav from "./src/Components/layout/BottomNav";
import LoginScreen from "./src/Screen/Login";
import ChatScreen from "./src/Screen/Chat/chatScreen";
import SplashScreen from "./src/Screen/Splash";
import AdminEventDashboard from "./src/Screen/Attendance/adminevent";
import AdminAnouncement from "./src/Screen//Anouncement/adminAnouncement";
import NotificationPage from "./src/Screen/Notification";
import Gallery from "./src/Screen/Gallery";
import Attendance from "./src/Screen/Attendance/index";
import AllAnnouncements from "./src/Screen/Anouncement/index";
import AdminUserManagement from "./src/Screen/Profile/AdminProfile";

import messaging, {
  AuthorizationStatus,
} from "@react-native-firebase/messaging";

import notifee, { AndroidImportance } from "@notifee/react-native";

const Stack = createNativeStackNavigator();

/* ---------------- BACKGROUND NOTIFICATION ---------------- */
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log("📩 BACKGROUND MESSAGE RECEIVED:", remoteMessage);

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
async function requestUserPermission() {
  try {
    console.log("🔐 Requesting notification permission...");

    if (Platform.OS === "android" && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log("❌ Android notification permission denied");
        return false;
      }
    }

    const authStatus = await messaging().requestPermission();

    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    console.log("✅ Firebase permission:", enabled);
    return enabled;
  } catch (e) {
    console.log("❌ Permission error:", e);
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

/* ---------------- TEST LOCAL NOTIFICATION ---------------- */
async function sendTestNotification() {
  console.log("🧪 Sending test notification...");

  await notifee.displayNotification({
    title: "Test Notification 🎉",
    body: "Notifications are working correctly!",
    android: {
      channelId: "default",
      importance: AndroidImportance.HIGH,
    },
  });
}

/* ---------------- CHECK LOGIN ---------------- */
async function checkLoginStatus(setInitialRoute) {
  try {
    const userData = await AsyncStorage.getItem("userData");

    console.log("📦 AsyncStorage userData:", userData);

    if (userData) {
      console.log("✅ User logged in → Main");
      setInitialRoute("Main");
    } else {
      console.log("❌ No user → Login");
      setInitialRoute("Login");
    }
  } catch (error) {
    console.log("❌ AsyncStorage error:", error);
    setInitialRoute("Login");
  }
}

/* ================= APP ================= */

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [initialRoute, setInitialRoute] = useState(null);

  /* After splash → check login + setup notifications */
  useEffect(() => {
    if (!showSplash) {
      setTimeout(async () => {
        await checkLoginStatus(setInitialRoute);

        const granted = await requestUserPermission();
        if (granted) {
          await createNotificationChannel();
          await sendTestNotification();
        }
      }, 500);
    }
  }, [showSplash]);

  /* FOREGROUND NOTIFICATIONS */
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log("📲 FOREGROUND MESSAGE:", remoteMessage);

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

  /* Splash Screen */
  if (showSplash) {
    return (
      <SafeAreaProvider>
        <PaperProvider>
          <StatusBar barStyle="light-content" backgroundColor="#1A237E" />
          <SplashScreen onAnimationComplete={() => setShowSplash(false)} />
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  /* Wait until route decided */
  if (!initialRoute) return null;

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Main" component={BottomNav} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="attendance" component={Attendance} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
            <Stack.Screen name="AdminEvent" component={AdminEventDashboard} />
            <Stack.Screen name="AdminAnouncement" component={AdminAnouncement} />
            <Stack.Screen name="NotificationPage" component={NotificationPage} />
            <Stack.Screen name="Gallery" component={Gallery} />
            <Stack.Screen name="announcements" component={AllAnnouncements} />
             <Stack.Screen name="allusers" component={AdminUserManagement} />
            
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
