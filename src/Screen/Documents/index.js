import MobileLayout from "@/components/layout/MobileLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Upload } from "lucide-react";

// Mock Data
const documents = [
  { id: 1, title: "January 2026 Summons", type: "summons", date: "Jan 03, 2026", size: "1.2 MB" },
  { id: 2, title: "Minutes - Dec 2025", type: "lodge", date: "Dec 18, 2025", size: "840 KB" },
  { id: 3, title: "Provincial Charity Report", type: "region", date: "Dec 10, 2025", size: "2.4 MB" },
  { id: 4, title: "Book of Constitutions Update", type: "grand", date: "Nov 22, 2025", size: "5.1 MB" },
  { id: 5, title: "December 2025 Summons", type: "summons", date: "Dec 01, 2025", size: "1.1 MB" },
];

const typeStyles = {
  summons: "bg-lodge-red text-white border-lodge-red",
  lodge: "bg-gray-500 text-white border-gray-500",
  region: "bg-lodge-navy text-white border-lodge-navy",
  grand: "bg-lodge-royal text-white border-lodge-royal",
};

const typeLabels = {
  summons: "Summons",
  lodge: "Lodge",
  region: "Region",
  grand: "Grand Lodge",
};

export default function Documents() {
  return (
    <MobileLayout>
      <div className="px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-2xl font-bold text-foreground">Documents</h1>
           {/* Only visible for secretary role - mocked here */}
          <Button size="icon" variant="outline" className="h-8 w-8 rounded-full">
            <Upload className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-transparent gap-2 mb-6">
            {["all", "summons", "lodge", "region", "grand"].map((tab) => (
              <TabsTrigger 
                key={tab} 
                value={tab}
                className="rounded-full border border-border bg-card px-4 py-1.5 text-xs data-[state=active]:bg-foreground data-[state=active]:text-background"
              >
                {tab === "grand" ? "Grand Lodge" : tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </TabsContent>
          
          {["summons", "lodge", "region", "grand"].map((type) => (
            <TabsContent key={type} value={type} className="space-y-4">
              {documents.filter(d => d.type === type).map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MobileLayout>
  );
}

function DocumentCard({ doc }) {
  const style = typeStyles[doc.type];
  
  return (
    <Card className="overflow-hidden hover:bg-muted/40 transition-colors border-l-4 border-l-transparent" style={{ 
      borderLeftColor: doc.type === 'grand' ? 'var(--lodge-royal)' : 
                     doc.type === 'region' ? 'var(--lodge-navy)' : 
                     doc.type === 'summons' ? 'var(--lodge-red)' : 
                     'var(--gray-500)'
    }}>
      <div className="p-4 flex items-center gap-4">
        <div className={`h-10 w-10 rounded flex items-center justify-center shrink-0 ${style.replace('text-white', 'text-current bg-opacity-10')}`}>
          <FileText className={`h-5 w-5 ${style.split(' ')[0].replace('bg-', 'text-')}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-foreground truncate">{doc.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium uppercase tracking-wider ${style.replace('border-', '')}`}>
              {typeLabels[doc.type]}
            </span>
            <span className="text-xs text-muted-foreground">• {doc.date}</span>
          </div>
        </div>

        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}