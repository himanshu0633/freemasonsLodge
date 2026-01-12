import * as React from "react";
import { BottomNavigation } from "react-native-paper";
import { Home as HomeIcon, FileText, MessageSquare, Calendar, ClipboardCheck, CreditCard } from "lucide-react-native";

import Home from "../../Screen/Home";
import Documents from "../../Screen/Documents";
import Chat from "../../Screen/Chat";
import CalendarPage from "../../Screen/Calendar";
import Attendance from "../../Screen/Attendance";
import Payments from "../../Screen/Payments";

export default function BottomNav() {
  const [index, setIndex] = React.useState(0);

  const [routes] = React.useState([
    { key: "home", title: "Home", icon: HomeIcon },
    { key: "docs", title: "Docs", icon: FileText },
    { key: "chat", title: "Chat", icon: MessageSquare },
    { key: "calendar", title: "Calendar", icon: Calendar },
    { key: "attendance", title: "Attend", icon: ClipboardCheck },
    { key: "payments", title: "Pay", icon: CreditCard },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    home: Home,
    docs: Documents,
    chat: Chat,
    calendar: CalendarPage,
    attendance: Attendance,
    payments: Payments,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      barStyle={{ backgroundColor: "#fff" }}
      renderIcon={({ route, color }) => {
        const IconComponent = route.icon;
        return <IconComponent color={color} size={22} />;
      }}
      activeColor="#2563eb"
      inactiveColor="#6b7280"
    />
  );
}
