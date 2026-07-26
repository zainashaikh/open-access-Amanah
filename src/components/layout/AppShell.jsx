import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import TopNav from "@/components/layout/TopNav";
import CoachPanel from "@/components/coach/CoachPanel";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function AppShell() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coachOpen, setCoachOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        try {
          const profiles = await base44.entities.Profile.filter({ user_id: me.id });
          if (profiles.length > 0) {
            setProfile(profiles[0]);
            if (!profiles[0].onboarding_complete && !window.location.pathname.startsWith("/onboarding")) {
              navigate("/onboarding", { replace: true });
            }
          } else {
            let newProfile = null;
            try {
              newProfile = await base44.entities.Profile.create({ user_id: me.id, full_name: me.full_name, role: "student" });
            } catch {
              newProfile = { user_id: me.id, full_name: me.full_name, role: "student", onboarding_complete: true };
            }
            setProfile(newProfile);
            if (newProfile.onboarding_complete === false) {
              navigate("/onboarding", { replace: true });
            }
          }
        } catch (profileErr) {
          console.warn("Could not fetch profile, using default:", profileErr);
          setProfile({ user_id: me.id, full_name: me.full_name || "Student", role: "student", onboarding_complete: true });
        }
      } catch (err) {
        console.warn("Auth check in AppShell failed or in preview mode, using demo user:", err);
        const demoUser = { id: "demo_user_123", full_name: "Amina Khan", email: "amina@example.com" };
        setUser(demoUser);
        setProfile({ id: "profile_demo", user_id: demoUser.id, full_name: demoUser.full_name, role: "student", onboarding_complete: true, skills: ["Tutoring", "Event Planning"] });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-sage border-t-navy rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading Amanah...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopNav user={user} />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet context={{ user, profile, setProfile }} />
      </main>

      <Button
        onClick={() => setCoachOpen(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full shadow-lg bg-navy hover:bg-navy/90 text-white h-12 px-5 gap-2"
      >
        <Sparkles className="w-5 h-5" />
        <span className="hidden sm:inline">Need a Recommendation</span>
        <span className="sm:hidden">Coach</span>
      </Button>

      <Sheet open={coachOpen} onOpenChange={setCoachOpen}>
        <SheetContent side="right" className="w-full sm:w-[420px] p-0">
          <CoachPanel user={user} profile={profile} mode="floating" onClose={() => setCoachOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
