import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Menu, Compass, ClipboardList, FileText, Heart, GraduationCap, LogOut, User, Mail, Sparkles, Target, Users, Building2, ChevronDown, Coffee, Award, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AmanahLogo from "@/components/AmanahLogo";

const SECTIONS = [
  { name: "Networking", icon: Users, items: [
    { label: "Community", path: "/community", icon: Users },
    { label: "Messages / Outreach", path: "/sent-messages", icon: Mail },
    { label: "Advice", path: "/advice-corner", icon: Heart },
    { label: "Goals", path: "/goal-exchange", icon: Target },
    { label: "Study Cafe", path: "/study-cafe", icon: Coffee },
  ]},
  { name: "Opportunities", icon: Compass, items: [
    { label: "Opportunities", path: "/opportunities", icon: Compass },
    { label: "Recommended Extracurriculars", path: "/recommended-extracurriculars", icon: Star },
    { label: "Sources", path: "/internship-sources", icon: Building2 },
  ]},
  { name: "Resume Building", icon: GraduationCap, items: [
    { label: "My Hours", path: "/volunteer-log", icon: ClipboardList },
    { label: "Sent & Received SSL Hours", path: "/ssl-forms", icon: Award },
    { label: "Resume", path: "/resume-generator", icon: FileText },
    { label: "Coach", path: "/goals-chatbot", icon: Sparkles },
  ]},
];

export default function TopNav({ user }) {
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await base44.auth.logout("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-navy text-white/95 shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <AmanahLogo size="sm" showText={true} textClassName="text-lg font-semibold text-white" />
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {SECTIONS.map(section => (
            <DropdownMenu key={section.name}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                  <section.icon className="w-4 h-4 mr-1.5" />
                  {section.name}
                  <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">{section.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {section.items.map(item => (
                  <DropdownMenuItem key={item.path} asChild>
                    <Link to={item.path} className="flex items-center gap-2 cursor-pointer py-2">
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                      <span>{item.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <Link to="/profile">
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
              <User className="w-4 h-4 mr-1" />
              Profile
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white/60 hover:text-white hover:bg-white/10">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-navy border-navy text-white w-72 p-0 overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sage/20 flex items-center justify-center">
                  <span className="text-sage font-semibold">{user?.full_name?.[0] || "U"}</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{user?.full_name || "Student"}</p>
                  <p className="text-xs text-white/50">{user?.email}</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {SECTIONS.map(section => (
                <div key={section.name}>
                  <p className="text-[11px] uppercase tracking-wide text-white/40 px-2 mb-1 flex items-center gap-1.5">
                    <section.icon className="w-3.5 h-3.5" />
                    {section.name}
                  </p>
                  <div className="space-y-0.5">
                    {section.items.map(item => (
                      <Link key={item.path} to={item.path} onClick={() => setOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10">
                          <item.icon className="w-4 h-4 mr-3" />
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <hr className="border-white/10 my-1" />
              <Link to="/profile" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10">
                  <User className="w-4 h-4 mr-3" />
                  Profile
                </Button>
              </Link>
              <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-white/60 hover:text-white hover:bg-white/10">
                <LogOut className="w-4 h-4 mr-3" />
                Log out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
