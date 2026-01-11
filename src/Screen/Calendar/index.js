import MobileLayout from "@/components/layout/MobileLayout";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { format } from "date-fns";
import { Clock, MapPin } from "lucide-react";

const events = [
  { date: new Date(2026, 0, 15), title: "Regular Meeting", type: "meeting", time: "6:30 PM", location: "Lodge Room 1" },
  { date: new Date(2026, 0, 22), title: "Rehearsal", type: "degree", time: "7:00 PM", location: "Lodge Room 2" },
  { date: new Date(2026, 0, 29), title: "Lodge of Instruction", type: "mentoring", time: "7:30 PM", location: "Committee Room" },
  { date: new Date(2026, 1, 5), title: "Officers Meeting", type: "admin", time: "6:00 PM", location: "Zoom" },
];

const eventTypes = {
  meeting: { color: "bg-lodge-red", label: "Regular" },
  degree: { color: "bg-lodge-gold", label: "Work" },
  mentoring: { color: "bg-lodge-green", label: "Mentoring" },
  admin: { color: "bg-lodge-navy", label: "Admin" },
};

export default function CalendarPage() {
  const [date, setDate] = useState(new Date());

  const selectedEvents = events.filter(e => 
    date && e.date.toDateString() === date.toDateString()
  );

  return (
    <MobileLayout>
      <div className="px-6 py-8">
        <h1 className="font-serif text-2xl font-bold text-foreground mb-6">Lodge Calendar</h1>
        
        <div className="bg-card rounded-xl shadow-sm border border-border p-3 mb-8">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md"
            modifiers={{
              event: (date) => events.some(e => e.date.toDateString() === date.toDateString()),
            }}
            modifiersClassNames={{
              event: "font-bold text-primary underline decoration-primary decoration-2 underline-offset-4",
            }}
          />
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-lg font-semibold flex items-center gap-2">
            Agenda <span className="text-sm font-sans font-normal text-muted-foreground ml-auto">{date ? format(date, "MMM d, yyyy") : "Select a date"}</span>
          </h2>

          {selectedEvents.length > 0 ? (
            selectedEvents.map((event, idx) => (
              <Card key={idx} className="border-l-4" style={{ borderLeftColor: `var(--${event.type === 'meeting' ? 'lodge-red' : event.type === 'degree' ? 'lodge-gold' : event.type === 'mentoring' ? 'lodge-green' : 'lodge-navy'})` }}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{event.title}</h3>
                    <Badge variant="secondary" className="text-[10px] uppercase">
                      {eventTypes[event.type]?.label || event.type}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" /> {event.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> {event.location}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
             <div className="text-center py-8 text-muted-foreground italic bg-muted/20 rounded-lg border border-dashed border-border">
               No events scheduled for this day.
             </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}