import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Rocket, Wallet } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="Barbie Fun logo" className="w-9 h-9 rounded-full object-cover border-2 border-primary" />
              <span className="font-bold text-xl tracking-tight">Barbie Fun</span>
            </Link>

            <div className="hidden md:flex space-x-1">
              <Link href="/">
                <Button variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                  Terminal
                </Button>
              </Link>
              <Link href="/launch">
                <Button variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                  Launch
                </Button>
              </Link>
              <Link href="/verify">
                <Button variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                  Verify
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/launch" className="hidden sm:block">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                <Rocket className="w-4 h-4 mr-2" />
                Launch Token
              </Button>
            </Link>
            <Button variant="outline" className="font-mono text-sm border-primary/50 text-primary hover:bg-primary/10">
              <Wallet className="w-4 h-4 mr-2" />
              Connect
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
