import React from "react";
import BottomNav from "./BottomNav";



export default function MobileLayout({ children }) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex justify-center bg-zinc-100 dark:bg-zinc-900">
      <div className="w-full max-w-md bg-background min-h-screen shadow-2xl relative flex flex-col pb-16 overflow-hidden">
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
