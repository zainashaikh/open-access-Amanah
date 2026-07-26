import React, { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GraduationCap, Star, Building2, CheckCircle2, ExternalLink, Search, Trophy } from "lucide-react";

// Comprehensive Ivy League & Top Tier Extracurricular Database
const BROAD_EXTRACURRICULARS = [
  {
    id: "ext_1",
    title: "Science Olympiad / Regeneron Science Talent Search (STS)",
    organization_name: "National STEM Competitions Network",
    category: "STEM & Research",
    city: "Nationwide / DMV",
    state: "MD/VA/DC",
    matchScore: 98,
    reasons: ["Top recommendation for Ivy League STEM applicants", "Highly valued by MIT, Harvard, Johns Hopkins"],
    description: "Compete in rigorous regional, state, and national STEM competitions. Conduct independent laboratory research or build complex engineering devices.",
    tier: "Tier 1 (National Impact)",
    time_commitment: "5-8 hours/week",
    link: "https://www.soinc.org"
  },
  {
    id: "ext_2",
    title: "Model United Nations (MUN) Executive Board & Delegate",
    organization_name: "DMV Regional High School MUN Circuit",
    category: "Leadership & Government",
    city: "Washington",
    state: "DC",
    matchScore: 95,
    reasons: ["Strong match for Pre-Law, International Relations, and Policy", "Valued by Georgetown, Yale, Columbia"],
    description: "Represent member states in diplomacy debates, draft resolution papers, and organize regional MUN conferences for middle and high school students.",
    tier: "Tier 1 (Regional Leadership)",
    time_commitment: "4-6 hours/week",
    link: "https://www.nhsmun.org"
  },
  {
    id: "ext_3",
    title: "High School Literary Magazine Founder & Editor-in-Chief",
    organization_name: "DMV Youth Press Association",
    category: "Arts & Media",
    city: "Silver Spring",
    state: "MD",
    matchScore: 92,
    reasons: ["Demonstrates entrepreneurial drive and creative writing expertise", "Valued by Brown, Dartmouth, Princeton"],
    description: "Curate poetry, prose, and artwork from local high school students. Manage publication design, printing budget, and distribution across 10+ schools.",
    tier: "Tier 2 (Creative Entrepreneurship)",
    time_commitment: "3-5 hours/week",
    link: "https://www.ncte.org"
  },
  {
    id: "ext_4",
    title: "Varsity / Club Track & Field / Cross Country Athlete",
    organization_name: "MPSSAA / Virginia High School League",
    category: "Sports & Athletics",
    city: "Bethesda",
    state: "MD",
    matchScore: 90,
    reasons: ["Proves discipline, physical endurance, and team leadership", "Valued by all NCAA Division I & III colleges"],
    description: "Train daily in long-distance running or sprinting events. Represent school at regional meets and mentor younger varsity squad members.",
    tier: "Tier 2 (Varsity Athletics)",
    time_commitment: "10-15 hours/week",
    link: "https://www.mpssaa.org"
  },
  {
    id: "ext_5",
    title: "University Independent Research Internship (Pre-Med / Bio)",
    organization_name: "UMD & Johns Hopkins Summer Research Labs",
    category: "STEM & Research",
    city: "College Park / Baltimore",
    state: "MD",
    matchScore: 99,
    reasons: ["Co-author peer-reviewed journal papers", "Essential for Johns Hopkins, Harvard, UPenn Pre-Med"],
    description: "Work alongside university professors on wet-lab molecular biology, machine learning in healthcare, or computational chemistry projects.",
    tier: "Tier 1 (National Scientific Research)",
    time_commitment: "15-20 hours/week (Summer)",
    link: "https://www.umd.edu"
  },
  {
    id: "ext_6",
    title: "Student Government Association (SGA) Class President",
    organization_name: "Montgomery County Region (MCR) SGA",
    category: "Leadership & Government",
    city: "Rockville",
    state: "MD",
    matchScore: 94,
    reasons: ["Elected community representative with policy impact", "Valued by Stanford, UPenn, Georgetown"],
    description: "Advocate for student rights, coordinate school-wide budgets, organize homecoming initiatives, and testify before county school boards.",
    tier: "Tier 1 (Elected Civic Leadership)",
    time_commitment: "5-7 hours/week",
    link: "https://www.montgomeryschoolsmd.org"
  },
  {
    id: "ext_7",
    title: "Youth Tech Non-Profit Founder & Free Coding Bootcamp Lead",
    organization_name: "CodeForGood DMV Youth Initiative",
    category: "Entrepreneurship & Competitions",
    city: "Fairfax",
    state: "VA",
    matchScore: 97,
    reasons: ["Shows social enterprise innovation and CS mastery", "Valued by MIT, Stanford, Carnegie Mellon"],
    description: "Founded a student-led 501(c)(3) teaching Python and web development to 300+ underrepresented middle school students across Maryland and Virginia.",
    tier: "Tier 1 (Social Entrepreneurship)",
    time_commitment: "6-8 hours/week",
    link: "https://www.code.org"
  },
  {
    id: "ext_8",
    title: "National History Day (NHD) Individual Research Scholar",
    organization_name: "National History Day Network",
    category: "Humanities & Writing",
    city: "College Park",
    state: "MD",
    matchScore: 91,
    reasons: ["Conduct primary archival research at Library of Congress", "Valued by Yale, Princeton, Columbia"],
    description: "Produce historical papers or documentaries analyzing historical turning points utilizing primary sources from the National Archives.",
    tier: "Tier 2 (Academic Research)",
    time_commitment: "4-6 hours/week",
    link: "https://www.nhd.org"
  }
];

export default function RecommendedExtracurriculars() {
  const { user, profile } = useOutletContext();
  const [opportunities, setOpportunities] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Opportunity.filter({ status: "active" })
      .then((opps) => setOpportunities(opps || []))
      .catch(() => setOpportunities([]))
      .finally(() => setLoading(false));
  }, []);

  const targetColleges = profile?.target_colleges || [
    "University of Maryland - College Park",
    "Georgetown University",
    "Johns Hopkins University"
  ];

  const userSkills = profile?.skills || [];
  const userInterests = profile?.interests || [];
  const userCareers = profile?.career_interests || [];

  const dbFormatted = opportunities.map(o => ({
    id: o.id,
    title: o.title,
    organization_name: o.organization_name,
    category: o.category || "Volunteering & Community",
    city: o.city || "DMV Area",
    state: o.state || "MD",
    matchScore: o.ssl_approved ? 90 : 85,
    reasons: [
      ...(o.ssl_approved ? ["Official MCPS SSL Verified"] : []),
      ...(o.mosque_based ? ["Mosque & Community Leadership"] : []),
      "Direct volunteer experience"
    ],
    description: o.description,
    tier: o.ssl_approved ? "Tier 2 (Verified SSL Service)" : "Tier 3 (Community Volunteer)",
    time_commitment: o.time_commitment || "2-4 hours/week",
    link: o.sign_up_url || "#"
  }));

  const combined = [...BROAD_EXTRACURRICULARS, ...dbFormatted];

  const filtered = combined.filter(item => {
    const q = search.toLowerCase();
    return !q || item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
  });

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-sage border-t-navy rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 border border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sage/10 text-sage mb-2">
              <Trophy className="w-3.5 h-3.5" /> Ivy League & Top Tier College Admissions Engine
            </span>
            <h1 className="font-heading text-2xl font-bold">Recommended Extracurriculars</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Extracurricular activities across athletics, STEM research, student government, arts, debate, competitions, and community service valued by Ivy League and Tier-1 university admissions.
            </p>
          </div>
          <Link to="/profile">
            <Button variant="outline" className="rounded-xl text-xs shrink-0">
              <GraduationCap className="w-3.5 h-3.5 mr-1.5" /> Edit Target Colleges
            </Button>
          </Link>
        </div>

        <div className="mt-4 pt-4 border-t border-border/30 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground font-medium">Targeting Admissions At:</span>
          {targetColleges.map((college) => (
            <span key={college} className="px-2.5 py-1 rounded-full bg-navy/5 text-navy font-medium border border-navy/10">
              {college}
            </span>
          ))}
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
        <Input
          className="pl-10 rounded-2xl text-xs bg-card h-10"
          placeholder="Search by keyword, domain (e.g. STEM, Athletics, Debate, Research, Arts)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-muted p-1 rounded-xl w-full sm:w-auto flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="all" className="rounded-lg text-xs font-medium">All Picks</TabsTrigger>
          <TabsTrigger value="stem" className="rounded-lg text-xs font-medium">STEM & Research</TabsTrigger>
          <TabsTrigger value="leadership" className="rounded-lg text-xs font-medium">Leadership & Gov</TabsTrigger>
          <TabsTrigger value="sports" className="rounded-lg text-xs font-medium">Sports & Athletics</TabsTrigger>
          <TabsTrigger value="arts" className="rounded-lg text-xs font-medium">Arts & Media</TabsTrigger>
          <TabsTrigger value="volunteering" className="rounded-lg text-xs font-medium">Volunteering</TabsTrigger>
        </TabsList>

        {["all", "stem", "leadership", "sports", "arts", "volunteering"].map(tabKey => {
          const tabItems = filtered.filter(item => {
            if (tabKey === "all") return true;
            if (tabKey === "stem") return item.category.includes("STEM");
            if (tabKey === "leadership") return item.category.includes("Leadership");
            if (tabKey === "sports") return item.category.includes("Sports");
            if (tabKey === "arts") return item.category.includes("Arts");
            if (tabKey === "volunteering") return item.category.includes("Volunteer") || item.category.includes("Community");
            return true;
          });

          return (
            <TabsContent key={tabKey} value={tabKey} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tabItems.map(item => (
                  <div key={item.id} className="bg-card rounded-2xl p-5 border border-border/50 flex flex-col justify-between hover:border-navy/30 transition-all space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber/10 text-amber flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber text-amber" /> {item.matchScore}% Match Score
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-navy/5 text-navy">
                          {item.tier}
                        </span>
                      </div>

                      <h3 className="font-heading text-base font-bold text-foreground mb-1">{item.title}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                        <Building2 className="w-3.5 h-3.5 text-navy" /> {item.organization_name} · {item.city}, {item.state}
                      </p>

                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="space-y-1">
                        {item.reasons.map((r, idx) => (
                          <p key={idx} className="text-[11px] font-medium text-navy flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-sage shrink-0" /> {r}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border/30 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-muted-foreground font-medium">{item.time_commitment}</span>
                      <a href={item.link} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="bg-navy hover:bg-navy/90 text-white rounded-xl text-xs">
                          <ExternalLink className="w-3.5 h-3.5 mr-1" /> Learn More / Apply
                        </Button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
