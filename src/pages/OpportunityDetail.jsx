import React, { useState, useEffect } from "react";
import { useParams, useOutletContext, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Clock, Calendar, ExternalLink, Shield, Award, Users, Home, Globe, Bookmark, BookmarkCheck, Mail, CalendarClock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const typeLabel = { internship: "Internship", job: "Career", ssl: "SSL", volunteer: "Volunteer", other: "Role" };

function DateRow({ label, value, unavailable }) {
  return (
    <div className="flex items-center justify-between text-sm py-1.5 border-b border-border/30 last:border-0">
      <span className="text-muted-foreground flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5" /> {label}</span>
      <span className={value ? "font-medium text-foreground" : "text-muted-foreground/70 italic"}>{value || (unavailable ? "Date unavailable" : "—")}</span>
    </div>
  );
}

export default function OpportunityDetail() {
  const { id } = useParams();
  const { user } = useOutletContext();
  const { toast } = useToast();
  const [opp, setOpp] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [o, s] = await Promise.all([
          base44.entities.Opportunity.get(id).catch(() => null),
          base44.entities.SavedOpportunity.filter({ user_id: user?.id, opportunity_id: id }).catch(() => []),
        ]);
        setOpp(o);
        setSaved((s || []).length > 0);
      } catch (err) {
        console.warn("Failed to load opportunity detail:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
    else setLoading(false);
  }, [id, user?.id]);

  const handleSave = async () => {
    if (saved) {
      const s = await base44.entities.SavedOpportunity.filter({ user_id: user.id, opportunity_id: id });
      if (s.length > 0) await base44.entities.SavedOpportunity.delete(s[0].id);
      setSaved(false);
      toast({ title: "Removed from saved" });
    } else {
      await base44.entities.SavedOpportunity.create({ user_id: user.id, opportunity_id: id });
      setSaved(true);
      toast({ title: "Opportunity saved" });
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-sage border-t-navy rounded-full animate-spin" /></div>;
  if (!opp) return <div className="text-center py-20"><p className="text-muted-foreground">Opportunity not found.</p></div>;

  const signUp = opp.sign_up_url || opp.source_url || opp.website;
  const orgEmail = opp.contact_email || opp.organization_email || opp.email;

  const mailtoUrl = orgEmail ? `mailto:${encodeURIComponent(orgEmail)}?subject=${encodeURIComponent(`Inquiry regarding ${opp.title} - ${user?.full_name || "Student"}`)}&body=${encodeURIComponent(
    `Hello ${opp.organization_name} Team,\n\n` +
    `I am reaching out regarding the ${opp.title} opportunity.\n\n` +
    `Student Name: ${user?.full_name || "Student"}\n` +
    `Email: ${user?.email || ""}\n\n` +
    `I would love to learn more about how I can participate or get involved.\n\n` +
    `Thank you,\n` +
    `${user?.full_name || "Student"}`
  )}` : null;

  const badgeList = [
    opp.ssl_approved && { label: "SSL Approved", icon: Award, color: "bg-emerald/10 text-emerald" },
    opp.youth_friendly && { label: "Youth-friendly", icon: Users, color: "bg-blue-50 text-blue-600" },
    opp.mosque_based && { label: "Mosque-based", icon: Home, color: "bg-purple-50 text-purple-600" },
    opp.family_safe && { label: "Family Safe", icon: Shield, color: "bg-green-50 text-green-700" },
    opp.women_led && { label: "Women-led", icon: Users, color: "bg-pink-50 text-pink-600" },
    opp.remote_allowed && { label: "Remote OK", icon: Globe, color: "bg-indigo-50 text-indigo-600" },
  ].filter(Boolean);

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/opportunities">
        <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground -ml-2">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to opportunities
        </Button>
      </Link>

      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap gap-2 mb-3">
            {opp.opportunity_type && opp.opportunity_type !== "volunteer" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gold/10 text-gold">{typeLabel[opp.opportunity_type] || opp.opportunity_type}</span>
            )}
            {opp.paid_or_unpaid && opp.paid_or_unpaid !== "unknown" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-sage/10 text-sage capitalize">{opp.paid_or_unpaid}</span>
            )}
            {badgeList.map((b) => (
              <span key={b.label} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${b.color}`}>
                <b.icon className="w-3.5 h-3.5" /> {b.label}
              </span>
            ))}
          </div>

          <h1 className="font-heading text-2xl font-bold text-foreground mb-1">{opp.title}</h1>
          <p className="text-muted-foreground">{opp.organization_name}</p>

          <div className="grid grid-cols-2 gap-3 mt-6">
            {opp.city && <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="w-4 h-4" /> {opp.city}, {opp.state || "MD"} {opp.zip_code}</div>}
            {opp.remote_allowed && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Globe className="w-4 h-4" /> Remote</div>}
            {!opp.remote_allowed && opp.in_person_allowed && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Home className="w-4 h-4" /> In-person</div>}
            {opp.hours_needed && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="w-4 h-4" /> {opp.hours_needed} hours</div>}
          </div>

          {/* Dates */}
          <div className="mt-6 bg-muted/40 rounded-2xl p-4">
            <h3 className="text-sm font-semibold mb-1 flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Dates</h3>
            {opp.rolling_ongoing && <p className="text-sm font-medium text-emerald mb-2">Rolling / Ongoing 2026</p>}
            <DateRow label="Application opens" value={opp.application_open} unavailable />
            <DateRow label="Application deadline" value={opp.application_deadline} unavailable />
            <DateRow label="Start date" value={opp.date_start} unavailable />
            <DateRow label="End date" value={opp.date_end} unavailable />
          </div>

          {opp.eligibility && (
            <div className="mt-4">
              <h3 className="font-medium text-sm mb-1">Eligibility</h3>
              <p className="text-sm text-muted-foreground">{opp.eligibility}</p>
            </div>
          )}

          {opp.description && (
            <div className="mt-6">
              <h3 className="font-medium text-sm mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{opp.description}</p>
            </div>
          )}

          {opp.source_name && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Source:</span>
              <a href={signUp || "#"} target="_blank" rel="noopener noreferrer" className="font-medium text-navy hover:underline">
                {opp.source_name}
              </a>
            </div>
          )}
        </div>

        {/* Action Toolbar */}
        <div className="border-t border-border/50 p-6 space-y-4 bg-muted/20">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleSave} variant="outline" className="rounded-xl shrink-0">
              {saved ? <BookmarkCheck className="w-4 h-4 mr-1.5 text-sage" /> : <Bookmark className="w-4 h-4 mr-1.5" />}
              {saved ? "Saved" : "Save Opportunity"}
            </Button>

            {signUp && (
              <a href={signUp} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button className="w-full rounded-xl bg-navy hover:bg-navy/90 text-white">
                  <ExternalLink className="w-4 h-4 mr-1.5" /> View Official Website / Apply
                </Button>
              </a>
            )}
          </div>

          {/* Real Organization Email Section */}
          {orgEmail ? (
            <div className="p-4 rounded-xl bg-sage/10 border border-sage/30 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-navy uppercase tracking-wider">Organization Contact Email</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{orgEmail}</p>
              </div>
              <a href={mailtoUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="bg-navy hover:bg-navy/90 text-white rounded-xl text-xs">
                  <Mail className="w-3.5 h-3.5 mr-1.5" /> Email Organization
                </Button>
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
