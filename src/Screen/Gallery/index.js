import MobileLayout from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Heart, Download, Share2, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

// Mock Images
const images = [
  { id: 1, url: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=800", caption: "Installation Banquet 2025" },
  { id: 2, url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=800", caption: "Charity Walk Team" },
  { id: 3, url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800", caption: "Ladies Night" },
  { id: 4, url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800", caption: "Festive Board" },
  { id: 5, url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800", caption: "Provincial Visit" },
  { id: 6, url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800", caption: "Summer BBQ" },
];

export default function Gallery() {
  const [, setLocation] = useLocation();

  return (
    <MobileLayout>
      <div className="px-6 py-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="-ml-2" onClick={() => setLocation("/")}>
               <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-serif text-2xl font-bold text-foreground">Social Gallery</h1>
          </div>
          <Button size="icon" variant="outline" className="h-8 w-8 rounded-full bg-primary/10 border-primary/20 text-primary">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-0.5 px-0.5">
        {images.map((img) => (
           <Dialog key={img.id}>
             <DialogTrigger asChild>
                <div className="relative group cursor-pointer overflow-hidden aspect-square">
                  <img 
                    src={img.url} 
                    alt={img.caption} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
             </DialogTrigger>
             <DialogContent className="max-w-sm w-[90%] p-0 overflow-hidden bg-transparent border-none shadow-none">
                <div className="bg-card rounded-lg overflow-hidden shadow-2xl">
                  <div className="relative aspect-[4/5] bg-black">
                     <img src={img.url} alt={img.caption} className="w-full h-full object-contain" />
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex justify-between items-center">
                       <p className="font-medium font-serif">{img.caption}</p>
                       <div className="flex gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-lodge-red hover:text-lodge-red/80 hover:bg-lodge-red/10">
                            <Heart className="h-5 w-5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <Share2 className="h-5 w-5" />
                          </Button>
                       </div>
                    </div>
                    <Button className="w-full" variant="secondary">
                       <Download className="mr-2 h-4 w-4" /> Download Original
                    </Button>
                  </div>
                </div>
             </DialogContent>
           </Dialog>
        ))}
      </div>
    </MobileLayout>
  );
}