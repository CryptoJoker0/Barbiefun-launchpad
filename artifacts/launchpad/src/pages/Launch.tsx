import { useState } from "react";
import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Rocket, CheckCircle2, Upload, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Launch() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ address: string; ticker: string } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const ticker = formData.get("ticker") as string;

    setTimeout(() => {
      setIsSubmitting(false);
      const hex = Array.from({ length: 40 }, (_, i) => ((i * 7 + 13) % 16).toString(16)).join("");
      setSuccessData({
        address: `0x${hex}`,
        ticker: ticker || "MEME",
      });
    }, 2000);
  };

  if (successData) {
    return (
      <div className="max-w-2xl mx-auto py-12 animate-in slide-in-from-bottom-8 duration-500">
        <Card className="border-primary/50 shadow-[0_0_50px_rgba(16,185,129,0.1)] text-center py-12">
          <CardContent className="space-y-6 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary"
            >
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Token Launched!</h2>
              <p className="text-muted-foreground text-lg">
                ${successData.ticker} is now live and trading.
              </p>
            </div>

            <div className="bg-background/50 p-6 rounded-lg w-full max-w-md border border-border">
              <Label className="text-muted-foreground mb-2 block">Contract Address</Label>
              <div className="font-mono text-primary text-sm break-all select-all bg-black/50 p-3 rounded border border-primary/20">
                {successData.address}
              </div>
            </div>

            <div className="flex gap-4 w-full max-w-md mt-4">
              <Link href={`/token/${successData.ticker.toLowerCase()}`} className="flex-1">
                <Button className="w-full bg-primary text-primary-foreground font-bold">
                  View Dashboard
                </Button>
              </Link>
              <Button variant="outline" className="flex-1" onClick={() => setSuccessData(null)}>
                Launch Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Launch a Token</h1>
        <p className="text-muted-foreground text-lg">
          Deploy your meme token instantly. No coding required.
        </p>
      </div>

      <Card className="border-border">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Token Details</CardTitle>
            <CardDescription>Enter the basics for your new token.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Token Name *</Label>
                <Input id="name" name="name" placeholder="e.g. Pepe 2.0" required className="font-sans" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticker">Ticker Symbol *</Label>
                <Input id="ticker" name="ticker" placeholder="e.g. PEPE2" required className="font-sans uppercase" maxLength={10} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="What is this token about? Make it catchy."
                required
                className="resize-none font-sans min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Token Logo *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground hover:bg-card/80 hover:border-primary/50 transition-colors cursor-pointer group">
                <Upload className="w-8 h-8 mb-4 group-hover:text-primary transition-colors" />
                <p className="text-sm font-medium mb-1 group-hover:text-primary transition-colors">Click to upload or drag and drop</p>
                <p className="text-xs">PNG, JPG, GIF up to 5MB</p>
                <input type="file" className="hidden" accept="image/*" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="supply">Total Supply</Label>
                <Input id="supply" name="supply" type="number" defaultValue="1000000000" min="1" required className="font-mono" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="liquidity">Initial Liquidity (ETH)</Label>
                <Input id="liquidity" name="liquidity" type="number" step="0.01" defaultValue="0.1" min="0.01" required className="font-mono" />
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start space-x-3 text-sm">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div className="text-primary-foreground/80">
                <strong className="text-primary block mb-1">Fair Launch Warning</strong>
                All launches on FerryPump are fair launches. 100% of the initial supply will be added to the liquidity pool. Ownership will be renounced immediately.
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/10 border-t border-border mt-6 pt-6">
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg h-14"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center space-x-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></span>
                  <span>Deploying Contract...</span>
                </span>
              ) : (
                <span className="flex items-center">
                  <Rocket className="w-5 h-5 mr-2" />
                  Launch Token Now (0.01 ETH)
                </span>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
