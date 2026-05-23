import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { HardHat } from "lucide-react";

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [validToken, setValidToken] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const verifyInvite = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user) {
        setValidToken(true);
        setEmail(sessionData.session.user.email || null);
        return;
      }

      const tokenHash = searchParams.get("token_hash");
      const token = searchParams.get("token");
      const emailParam = searchParams.get("email");

      if (tokenHash) {
        const { data, error: verifyError } = await supabase.auth.verifyOtp({ type: "invite", token_hash: tokenHash });
        if (verifyError) { setError("Ogiltig inbjudan"); return; }
        setValidToken(true);
        setEmail(data.user?.email || null);
        return;
      }

      if (token && emailParam) {
        const { data, error: verifyError } = await supabase.auth.verifyOtp({ type: "invite", token, email: emailParam });
        if (verifyError) { setError("Ogiltig inbjudan"); return; }
        setValidToken(true);
        setEmail(data.user?.email || null);
        return;
      }

      setError("Ogiltig inbjudan");
    };
    verifyInvite();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      toast.error("Lösenordet måste vara minst 8 tecken");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Lösenorden matchar inte");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;

      toast.success("Konto skapat!");
      navigate("/admin");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ett fel uppstod";
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-destructive">
              <HardHat className="h-7 w-7 text-destructive-foreground" />
            </div>
            <CardTitle className="font-display text-2xl">Ogiltig inbjudan</CardTitle>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Kontakta en administratör för att få en ny inbjudan.
            </p>
            <Button variant="outline" onClick={() => navigate("/admin/login")}>
              Gå till inloggning
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary">
              <HardHat className="h-7 w-7 text-primary-foreground" />
            </div>
            <CardTitle className="font-display text-2xl">Acceptera inbjudan</CardTitle>
            <p className="text-sm text-muted-foreground">Verifierar inbjudan...</p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary">
            <HardHat className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="font-display text-2xl">Acceptera inbjudan</CardTitle>
          {email && <p className="text-sm text-muted-foreground">{email}</p>}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Ange ditt nya lösenord</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minst 8 tecken"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Bekräfta lösenord</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Upprepa lösenord"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Skapar konto..." : "Skapa konto"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvite;