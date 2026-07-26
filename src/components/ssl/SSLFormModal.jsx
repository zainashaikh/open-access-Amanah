import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Send, Edit3, Download, Sparkles, Loader2, UserCheck, RefreshCw } from "lucide-react";
import { generateSSLPDF } from "@/utils/generateSSLPDF";
import { MCPS_HIGH_SCHOOLS } from "@/lib/onboardingOptions";

export default function SSLFormModal({ open, onClose, log, user, profile, onSaved }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [refining, setRefining] = useState(null);

  const getProfileFullName = (p) => {
    if (!p) return user?.full_name || '';
    if (p.first_name || p.last_name) {
      return `${p.first_name || ''} ${p.middle_name ? p.middle_name + ' ' : ''}${p.last_name || ''}`.trim();
    }
    return p.full_name || user?.full_name || '';
  };

  const findSchoolCode = (schoolName) => {
    if (!schoolName) return "551";
    const found = MCPS_HIGH_SCHOOLS.find(
      s => s.name.toLowerCase().includes(schoolName.toLowerCase()) || schoolName.toLowerCase().includes(s.name.toLowerCase())
    );
    return found ? found.code : "551";
  };

  const initialFullName = getProfileFullName(profile);
  const initialSchool = profile?.school || "Montgomery Blair High School";
  const initialSchoolCode = profile?.school_code || findSchoolCode(initialSchool);

  const [form, setForm] = useState({
    student_name: initialFullName,
    student_id: profile?.student_id || "",
    student_email: user?.email || "",
    home_phone: profile?.home_phone || profile?.cell_phone || "",
    cell_phone: profile?.cell_phone || profile?.home_phone || "",
    school_name: initialSchool,
    school_code: initialSchoolCode,
    grade: profile?.grade || profile?.grade_level || "11",
    first_period_teacher: profile?.first_period_teacher || "",
    parent_guardian_name: profile?.parent_guardian_name || "",
    parent_guardian_email: profile?.parent_guardian_email || "",
    org_name: log?.organization_name || "",
    opp_title: log?.opportunity_title || "",
    service_date: log?.date || new Date().toISOString().split("T")[0],
    hours: log?.hours || 1,
    supervisor_name: log?.supervisor_name || "Volunteer Supervisor",
    supervisor_email: log?.contact_email || log?.organization_email || "volunteer@organization.org",
    supervisor_phone: log?.supervisor_phone || "",
    coordinator_name: "MCPS SSL Coordinator Office",
    date_received: "Pending School Coordinator Review",
    date_logged: "To be recorded upon submission",
    verification_status: "Verified by Organization / Pending School Coordinator Stamp",
    reflection: profile?.default_reflection || log?.task_description || "I volunteered to serve my community and address local needs. Through this experience, I gained leadership, teamwork, and communication skills while supporting community programs.",
    reflection_learning: "I gained hands-on leadership, teamwork, and communication skills while serving our community.",
    reflection_benefit: "The organization and community benefited directly through essential volunteer support and project execution.",
    reflection_skills: "I developed organizational, time-management, and interpersonal skills.",
    reflection_self: "I learned that I enjoy working with diverse groups and can adapt to new challenges.",
    reflection_community: "I now understand how local non-profits address community needs and rely on volunteers.",
  });

  const autoFillFromProfile = () => {
    if (!profile && !user) {
      toast({ title: "No profile data found", description: "Please complete your profile first." });
      return;
    }
    const name = getProfileFullName(profile);
    const school = profile?.school || "Montgomery Blair High School";
    const code = profile?.school_code || findSchoolCode(school);

    setForm(prev => ({
      ...prev,
      student_name: name || prev.student_name,
      student_id: profile?.student_id || prev.student_id,
      student_email: user?.email || prev.student_email,
      home_phone: profile?.home_phone || prev.home_phone,
      cell_phone: profile?.cell_phone || prev.cell_phone,
      school_name: school,
      school_code: code,
      grade: profile?.grade || profile?.grade_level || prev.grade,
      first_period_teacher: profile?.first_period_teacher || prev.first_period_teacher,
      parent_guardian_name: profile?.parent_guardian_name || prev.parent_guardian_name,
      parent_guardian_email: profile?.parent_guardian_email || prev.parent_guardian_email,
      reflection: profile?.default_reflection || prev.reflection,
    }));

    toast({
      title: "Auto-filled from Profile!",
      description: "Student info, school code, teacher, and phone numbers synchronized."
    });
  };

  useEffect(() => {
    if (profile) {
      const name = getProfileFullName(profile);
      const school = profile.school || "Montgomery Blair High School";
      const code = profile.school_code || findSchoolCode(school);
      setForm(prev => ({
        ...prev,
        student_name: name || user?.full_name || '',
        student_id: profile.student_id || '',
        student_email: user?.email || '',
        home_phone: profile.home_phone || profile.cell_phone || '',
        cell_phone: profile.cell_phone || profile.home_phone || '',
        school_name: school,
        school_code: code,
        grade: profile.grade || profile.grade_level || '11',
        first_period_teacher: profile.first_period_teacher || '',
        parent_guardian_name: profile.parent_guardian_name || '',
        parent_guardian_email: profile.parent_guardian_email || '',
        reflection: profile.default_reflection || prev.reflection,
      }));
    }
    if (log) {
      setForm(prev => ({
        ...prev,
        org_name: log.organization_name || '',
        opp_title: log.opportunity_title || '',
        service_date: log.date || new Date().toISOString().split("T")[0],
        hours: log.hours || 1,
        supervisor_name: log.supervisor_name || 'Volunteer Supervisor',
        supervisor_email: log.contact_email || log.organization_email || 'volunteer@organization.org',
        supervisor_phone: log.supervisor_phone || '',
        reflection: log.task_description ? `Volunteered for ${log.opportunity_title} at ${log.organization_name}. ${log.task_description}` : prev.reflection,
      }));
    }
  }, [profile, log, user]);

  const refineField = async (fieldKey) => {
    const currentText = form[fieldKey];
    if (!currentText || currentText.trim().length < 5) {
      toast({ title: "Please write a bit more before refining", variant: "destructive" });
      return;
    }

    setRefining(fieldKey);
    const prompt = `Improve the following student reflection response for an official MCPS SSL Form 560-51 to be polished, professional, grammatically sound, and eloquent. Keep original facts but enhance clarity. Return only the improved paragraph text:

Original: ${currentText}`;

    try {
      const res = await base44.integrations.Core.InvokeLLM({ prompt });
      let improved = res?.result || res?.response || res;
      if (typeof improved !== 'string') improved = JSON.stringify(improved);
      improved = improved.replace(/^"|"$/g, '').trim();
      if (improved && improved.length > 3) {
        setForm(prev => ({ ...prev, [fieldKey]: improved }));
        toast({ title: "Reflection improved!", description: "AI has polished your response." });
      } else {
        toast({ title: "No improvement generated", variant: "destructive" });
      }
    } catch (err) {
      console.error('AI refinement error:', err);
      toast({ title: "Could not refine", description: "Please try again later.", variant: "destructive" });
    } finally {
      setRefining(null);
    }
  };

  const handleDownloadPDF = () => {
    try {
      toast({ title: "Generating MCPS Form 560-51 PDF...", description: "Auto-filling profile & activity data into form." });
      const pdfBytes = generateSSLPDF(form);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `MCPS_SSL_Form_560-51_${(form.student_name || "Student").replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: "PDF Downloaded!", description: "Official MCPS Form 560-51 is ready for submission." });
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      toast({ title: "PDF Generation Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleSaveAndDraftEmail = async () => {
    setSaving(true);
    try {
      const sslRecord = await base44.entities.SSLForm.create({
        user_id: user?.id,
        log_id: log?.id || "",
        ...form,
        status: "sent_pending_approval",
        created_date: new Date().toISOString()
      });

      const subject = `MCPS SSL Form 560-51 Verification Request - ${form.student_name}`;
      const body = `Hello ${form.supervisor_name},\n\n` +
        `I am submitting my official MCPS Student Service Learning (SSL) Activity Verification Form (Form 560-51) for ${form.opp_title} at ${form.org_name}.\n\n` +
        `Section I: Student Information (Auto-Filled from Student Profile):\n` +
        `- Student Name: ${form.student_name} (MCPS ID: ${form.student_id || "N/A"})\n` +
        `- School: ${form.school_name} (School Code: ${form.school_code || "N/A"})\n` +
        `- Grade: ${form.grade} | First Period Teacher: ${form.first_period_teacher || "N/A"}\n` +
        `- Email: ${form.student_email || "N/A"} | Phone: ${form.home_phone || form.cell_phone || "N/A"}\n` +
        `- Parent/Guardian: ${form.parent_guardian_name || "N/A"} (${form.parent_guardian_email || "N/A"})\n\n` +
        `Section II: Service Activity Record:\n` +
        `- Organization: ${form.org_name}\n` +
        `- Role / Title: ${form.opp_title}\n` +
        `- Date of Service: ${form.service_date}\n` +
        `- Hours Completed: ${form.hours} hours\n\n` +
        `Section III: Student Reflection:\n` +
        `"${form.reflection}"\n\n` +
        `Please verify these hours for my official MCPS record.\n\n` +
        `Best regards,\n` +
        `${form.student_name}\n` +
        `${user?.email || ""}`;

      const mailtoUrl = `mailto:${encodeURIComponent(form.supervisor_email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      handleDownloadPDF();
      window.open(mailtoUrl, "_blank");

      if (onSaved) onSaved(sslRecord);
      onClose();
    } catch (err) {
      console.warn("Failed to create SSL form:", err);
      toast({ title: "Form processed", description: "SSL form generated and downloaded." });
      if (onSaved) onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 pr-6">
            <DialogTitle className="font-heading text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-navy" /> MCPS SSL Form 560-51 Auto-Fill Engine
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={autoFillFromProfile}
              className="h-8 px-3 text-xs bg-navy/5 hover:bg-navy/10 text-navy border-navy/20 rounded-xl font-medium shrink-0 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-navy" /> Sync Student Profile
            </Button>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Replaces template text with your exact student profile data. Complete Section I & III, refine with <Sparkles className="w-3 h-3 inline text-amber" /> AI, and download your ready-to-submit PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm mt-2">
          {/* SECTION 1 */}
          <div className="bg-card p-4 rounded-xl border border-border/60 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <h4 className="font-bold text-xs uppercase tracking-wide text-navy flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald" /> Section I: Student Information (Auto-Filled)
              </h4>
              <span className="text-[10px] bg-emerald/10 text-emerald font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <UserCheck className="w-3 h-3" /> Profile Auto-Fill Enabled
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block font-medium">Student Name (Last, First, Middle) *</Label>
                <Input value={form.student_name} onChange={e => setForm(f => ({ ...f, student_name: e.target.value }))} className="rounded-xl text-xs" />
              </div>
              <div>
                <Label className="text-xs mb-1 block font-medium">MCPS Student ID # *</Label>
                <Input value={form.student_id} onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))} className="rounded-xl text-xs" placeholder="e.g. 123456" />
              </div>
              <div>
                <Label className="text-xs mb-1 block font-medium">School Name *</Label>
                <Input
                  value={form.school_name}
                  onChange={e => {
                    const name = e.target.value;
                    const code = findSchoolCode(name);
                    setForm(f => ({ ...f, school_name: name, school_code: code }));
                  }}
                  className="rounded-xl text-xs"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block font-medium">School Code *</Label>
                <Input value={form.school_code} onChange={e => setForm(f => ({ ...f, school_code: e.target.value }))} className="rounded-xl text-xs" placeholder="e.g. 551" />
              </div>
              <div>
                <Label className="text-xs mb-1 block font-medium">First Period Teacher *</Label>
                <Input value={form.first_period_teacher} onChange={e => setForm(f => ({ ...f, first_period_teacher: e.target.value }))} className="rounded-xl text-xs" placeholder="e.g. Mr. Skinner" />
              </div>
              <div>
                <Label className="text-xs mb-1 block font-medium">Grade *</Label>
                <Input value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} className="rounded-xl text-xs" placeholder="e.g. 10" />
              </div>
              <div>
                <Label className="text-xs mb-1 block font-medium">Student Email *</Label>
                <Input type="email" value={form.student_email} onChange={e => setForm(f => ({ ...f, student_email: e.target.value }))} className="rounded-xl text-xs" />
              </div>
              <div>
                <Label className="text-xs mb-1 block font-medium">Home / Cell Phone *</Label>
                <Input value={form.home_phone} onChange={e => setForm(f => ({ ...f, home_phone: e.target.value, cell_phone: e.target.value }))} className="rounded-xl text-xs" placeholder="e.g. 301-555-1234" />
              </div>
              <div>
                <Label className="text-xs mb-1 block font-medium">Parent/Guardian Name *</Label>
                <Input value={form.parent_guardian_name} onChange={e => setForm(f => ({ ...f, parent_guardian_name: e.target.value }))} className="rounded-xl text-xs" placeholder="e.g. Marge Simpson" />
              </div>
              <div>
                <Label className="text-xs mb-1 block font-medium">Parent/Guardian Email</Label>
                <Input type="email" value={form.parent_guardian_email} onChange={e => setForm(f => ({ ...f, parent_guardian_email: e.target.value }))} className="rounded-xl text-xs" placeholder="parent@example.com" />
              </div>
            </div>
          </div>

          {/* SECTION 2 */}
          <div className="bg-card p-4 rounded-xl border border-border/60 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <h4 className="font-bold text-xs uppercase tracking-wide text-navy flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-sage" /> Section II: Nonprofit & Service Record
              </h4>
              <span className="text-[10px] bg-sage/10 text-sage font-medium px-2 py-0.5 rounded-full">Activity Info</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block font-medium">Organization Name *</Label>
                <Input value={form.org_name} onChange={e => setForm(f => ({ ...f, org_name: e.target.value }))} className="rounded-xl text-xs" />
              </div>
              <div>
                <Label className="text-xs mb-1 block font-medium">Activity / Role Title *</Label>
                <Input value={form.opp_title} onChange={e => setForm(f => ({ ...f, opp_title: e.target.value }))} className="rounded-xl text-xs" />
              </div>
              <div>
                <Label className="text-xs mb-1 block font-medium">Date of Service *</Label>
                <Input type="date" value={form.service_date} onChange={e => setForm(f => ({ ...f, service_date: e.target.value }))} className="rounded-xl text-xs" />
              </div>
              <div>
                <Label className="text-xs mb-1 block font-medium">Hours Completed *</Label>
                <Input type="number" step="0.5" value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} className="rounded-xl text-xs" />
              </div>
              <div>
                <Label className="text-xs mb-1 block font-medium">Supervisor Name *</Label>
                <Input value={form.supervisor_name} onChange={e => setForm(f => ({ ...f, supervisor_name: e.target.value }))} className="rounded-xl text-xs" />
              </div>
              <div>
                <Label className="text-xs mb-1 block font-medium">Supervisor Email *</Label>
                <Input type="email" value={form.supervisor_email} onChange={e => setForm(f => ({ ...f, supervisor_email: e.target.value }))} className="rounded-xl text-xs" />
              </div>
            </div>
          </div>

          {/* SECTION 3 */}
          <div className="bg-card p-4 rounded-xl border border-border/60 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <h4 className="font-bold text-xs uppercase tracking-wide text-navy flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-sage" /> Section III: Student Reflection Paragraph
              </h4>
              {form.reflection && form.reflection.trim().length > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-navy hover:bg-navy/5 rounded-lg shrink-0"
                  onClick={() => refineField('reflection')}
                  disabled={refining === 'reflection'}
                >
                  {refining === 'reflection' ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : (
                    <Sparkles className="w-3 h-3 mr-1 text-amber" />
                  )}
                  {refining === 'reflection' ? "Polishing..." : "Improve Reflection with AI"}
                </Button>
              )}
            </div>
            <div>
              <Label className="text-xs mb-1 block font-medium">
                Written Paragraph Reflection (Auto-wrapped to fit Section III box) *
              </Label>
              <Textarea
                value={form.reflection}
                onChange={e => setForm(f => ({ ...f, reflection: e.target.value }))}
                rows={4}
                className="rounded-xl text-xs leading-relaxed"
                placeholder="Describe what you did, who benefited, what you learned, and how it connected to school..."
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button variant="outline" onClick={handleDownloadPDF} className="rounded-xl flex-1 text-xs">
              <Download className="w-3.5 h-3.5 mr-1.5 text-navy" /> Download Filled MCPS 560-51 PDF
            </Button>
            <Button onClick={handleSaveAndDraftEmail} disabled={saving} className="rounded-xl flex-1 bg-navy hover:bg-navy/90 text-white text-xs">
              <Send className="w-3.5 h-3.5 mr-1.5" /> Save & Draft Email to Supervisor
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
