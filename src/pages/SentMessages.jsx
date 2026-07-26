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
import { Shield, Send, Mail, Clock, ArrowDownLeft, CheckCheck, Trash2, Building2, Bell } from "lucide-react";
import { canDo } from "@/lib/rateLimit";

const TYPE_STYLES = {
  flag_post: { label: "Flagged Post", color: "bg-red-50 text-red-600" },
  flag_reply: { label: "Flagged Reply", color: "bg-red-50 text-red-600" },
  flag_message: { label: "Flagged Message", color: "bg-red-50 text-red-600" },
  contact: { label: "Contact Admin", color: "bg-sage/10 text-sage" },
  feedback: { label: "Feedback", color: "bg-amber/10 text-amber" },
  outreach: { label: "Outreach", color: "bg-navy/5 text-navy" },
};

export default function SentMessages() {
  const { user } = useOutletContext();
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ subject: "", body: "", message_type: "contact" });

  const load = async () => {
    try {
      const m = await base44.entities.SentMessage.filter({ user_id: user?.id }, "-created_date").catch(() => []);
      setMessages((m || []).filter(x => x.status !== "hidden"));
    } catch (err) {
      console.warn("Failed to load sent messages:", err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { if (user?.id) load(); else setLoading(false); }, [user?.id]);

  const adminReplies = messages.filter(m => m.from_admin);
  const unread = adminReplies.filter(m => !m.read_by_user);
  const mine = messages.filter(m => !m.from_admin);

  const handleSend = async () => {
    if (!form.subject || !form.body) return;
    const rl = canDo("outreach");
    if (!rl.ok) { toast({ title: "Please wait a moment", description: `Try again in ${rl.wait}s.`, variant: "destructive" }); return; }
    setSaving(true);
    try {
      await base44.functions.invoke("messageAdmin", { subject: form.subject, body: form.body });
      setForm({ subject: "", body: "", message_type: "contact" });
      setOpen(false);
      await load();
      toast({ title: "Message sent", description: "Emailed to administrators and saved here." });
    } catch {
      toast({ title: "Couldn't send", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.SentMessage.update(id, { status: "hidden" });
    setMessages(messages.filter(m => m.id !== id));
    toast({ title: "Removed from your view", description: "A record is kept for safety audits." });
  };

  const markRead = async (id) => {
    await base44.entities.SentMessage.update(id, { read_by_user: true });
    setMessages(messages.map(m => m.id === id ? { ...m, read_by_user: true } : m));
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-sage border-t-navy rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
            Outreach
            {unread.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500 text-white">
                <Bell className="w-3 h-3" /> {unread.length} new
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Messages to admins and their replies</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-navy hover:bg-navy/90 text-white rounded-xl"><Send className="w-4 h-4 mr-1.5" /> New Message</Button></DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle className="font-heading">Message Administrators</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label className="text-sm mb-1 block">Subject *</Label><Input className="rounded-xl" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="What's this about?" /></div>
              <div><Label className="text-sm mb-1 block">Message *</Label><Textarea className="rounded-xl" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={4} placeholder="Write your message..." /></div>
              <Button onClick={handleSend} disabled={saving} className="w-full bg-navy hover:bg-navy/90 text-white rounded-xl">{saving ? "Sending..." : "Send Message"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {adminReplies.length > 0 && (
        <div className="mb-6">
          <h2 className="font-heading text-sm font-semibold mb-2 flex items-center gap-1.5"><ArrowDownLeft className="w-4 h-4 text-sage" /> Admin replies</h2>
          <div className="space-y-3">
            {adminReplies.map(msg => (
              <div key={msg.id} className={`bg-sage/5 rounded-2xl p-5 border ${!msg.read_by_user ? "border-sage/40" : "border-border/50"}`} onClick={() => !msg.read_by_user && markRead(msg.id)}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-sage/15 text-sage">Reply from admin</span>
                  {!msg.read_by_user && <span className="text-xs text-red-600 font-medium">New</span>}
                </div>
                <h3 className="font-medium text-sm text-foreground mb-1">{msg.subject}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{msg.body}</p>
                <div className="text-xs text-muted-foreground mt-2">{new Date(msg.created_date).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="font-heading text-sm font-semibold mb-2 flex items-center gap-1.5"><Mail className="w-4 h-4 text-muted-foreground" /> Your sent messages</h2>
      {mine.length === 0 ? (
        <EmptyState icon={Mail} title="No messages yet" description="Outreach emails and notes to admins will appear here." />
      ) : (
        <div className="space-y-3">
          {mine.map(msg => {
            const style = TYPE_STYLES[msg.message_type] || TYPE_STYLES.contact;
            return (
              <div key={msg.id} className="bg-card rounded-2xl p-5 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${style.color}`}>{style.label}</span>
                  <span className={`text-xs flex items-center gap-1 ${msg.status === "read" ? "text-emerald" : "text-muted-foreground"}`}>
                    {msg.status === "read" ? <><CheckCheck className="w-3 h-3" /> Read</> : <><Clock className="w-3 h-3" /> Sent</>}
                  </span>
                </div>
                <h3 className="font-medium text-sm text-foreground mb-1">{msg.subject}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{msg.body}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {msg.recipient && <span className="flex items-center gap-1">{msg.recipient_type === "organization" ? <Building2 className="w-3 h-3" /> : <Shield className="w-3 h-3" />}{msg.recipient}</span>}
                    <span>{new Date(msg.created_date).toLocaleString()}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(msg.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
