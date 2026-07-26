import React, { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import EmptyState from "@/components/ui/EmptyState";
import { Coffee, Search, RefreshCw, Plus, Loader2, Calendar } from "lucide-react";
import { canDo } from "@/lib/rateLimit";
import { evalOpenNow } from "@/lib/openHours";
import PlaceCard from "@/components/studycafe/PlaceCard";
import PlaceDetailsDialog from "@/components/studycafe/PlaceDetailsDialog";
import PlaceAdminDialog from "@/components/studycafe/PlaceAdminDialog";

const FILTERS = [
  { key: "cafe", label: "Cafe" },
  { key: "restaurant", label: "Restaurant" },
  { key: "quiet", label: "Quiet" },
  { key: "wifi", label: "Wi-Fi" },
  { key: "openNow", label: "Open now" },
  { key: "lateNight", label: "Late-night" },
  { key: "familySafe", label: "Family-safe" },
  { key: "womenSafe", label: "Women-safe" },
  { key: "mosqueAdjacent", label: "Mosque-adjacent" },
  { key: "savedOnly", label: "Saved" },
];

export default function StudyCafe() {
  const { user } = useOutletContext();
  const { toast } = useToast();
  const [places, setPlaces] = useState([]);
  const [saved, setSaved] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [f, setF] = useState({ cafe: false, restaurant: false, quiet: false, wifi: false, openNow: false, lateNight: false, familySafe: false, womenSafe: false, mosqueAdjacent: false, savedOnly: false });
  const [selected, setSelected] = useState(null);
  const [sessionsByPlace, setSessionsByPlace] = useState({});
  const [counts, setCounts] = useState({});
  const [joined, setJoined] = useState({});
  const [planFor, setPlanFor] = useState(null);
  const [planForm, setPlanForm] = useState({ scheduled_for: "", max_attendees: 4, note: "" });
  const [savingPlan, setSavingPlan] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [adminDialog, setAdminDialog] = useState(null);
  const isAdmin = user?.role === "admin";

  const load = async () => {
    setLoading(true);
    const [p, sv, sess, rsvps] = await Promise.all([
      base44.entities.StudyPlace.filter({ status: "active" }).catch(() => []),
      base44.entities.SavedStudyPlace.filter({ user_id: user.id }).catch(() => []),
      base44.entities.StudySession.filter({ status: "open" }).catch(() => []),
      base44.entities.StudySessionRSVP.list("-created_date", 500).catch(() => []),
    ]);
    setPlaces(p);
    setSaved(new Set(sv.map(s => s.place_id)));
    const now = Date.now();
    const map = {};
    for (const s of sess) {
      if (!s.scheduled_for || new Date(s.scheduled_for).getTime() >= now - 3600000) {
        (map[s.place_id] = map[s.place_id] || []).push(s);
      }
    }
    setSessionsByPlace(map);
    const cnt = {}; const mine = {};
    for (const r of rsvps) { cnt[r.session_id] = (cnt[r.session_id] || 0) + 1; if (r.user_id === user.id) mine[r.session_id] = true; }
    setCounts(cnt); setJoined(mine);
    setLoading(false);
  };
  useEffect(() => { load(); }, [user.id]);

  const cities = useMemo(() => ["all", ...Array.from(new Set(places.map(p => p.city).filter(Boolean))).sort()], [places]);

  const filtered = useMemo(() => places.filter(p => {
    if (city !== "all" && p.city !== city) return false;
    if (f.cafe && p.place_type !== "cafe") return false;
    if (f.restaurant && p.place_type !== "restaurant") return false;
    if (f.quiet && !p.quiet) return false;
    if (f.wifi && !p.wifi) return false;
    if (f.lateNight && !p.late_night) return false;
    if (f.familySafe && !p.family_safe) return false;
    if (f.womenSafe && !p.women_safe) return false;
    if (f.mosqueAdjacent && !p.mosque_adjacent) return false;
    if (f.savedOnly && !saved.has(p.id)) return false;
    if (f.openNow && evalOpenNow(p.open_hours) !== true) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!`${p.name} ${p.address} ${p.city} ${p.state} ${p.study_note} ${p.halal_note}`.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [places, city, f, saved, search]);

  const toggle = (k) => setF(prev => ({ ...prev, [k]: !prev[k] }));

  const toggleSaved = async (p) => {
    if (saved.has(p.id)) {
      const rec = await base44.entities.SavedStudyPlace.filter({ user_id: user.id, place_id: p.id });
      if (rec.length) await base44.entities.SavedStudyPlace.delete(rec[0].id);
      setSaved(prev => { const n = new Set(prev); n.delete(p.id); return n; });
    } else {
      await base44.entities.SavedStudyPlace.create({ user_id: user.id, place_id: p.id });
      setSaved(prev => new Set(prev).add(p.id));
    }
  };

  const sharePlace = async (p) => {
    const url = p.source_url || p.website;
    if (!url) { toast({ title: "No link available for this place" }); return; }
    if (navigator.share) { try { await navigator.share({ title: p.name, url }); } catch { /* user cancelled */ } }
    else { try { await navigator.clipboard.writeText(url); toast({ title: "Link copied" }); } catch { toast({ title: "Couldn't copy" }); } }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await base44.functions.invoke("refreshStudyPlaces", {});
      const d = res.data;
      if (d?.error) toast({ title: "Refresh failed", description: d.error, variant: "destructive" });
      else { toast({ title: "Directory refreshed", description: `Added ${d.added || 0}, updated ${d.updated || 0} from OpenStreetMap.` }); await load(); }
    } catch { toast({ title: "Refresh failed", variant: "destructive" }); }
    setRefreshing(false);
  };

  const handlePlan = async () => {
    if (!planForm.scheduled_for) { toast({ title: "Pick a date & time" }); return; }
    const rl = canDo("outreach");
    if (!rl.ok) { toast({ title: "Please wait", description: `${rl.wait}s`, variant: "destructive" }); return; }
    setSavingPlan(true);
    const sess = await base44.entities.StudySession.create({
      user_id: user.id, place_id: planFor.id, place_name: planFor.name, place_address: planFor.address,
      scheduled_for: planForm.scheduled_for, max_attendees: parseInt(planForm.max_attendees) || 4, note: planForm.note, status: "open",
    });
    setSessionsByPlace(prev => ({ ...prev, [planFor.id]: [sess, ...(prev[planFor.id] || [])] }));
    setPlanFor(null); setPlanForm({ scheduled_for: "", max_attendees: 4, note: "" }); setSavingPlan(false);
    toast({ title: "Session planned" });
  };

  const join = async (sess) => {
    if ((counts[sess.id] || 0) >= sess.max_attendees) { toast({ title: "Session is full", variant: "destructive" }); return; }
    await base44.entities.StudySessionRSVP.create({ session_id: sess.id, user_id: user.id });
    setJoined(prev => ({ ...prev, [sess.id]: true }));
    setCounts(prev => ({ ...prev, [sess.id]: (prev[sess.id] || 0) + 1 }));
    toast({ title: "You're in" });
  };
  const leave = async (sessId) => {
    const mine = await base44.entities.StudySessionRSVP.filter({ session_id: sessId, user_id: user.id });
    if (mine.length) await base44.entities.StudySessionRSVP.delete(mine[0].id);
    setJoined(prev => { const n = { ...prev }; delete n[sessId]; return n; });
    setCounts(prev => ({ ...prev, [sessId]: Math.max((prev[sessId] || 1) - 1, 0) }));
  };
  const report = async (sess) => {
    await base44.entities.SentMessage.create({ user_id: user.id, message_type: "flag_message", recipient_type: "admin", subject: `Study Cafe report: ${sess.place_name}`, body: sess.note || "Reported session." });
    toast({ title: "Reported to admins" });
  };
  const deletePlace = async (p) => {
    if (!confirm(`Remove ${p.name} from the directory?`)) return;
    await base44.entities.StudyPlace.delete(p.id);
    setPlaces(prev => prev.filter(x => x.id !== p.id));
    toast({ title: "Place removed" });
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2"><Coffee className="w-6 h-6 text-sage" /> Study Cafe</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Halal restaurants & halal-friendly cafes across the DMV. <span className="text-[11px]">Sourced from OpenStreetMap.</span></p>
        </div>
        {isAdmin && (
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" className="rounded-xl" onClick={handleRefresh} disabled={refreshing}>{refreshing ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1.5" />}Refresh</Button>
            <Button className="rounded-xl bg-navy hover:bg-navy/90 text-white" onClick={() => setAdminDialog("new")}><Plus className="w-4 h-4 mr-1.5" />Add place</Button>
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl p-4 border border-border/50 mb-4">
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input className="rounded-xl pl-9" placeholder="Search by name, city, or note" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="rounded-xl sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              {cities.map(c => <SelectItem key={c} value={c}>{c === "all" ? "All cities" : c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(ff => (
            <button key={ff.key} onClick={() => toggle(ff.key)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${f[ff.key] ? "bg-navy text-white border-navy" : "bg-card text-muted-foreground border-border hover:border-navy/40"}`}>{ff.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-sage animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Coffee} title={places.length === 0 ? "No places yet" : "No matches"} description={places.length === 0 ? (isAdmin ? "Click Refresh to load the DMV halal directory from OpenStreetMap, or Add a place." : "The directory is being populated — check back soon.") : "Try clearing some filters."} />
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <PlaceCard key={p.id} place={p} saved={saved.has(p.id)} sessions={sessionsByPlace[p.id]} counts={counts} joined={joined} currentUserId={user.id}
              onToggleSave={toggleSaved} onShare={sharePlace} onOpen={setSelected} onPlan={setPlanFor}
              onJoin={join} onLeave={leave} onReport={report} isAdmin={isAdmin} onEdit={setAdminDialog} onDelete={deletePlace} />
          ))}
        </div>
      )}

      <PlaceDetailsDialog place={selected} open={!!selected} onClose={() => setSelected(null)} saved={selected && saved.has(selected.id)}
        onToggleSave={toggleSaved} onShare={sharePlace} onPlan={(p) => { setSelected(null); setPlanFor(p); }} isAdmin={isAdmin} onEdit={(p) => { setSelected(null); setAdminDialog(p); }} />
      <PlaceAdminDialog open={!!adminDialog} place={adminDialog === "new" ? null : adminDialog} onClose={() => setAdminDialog(null)} onSaved={load} />

      <Dialog open={!!planFor} onOpenChange={(o) => !o && setPlanFor(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle className="font-heading">Plan a study session</DialogTitle></DialogHeader>
          {planFor && (
            <div className="space-y-4 mt-2">
              <p className="text-sm text-muted-foreground">{planFor.name} · {planFor.address}</p>
              <div><Label className="text-sm mb-1 block">When *</Label><Input type="datetime-local" className="rounded-xl" value={planForm.scheduled_for} onChange={e => setPlanForm(f => ({ ...f, scheduled_for: e.target.value }))} /></div>
              <div><Label className="text-sm mb-1 block">Max attendees (including you)</Label><Input type="number" min="2" max="10" className="rounded-xl" value={planForm.max_attendees} onChange={e => setPlanForm(f => ({ ...f, max_attendees: e.target.value }))} /></div>
              <div><Label className="text-sm mb-1 block">Note (optional)</Label><Textarea rows={2} className="rounded-xl" value={planForm.note} onChange={e => setPlanForm(f => ({ ...f, note: e.target.value }))} placeholder="e.g. Bringing AP Bio notes" /></div>
              <Button onClick={handlePlan} disabled={savingPlan} className="w-full bg-navy hover:bg-navy/90 text-white rounded-xl"><Calendar className="w-4 h-4 mr-1.5" />{savingPlan ? "Saving…" : "Create session"}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
