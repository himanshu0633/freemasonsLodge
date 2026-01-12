import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Home from "./src/Screen/Home";
import Documents from "./src/Screen/Documents";
import Chat from "./src/Screen/Chat";
import CalendarPage from "./src/Screen/Calendar";
import Attendance from "./src/Screen/Attendance";
import Payments from "./src/Screen/Payments";
import Gallery from "./src/Screen/Gallery";
import AuthPage from "./src/Screen/Auth";

const Stack = createNativeStackNavigator();

export default function Router() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthPage} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Documents" component={Documents} />
        <Stack.Screen name="Chat" component={Chat} />
        <Stack.Screen name="Calendar" component={CalendarPage} />
        <Stack.Screen name="Attendance" component={Attendance} />
        <Stack.Screen name="Payments" component={Payments} />
        <Stack.Screen name="Gallery" component={Gallery} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
