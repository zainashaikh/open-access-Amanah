import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Award, FileText, Send, CheckCircle2, Download, GraduationCap, ExternalLink, ShieldCheck, Mail, Trash2 } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/use-toast";

import { generateSSLPDF } from "@/utils/generateSSLPDF";

const MCPS_COORDINATORS = [
  { school: "Montgomery Blair High School", coordinator: "Beth Sanchez", email: "Beth_S_Sanchez@mcpsmd.org", url: "https://www.montgomeryschoolsmd.org/schools/blairhs/ssl/" },
  { school: "Col. Zadok Magruder High School", coordinator: "Ashleigh Prendable", email: "Ashleigh_M_Prendable@mcpsmd.org", url: "https://www.montgomeryschoolsmd.org/schools/magruderhs/ssl/" },
  { school: "Bethesda-Chevy Chase High School", coordinator: "Claudia Yener", email: "Claudia_F_Yener@mcpsmd.org", url: "https://www.montgomeryschoolsmd.org/schools/bcchs/ssl/" },
  { school: "Winston Churchill High School", coordinator: "Tishya Soni-Chopra", email: "Tishya_R_Soni-Chopra@mcpsmd.org", url: "https://www.montgomeryschoolsmd.org/schools/churchillhs/ssl/" },
  { school: "Clarksburg High School", coordinator: "Ashleigh Coe", email: "Ashleigh_A_Coe@mcpsmd.org", url: "https://www.montgomeryschoolsmd.org/schools/clarksburghs/ssl/" },
  { school: "Damascus High School", coordinator: "Kristen Stevenson", email: "Kristen_Stevenson@mcpsmd.org", url: "https://www.montgomeryschoolsmd.org/schools/damascushs/ssl/" },
  { school: "Albert Einstein High School", coordinator: "Sharon Winston", email: "Sharon_S_Winston@mcpsmd.org", url: "https://www.montgomeryschoolsmd.org/schools/einsteinhs/ssl/" },
  { school: "Gaithersburg High School", coordinator: "Melissa Parks", email: "Melissa_A_Parks@mcpsmd.org", url: "https://www.montgomeryschoolsmd.org/schools/gaithersburghs/ssl/" },
  { school: "Walter Johnson High School", coordinator: "Ashley Weddle", email: "Ashley_J_Weddle@mcpsmd.org", url: "https://www.montgomeryschoolsmd.org/schools/wjhs/ssl/" },
  { school: "John F. Kennedy High School", coordinator: "Lexanne Wilson", email: "Lexanne_C_Wilson@mcpsmd.org", url: "https://www.montgomeryschoolsmd.org/schools/kennedyhs/ssl/" },
  { school: "Northwood High School", coordinator: "Julie Brenner & Lisette Kernizan", email: "Julie_M_Brenner@mcpsmd.org", url: "https://www.montgomeryschoolsmd.org/schools/northwoodhs/ssl/" },
  { school: "Paint Branch High School", coordinator: "Latasha Kelly", email: "Latasha_R_Kelly@mcpsmd.org", url: "https://www.montgomeryschoolsmd.org/schools/paintbranchhs/ssl/" },
  { school: "Poolesville High School", coordinator: "Lisa Fedders", email: "Lisa_L_Fedders@mcpsmd.org", url: "https://www.montgomeryschoolsmd.org/schools/poolesvillehs/ssl/" },
  { school: "Rockville High School", coordinator: "Honor Shevchenko", email: "Honor_C_Shevchenko@mcpsmd.org", url: "https://www.montgomeryschoolsmd.org/schools/rockvillehs/ssl/" },
  { school: "Seneca Valley High School", coordinator: "Paulina Duffy", email: "Paulina_M_Duffy@mcpsmd.org", url: "https://www.montgomeryschoolsmd.org/schools/senecavalleyhs/ssl/" },
  { school: "Sherwood High School", coordinator: "William Sartori", email: "William_L_Sartori@mcpsmd.org", url: "https://www.montgomeryschoolsmd.org/schools/sherwoodhs/ssl/" },
  { school: "Springbrook High School", coordinator: "Latrice Curtis", email: "Latrice_C_Curtis@mcpsmd.org", url: "https://www.montgomeryschoolsmd.org/schools/springbrookhs/ssl/" },
  { school: "Watkins Mill High School", coordinator: "Krista Jiron", email: "krista_l_jiron@mcpsmd.org", url: "https://www.montgomeryschoolsmd.org/schools/watkinsmillhs/ssl/" },
  { school: "Wheaton High School", coordinator: "Matthew Lilja", email: "Matthew_J_Lilja@mcpsmd.org", url: "https://www.montgomeryschoolsmd.org/schools/wheatonhs/ssl/" },
  { school: "Walt Whitman High School", coordinator: "Stephanie Mathis", email: "Stephanie_Mathis@mcpsmd.org", url: "https://www.montgomeryschoolsmd.org/schools/whitmanhs/ssl/" },
  { school: "Thomas S. Wootton High School", coordinator: "Christopher Thompson", email: "christopher_l_thompson@mcpsmd.org", url: "https://www.montgomeryschoolsmd.org/schools/woottonhs/ssl/" }
];

export default function SSLForms() {
  const { user } = useOutletContext();
  const { toast } = useToast();
  const [sslForms, setSslForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    base44.entities.SSLForm.filter({ user_id: user.id }, "-created_date")
      .then(forms => setSslForms(forms || []))
      .catch(err => {
        console.warn("Failed to load SSL forms:", err);
        setSslForms([]);
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  const downloadPDF = (form) => {
    try {
      const pdfBytes = generateSSLPDF(form);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `MCPS_SSL_Form_560-51_${(form.student_name || "Form").replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: "PDF Downloaded", description: "MCPS Form 560-51 generated with student profile data." });
    } catch (err) {
      console.error("PDF download error:", err);
      toast({ title: "Failed to download PDF", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteSSL = async (formId) => {
    if (window.confirm('Are you sure you want to delete this SSL form?')) {
      try {
        await base44.entities.SSLForm.delete(formId);
        setSslForms(sslForms.filter(f => f.id !== formId));
        toast({ title: 'SSL form deleted', description: 'The form has been removed.' });
      } catch (err) {
        console.warn('Delete SSL form error:', err);
        toast({ title: 'Failed to delete', variant: 'destructive' });
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-sage border-t-navy rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 border border-border/50">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald/10 text-emerald mb-2">
          <Award className="w-3.5 h-3.5" /> Official MCPS Form 560-51 Hub
        </span>
        <h1 className="font-heading text-2xl font-bold">Sent & Received SSL Hours</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage official MCPS Student Service Learning (SSL) activity verification forms.
        </p>
      </div>

      <Tabs defaultValue="forms" className="w-full">
        <TabsList className="bg-muted p-1 rounded-xl w-full sm:w-auto grid grid-cols-2">
          <TabsTrigger value="forms" className="rounded-lg text-xs font-medium">
            <FileText className="w-3.5 h-3.5 mr-1.5" /> My SSL Forms ({sslForms.length})
          </TabsTrigger>
          <TabsTrigger value="coordinators" className="rounded-lg text-xs font-medium">
            <GraduationCap className="w-3.5 h-3.5 mr-1.5" /> Official MCPS SSL Directory
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forms" className="mt-4">
          {sslForms.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No SSL forms generated yet"
              description="Go to 'My Hours' and click 'Create SSL Form' on any logged activity."
            />
          ) : (
            <div className="space-y-3">
              {sslForms.map((form) => (
                <div key={form.id} className="bg-card rounded-2xl p-5 border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading text-base font-bold text-foreground truncate">{form.opp_title}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald/10 text-emerald flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Form 560-51
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{form.org_name} · Service Date: {form.service_date}</p>
                    <p className="text-xs text-muted-foreground">Supervisor: {form.supervisor_name} ({form.supervisor_email})</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => downloadPDF(form)} className="rounded-xl text-xs">
                      <Download className="w-3.5 h-3.5 mr-1" /> Download
                    </Button>
                    <a href={`mailto:${encodeURIComponent(form.supervisor_email || '')}`} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="bg-navy hover:bg-navy/90 text-white rounded-xl text-xs">
                        <Send className="w-3.5 h-3.5 mr-1" /> Email
                      </Button>
                    </a>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteSSL(form.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="coordinators" className="mt-4">
          <div className="bg-card rounded-2xl p-5 border border-border/50 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-heading text-sm font-bold text-navy mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald" /> Official MCPS School SSL Pages & Directory
              </h3>
              <p className="text-xs text-muted-foreground">
                Sourced directly from official Montgomery County Public Schools portals. Access school-specific SSL coordinators and guidelines.
              </p>
            </div>
            <a href="https://www.montgomeryschoolsmd.org/departments/ssl/coordinators/" target="_blank" rel="noopener noreferrer" className="shrink-0">
              <Button size="sm" className="bg-navy hover:bg-navy/90 text-white rounded-xl text-xs">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Main MCPS SSL Directory
              </Button>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MCPS_COORDINATORS.map((coord) => (
              <div key={coord.school} className="bg-card rounded-2xl p-4 border border-border/50 flex items-center justify-between gap-3 hover:border-navy/30 transition-all">
                <div className="min-w-0">
                  <h4 className="font-semibold text-xs text-foreground truncate">{coord.school}</h4>
                  <p className="text-[11px] font-medium text-navy mt-0.5">{coord.coordinator}</p>
                  <a href={`mailto:${coord.email}`} className="text-[11px] text-muted-foreground hover:underline truncate block">
                    {coord.email}
                  </a>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a href={`mailto:${coord.email}`}>
                    <Button size="sm" className="bg-navy hover:bg-navy/90 text-white rounded-xl text-[11px] h-8 px-2.5">
                      <Mail className="w-3 h-3 mr-1" /> Email
                    </Button>
                  </a>
                  <a href={coord.url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="rounded-xl text-[11px] h-8 px-2.5">
                      <ExternalLink className="w-3 h-3 mr-1 text-navy" /> School Page
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
