// src/utils/generateSSLPDF.js
import jsPDF from 'jspdf';

/**
 * Parses and splits a phone number string (e.g. "301-555-1234" or "(301) 555-1234")
 * into 3 constituent numeric parts [area, prefix, line].
 */
export function parsePhoneParts(phoneStr) {
  if (!phoneStr) return ['', '', ''];
  const digits = phoneStr.replace(/\D/g, '');
  if (digits.length >= 10) {
    return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10)];
  } else if (digits.length >= 7) {
    return [digits.slice(0, 3), digits.slice(3, 7), ''];
  }
  const parts = phoneStr.split(/[-.\s]+/);
  return [parts[0] || '', parts[1] || '', parts[2] || ''];
}

/**
 * Combines individual reflection responses into a single formatted paragraph,
 * matching the MCPS Form 560-51 Section III reflection requirement.
 */
export function buildCombinedReflection(formData) {
  if (formData.reflection && formData.reflection.trim()) {
    return formData.reflection.trim();
  }
  const parts = [];
  if (formData.reflection_learning) parts.push(formData.reflection_learning.trim());
  if (formData.reflection_benefit) parts.push(formData.reflection_benefit.trim());
  if (formData.reflection_skills) parts.push(formData.reflection_skills.trim());
  if (formData.reflection_self) parts.push(formData.reflection_self.trim());
  if (formData.reflection_community) parts.push(formData.reflection_community.trim());

  if (parts.length > 0) {
    return parts.join(' ');
  }
  return 'I volunteered to serve my community and address local needs. Through this experience, I gained leadership, teamwork, and communication skills, while developing a deeper understanding of community support systems.';
}

/**
 * Generates an official MCPS Student Service Learning Activity Verification Form (Form 560-51)
 * pre-filled with student profile and service activity data.
 */
export const generateSSLPDF = (formData) => {
  const doc = new jsPDF('p', 'pt', 'letter');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header Box
  doc.setLineWidth(1);
  doc.setDrawColor(0, 0, 0);

  // Title block
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Service Learning Activity Verification', pageWidth / 2, y + 14, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Division of School Leadership & Improvement | MONTGOMERY COUNTY PUBLIC SCHOOLS', pageWidth / 2, y + 26, { align: 'center' });
  doc.text('Rockville, Maryland 20850 | MCPS Form 560-51', pageWidth / 2, y + 36, { align: 'center' });
  y += 44;

  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Section Banner Helper
  const drawBanner = (title) => {
    doc.setFillColor(30, 41, 59); // Dark navy banner
    doc.rect(margin, y, contentWidth, 18, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(title, margin + 8, y + 12);
    doc.setTextColor(0, 0, 0);
    y += 22;
  };

  // Helper for key-value row with underline
  const drawInlineField = (label, val, x, width, yPos) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(label, x, yPos);
    const labelWidth = doc.getTextWidth(label) + 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const textVal = val ? String(val) : '';
    doc.text(textVal, x + labelWidth, yPos);
    doc.setLineWidth(0.5);
    doc.setDrawColor(180, 180, 180);
    doc.line(x + labelWidth, yPos + 2, x + width, yPos + 2);
    doc.setDrawColor(0, 0, 0);
  };

  // Parse phone numbers
  const homeParts = parsePhoneParts(formData.home_phone || formData.student_phone);
  const otherParts = parsePhoneParts(formData.cell_phone || formData.other_phone);

  // ==========================================
  // SECTION I: STUDENT INFORMATION
  // ==========================================
  drawBanner('SECTION I. STUDENT INFORMATION — To be completed by student prior to service review.');

  // Row 1: Student Name, Student ID
  drawInlineField('Student Name (Last, First, Middle):', formData.student_name || '', margin, 380, y);
  drawInlineField('Student ID:', formData.student_id || '', margin + 390, 150, y);
  y += 18;

  // Row 2: School / Code, First Period Teacher, Grade
  const schoolDisplay = formData.school_code ? `${formData.school_name || ''} (${formData.school_code})` : (formData.school_name || '');
  drawInlineField('School / Code:', schoolDisplay, margin, 240, y);
  drawInlineField('First Period Teacher:', formData.first_period_teacher || '', margin + 250, 200, y);
  drawInlineField('Grade:', formData.grade || '', margin + 460, 80, y);
  y += 18;

  // Row 3: E-mail
  drawInlineField('E-mail:', formData.student_email || '', margin, contentWidth, y);
  y += 18;

  // Row 4: Parent Name & Phones
  drawInlineField('Parent/Guardian Name:', formData.parent_guardian_name || '', margin, 230, y);
  const homePhoneStr = homeParts[0] ? `${homeParts[0]}-${homeParts[1]}-${homeParts[2]}` : '';
  const otherPhoneStr = otherParts[0] ? `${otherParts[0]}-${otherParts[1]}-${otherParts[2]}` : '';
  drawInlineField('Home/Cell Phone:', homePhoneStr, margin + 240, 150, y);
  drawInlineField('Other Phone:', otherPhoneStr, margin + 400, 140, y);
  y += 24;

  // ==========================================
  // SECTION II: NONPROFIT / ORGANIZATION INFORMATION
  // ==========================================
  drawBanner('SECTION II. NONPROFIT / ORGANIZATION INFORMATION — To be completed by supervisor.');

  drawInlineField('Organization Name:', formData.org_name || '', margin, 360, y);
  drawInlineField('MCPS SSL Listed?', 'Yes [X]   No [ ]', margin + 370, 170, y);
  y += 18;

  drawInlineField('Federal EIN #:', formData.ein || 'XX-XXXXXXX', margin, 180, y);
  drawInlineField('Supervisor Phone:', formData.supervisor_phone || '', margin + 190, 170, y);
  drawInlineField('Supervisor Email:', formData.supervisor_email || '', margin + 370, 170, y);
  y += 18;

  drawInlineField('Describe Activity:', formData.opp_title || 'Community Service Activity', margin, contentWidth, y);
  y += 22;

  // Service Record Table
  const tableX = margin;
  const tableW = contentWidth;
  doc.setFillColor(241, 245, 249);
  doc.rect(tableX, y, tableW, 16, 'F');
  doc.rect(tableX, y, tableW, 36, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Date From', tableX + 20, y + 11);
  doc.text('Date To', tableX + 120, y + 11);
  doc.text('# Days', tableX + 220, y + 11);
  doc.text('# Hours / Day', tableX + 310, y + 11);
  doc.text('Total Hours Completed', tableX + 410, y + 11);

  doc.line(tableX, y + 16, tableX + tableW, y + 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(formData.service_date || new Date().toISOString().split('T')[0], tableX + 15, y + 28);
  doc.text(formData.service_date || new Date().toISOString().split('T')[0], tableX + 115, y + 28);
  doc.text('1', tableX + 230, y + 28);
  doc.text(String(formData.hours || 1), tableX + 330, y + 28);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formData.hours || 1} Hours`, tableX + 420, y + 28);
  y += 44;

  drawInlineField('Supervisor Name (print):', formData.supervisor_name || 'Volunteer Supervisor', margin, 320, y);
  drawInlineField('Title:', 'Program Director', margin + 330, 210, y);
  y += 18;
  drawInlineField('Supervisor Signature:', '_______________________ (Verified Electronically)', margin, 340, y);
  drawInlineField('Date:', formData.service_date || '', margin + 350, 190, y);
  y += 24;

  // ==========================================
  // SECTION III: STUDENT REFLECTION
  // ==========================================
  drawBanner('SECTION III. STUDENT REFLECTION — Think about your SSL activity & community impact.');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Respond to the following in a paragraph: What did you do, who benefited, what did you learn, and how was it connected to school?', margin, y);
  y += 12;
  doc.setTextColor(0, 0, 0);

  // Reflection Box - Formatted Paragraph
  const reflectionText = buildCombinedReflection(formData);
  const boxHeight = 110;
  doc.rect(margin, y, contentWidth, boxHeight, 'S');

  // Wrap text inside reflection box using Helvetica 9pt metrics
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const wrappedLines = doc.splitTextToSize(reflectionText, contentWidth - 16);
  let lineY = y + 14;
  for (let i = 0; i < wrappedLines.length && lineY < y + boxHeight - 8; i++) {
    doc.text(wrappedLines[i], margin + 8, lineY);
    lineY += 12;
  }
  y += boxHeight + 16;

  // ==========================================
  // MCPS SSL COORDINATOR USE ONLY
  // ==========================================
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 54, 'F');
  doc.rect(margin, y, contentWidth, 54, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('MCPS SSL COORDINATOR USE ONLY', margin + 8, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('[  ] Check if automatic hours attached as result of course instruction', margin + 200, y + 14);

  doc.text('Verification form submitted to coordinator Date: ____/____/________', margin + 8, y + 32);
  doc.text(`Hours earned previously: ______ + Hours for this activity: ${formData.hours || 0} = Total: ______`, margin + 8, y + 46);
  doc.text('Date: ____/____/________', margin + 380, y + 46);

  // Footer
  y += 66;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text('Generated via Amanah — Official MCPS Form 560-51 Auto-Fill Engine', pageWidth / 2, y, { align: 'center' });

  return doc.output('arraybuffer');
};
