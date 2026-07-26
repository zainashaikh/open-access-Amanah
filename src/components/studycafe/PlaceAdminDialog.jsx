import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const EMPTY = { name: "", place_type: "restaurant", address: "", city: "", state: "", lat: "", lng: "", website: "", source_url: "", halal_status: "verified", halal_note: "", study_note: "", quiet: false, wifi: false, late_night: false, family_safe: true, women_safe: true, mosque_adjacent: false, open_hours: "" };

export default function PlaceAdminDialog({ open, place, onClose, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    setForm(place ? { ...EMPTY, ...place, lat: place.lat ?? "", lng: place.lng ?? "" } : EMPTY);
  }, [place, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const geocode = async () => {
    const q = [form.address, form.city, form.state].filter(Boolean).join(", ");
    if (!q) { toast({ title: "Add an address first" }); return; }
    setGeocoding(true);
    try {
      const res = await base44.functions.invoke("geocodePlace", { q });
      const d = res.data;
      if (d?.error) toast({ title: "Couldn't geocode", description: d.error, variant: "destructive" });
      else { set("lat", d.lat); set("lng", d.lng); toast({ title: "Location found" }); }
    } catch { toast({ title: "Geocoding failed", variant: "destructive" }); }
    setGeocoding(false);
  };

  const save = async () => {
    if (!form.name) { toast({ title: "Name required" }); return; }
    setSaving(true);
    const payload = {
      ...form,
      lat: form.lat === "" ? null : Number(form.lat),
      lng: form.lng === "" ? null : Number(form.lng),
      source: form.source || "admin",
    };
    try {
      if (place?.id) { await base44.entities.StudyPlace.update(place.id, payload); toast({ title: "Place updated" }); }
      else { await base44.entities.StudyPlace.create(payload); toast({ title: "Place added" }); }
      onSaved();
      onClose();
    } catch { toast({ title: "Save failed", variant: "destructive" }); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-2xl max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-heading">{place ? "Edit place" : "Add a place"}</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-1">
          <div><Label className="text-sm mb-1 block">Name *</Label><Input className="rounded-xl" value={form.name} onChange={e => set("name", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-sm mb-1 block">Type</Label>
              <Select value={form.place_type} onValueChange={v => set("place_type", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="restaurant">Restaurant</SelectItem><SelectItem value="cafe">Cafe</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label className="text-sm mb-1 block">Halal status</Label>
              <Select value={form.halal_status} onValueChange={v => set("halal_status", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="verified">Verified</SelectItem><SelectItem value="halal_friendly">Halal-friendly</SelectItem><SelectItem value="unknown">Unknown</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div><Label className="text-sm mb-1 block">Address</Label><Input className="rounded-xl" value={form.address} onChange={e => set("address", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-sm mb-1 block">City</Label><Input className="rounded-xl" value={form.city} onChange={e => set("city", e.target.value)} /></div>
            <div><Label className="text-sm mb-1 block">State</Label><Input className="rounded-xl" value={form.state} onChange={e => set("state", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-sm mb-1 block">Latitude</Label><Input className="rounded-xl" value={form.lat} onChange={e => set("lat", e.target.value)} placeholder="auto" /></div>
            <div><Label className="text-sm mb-1 block">Longitude</Label><Input className="rounded-xl" value={form.lng} onChange={e => set("lng", e.target.value)} placeholder="auto" /></div>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={geocode} disabled={geocoding}>{geocoding ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}Geocode from address</Button>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-sm mb-1 block">Website</Label><Input className="rounded-xl" value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://…" /></div>
            <div><Label className="text-sm mb-1 block">Map / source link</Label><Input className="rounded-xl" value={form.source_url} onChange={e => set("source_url", e.target.value)} placeholder="https://…" /></div>
          </div>
          <div><Label className="text-sm mb-1 block">Halal note</Label><Textarea rows={2} className="rounded-xl" value={form.halal_note} onChange={e => set("halal_note", e.target.value)} /></div>
          <div><Label className="text-sm mb-1 block">Study-friendliness note</Label><Textarea rows={2} className="rounded-xl" value={form.study_note} onChange={e => set("study_note", e.target.value)} /></div>
          <div><Label className="text-sm mb-1 block">Opening hours</Label><Input className="rounded-xl" value={form.open_hours} onChange={e => set("open_hours", e.target.value)} placeholder="e.g. Mo-Su 09:00-22:00" /></div>
          <div className="grid grid-cols-2 gap-2">
            <Toggle label="Quiet" v={form.quiet} on={v => set("quiet", v)} />
            <Toggle label="Wi-Fi" v={form.wifi} on={v => set("wifi", v)} />
            <Toggle label="Late-night" v={form.late_night} on={v => set("late_night", v)} />
            <Toggle label="Mosque-adjacent" v={form.mosque_adjacent} on={v => set("mosque_adjacent", v)} />
            <Toggle label="Family-safe" v={form.family_safe} on={v => set("family_safe", v)} />
            <Toggle label="Women-safe" v={form.women_safe} on={v => set("women_safe", v)} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="rounded-xl flex-1" onClick={onClose}>Cancel</Button>
            <Button className="rounded-xl flex-1 bg-navy hover:bg-navy/90 text-white" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save place"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Toggle({ label, v, on }) {
  return (
    <div className="flex items-center justify-between p-2.5 bg-muted rounded-xl">
      <span className="text-sm">{label}</span>
      <Switch checked={!!v} onCheckedChange={on} />
    </div>
  );
}
