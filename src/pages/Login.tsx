import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Waves } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      navigate("/");
    },
    onError: () => {
      setError("Invalid credentials. Please try again.");
    },
  });

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-12 sm:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-16 h-64 w-64 rounded-full bg-amber-100/70 blur-3xl" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-100/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-60 w-60 rounded-full bg-stone-100 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-6xl items-center justify-center">
        <Card className="w-full max-w-md border-white/70 bg-white/90 shadow-[0_20px_60px_-30px_rgba(120,90,60,0.55)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_30px_80px_-35px_rgba(120,90,60,0.65)]">
          <CardHeader className="space-y-5 pb-3 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-stone-100 shadow-sm">
              <Waves className="h-6 w-6 text-amber-800" />
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.26em] text-amber-700/80">
                La Vida Resort & Beach Club
              </p>
              <CardTitle className="text-3xl font-semibold text-stone-800">
                Welcome Back
              </CardTitle>
            </div>
            <p className="mx-auto max-w-xs text-sm text-stone-500">
              Access your concierge dashboard and guest communication hub.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="email" className="text-[#6f5840]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-[#e7d7c2] bg-white/95"
                placeholder="info@lavidaresort.ly"
              />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="password" className="text-[#6f5840]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 border-[#e7d7c2] bg-white/95"
                placeholder="••••••••"
              />
            </div>
            <Button
              className="h-12 w-full rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 text-base font-medium text-amber-50 shadow-md transition-all duration-300 hover:from-amber-800 hover:to-amber-600 hover:shadow-lg"
              size="lg"
              onClick={() => {
                setError("");
                loginMutation.mutate({ email, password });
              }}
              disabled={loginMutation.isPending}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </Button>
            {error ? <p className="text-center text-xs text-red-600">{error}</p> : null}
            <p className="text-center text-xs text-stone-500">
              Local development admin access for La Vida operations
            </p>
          </CardContent>
        </Card>

        <div className="pointer-events-none absolute bottom-8 text-center text-xs uppercase tracking-[0.2em] text-stone-500/70">
          Coastal Calm. Premium Service.
        </div>
      </div>
    </div>
  );
}
