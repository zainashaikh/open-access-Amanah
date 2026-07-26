import React, { useState, useEffect } from "react";
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
import { GraduationCap, Sparkles, Copy, Check, Loader2, Plus, Lightbulb, BookOpen, Briefcase, FileText, Trash2 } from "lucide-react";

export default function ResumeGenerator() {
  const { user, profile } = useOutletContext();
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [entries, setEntries] = useState([]);
  const [manualExperiences, setManualExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [openManualModal, setOpenManualModal] = useState(false);
  const [savingManual, setSavingManual] = useState(false);

  const [manualForm, setManualForm] = useState({
    title: "",
    organization: "",
    category: "Volunteer",
    dates: "",
    hours: "",
    tasks: ""
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [l, e, m] = await Promise.all([
          base44.entities.VolunteerLog.filter({ user_id: user?.id }).catch(() => []),
          base44.entities.ResumeEntry.filter({ user_id: user?.id }).catch(() => []),
          base44.entities.ManualExperience?.filter({ user_id: user?.id }).catch(() => []) || [],
        ]);
        setLogs(l || []);
        setEntries(e || []);
        setManualExperiences(m || []);
      } catch (err) {
        console.warn("Failed to load resume data:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) load();
    else setLoading(false);
  }, [user?.id]);

  const targetColleges = profile?.target_colleges || [
    "University of Maryland - College Park",
    "Georgetown University",
    "Johns Hopkins University"
  ];
  const userCareer = profile?.career_interests || [];
  const userGrade = profile?.grade_level || "11";

  const generateBullet = async (item) => {
    const itemId = item.id || `${item.title}-${item.organization}`;
    setGenerating(itemId);

    const title = item.opportunity_title || item.title;
    const org = item.organization_name || item.organization;
    const tasks = item.task_description || item.tasks || "Assisted with organizational projects.";
    const hours = item.hours ? `${item.hours} hours` : "Ongoing commitment";

    let generatedBullet = `Coordinated ${title} at ${org}, executing key tasks including ${tasks} to serve over 100 community members.`;
    let skillsGained = ["Leadership", "Communication", "Project Execution", "Community Engagement"];

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a strong, high-impact college application resume bullet point for a high school student in grade ${userGrade}.
Role: ${title} at ${org}
Category/Tasks: ${tasks}
Duration/Hours: ${hours}
Target Field: ${userCareer.join(", ") || "General Leadership"}

Write ONE concise, action-verb-led resume bullet using the Google XYZ formula ("Accomplished [X] as measured by [Y], by doing [Z]").`
      });
      if (typeof res === "string" && res.length > 10) {
        generatedBullet = res.trim();
      } else if (res?.bullet || res?.result || res?.response) {
        generatedBullet = res.bullet || res.result || res.response;
      }
    } catch { /* fallback */ }

    const entryPayload = {
      user_id: user.id,
      opportunity_title: title,
      organization_name: org,
      generated_bullet: generatedBullet,
      edited_bullet: generatedBullet,
      skills_gained: skillsGained,
      hours: item.hours || 0,
      date_range: item.date || item.dates || "2026",
    };

    try {
      const created = await base44.entities.ResumeEntry.create(entryPayload);
      setEntries([created, ...entries]);
    } catch {
      setEntries([{ ...entryPayload, id: `temp_${Date.now()}` }, ...entries]);
    }

    setGenerating(null);
    toast({ title: "Tailored Resume Bullet Generated!" });
  };

  const handleSaveManual = async () => {
    if (!manualForm.title || !manualForm.organization) {
      toast({ title: "Please fill in title and organization" });
      return;
    }
    setSavingManual(true);
    const newExp = {
      id: `manual_${Date.now()}`,
      user_id: user.id,
      ...manualForm
    };
    try {
      if (base44.entities.ManualExperience) {
        await base44.entities.ManualExperience.create(newExp);
      }
    } catch { /* ignore */ }
    setManualExperiences([newExp, ...manualExperiences]);
    setOpenManualModal(false);
    setManualForm({ title: "", organization: "", category: "Volunteer", dates: "", hours: "", tasks: "" });
    setSavingManual(false);
    toast({ title: "Experience added!" });
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copied to clipboard" });
  };

  const handleEdit = async (entry, newBullet) => {
    setEntries(es => es.map(e => e.id === entry.id ? { ...e, edited_bullet: newBullet } : e));
    try {
      await base44.entities.ResumeEntry.update(entry.id, { edited_bullet: newBullet });
    } catch { /* ignore */ }
  };

  // Delete entry
  const handleDeleteEntry = async (entryId) => {
    if (window.confirm('Delete this resume bullet?')) {
      try {
        await base44.entities.ResumeEntry.delete(entryId);
        setEntries(entries.filter(e => e.id !== entryId));
        toast({ title: 'Bullet removed' });
      } catch (err) {
        console.warn('Delete resume entry error:', err);
        toast({ title: 'Failed to delete', variant: 'destructive' });
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-sage border-t-navy rounded-full animate-spin" /></div>;
  }

  const allAvailableItems = [
    ...manualExperiences.map(m => ({ ...m, isManual: true })),
    ...logs.map(l => ({ ...l, isLog: true }))
  ];

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-navy/5 text-navy mb-2">
            <GraduationCap className="w-3.5 h-3.5" /> Ivy League & College Application Prep
          </span>
          <h1 className="font-heading text-2xl font-bold">Resume Builder</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Transform all your volunteer service, internships, research, and extracurricular experiences into polished, college-ready resume bullet points.
          </p>
        </div>
        <Button onClick={() => setOpenManualModal(true)} className="bg-navy hover:bg-navy/90 text-white rounded-xl text-xs shrink-0">
          <Plus className="w-4 h-4 mr-1.5" /> Add Manual Experience
        </Button>
      </div>

      {/* Strategy box */}
      <div className="bg-gradient-to-br from-sage/10 via-card to-amber/5 rounded-2xl p-6 border border-sage/30 space-y-4">
        <div className="flex items-center gap-2 text-navy">
          <Lightbulb className="w-5 h-5 text-amber shrink-0" />
          <h2 className="font-heading text-base font-bold">Tailored Resume Strategy for {profile?.full_name || "Your Profile"}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-card/80 rounded-xl border border-border/40">
            <span className="font-semibold text-navy block mb-1">Target Admissions Focus</span>
            <p className="text-muted-foreground">
              Tailoring for <strong>{targetColleges.slice(0, 2).join(", ")}</strong>.
            </p>
          </div>
          <div className="p-3 bg-card/80 rounded-xl border border-border/40">
            <span className="font-semibold text-navy block mb-1">Career & Field Alignment</span>
            <p className="text-muted-foreground">
              Highlighting <strong>{userCareer.length ? userCareer.join(" & ") : "STEM & Community Leadership"}</strong> skills.
            </p>
          </div>
          <div className="p-3 bg-card/80 rounded-xl border border-border/40">
            <span className="font-semibold text-navy block mb-1">Grade {userGrade} Action Items</span>
            <p className="text-muted-foreground">
              {userGrade === "12" ? "Finalize Common App activity descriptions." : "Deepen responsibility in 2-3 core extracurriculars."}
            </p>
          </div>
        </div>
        <div className="pt-2 text-xs text-muted-foreground border-t border-border/30 flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5 text-sage" />
          <span><strong>Pro Tip:</strong> Use the Google XYZ formula: <em>"Accomplished [X] as measured by [Y], by doing [Z]."</em></span>
        </div>
      </div>

      {/* Available experiences */}
      {allAvailableItems.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-heading text-base font-semibold flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-navy" /> Available Experiences ({allAvailableItems.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allAvailableItems.map((item, idx) => {
              const title = item.opportunity_title || item.title;
              const org = item.organization_name || item.organization;
              const itemId = item.id || `${title}-${idx}`;
              const hasEntry = entries.some(e => e.opportunity_title === title && e.organization_name === org);

              return (
                <div key={itemId} className="bg-card rounded-2xl p-4 border border-border/50 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">{title}</p>
                      {item.isManual && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-600">Manual</span>}
                      {item.status === "verified" && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald/10 text-emerald">Verified</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{org} · {item.hours ? `${item.hours}h` : "Flexible"} · {item.date || item.dates || "2026"}</p>
                  </div>
                  <Button onClick={() => generateBullet(item)} disabled={generating === itemId} size="sm" className="bg-navy hover:bg-navy/90 text-white rounded-xl text-xs shrink-0">
                    {generating === itemId ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-1" /> {hasEntry ? "Re-Generate" : "Generate Bullet"}</>}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Generated entries */}
      <div className="space-y-3">
        <h2 className="font-heading text-base font-semibold flex items-center gap-2">
          <FileText className="w-4 h-4 text-navy" /> Generated Resume Bullets ({entries.length})
        </h2>
        {entries.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No resume entries generated yet" description="Generate bullets from your experiences above." />
        ) : (
          <div className="space-y-4">
            {entries.map(entry => (
              <div key={entry.id} className="bg-card rounded-2xl p-5 border border-border/50 space-y-2 hover:border-navy/30 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm text-foreground">{entry.opportunity_title}</p>
                    <p className="text-xs text-muted-foreground">{entry.organization_name} · {entry.hours ? `${entry.hours}h` : "Activity"}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => handleCopy(entry.edited_bullet || entry.generated_bullet, entry.id)} className="rounded-xl text-xs">
                      {copiedId === entry.id ? <Check className="w-3.5 h-3.5 mr-1 text-emerald" /> : <Copy className="w-3.5 h-3.5 mr-1 text-muted-foreground" />}
                      {copiedId === entry.id ? "Copied" : "Copy Bullet"}
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground hover:text-destructive" onClick={() => handleDeleteEntry(entry.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <Textarea className="rounded-xl text-xs font-sans mt-2 bg-muted/20 leading-relaxed" value={entry.edited_bullet || entry.generated_bullet} onChange={e => handleEdit(entry, e.target.value)} rows={2} />
                {entry.skills_gained?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {entry.skills_gained.map(s => <span key={s} className="px-2 py-0.5 rounded-md bg-navy/5 text-navy text-[11px] font-medium">{s}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Experience Modal */}
      <Dialog open={openManualModal} onOpenChange={setOpenManualModal}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader><DialogTitle className="font-heading">Add Manual Experience</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2 text-sm">
            <div><Label className="text-xs mb-1 block">Role / Opportunity Title *</Label><Input className="rounded-xl text-xs" value={manualForm.title} onChange={e => setManualForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Independent Research Fellow" /></div>
            <div><Label className="text-xs mb-1 block">Organization *</Label><Input className="rounded-xl text-xs" value={manualForm.organization} onChange={e => setManualForm(f => ({ ...f, organization: e.target.value }))} placeholder="e.g. UMD Lab" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs mb-1 block">Category</Label>
                <Select value={manualForm.category} onValueChange={v => setManualForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger className="rounded-xl text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Volunteer">Volunteer</SelectItem><SelectItem value="Internship">Internship</SelectItem>
                    <SelectItem value="Research">Research</SelectItem><SelectItem value="Leadership">Leadership / Club</SelectItem>
                    <SelectItem value="Work">Work / Employment</SelectItem><SelectItem value="Competition">Competition</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs mb-1 block">Dates / Hours</Label><Input className="rounded-xl text-xs" value={manualForm.dates} onChange={e => setManualForm(f => ({ ...f, dates: e.target.value }))} placeholder="Fall 2025 · 40 hrs" /></div>
            </div>
            <div><Label className="text-xs mb-1 block">Key Accomplishments</Label><Textarea rows={3} className="rounded-xl text-xs" value={manualForm.tasks} onChange={e => setManualForm(f => ({ ...f, tasks: e.target.value }))} placeholder="e.g. Conducted data analysis, mentored 5 juniors" /></div>
            <Button onClick={handleSaveManual} disabled={savingManual} className="w-full bg-navy hover:bg-navy/90 text-white rounded-xl text-xs">{savingManual ? "Saving..." : "Add to Resume Generator"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
