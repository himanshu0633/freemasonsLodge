import MobileLayout from "@/components/layout/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, Heart, History, ChevronRight } from "lucide-react";

export default function Payments() {
  return (
    <MobileLayout>
      <div className="px-6 py-8">
        <h1 className="font-serif text-2xl font-bold text-foreground mb-6">Payments</h1>

        {/* Outstanding Dues */}
        <Card className="mb-8 border-l-4 border-l-destructive shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Annual Subscription 2026</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-serif font-bold">$150.00</span>
                <span className="text-sm text-destructive font-medium">Overdue</span>
              </div>
              <Button className="w-full bg-foreground text-background hover:bg-foreground/90">
                <CreditCard className="mr-2 h-4 w-4" /> Pay via Card
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Charity Donation */}
        <div className="space-y-4 mb-8">
          <h2 className="font-serif text-lg font-semibold flex items-center gap-2">
            <Heart className="w-4 h-4 text-lodge-red" /> Charity Donation
          </h2>
          
          <Card>
            <CardContent className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground">Make a one-off donation to the Master's List.</p>
              
              <div className="grid grid-cols-3 gap-3">
                {["10", "20", "50"].map((amount) => (
                  <Button key={amount} variant="outline" className="border-primary/20 hover:bg-primary/5 hover:border-primary">
                    ${amount}
                  </Button>
                ))}
              </div>
              
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input type="number" placeholder="Other amount" className="pl-8" />
              </div>

              <Button className="w-full bg-lodge-gold text-foreground hover:bg-lodge-gold/90">
                Donate
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* History */}
        <div className="space-y-4">
           <h2 className="font-serif text-lg font-semibold flex items-center gap-2">
            <History className="w-4 h-4" /> Recent Transactions
          </h2>
          
          <div className="space-y-2">
            {[
              { label: "Dining Fee - Dec Meeting", date: "Dec 15, 2025", amount: "$35.00" },
              { label: "Charity - Almoner's Fund", date: "Nov 20, 2025", amount: "$50.00" },
              { label: "Raffle Tickets", date: "Nov 20, 2025", amount: "$10.00" },
            ].map((tx, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50">
                 <div className="flex flex-col">
                   <span className="font-medium text-sm">{tx.label}</span>
                   <span className="text-xs text-muted-foreground">{tx.date}</span>
                 </div>
                 <span className="font-mono font-medium">{tx.amount}</span>
              </div>
            ))}
             <Button variant="ghost" className="w-full text-xs text-muted-foreground">View All History <ChevronRight className="w-3 h-3 ml-1" /></Button>
          </div>
        </div>

      </div>
    </MobileLayout>
  );
}