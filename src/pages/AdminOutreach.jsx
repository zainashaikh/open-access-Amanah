import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import EmptyState from "@/components/ui/EmptyState";
import { Shield, Send } from "lucide-react";

export default function AdminOutreach() {
  const { user } = useOutletContext();
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [emails, setEmails] = useState({});
  const [loading, setLoading] = useState(true);
  const [replies, setReplies] = useState({});
  const [sending, setSending] = useState(null);

  useEffect(() => {
    base44.entities.SentMessage.list("-created_date", 100).then(async (m) => {
      const outbound = m.filter(x => !x.from_admin && x.status !== "hidden");
      setMessages(outbound);
      const uids = [...new Set(outbound.map(x => x.user_id))];
      const em = {};
      await Promise.all(uids.map(async uid => {
        try { const u = await base44.entities.User.get(uid); em[uid] = u?.email; } catch { /* ignore */ }
      }));
      setEmails(em);
      setLoading(false);
    });
  }, []);

  const handleReply = async (msg) => {
    const body = replies[msg.id];
    if (!body) return;
    setSending(msg.id);
    try {
      await base44.functions.invoke("adminReply", { targetUserId: msg.user_id, subject: `Re: ${msg.subject}`, body });
      setReplies(r => ({ ...r, [msg.id]: "" }));
      toast({ title: "Reply sent", description: `Email sent to ${emails[msg.user_id] || "user"}.` });
    } catch {
      toast({ title: "Failed to send", variant: "destructive" });
    }
    setSending(null);
  };

  if (user.role !== "admin") {
    return <div className="text-center py-20 text-muted-foreground">Admins only.</div>;
  }
  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-sage border-t-navy rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2"><Shield className="w-6 h-6 text-navy" /> Admin Outreach</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Reply to student outreach; replies are emailed and shown in their Outreach inbox.</p>
      </div>

      {messages.length === 0 ? (
        <EmptyState icon={Shield} title="No outreach messages" description="Student messages to admins will appear here." />
      ) : (
        <div className="space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className="bg-card rounded-2xl p-5 border border-border/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-navy/5 text-navy">{msg.message_type}</span>
                <span className="text-xs text-muted-foreground">{emails[msg.user_id] || "user"} · {new Date(msg.created_date).toLocaleString()}</span>
              </div>
              <h3 className="font-medium text-sm text-foreground">{msg.subject}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line mt-1">{msg.body}</p>
              {msg.related_opportunity_id && <p className="text-xs text-muted-foreground mt-1">Related opportunity: {msg.related_opportunity_id}</p>}
              <div className="mt-3 flex gap-2">
                <Textarea rows={2} className="rounded-xl flex-1" placeholder="Type a reply…" value={replies[msg.id] || ""} onChange={e => setReplies(r => ({ ...r, [msg.id]: e.target.value }))} />
                <Button onClick={() => handleReply(msg)} disabled={sending === msg.id || !replies[msg.id]} className="bg-navy hover:bg-navy/90 text-white rounded-xl shrink-0 self-end">
                  <Send className="w-4 h-4 mr-1.5" /> {sending === msg.id ? "Sending…" : "Reply"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
