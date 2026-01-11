import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

import Home from "./src/Screen/Home";
import Documents from "./src/Screen/Documents";
import Chat from "./src/Screen/Chat";
import CalendarPage from "./src/Screen/Calendar";
import Attendance from "./src/Screen/Attendance";
import Payments from "./src/Screen/Payments";
import Gallery from "./src/Screen/Gallery";
import AuthPage from "./src/Screen/Auth";

function Router() {
  return (
    <Switch>
      <Route path="/auth">
        <AuthPage />
      </Route>
      <Route path="/">
        <Home />
      </Route>
      <Route path="/documents">
        <Documents />
      </Route>
      <Route path="/chat">
        <Chat />
      </Route>
      <Route path="/calendar">
        <CalendarPage />
      </Route>
      <Route path="/attendance">
        <Attendance />
      </Route>
      <Route path="/payments">
        <Payments />
      </Route>
      <Route path="/gallery">
        <Gallery />
      </Route>
    
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
