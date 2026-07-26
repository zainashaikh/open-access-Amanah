import React, { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { base44 } from "@/api/base44Client";
import { ChevronRight, ChevronLeft, Check, Upload, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TagPicker from "@/components/onboarding/TagPicker";
import OtherSelect from "@/components/onboarding/OtherSelect";
import { Image } from "@/components/ui/image";
import {
  EDUCATION_STATUSES, GRADE_OPTIONS, YEAR_OPTIONS, TARGET_COLLEGES, SKILLS, INTERESTS,
  CAREER_INTERESTS, FIELDS_OF_STUDY, INTERNSHIP_INTERESTS, DAYS, TIMES, SAFETY,
} from "@/lib/onboardingOptions";
import { canDo } from "@/lib/rateLimit";

export default function Onboarding() {
  const { user, profile, setProfile } = useOutletContext();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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
    student_id: profile?.student_id || "",
    first_period_teacher: profile?.first_period_teacher || "",
    parent_guardian_name: profile?.parent_guardian_name || "",
    parent_guardian_email: profile?.parent_guardian_email || "",
    home_phone: profile?.home_phone || "",
    cell_phone: profile?.cell_phone || "",
    target_colleges: profile?.target_colleges || [],
    zip_code: profile?.zip_code || "",
    travel_radius: profile?.travel_radius || 10,
    skills: profile?.skills || [],
    interests: profile?.interests || [],
    career_interests: profile?.career_interests || [],
    field_of_study: profile?.field_of_study || "",
    internship_interests: profile?.internship_interests || [],
    availability_days: profile?.availability_days || [],
    availability_times: profile?.availability_times || [],
    remote_only: profile?.remote_only || false,
    ssl_only: profile?.ssl_only || false,
    safety_preferences: profile?.safety_preferences || [],
    other_details: profile?.other_details || "",
    photo_url: profile?.photo_url || "",
    discoverable: profile?.discoverable || false,
  });

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

  const gradeOptions = form.education_status === "high_school" ? GRADE_OPTIONS : YEAR_OPTIONS;
  const schoolLabel = form.education_status === "high_school" ? "School" : "College / University";

  const steps = [
    {
      title: "About You",
      subtitle: "Tell us about yourself so we can match you with the right opportunities.",
      content: (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium mb-2 block">First Name</Label>
              <Input className="rounded-xl h-11" value={form.first_name} onChange={(e) => set("first_name", e.target.value)} placeholder="First name" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Middle Name (optional)</Label>
              <Input className="rounded-xl h-11" value={form.middle_name} onChange={(e) => set("middle_name", e.target.value)} placeholder="Middle name" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Last Name</Label>
              <Input className="rounded-xl h-11" value={form.last_name} onChange={(e) => set("last_name", e.target.value)} placeholder="Last name" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Student ID</Label>
              <Input className="rounded-xl h-11" value={form.student_id} onChange={(e) => set("student_id", e.target.value)} placeholder="e.g. 123456" />
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">School</Label>
            <Input className="rounded-xl h-11" value={form.school} onChange={(e) => set("school", e.target.value)} placeholder="e.g. Montgomery Blair High School" />
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">First Period Teacher</Label>
            <Input className="rounded-xl h-11" value={form.first_period_teacher} onChange={(e) => set("first_period_teacher", e.target.value)} placeholder="e.g. Ms. Johnson" />
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">Grade</Label>
            <Input className="rounded-xl h-11" value={form.grade} onChange={(e) => set("grade", e.target.value)} placeholder="e.g. 11" />
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">Parent/Guardian Name</Label>
            <Input className="rounded-xl h-11" value={form.parent_guardian_name} onChange={(e) => set("parent_guardian_name", e.target.value)} placeholder="e.g. Fatima Khan" />
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">Parent/Guardian Email</Label>
            <Input className="rounded-xl h-11" value={form.parent_guardian_email} onChange={(e) => set("parent_guardian_email", e.target.value)} placeholder="parent@example.com" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium mb-2 block">Home Phone</Label>
              <Input className="rounded-xl h-11" value={form.home_phone} onChange={(e) => set("home_phone", e.target.value)} placeholder="(301) 555-1234" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Cell Phone</Label>
              <Input className="rounded-xl h-11" value={form.cell_phone} onChange={(e) => set("cell_phone", e.target.value)} placeholder="(240) 555-5678" />
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">A short description about yourself</Label>
            <Textarea className="rounded-xl" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="e.g. I'm a junior passionate about health and mentoring younger students." />
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">Education Status</Label>
            <OtherSelect options={EDUCATION_STATUSES} value={form.education_status} onChange={(v) => set("education_status", v)} placeholder="Select" />
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">Grade / Year</Label>
            <OtherSelect options={gradeOptions} value={form.grade_level} onChange={(v) => set("grade_level", v)} placeholder="Select" />
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">ZIP Code</Label>
            <Input className="rounded-xl h-11" value={form.zip_code} onChange={(e) => set("zip_code", e.target.value)} placeholder="e.g. 20878" />
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">Travel Radius (miles): {form.travel_radius}</Label>
            <input type="range" min="1" max="50" value={form.travel_radius} onChange={(e) => set("travel_radius", parseInt(e.target.value))} className="w-full accent-navy" />
          </div>
        </div>
      ),
      valid: !!form.first_name && !!form.last_name && !!form.zip_code,
    },
    {
      title: "Target Colleges of Interest",
      subtitle: "Select colleges you are interested in applying to. We will tailor extracurricular and resume guidance to their admissions expectations.",
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-navy/5 rounded-xl text-xs text-navy font-medium">
            <GraduationCap className="w-4 h-4 text-navy shrink-0" />
            <span>Select Ivy League, DMV, or national universities you plan to target.</span>
          </div>
          <TagPicker options={TARGET_COLLEGES} value={form.target_colleges} onChange={(v) => set("target_colleges", v)} />
        </div>
      ),
      valid: true,
    },
    {
      title: "Your Skills",
      subtitle: "Select skills you'd like to use while volunteering.",
      content: <TagPicker options={SKILLS} value={form.skills} onChange={(v) => set("skills", v)} />,
      valid: form.skills.length > 0,
    },
    {
      title: "Your Interests",
      subtitle: "What causes are you passionate about?",
      content: <TagPicker options={INTERESTS} value={form.interests} onChange={(v) => set("interests", v)} />,
      valid: form.interests.length > 0,
    },
    {
      title: "Career & Study",
      subtitle: "Tell us your career interests, field of study, and internship interests.",
      content: (
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium mb-2 block">Career Interests</Label>
            <TagPicker options={CAREER_INTERESTS} value={form.career_interests} onChange={(v) => set("career_interests", v)} />
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">Field of Study</Label>
            <OtherSelect options={FIELDS_OF_STUDY} value={form.field_of_study} onChange={(v) => set("field_of_study", v)} placeholder="Select your field" />
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">Internship Interests</Label>
            <TagPicker options={INTERNSHIP_INTERESTS} value={form.internship_interests} onChange={(v) => set("internship_interests", v)} />
          </div>
        </div>
      ),
      valid: form.career_interests.length > 0,
    },
    {
      title: "Availability & Preferences",
      subtitle: "When are you free, and what are your preferences?",
      content: (
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium mb-2 block">Days Available</Label>
            <TagPicker options={DAYS} value={form.availability_days} onChange={(v) => set("availability_days", v)} />
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">Times Available</Label>
            <TagPicker options={TIMES} value={form.availability_times} onChange={(v) => set("availability_times", v)} />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
              <span className="text-sm font-medium">Remote only</span>
              <Switch checked={form.remote_only} onCheckedChange={(v) => set("remote_only", v)} />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
              <span className="text-sm font-medium">SSL-approved only</span>
              <Switch checked={form.ssl_only} onCheckedChange={(v) => set("ssl_only", v)} />
            </div>
          </div>
        </div>
      ),
      valid: form.availability_days.length > 0,
    },
    {
      title: "Safety Preferences",
      subtitle: "Select any filters that matter to you. All are optional.",
      content: <TagPicker options={SAFETY} value={form.safety_preferences} onChange={(v) => set("safety_preferences", v)} />,
      valid: true,
    },
    {
      title: "Profile Extras",
      subtitle: "Add anything else you'd like shown on your profile, and a photo if you'd like.",
      content: (
        <div className="space-y-5">
          <div>
            <Label className="text-sm font-medium mb-2 block">Other things to include on my profile</Label>
            <Textarea className="rounded-xl" rows={4} value={form.other_details} onChange={(e) => set("other_details", e.target.value)} placeholder="Languages spoken, certifications, awards, hobbies — anything you'd like others to see." />
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">Profile Photo (optional)</Label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted flex items-center justify-center shrink-0">
                {form.photo_url ? <Image src={form.photo_url} fittingType="fill" className="w-full h-full" alt="Profile" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
              </div>
              <label className="cursor-pointer">
                <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted text-sm font-medium hover:bg-muted/80">
                  <Upload className="w-4 h-4" /> {uploading ? "Uploading…" : "Upload photo"}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} disabled={uploading} />
              </label>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
            <div>
              <span className="text-sm font-medium">Show me in Community</span>
              <p className="text-xs text-muted-foreground mt-0.5">Others can see your profile. No contact info is ever shared.</p>
            </div>
            <Switch checked={form.discoverable} onCheckedChange={(v) => set("discoverable", v)} />
          </div>
        </div>
      ),
      valid: true,
    },
  ];

  const handleFinish = async () => {
    const rl = canDo("profile");
    if (!rl.ok) return;
    setSaving(true);
    const fullName = `${form.first_name} ${form.middle_name ? form.middle_name + ' ' : ''}${form.last_name}`.trim();
    if (fullName && fullName !== user?.full_name) {
      try { await base44.auth.updateMe({ full_name: fullName }); } catch { /* ignore */ }
    }
    const updated = await base44.entities.Profile.update(profile.id, { 
      ...form, 
      full_name: fullName, 
      onboarding_complete: true 
    });
    setProfile(updated);
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="max-w-lg mx-auto py-8">
      <div className="flex gap-1.5 mb-8">
        {steps.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-navy" : "bg-muted"}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-1">{steps[step].title}</h2>
          <p className="text-sm text-muted-foreground mb-6">{steps[step].subtitle}</p>
          {steps[step].content}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-8">
        <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0} className="rounded-xl">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        {step < steps.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!steps[step].valid} className="bg-navy hover:bg-navy/90 text-white rounded-xl px-6">
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleFinish} disabled={saving} className="bg-navy hover:bg-navy/90 text-white rounded-xl px-6">
            {saving ? "Saving…" : "Finish"} <Check className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}