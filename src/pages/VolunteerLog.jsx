import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import EmptyState from "@/components/ui/EmptyState";
import { Plus, Clock, ClipboardList, Trash2, Award, Calendar, Copy, FileText } from "lucide-react";
import SSLFormModal from "@/components/ssl/SSLFormModal";

export default function VolunteerLog() {
  const { user, profile } = useOutletContext();
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedLogForSSL, setSelectedLogForSSL] = useState(null);
  const [form, setForm] = useState({ opportunity_title: "", organization_name: "", date: "", hours: "", task_description: "", notes: "", contact_email: "" });

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    base44.entities.VolunteerLog.filter({ user_id: user.id }, "-created_date")
      .then(l => setLogs(l || []))
      .catch(err => {
        console.warn("Failed to fetch volunteer logs:", err);
        setLogs([]);
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  const total = logs.reduce((s, l) => s + (l.hours || 0), 0);
  const now = new Date();
  const thisMonth = logs.filter(l => {
    if (!l.date) return false;
    const d = new Date(l.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, l) => s + (l.hours || 0), 0);

  const badges = [];
  if (total >= 25) badges.push("25 Hour Club");
  if (total >= 50) badges.push("50 Hour Scholar");
  if (total >= 75) badges.push("75 Hour Leader");
  if (total >= 100) badges.push("100 Hour Champion");

  const handleDelete = async (log) => {
    await base44.entities.VolunteerLog.delete(log.id);
    setLogs(logs.filter(l => l.id !== log.id));
    toast({ title: "Entry deleted" });
  };

  const handleCopyBullet = (log) => {
    const bullet = `• ${log.task_description ? log.task_description + " — " : ""}${log.organization_name} (${log.date}); ${log.hours} hours.`;
    if (navigator.clipboard) navigator.clipboard.writeText(bullet);
    toast({ title: "Resume bullet copied", description: "Paste it into your resume or the Resume Builder." });
  };

  const handleSubmit = async () => {
    if (!form.opportunity_title || !form.organization_name || !form.date || !form.hours) return;
    setSaving(true);
    const log = await base44.entities.VolunteerLog.create({
      ...form,
      hours: parseFloat(form.hours),
      user_id: user.id,
      status: "verified" // Immediately verified & counted
    });
    setLogs([log, ...logs]);
    setForm({ opportunity_title: "", organization_name: "", date: "", hours: "", task_description: "", notes: "", contact_email: "" });
    setOpen(false);
    setSaving(false);
    toast({ title: "Hours logged!", description: `${log.hours}h added immediately to your record.` });
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-sage border-t-navy rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">My Hours</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Log service hours immediately and generate official MCPS SSL 560-51 verification forms.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-navy hover:bg-navy/90 text-white rounded-xl">
              <Plus className="w-4 h-4 mr-1.5" /> Log Hours
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle className="font-heading">Log Volunteer Hours</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-sm mb-1 block">Opportunity Name *</Label>
                <Input className="rounded-xl" value={form.opportunity_title} onChange={e => setForm(f => ({ ...f, opportunity_title: e.target.value }))} placeholder="e.g. ADAMS Weekend School Tutoring" />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Organization *</Label>
                <Input className="rounded-xl" value={form.organization_name} onChange={e => setForm(f => ({ ...f, organization_name: e.target.value }))} placeholder="e.g. ADAMS Center Sterling" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm mb-1 block">Date *</Label>
                  <Input type="date" className="rounded-xl" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-sm mb-1 block">Hours *</Label>
                  <Input type="number" step="0.5" min="0.5" className="rounded-xl" value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} placeholder="e.g. 3" />
                </div>
              </div>
              <div>
                <Label className="text-sm mb-1 block">Supervisor / Organization Email</Label>
                <Input type="email" className="rounded-xl" value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} placeholder="e.g. volunteer@adamscenter.org" />
              </div>
              <div>
                <Label className="text-sm mb-1 block">What did you do?</Label>
                <Textarea className="rounded-xl" value={form.task_description} onChange={e => setForm(f => ({ ...f, task_description: e.target.value }))} placeholder="Brief description of your tasks" rows={3} />
              </div>
              <Button onClick={handleSubmit} disabled={saving} className="w-full bg-navy hover:bg-navy/90 text-white rounded-xl">
                {saving ? "Saving..." : "Log Hours Immediately"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-card rounded-2xl p-4 border border-border/50 text-center">
          <Clock className="w-5 h-5 text-navy mx-auto mb-1" />
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-xs text-muted-foreground">Total Service Hours</p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border/50 text-center">
          <Calendar className="w-5 h-5 text-sage mx-auto mb-1" />
          <p className="text-2xl font-bold">{thisMonth}</p>
          <p className="text-xs text-muted-foreground">This Month</p>
        </div>
      </div>

      {badges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Award className="w-4 h-4 text-amber" />
          {badges.map(b => (
            <span key={b} className="text-xs px-2.5 py-1 rounded-full bg-amber/10 text-amber font-medium">{b}</span>
          ))}
        </div>
      )}

      {logs.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No hours logged yet" description="Start tracking your volunteer service by logging your first hours." />
      ) : (
        <div className="space-y-3">
          {logs.map(log => (
            <div key={log.id} className="bg-card rounded-2xl p-4 border border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">{log.opportunity_title}</p>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald/10 text-emerald">Verified</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{log.organization_name} · {log.date}</p>
                  {log.task_description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{log.task_description}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-navy px-2 py-1 bg-navy/5 rounded-lg">{log.hours}h</span>
                  <Button
                    size="sm"
                    className="bg-navy hover:bg-navy/90 text-white rounded-xl text-xs"
                    onClick={() => setSelectedLogForSSL(log)}
                  >
                    <FileText className="w-3.5 h-3.5 mr-1" /> Create SSL Form
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-navy" title="Copy resume bullet" onClick={() => handleCopyBullet(log)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" title="Delete" onClick={() => handleDelete(log)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedLogForSSL && (
        <SSLFormModal
          open={!!selectedLogForSSL}
          onClose={() => setSelectedLogForSSL(null)}
          log={selectedLogForSSL}
          user={user}
          profile={profile}
          onSaved={() => {
            setSelectedLogForSSL(null);
            toast({ title: "SSL Form Created!", description: "View in 'Sent & Received SSL Hours'." });
          }}
        />
      )}
    </div>
  );
}
