import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Image } from "@/components/ui/image";
import TagPicker from "@/components/onboarding/TagPicker";
import OtherSelect from "@/components/onboarding/OtherSelect";
import { Save, Upload, Users, UserCheck, GraduationCap, AlertTriangle, Trash2 } from "lucide-react";
import {
  EDUCATION_STATUSES, GRADE_OPTIONS, YEAR_OPTIONS, SKILLS, INTERESTS,
  CAREER_INTERESTS, FIELDS_OF_STUDY, INTERNSHIP_INTERESTS,
} from "@/lib/onboardingOptions";
import { canDo } from "@/lib/rateLimit";

const TARGET_COLLEGES_OPTIONS = [
  "University of Maryland - College Park",
  "Georgetown University",
  "Johns Hopkins University",
  "George Washington University",
  "Howard University",
  "George Mason University",
  "University of Virginia",
  "Virginia Tech",
  "UMBC",
  "Towson University",
  "American University",
  "University of Maryland Global Campus"
];

export default function Profile() {
  const { user, profile, setProfile } = useOutletContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    full_name: profile?.full_name || user?.full_name || "",
    first_name: profile?.first_name || "",
    middle_name: profile?.middle_name || "",
    last_name: profile?.last_name || "",
    description: profile?.description || "",
    education_status: profile?.education_status || "high_school",
    grade_level: profile?.grade_level || "",
    grade: profile?.grade || "",
    school: profile?.school || "",
    school_code: profile?.school_code || "",
    student_id: profile?.student_id || "",
    first_period_teacher: profile?.first_period_teacher || "",
    parent_guardian_name: profile?.parent_guardian_name || "",
    parent_guardian_email: profile?.parent_guardian_email || "",
    home_phone: profile?.home_phone || "",
    cell_phone: profile?.cell_phone || "",
    default_reflection: profile?.default_reflection || "",
    zip_code: profile?.zip_code || "",
    travel_radius: profile?.travel_radius || 10,
    skills: profile?.skills || [],
    interests: profile?.interests || [],
    career_interests: profile?.career_interests || [],
    field_of_study: profile?.field_of_study || "",
    internship_interests: profile?.internship_interests || [],
    target_colleges: profile?.target_colleges || [
      "University of Maryland - College Park",
      "Georgetown University",
      "Johns Hopkins University"
    ],
    availability_days: profile?.availability_days || [],
    availability_times: profile?.availability_times || [],
    remote_only: profile?.remote_only || false,
    ssl_only: profile?.ssl_only || false,
    safety_preferences: profile?.safety_preferences || [],
    other_details: profile?.other_details || "",
    photo_url: profile?.photo_url || "",
    allow_messages: profile?.allow_messages || false,
    discoverable: profile?.discoverable || false,
  });

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [f1, f2] = await Promise.all([
          base44.entities.Follow.filter({ following_id: user?.id }).catch(() => []),
          base44.entities.Follow.filter({ follower_id: user?.id }).catch(() => []),
        ]);
        setFollowers((f1 || []).length);
        setFollowing((f2 || []).length);
      } catch (err) {
        console.warn("Failed to load follow counts:", err);
      }
    };
    if (user?.id) loadCounts();
  }, [user?.id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      set("photo_url", file_url);
    } catch { /* ignore */ }
    setUploading(false);
  };

  const handleSave = async () => {
    const rl = canDo("profile");
    if (!rl.ok) {
      toast({ title: "Please wait a moment", description: `Try again in ${rl.wait}s.`, variant: "destructive" });
      return;
    }
    setSaving(true);
    const fullName = `${form.first_name} ${form.middle_name ? form.middle_name + ' ' : ''}${form.last_name}`.trim();
    if (fullName && fullName !== user?.full_name) {
      try { await base44.auth.updateMe({ full_name: fullName }); } catch { /* ignore */ }
    }
    const updated = await base44.entities.Profile.update(profile.id, { ...form, full_name: fullName });
    setProfile(updated);
    setSaving(false);
    toast({ title: "Profile updated!" });
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      if (profile?.id) {
        await base44.entities.Profile.delete(profile.id).catch(() => {});
      }
      localStorage.clear();
      await base44.auth.logout("/");
      toast({ title: "Account deleted", description: "Your profile has been cleared. You can register anytime as a fresh new user." });
      navigate("/register");
    } catch (err) {
      console.warn("Account deletion error:", err);
      localStorage.clear();
      navigate("/register");
    } finally {
      setDeleting(false);
    }
  };

  const gradeOptions = form.education_status === "high_school" ? GRADE_OPTIONS : YEAR_OPTIONS;
  const schoolLabel = form.education_status === "high_school" ? "School" : "College / University";

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-heading text-2xl font-bold mb-6">Your Profile</h1>

      {/* Public preview */}
      <div className="bg-card rounded-2xl p-6 border border-border/50 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-navy/5 flex items-center justify-center shrink-0">
            {form.photo_url ? <Image src={form.photo_url} fittingType="fill" className="w-full h-full" alt="Profile" /> : <span className="text-navy font-heading text-xl">{(form.first_name || "S")[0]}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{form.first_name} {form.last_name}</p>
            <p className="text-sm text-muted-foreground truncate">{form.description || "Add a short description"}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {followers} followers</span>
              <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" /> {following} friends</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground">{form.discoverable ? "Visible" : "Hidden"}</span>
            <Switch checked={form.discoverable} onCheckedChange={(v) => set("discoverable", v)} />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 border border-border/50 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-muted flex items-center justify-center shrink-0">
            {form.photo_url ? <Image src={form.photo_url} fittingType="fill" className="w-full h-full" alt="Profile" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
          </div>
          <label className="cursor-pointer">
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted text-sm font-medium hover:bg-muted/80">
              <Upload className="w-4 h-4" /> {uploading ? "Uploading…" : "Change photo"}
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} disabled={uploading} />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label className="text-sm font-medium mb-1 block">First Name</Label>
            <Input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} className="rounded-xl" />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1 block">Middle Name</Label>
            <Input value={form.middle_name} onChange={(e) => set("middle_name", e.target.value)} className="rounded-xl" />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1 block">Last Name</Label>
            <Input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} className="rounded-xl" />
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium mb-1 block">Short description</Label>
          <Textarea rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} className="rounded-xl" placeholder="A short bio about yourself" />
        </div>

        {/* MCPS SSL Verification Information */}
        <div className="bg-card p-4 rounded-xl border border-navy/20 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-border/40">
            <h3 className="text-xs font-bold uppercase text-navy tracking-wide flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-emerald" /> MCPS Form 560-51 Auto-Fill Student Details
            </h3>
            <span className="text-[10px] bg-emerald/10 text-emerald font-semibold px-2 py-0.5 rounded-full">
              Used in SSL Form Auto-Fill
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium mb-1 block">MCPS Student ID #</Label>
              <Input value={form.student_id} onChange={(e) => set("student_id", e.target.value)} className="rounded-xl text-xs" placeholder="e.g. 123456" />
            </div>
            <div>
              <Label className="text-xs font-medium mb-1 block">School Code #</Label>
              <Input value={form.school_code} onChange={(e) => set("school_code", e.target.value)} className="rounded-xl text-xs" placeholder="e.g. 551" />
            </div>
            <div>
              <Label className="text-xs font-medium mb-1 block">First Period Teacher</Label>
              <Input value={form.first_period_teacher} onChange={(e) => set("first_period_teacher", e.target.value)} className="rounded-xl text-xs" placeholder="e.g. Mr. Skinner" />
            </div>
            <div>
              <Label className="text-xs font-medium mb-1 block">Grade</Label>
              <Input value={form.grade} onChange={(e) => set("grade", e.target.value)} className="rounded-xl text-xs" placeholder="e.g. 10" />
            </div>
            <div>
              <Label className="text-xs font-medium mb-1 block">Parent/Guardian Name</Label>
              <Input value={form.parent_guardian_name} onChange={(e) => set("parent_guardian_name", e.target.value)} className="rounded-xl text-xs" placeholder="e.g. Marge Simpson" />
            </div>
            <div>
              <Label className="text-xs font-medium mb-1 block">Parent/Guardian Email</Label>
              <Input value={form.parent_guardian_email} onChange={(e) => set("parent_guardian_email", e.target.value)} className="rounded-xl text-xs" placeholder="parent@example.com" />
            </div>
            <div>
              <Label className="text-xs font-medium mb-1 block">Home Phone</Label>
              <Input value={form.home_phone} onChange={(e) => set("home_phone", e.target.value)} className="rounded-xl text-xs" placeholder="e.g. 301-555-1234" />
            </div>
            <div>
              <Label className="text-xs font-medium mb-1 block">Cell / Other Phone</Label>
              <Input value={form.cell_phone} onChange={(e) => set("cell_phone", e.target.value)} className="rounded-xl text-xs" placeholder="e.g. 301-555-9876" />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium mb-1 block">Default Service Reflection Paragraph</Label>
            <Textarea
              rows={3}
              value={form.default_reflection}
              onChange={(e) => set("default_reflection", e.target.value)}
              className="rounded-xl text-xs leading-relaxed"
              placeholder="e.g. I volunteered at the local food bank, sorting and packing groceries for families in need..."
            />
          </div>
        </div>

        {/* Target Colleges Section */}
        <div className="bg-sage/10 p-4 rounded-xl border border-sage/30 space-y-2">
          <Label className="text-sm font-semibold text-navy flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-sage" /> Colleges & Universities Interested in Attending
          </Label>
          <p className="text-xs text-muted-foreground">
            We tailor your recommended extracurriculars and volunteer opportunities based on what your target colleges value in applicants.
          </p>
          <TagPicker options={TARGET_COLLEGES_OPTIONS} value={form.target_colleges} onChange={(v) => set("target_colleges", v)} size="sm" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-1 block">Education Status</Label>
            <OtherSelect options={EDUCATION_STATUSES} value={form.education_status} onChange={(v) => set("education_status", v)} />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1 block">Grade / Year</Label>
            <OtherSelect options={gradeOptions} value={form.grade_level} onChange={(v) => set("grade_level", v)} placeholder="Select" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-1 block">{schoolLabel}</Label>
            <Input value={form.school} onChange={(e) => set("school", e.target.value)} className="rounded-xl" />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1 block">ZIP Code</Label>
            <Input value={form.zip_code} onChange={(e) => set("zip_code", e.target.value)} className="rounded-xl" />
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Skills</Label>
          <TagPicker options={SKILLS} value={form.skills} onChange={(v) => set("skills", v)} size="sm" />
        </div>
        <div>
          <Label className="text-sm font-medium mb-2 block">Interests</Label>
          <TagPicker options={INTERESTS} value={form.interests} onChange={(v) => set("interests", v)} size="sm" />
        </div>
        <div>
          <Label className="text-sm font-medium mb-2 block">Career Interests</Label>
          <TagPicker options={CAREER_INTERESTS} value={form.career_interests} onChange={(v) => set("career_interests", v)} size="sm" />
        </div>
        <div>
          <Label className="text-sm font-medium mb-2 block">Field of Study</Label>
          <OtherSelect options={FIELDS_OF_STUDY} value={form.field_of_study} onChange={(v) => set("field_of_study", v)} placeholder="Select your field" />
        </div>
        <div>
          <Label className="text-sm font-medium mb-2 block">Internship Interests</Label>
          <TagPicker options={INTERNSHIP_INTERESTS} value={form.internship_interests} onChange={(v) => set("internship_interests", v)} size="sm" />
        </div>

        <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
          <div>
            <span className="text-sm font-medium">Allow direct messages</span>
            <p className="text-xs text-muted-foreground mt-0.5">Let other students start private conversations with you.</p>
          </div>
          <Switch checked={form.allow_messages} onCheckedChange={(v) => set("allow_messages", v)} />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full bg-navy hover:bg-navy/90 text-white rounded-xl">
          <Save className="w-4 h-4 mr-1.5" /> {saving ? "Saving…" : "Save Profile"}
        </Button>

        {/* Danger Zone: Account Deletion */}
        <div className="border-t border-destructive/20 pt-6 mt-8 space-y-3">
          <h3 className="font-heading text-sm font-bold text-destructive flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Danger Zone: Delete Account
          </h3>
          <p className="text-xs text-muted-foreground">
            Permanently delete your profile and account settings. You will be able to register anytime with a fresh account using the same email or Google login.
          </p>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)} className="rounded-xl text-xs">
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete Account
          </Button>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Are you sure you want to delete your account?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              This will remove your current profile and clear local session state. You can sign up again anytime with the same email as a fresh new account without any restrictions.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting} className="rounded-xl">
              {deleting ? "Deleting..." : "Permanently Delete Account"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}