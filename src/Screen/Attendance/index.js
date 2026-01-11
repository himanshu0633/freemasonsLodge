import MobileLayout from "@/components/layout/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2 } from "lucide-react";

const workingOfficers = [
  { role: "Worshipful Master", name: "W.Bro. James Smith", status: "confirmed" },
  { role: "Senior Warden", name: "Bro. Thomas Anderson", status: "confirmed" },
  { role: "Junior Warden", name: "Bro. Robert Brown", status: "pending" },
  { role: "Chaplain", name: "W.Bro. Peter Wilson", status: "confirmed" },
  { role: "Treasurer", name: "W.Bro. Michael Jones", status: "confirmed" },
  { role: "Secretary", name: "W.Bro. David Clark", status: "confirmed" },
];

export default function Attendance() {
  return (
    <MobileLayout>
      <div className="px-6 py-8">
        <h1 className="font-serif text-2xl font-bold text-foreground mb-6">Attendance & Working</h1>

        {/* User Status */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Your Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Next Meeting: Jan 15</p>
                <p className="text-sm text-muted-foreground">Response required</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="default" className="bg-primary hover:bg-primary/90">Attending</Button>
                <Button size="sm" variant="outline">Apology</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Working Distribution */}
        <div className="space-y-4">
           <h2 className="font-serif text-lg font-semibold">Working Officers</h2>
           
           <Tabs defaultValue="officers" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="officers">Regular Officers</TabsTrigger>
              <TabsTrigger value="extra">Additional Work</TabsTrigger>
            </TabsList>

            <TabsContent value="officers" className="space-y-3">
              {workingOfficers.map((officer, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                  <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-wider">{officer.role}</p>
                    <p className="font-medium text-sm">{officer.name}</p>
                  </div>
                  {officer.status === 'confirmed' ? (
                    <CheckCircle2 className="w-5 h-5 text-lodge-green" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-lodge-gold animate-pulse" />
                  )}
                </div>
              ))}
            </TabsContent>
            <TabsContent value="extra">
              <div className="text-center py-8 text-muted-foreground">
                No additional work assigned yet.
              </div>
            </TabsContent>
           </Tabs>
        </div>
      </div>
    </MobileLayout>
  );
}