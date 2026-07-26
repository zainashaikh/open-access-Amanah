import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { targetUserId, subject, body: replyBody } = body;
    if (!targetUserId || !replyBody) return Response.json({ error: 'Missing fields' }, { status: 400 });

    await base44.asServiceRole.entities.SentMessage.create({
      user_id: targetUserId,
      message_type: 'contact',
      recipient_type: 'user',
      recipient: user.email || 'Amanah Admin',
      subject: subject || 'Reply from Amanah admin',
      body: replyBody,
      status: 'sent',
      from_admin: true,
      read_by_user: false,
    });

    let targetEmail = null;
    try {
      const target = await base44.asServiceRole.entities.User.get(targetUserId);
      targetEmail = target?.email;
    } catch { /* ignore */ }
    if (targetEmail) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({ to: targetEmail, subject: subject || 'Reply from Amanah admin', body: replyBody });
      } catch { /* ignore */ }
    }
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
