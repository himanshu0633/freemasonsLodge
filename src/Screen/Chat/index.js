import MobileLayout from "@/components/layout/MobileLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, Plus, User } from "lucide-react";

const chats = [
  { id: 1, name: "Lodge Harmony 341", lastMessage: "Brethren, remember the rehearsal tomorrow.", time: "10:30 AM", unread: 3, isGroup: true, image: "/crest-placeholder.png" },
  { id: 2, name: "W. Bro. James Smith", lastMessage: "Can you confirm the dining numbers?", time: "Yesterday", unread: 0, isGroup: false },
  { id: 3, name: "Charity Committee", lastMessage: "The raffle prizes are sorted.", time: "Tuesday", unread: 0, isGroup: true },
  { id: 4, name: "Bro. David Wilson", lastMessage: "Thanks for the lift!", time: "Monday", unread: 0, isGroup: false },
];

export default function Chat() {
  return (
    <MobileLayout>
      <div className="flex flex-col h-full min-h-[calc(100vh-4rem)]">
        {/* Chat Header */}
        <div className="px-6 py-6 pb-2">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-serif text-2xl font-bold text-foreground">Messages</h1>
            <div className="bg-primary/10 text-primary p-2 rounded-full cursor-pointer hover:bg-primary/20 transition-colors">
              <Plus className="h-5 w-5" />
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div 
              key={chat.id} 
              className="px-6 py-4 flex items-center gap-4 hover:bg-muted/30 cursor-pointer transition-colors border-b border-border/40 last:border-0"
            >
              <Avatar className="h-12 w-12 border border-border">
                {/* Fallback to crest for group or initials for user */}
                <AvatarImage src={chat.isGroup && chat.id === 1 ? undefined : undefined} />
                <AvatarFallback className={chat.isGroup ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}>
                  {chat.isGroup ? <User className="h-5 w-5" /> : chat.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-medium text-sm text-foreground truncate">{chat.name}</h3>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">{chat.time}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate pr-4">
                  <span className="text-foreground">{chat.lastMessage.split(':')[0]}</span>
                  {chat.lastMessage.includes(':') ? ':' + chat.lastMessage.split(':')[1] : ''}
                </p>
              </div>

              {chat.unread > 0 && (
                <div className="h-5 min-w-[1.25rem] px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {chat.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
