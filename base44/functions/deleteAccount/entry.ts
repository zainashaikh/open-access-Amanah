import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const uid = user.id;
    const svc = base44.asServiceRole;

    await svc.entities.Profile.deleteMany({ user_id: uid });
    await svc.entities.VolunteerLog.deleteMany({ user_id: uid });
    await svc.entities.Application.deleteMany({ user_id: uid });
    await svc.entities.SavedOpportunity.deleteMany({ user_id: uid });
    await svc.entities.ChatMessage.deleteMany({ user_id: uid });
    await svc.entities.SentMessage.deleteMany({ user_id: uid });
    await svc.entities.GoalExchange.deleteMany({ user_id: uid });
    await svc.entities.SkillSwap.deleteMany({ user_id: uid });
    await svc.entities.SkillSwapRequest.deleteMany({ requester_id: uid });
    await svc.entities.SkillSwapRequest.deleteMany({ listing_user_id: uid });
    await svc.entities.ResumeEntry.deleteMany({ user_id: uid });
    await svc.entities.AdvicePost.deleteMany({ user_id: uid });
    await svc.entities.AdviceReply.deleteMany({ user_id: uid });
    await svc.entities.Follow.deleteMany({ follower_id: uid });
    await svc.entities.Follow.deleteMany({ following_id: uid });
    await svc.entities.StudySession.deleteMany({ user_id: uid });
    await svc.entities.StudySessionRSVP.deleteMany({ user_id: uid });
    await svc.entities.Conversation.deleteMany({ participant_a_id: uid });
    await svc.entities.Conversation.deleteMany({ participant_b_id: uid });
    await svc.entities.DirectMessage.deleteMany({ sender_id: uid });
    await svc.entities.DirectMessage.deleteMany({ recipient_id: uid });

    return Response.json({ ok: true, note: 'App data deleted. The login account itself is managed by the platform.' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
