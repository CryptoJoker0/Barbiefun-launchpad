import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BadgeCheck, ShieldAlert, CheckCircle2, Rocket } from "lucide-react";
import { getLaunches, setLaunchVerified } from "@/lib/launches";
import ChainIcon from "@/components/ChainIcon";
import { SUPPORTED_CHAINS } from "@/lib/wagmi";

export default function Verify() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [launches, setLaunches] = useState(getLaunches());

  const toggleVerified = (id: string, verified: boolean) => {
    setLaunchVerified(id, verified);
    setLaunches(getLaunches());
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: wire to a real review-queue backend/API once available.
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto py-12 animate-in slide-in-from-bottom-8 duration-500">
        <Card className="border-primary/50 text-center py-12 rounded-3xl shadow-lg">
          <CardContent className="space-y-6 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Application Submitted</h2>
              <p className="text-muted-foreground">
                Our team will review your application within 24-48 hours. If approved, your token will receive the Verified badge.
              </p>
            </div>

            <Button variant="outline" onClick={() => setIsSuccess(false)} className="mt-4 rounded-full">
              Submit Another
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 flex items-center">
          Get Verified <BadgeCheck className="w-8 h-8 ml-3 text-primary" />
        </h1>
        <p className="text-muted-foreground text-lg">
          Apply for the blue checkmark. Verified tokens stand out in the feed and build trust with the community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="border-border rounded-3xl shadow-sm">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Verification Application</CardTitle>
                <CardDescription>Provide details about your project to prove legitimacy.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

                <div className="space-y-4">
                  <h3 className="text-lg font-bold border-b border-border/50 pb-2">Project Basics</h3>

                  <div className="space-y-2">
                    <Label htmlFor="address">Contract Address *</Label>
                    <Input id="address" placeholder="0x..." required className="font-mono" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Project Name *</Label>
                      <Input id="name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website *</Label>
                      <Input id="website" type="url" placeholder="https://" required />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold border-b border-border/50 pb-2">Social Presence</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter / X URL</Label>
                      <Input id="twitter" type="url" placeholder="https://x.com/Amanchain50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telegram">Telegram Group</Label>
                      <Input id="telegram" type="url" placeholder="https://t.me/barbiefunv2" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold border-b border-border/50 pb-2">Trust & Security</h3>

                  <div className="space-y-2">
                    <Label htmlFor="audit">Audit Link (Optional but recommended)</Label>
                    <Input id="audit" type="url" placeholder="Link to Certik, Hacken, etc." />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="details">Why should we verify you? *</Label>
                    <Textarea
                      id="details"
                      placeholder="Tell us about the team, locked liquidity, utility, etc."
                      required
                      className="min-h-[120px]"
                    />
                  </div>
                </div>

              </CardContent>
              <CardFooter className="bg-muted/10 border-t border-border mt-6 pt-6">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold rounded-full shadow-md hover:shadow-pink-300/50 transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20 rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <ShieldAlert className="w-5 h-5 mr-2 text-primary" />
                Verification Criteria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-primary mr-2 mt-0.5 shrink-0" />
                  <span>Liquidity must be locked or burned</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-primary mr-2 mt-0.5 shrink-0" />
                  <span>Contract source code verified on explorer</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-primary mr-2 mt-0.5 shrink-0" />
                  <span>Active social media presence</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-primary mr-2 mt-0.5 shrink-0" />
                  <span>No malicious functions in contract (honeypot, tax &gt; 10%)</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reviewer panel — no backend yet, so review decisions are applied
          directly to the local launch records that power the Verified
          badge shown across the app (TokenCard, TokenDetail, Home feed). */}
      <div className="mt-10">
        <Card className="border-border rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              Review Queue
            </CardTitle>
            <CardDescription>
              Team-only: approve or revoke the Verified badge for tokens launched on Barbie Fun.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {launches.length === 0 ? (
              <div className="text-center py-10">
                <Rocket className="w-8 h-8 text-pink-200 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No launches to review yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {launches.map((launch) => {
                  const chainMeta = SUPPORTED_CHAINS.find((c) => c.id === launch.chainId);
                  return (
                    <div
                      key={launch.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border bg-muted/10"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-300 to-red-300 flex items-center justify-center text-white font-black text-[10px] shrink-0">
                          {launch.ticker.slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate flex items-center gap-1">
                            {launch.name}
                            {launch.verified && <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-mono">${launch.ticker}</span>
                            {chainMeta && (
                              <span className="flex items-center gap-1">
                                <ChainIcon chain={chainMeta.icon} size={12} />{chainMeta.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={launch.verified ? "outline" : "default"}
                        className={launch.verified ? "rounded-full border-red-200 text-red-500 hover:bg-red-50" : "rounded-full bg-primary text-primary-foreground"}
                        onClick={() => toggleVerified(launch.id, !launch.verified)}
                      >
                        {launch.verified ? "Revoke" : "Approve"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
