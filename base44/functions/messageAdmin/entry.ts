import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const subject = body.subject || 'Message to Amanah admin';
    const bodyText = body.body || '';
    const relatedOpportunityId = body.related_opportunity_id || null;
    const recipient = body.recipient || 'Amanah Admin';

    await base44.asServiceRole.entities.SentMessage.create({
      user_id: user.id,
      message_type: 'contact',
      recipient_type: 'admin',
      recipient,
      subject,
      body: bodyText,
      related_opportunity_id: relatedOpportunityId,
      status: 'sent',
      from_admin: false,
      read_by_user: false,
    });

    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
    for (const a of admins) {
      if (a?.email) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({ to: a.email, subject, body: bodyText });
        } catch { /* ignore individual failures */ }
      }
    }
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
