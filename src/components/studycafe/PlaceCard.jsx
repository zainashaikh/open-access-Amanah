import React from "react";
import { Button } from "@/components/ui/button";
import { Coffee, MapPin, Wifi, Moon, Heart, Share2, Calendar, LogIn, LogOut, Flag, Globe, Users, Pencil, Trash2, ShieldCheck, Store, Utensils } from "lucide-react";
import { evalOpenNow } from "@/lib/openHours";

const HALAL_BADGE = {
  verified: { label: "Halal verified", cls: "bg-emerald/15 text-emerald" },
  halal_friendly: { label: "Halal-friendly", cls: "bg-sage/15 text-sage" },
  unknown: { label: "Halal unknown", cls: "bg-muted text-muted-foreground" },
};

export default function PlaceCard({ place, saved, sessions, counts, joined, currentUserId, onToggleSave, onShare, onOpen, onPlan, onJoin, onLeave, onReport, isAdmin, onEdit, onDelete }) {
  const hb = HALAL_BADGE[place.halal_status] || HALAL_BADGE.unknown;
  const openNow = evalOpenNow(place.open_hours);
  const sss = sessions || [];
  return (
    <div className="bg-card rounded-2xl p-4 border border-border/50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onOpen(place)}>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium text-foreground">{place.name}</h3>
            <span className="text-xs px-2 py-0.5 rounded-md bg-navy/5 text-navy flex items-center gap-1">
              {place.place_type === "cafe" ? <Coffee className="w-3 h-3" /> : <Utensils className="w-3 h-3" />}{place.place_type}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-md ${hb.cls}`}>{hb.label}</span>
          </div>
          {(place.address || place.city) && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{[place.address, place.city, place.state].filter(Boolean).join(", ")}</p>
          )}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {openNow === true && <span className="text-xs px-2 py-0.5 rounded-md bg-emerald/10 text-emerald">Open now</span>}
            {openNow === false && place.open_hours && <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">Closed now</span>}
            {place.wifi && <Chip icon={Wifi} label="Wi-Fi" />}
            {place.quiet && <Chip icon={Moon} label="Quiet" />}
            {place.late_night && <Chip icon={Moon} label="Late-night" />}
            {place.family_safe && <Chip icon={ShieldCheck} label="Family-safe" />}
            {place.women_safe && <Chip icon={ShieldCheck} label="Women-safe" />}
            {place.mosque_adjacent && <Chip icon={Store} label="Mosque-adjacent" />}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onToggleSave(place)}>
            <Heart className={`w-4 h-4 ${saved ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onShare(place)}><Share2 className="w-4 h-4 text-muted-foreground" /></Button>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => onOpen(place)}>Details</Button>
        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => onPlan(place)}><Calendar className="w-3.5 h-3.5 mr-1" />Plan a session</Button>
        {place.website && <a href={place.website} target="_blank" rel="noopener noreferrer" className="text-xs text-navy hover:underline flex items-center gap-1 ml-1"><Globe className="w-3.5 h-3.5" />Website</a>}
        {place.source_url && <a href={place.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-navy hover:underline">Map</a>}
        {isAdmin && (
          <div className="flex items-center gap-1 ml-auto">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(place)}><Pencil className="w-3.5 h-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onDelete(place)}><Trash2 className="w-3.5 h-3.5" /></Button>
          </div>
        )}
      </div>

      {sss.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/40 space-y-2">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> Studying here</p>
          {sss.map(sess => (
            <div key={sess.id} className="flex items-center justify-between gap-2 bg-muted/40 rounded-xl px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{new Date(sess.scheduled_for).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</p>
                {sess.note && <p className="text-xs text-muted-foreground truncate">{sess.note}</p>}
                <p className="text-[11px] text-muted-foreground">{counts[sess.id] || 0}/{sess.max_attendees} joined{sess.user_id === currentUserId ? " · you're hosting" : ""}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {joined[sess.id]
                  ? <Button size="sm" variant="ghost" className="rounded-lg h-8" onClick={() => onLeave(sess.id)}><LogOut className="w-3.5 h-3.5 mr-1" />Leave</Button>
                  : <Button size="sm" variant="outline" className="rounded-lg h-8" onClick={() => onJoin(sess)} disabled={(counts[sess.id] || 0) >= sess.max_attendees}><LogIn className="w-3.5 h-3.5 mr-1" />Join</Button>}
                {sess.user_id !== currentUserId && <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onReport(sess)} title="Report"><Flag className="w-3.5 h-3.5" /></Button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ icon: Icon, label }) {
  return <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground flex items-center gap-1"><Icon className="w-3 h-3" />{label}</span>;
}
