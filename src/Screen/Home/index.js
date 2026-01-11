import MobileLayout from "@/components/layout/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bell, ChevronRight, FileText, CalendarDays, MapPin, Image as ImageIcon } from "lucide-react";
import lodgeCrest from "@assets/generated_images/classical_freemasonry_lodge_crest.png";
import { Link } from "wouter";

export default function Home() {
  return (
    <MobileLayout>
      {/* Header Section */}
      <div className="relative pt-12 pb-6 px-6 text-center space-y-4">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent -z-10" />
        
        <div className="mx-auto w-24 h-24 rounded-full bg-card shadow-lg p-4 border-2 border-primary/20 flex items-center justify-center mb-4">
           <img src={lodgeCrest} alt="Lodge Crest" className="w-full h-full object-contain opacity-90" />
        </div>
        
        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground">
            Lodge Harmony
          </h1>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
            No. 341 • Est. 1892
          </p>
        </div>
      </div>

      {/* Status Cards - Horizontal Scroll */}
      <div className="mb-8">
        <ScrollArea className="w-full whitespace-nowrap px-6">
          <div className="flex space-x-4 pb-4">
            {/* Next Meeting Card */}
            <Card className="w-[280px] shrink-0 border-l-4 border-l-lodge-red shadow-sm bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                  <CalendarDays className="w-3 h-3" /> Next Regular Meeting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xl font-serif font-bold text-foreground">Jan 15, 2026</p>
                    <p className="text-sm text-muted-foreground mt-1">Third Degree Working</p>
                  </div>
                  <Badge variant="outline" className="bg-background">6:30 PM</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Status Card */}
            <Card className="w-[280px] shrink-0 border-l-4 border-l-lodge-gold shadow-sm bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Attendance Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Are you attending?</p>
                    <div className="flex gap-2">
                      <Button size="sm" className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground">Yes</Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs">Apology</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dues Card */}
            <Card className="w-[280px] shrink-0 border-l-4 border-l-lodge-navy shadow-sm bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                   Outstanding Dues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xl font-serif font-bold text-destructive">$150.00</p>
                    <p className="text-xs text-muted-foreground">Due by Jan 31</p>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs border-destructive text-destructive hover:bg-destructive/10">Pay Now</Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </div>

      {/* Announcements Section */}
      <div className="px-6 space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-foreground">Announcements</h2>
          <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">View All</Button>
        </div>

        <div className="space-y-3">
          {/* Summons Item */}
          <div className="group relative flex items-start space-x-4 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-lodge-red rounded-l-lg" />
            <div className="bg-lodge-red/10 p-2 rounded-full mt-1">
              <FileText className="w-4 h-4 text-lodge-red" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium leading-none">January Summons Released</p>
                <span className="text-[10px] text-muted-foreground">2h ago</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                The summons for the upcoming regular meeting has been published. Please review the agenda.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 self-center" />
          </div>

          {/* Regional Notice */}
          <div className="group relative flex items-start space-x-4 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-lodge-navy rounded-l-lg" />
            <div className="bg-lodge-navy/10 p-2 rounded-full mt-1">
              <Bell className="w-4 h-4 text-lodge-navy" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium leading-none">Provincial Grand Lodge Visit</p>
                <span className="text-[10px] text-muted-foreground">1d ago</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                The Provincial Grand Master will be visiting Lodge of Unity next month.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 self-center" />
          </div>

           {/* Grand Lodge Notice */}
           <div className="group relative flex items-start space-x-4 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-lodge-royal rounded-l-lg" />
            <div className="bg-lodge-royal/10 p-2 rounded-full mt-1">
              <Bell className="w-4 h-4 text-lodge-royal" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium leading-none">Quarterly Communication</p>
                <span className="text-[10px] text-muted-foreground">3d ago</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                Highlights from the recent Quarterly Communication of Grand Lodge.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 self-center" />
          </div>
        </div>
      </div>

       {/* Lodge Life / Gallery Teaser */}
       <div className="px-6 space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-foreground">Lodge Life</h2>
          <Link href="/gallery">
             <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground cursor-pointer">View Gallery</Button>
          </Link>
        </div>

        <Link href="/gallery">
          <div className="relative h-40 w-full rounded-xl overflow-hidden cursor-pointer group">
             <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-black/30 transition-colors" />
             <img 
               src="https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=800" 
               alt="Gallery Preview" 
               className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
             />
             <div className="absolute bottom-4 left-4 z-20 text-white">
                <div className="flex items-center gap-2 mb-1">
                   <ImageIcon className="w-4 h-4 text-lodge-gold" />
                   <span className="text-xs font-medium uppercase tracking-wider text-lodge-gold">Social Gallery</span>
                </div>
                <p className="font-serif font-medium text-lg">View Photos from Last Meeting</p>
             </div>
          </div>
        </Link>
      </div>
    </MobileLayout>
  );
}