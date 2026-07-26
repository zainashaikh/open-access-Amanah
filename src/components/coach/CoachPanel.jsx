import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import EmptyState from "@/components/ui/EmptyState";
import { Sparkles, Send, Flag, ShieldAlert, Bot, User, Plus, Compass, BookOpen, Coffee, GraduationCap } from "lucide-react";

const SAFETY_BANNER = "This is an AI goal-coach — not a human. For emergencies or self-harm, reach a trusted adult or 988 (Suicide & Crisis Lifeline).";
const SENSITIVE = ["suicide", "kill myself", "self-harm", "hurt myself", "abuse", "assault", "end my life", "want to die"];

const QUICK_PROMPTS = [
  { icon: GraduationCap, label: "Earn MCPS SSL Hours", text: "How do I earn and submit MCPS SSL hours on Amanah?" },
  { icon: BookOpen, label: "Draft Resume Bullet", text: "Help me write a strong college application resume bullet point for my volunteer work." },
  { icon: Coffee, label: "DMV Study Cafes", text: "What are quiet, safe, halal study spots open late in Maryland or Virginia?" },
  { icon: Compass, label: "Balance APs & Volunteering", text: "How can I balance 3+ AP courses while completing 50 volunteer hours this year?" },
];

export default function CoachPanel({ user, profile, mode = "inline", onClose }) {
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [goals, setGoals] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [m, g] = await Promise.all([
          base44.entities.ChatMessage.filter({ user_id: user?.id }, "created_date").catch(() => []),
          base44.entities.GoalExchange.filter({ user_id: user?.id, status: "seeking" }).catch(() => []),
        ]);
        setMessages(m || []);
        setGoals(g || []);
      } catch (err) {
        console.warn("Failed to load coach panel chat data:", err);
        setMessages([]);
        setGoals([]);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) load();
    else setLoading(false);
  }, [user?.id]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const buildPrompt = (history, userMsg) => {
    const convo = history.map(m => `${m.role === "user" ? "Student" : "Coach"}: ${m.content}`).join("\n");
    const profileCtx = profile
      ? `Profile — Name: ${profile.full_name || "Student"}. Skills: ${profile.skills?.join(", ") || "n/a"}. Interests: ${profile.interests?.join(", ") || "n/a"}. Career interests: ${profile.career_interests?.join(", ") || "n/a"}. Grade: ${profile.grade_level || "high school"}. Target Colleges: ${profile.target_colleges?.join(", ") || "n/a"}.`
      : "";
    const goalsCtx = goals.length ? `Active goals: ${goals.map(g => g.goal).join("; ")}` : "";
    return `You are Amanah, an intelligent AI goal-coach and academic advisor for Muslim high school and college students in the DMV area. You are NOT a human. You turn goals into clear next steps for school, volunteer planning, college prep, and resume bullets.

${profileCtx}
${goalsCtx}

Conversation so far:
${convo}

Student: ${userMsg}
Coach:`;
  };

  const parseAiResponse = (res) => {
    if (!res) return "BarakAllahu Feek! I'm here to support your goals. What specific project, volunteer role, or college goal would you like to discuss next?";
    if (typeof res === "string") return res;
    if (res.result) return typeof res.result === "string" ? res.result : JSON.stringify(res.result);
    if (res.response) return typeof res.response === "string" ? res.response : JSON.stringify(res.response);
    if (res.reply) return typeof res.reply === "string" ? res.reply : JSON.stringify(res.reply);
    if (res.content) return typeof res.content === "string" ? res.content : JSON.stringify(res.content);
    return JSON.stringify(res);
  };

  const handleSendPrompt = async (textToSend) => {
    const userMsg = (textToSend || input).trim();
    if (!userMsg || sending) return;
    if (SENSITIVE.some(s => userMsg.toLowerCase().includes(s))) setShowResources(true);

    let userRec = null;
    try {
      userRec = await base44.entities.ChatMessage.create({ user_id: user.id, role: "user", content: userMsg });
    } catch {
      userRec = { id: `local_${Date.now()}`, user_id: user.id, role: "user", content: userMsg };
    }

    const newHistory = [...messages, userRec];
    setMessages(newHistory);
    setInput("");
    setSending(true);

    let aiText = "";
    try {
      const res = await base44.integrations.Core.InvokeLLM({ prompt: buildPrompt(messages, userMsg) });
      aiText = parseAiResponse(res);
    } catch (err) {
      console.warn("InvokeLLM failed:", err);
      aiText = "BarakAllahu Feek! I encountered a temporary connection issue. Please try resending your prompt or check out our Volunteer Log or SSL Forms tab directly!";
    }

    try {
      const aiRec = await base44.entities.ChatMessage.create({ user_id: user.id, role: "assistant", content: aiText });
      setMessages([...newHistory, aiRec]);
    } catch {
      setMessages([...newHistory, { id: `local_ai_${Date.now()}`, user_id: user.id, role: "assistant", content: aiText }]);
    }

    setSending(false);
  };

  const handleNew = async () => {
    try {
      await base44.entities.ChatMessage.deleteMany({ user_id: user.id });
    } catch {
      // Ignore
    }
    setMessages([]);
    setShowResources(false);
    toast({ title: "New conversation started" });
  };

  const handleReport = async () => {
    try {
      await base44.entities.SentMessage.create({ user_id: user.id, message_type: "feedback", recipient_type: "admin", subject: "Coach report", body: "User reported a concern about the AI coach." });
    } catch {
      // Ignore
    }
    toast({ title: "Report sent to admins" });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className={`flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card ${mode === "floating" ? "pr-12" : ""}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-navy flex items-center justify-center"><Sparkles className="w-4 h-4 text-sage" /></div>
          <div>
            <h2 className="font-heading text-base font-bold leading-tight">AI Goal Coach</h2>
            <p className="text-[11px] text-muted-foreground">Personalized · Powered by Gemini</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNew} title="New conversation"><Plus className="w-4 h-4 text-muted-foreground" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleReport} title="Report a concern"><Flag className="w-4 h-4 text-muted-foreground" /></Button>
        </div>
      </div>

      <div className="px-4 pt-3">
        <div className="bg-amber/10 border border-amber/30 rounded-xl px-3 py-2 flex gap-2">
          <ShieldAlert className="w-4 h-4 text-amber shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber">{SAFETY_BANNER}</p>
        </div>
      </div>

      {showResources && (
        <div className="px-4 pt-3">
          <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            <p className="text-[11px] text-red-700">You matter. Please reach a trusted adult now, or call/text <strong>988</strong> (Suicide &amp; Crisis Lifeline, 24/7). If you're in immediate danger, call 911.</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 px-4 py-3">
        {loading ? (
          <div className="flex justify-center py-10"><div className="w-7 h-7 border-3 border-sage border-t-navy rounded-full animate-spin" /></div>
        ) : messages.length === 0 ? (
          <div className="space-y-4 py-4">
            <EmptyState icon={Sparkles} title="How can your AI Coach assist today?" description="Ask anything about SSL hours, local volunteer roles, resume bullets, or quiet DMV study cafes." />
            
            <div className="space-y-2 pt-2">
              <p className="text-xs font-semibold text-muted-foreground px-1">Quick Prompts:</p>
              <div className="grid grid-cols-1 gap-2">
                {QUICK_PROMPTS.map((qp, idx) => {
                  const Icon = qp.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSendPrompt(qp.text)}
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-border/60 bg-card hover:bg-navy/5 hover:border-navy/30 text-left transition-all text-xs font-medium text-foreground group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-navy/10 flex items-center justify-center shrink-0 group-hover:bg-navy group-hover:text-white transition-colors">
                        <Icon className="w-3.5 h-3.5 text-navy group-hover:text-white" />
                      </div>
                      <span className="flex-1">{qp.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : messages.map(m => (
          <div key={m.id} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && <div className="w-7 h-7 rounded-lg bg-navy/10 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-navy" /></div>}
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${m.role === "user" ? "bg-navy text-white" : "bg-card border border-border/60 text-foreground shadow-sm"}`}>
              <p className="whitespace-pre-line">{m.content}</p>
            </div>
            {m.role === "user" && <div className="w-7 h-7 rounded-lg bg-sage/20 flex items-center justify-center shrink-0"><User className="w-4 h-4 text-sage" /></div>}
          </div>
        ))}
        {sending && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-lg bg-navy/10 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-navy animate-pulse" /></div>
            <div className="bg-card border border-border/50 rounded-2xl px-3.5 py-2.5 text-xs text-muted-foreground">Generating response...</div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-3 border-t border-border/50 bg-card">
        <div className="flex gap-2">
          <Textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendPrompt(); } }} rows={1} placeholder="Ask about SSL hours, resume bullets, or study spots..." className="rounded-xl resize-none text-xs min-h-[40px]" />
          <Button onClick={() => handleSendPrompt()} disabled={sending || !input.trim()} className="bg-navy hover:bg-navy/90 text-white rounded-xl shrink-0 h-10 w-10 p-0"><Send className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  );
}

