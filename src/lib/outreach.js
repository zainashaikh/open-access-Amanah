export const buildOutreachMailto = (opportunity, studentName = "Student") => {
  const email = opportunity.contact_email || opportunity.organization_email || '';
  const subject = `Volunteer Inquiry: ${opportunity.title}`;
  const body = `Dear ${opportunity.organization_name},\n\nMy name is ${studentName} and I am interested in volunteering for "${opportunity.title}". I found this opportunity on Amanah.\n\nCould you please let me know the next steps to apply?\n\nThank you,\n${studentName}`;
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

export const signUpUrl = (opportunity) => {
  return opportunity.signup_url || opportunity.source_url || null;
};

export const moreInfoUrl = (opportunity) => {
  return opportunity.source_url || null;
};

// Simple rate‑limiting stub – always returns success in this placeholder.
export const rateLimitedOutreach = (opportunity, user) => {
  // In production, you might check localStorage timestamps.
  // For now, allow all.
  return { ok: true };
};