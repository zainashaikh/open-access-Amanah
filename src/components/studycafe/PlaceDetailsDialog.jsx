import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, Heart, Share2, Calendar, Wifi, Moon, ShieldCheck, Store } from "lucide-react";
import { evalOpenNow } from "@/lib/openHours";

const HALAL_BADGE = {
  verified: { label: "Halal verified", cls: "bg-emerald/15 text-emerald" },
  halal_friendly: { label: "Halal-friendly", cls: "bg-sage/15 text-sage" },
  unknown: { label: "Halal unknown", cls: "bg-muted text-muted-foreground" },
};

export default function PlaceDetailsDialog({ place, open, onClose, saved, onToggleSave, onShare, onPlan, isAdmin, onEdit }) {
  if (!place) return null;
  const hb = HALAL_BADGE[place.halal_status] || HALAL_BADGE.unknown;
  const openNow = evalOpenNow(place.open_hours);
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-2xl max-w-lg">
        <DialogHeader><DialogTitle className="font-heading">{place.name}</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-1">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-2 py-0.5 rounded-md bg-navy/5 text-navy">{place.place_type}</span>
            <span className={`text-xs px-2 py-0.5 rounded-md ${hb.cls}`}>{hb.label}</span>
            {openNow === true && <span className="text-xs px-2 py-0.5 rounded-md bg-emerald/10 text-emerald">Open now</span>}
            {openNow === false && place.open_hours && <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">Closed now</span>}
          </div>
          {(place.address || place.city) && (
            <p className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="w-4 h-4" />{[place.address, place.city, place.state].filter(Boolean).join(", ")}</p>
          )}
          {place.open_hours && <p className="text-sm"><span className="text-muted-foreground">Hours: </span>{place.open_hours}</p>}
          {place.lat != null && place.lng != null && <p className="text-xs text-muted-foreground">Lat/Lng: {Number(place.lat).toFixed(4)}, {Number(place.lng).toFixed(4)}</p>}
          {place.halal_note && <p className="text-sm bg-sage/5 rounded-xl p-3"><span className="font-medium">Halal: </span>{place.halal_note}</p>}
          {place.study_note && <p className="text-sm text-muted-foreground">{place.study_note}</p>}
          <div className="flex flex-wrap gap-1.5">
            {place.wifi && <Badge icon={Wifi} label="Wi-Fi" />}
            {place.quiet && <Badge icon={Moon} label="Quiet" />}
            {place.late_night && <Badge icon={Moon} label="Late-night" />}
            {place.family_safe && <Badge icon={ShieldCheck} label="Family-safe" />}
            {place.women_safe && <Badge icon={ShieldCheck} label="Women-safe" />}
            {place.mosque_adjacent && <Badge icon={Store} label="Mosque-adjacent" />}
          </div>
          {place.source && <p className="text-[11px] text-muted-foreground">Source: {place.source === "osm" ? "OpenStreetMap" : place.source === "seed" ? "Curated (verify with venue)" : place.source}</p>}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => onToggleSave(place)}><Heart className={`w-4 h-4 mr-1.5 ${saved ? "fill-red-500 text-red-500" : ""}`} />{saved ? "Saved" : "Save"}</Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => onShare(place)}><Share2 className="w-4 h-4 mr-1.5" />Share</Button>
            <Button size="sm" className="rounded-xl bg-navy hover:bg-navy/90 text-white" onClick={() => onPlan(place)}><Calendar className="w-4 h-4 mr-1.5" />Plan a session</Button>
            {place.website && <a href={place.website} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm" className="rounded-xl"><Globe className="w-4 h-4 mr-1.5" />Website</Button></a>}
            {place.source_url && <a href={place.source_url} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm" className="rounded-xl">Map</Button></a>}
            {isAdmin && <Button variant="outline" size="sm" className="rounded-xl ml-auto" onClick={() => onEdit(place)}>Edit</Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Badge({ icon: Icon, label }) {
  return <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground flex items-center gap-1"><Icon className="w-3 h-3" />{label}</span>;
}
