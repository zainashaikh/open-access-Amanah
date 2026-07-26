import { GoogleGenAI } from "@google/genai";

export async function handleChatRequest(req, res) {
  let bodyStr = "";
  
  req.on("data", chunk => {
    bodyStr += chunk;
  });

  req.on("end", async () => {
    let payload = {};
    try {
      if (bodyStr) payload = JSON.parse(bodyStr);
    } catch {
      payload = {};
    }

    const promptText = payload.prompt || payload.message || "Hello";
    const systemInstruction = payload.systemInstruction || `You are Amanah, an intelligent, practical, and empathetic AI Goal Coach and academic advisor for Muslim high school and college students in the DMV area (DC, Maryland, Virginia).

Your primary mission:
- Guide students on volunteer opportunities, MCPS/FCPS/PGCPS SSL (Student Service Learning) hours, and community involvement (e.g. MCC MD, ADAMS Sterling, Dar Al-Hijrah, Diyanet Center).
- Assist in planning academic goals, balancing AP/IB courses, extracurricular activities, and college admissions preparation.
- Help generate polished, impact-driven college resume bullet points using strong action verbs (Google XYZ formula).
- Recommend safe, halal-certified study spots and coffee shops in the DMV (e.g. Qamaria in Vienna, Shotted in Tysons, Bake & Karak in College Park).
- Provide warm, non-judgmental, actionable, and structured guidance.

Formatting Rules:
- Keep responses concise (typically 120-220 words) with clear bullet points where helpful.
- Be warm and welcoming. Speak naturally and encouragement-focused.
- Do NOT impersonate a medical, mental health, or legal professional. If crisis or self-harm is mentioned, share 988 lifeline immediately.`;

    // Try Gemini API first if process.env.GEMINI_API_KEY is defined
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim().length > 0) {
      try {
        const ai = new GoogleGenAI({
          apiKey: apiKey.trim(),
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build"
            }
          }
        });

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: promptText,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7
          }
        });

        const replyText = response.text;
        if (replyText && replyText.trim().length > 0) {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ result: replyText.trim() }));
          return;
        }
      } catch (geminiError) {
        console.warn("Gemini API call error, switching to dynamic fallback:", geminiError?.message || geminiError);
      }
    }

    // Context-aware dynamic fallback generator if GEMINI_API_KEY is not set or fails
    const reply = generateDynamicResponse(promptText);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ result: reply }));
  });
}

function generateDynamicResponse(prompt) {
  const p = prompt.toLowerCase();

  if (p.includes("ssl") || p.includes("hour") || p.includes("service learning") || p.includes("form")) {
    return `To earn and track your SSL (Student Service Learning) hours on Amanah:

1. **Discover Verified Opportunities**: Explore local listings like Dar Al-Hijrah Food Pantry, MCC MD Youth Circles, or ADAMS Sterling Weekend School.
2. **Log Your Hours**: After each session, record your service date, hours, supervisor email, and reflection on the **Volunteer Log** page.
3. **Export MCPS Form**: Go to the **SSL Forms** tab to generate a pre-filled MCPS Form 560-51 PDF with one click ready for submission!

Would you like me to help you find an SSL opportunity that matches your specific interests?`;
  }

  if (p.includes("resume") || p.includes("bullet") || p.includes("xyz") || p.includes("common app") || p.includes("college app")) {
    return `Here is a strong, action-driven resume bullet format tailored for your college applications:

• **Google XYZ Pattern**: *"Accomplished [X] as measured by [Y], by doing [Z]."*
• **Example**: *"Coordinated weekly youth mentorship and Quran study circles for 20+ middle school students at All Dulles Area Muslim Society, facilitating lesson logistics and logging 45 total community service hours."*

You can also use our **Resume Builder** tool in the navigation menu to automatically convert any of your logged service hours into tailored bullet points! What specific role would you like a bullet point for?`;
  }

  if (p.includes("cafe") || p.includes("study") || p.includes("coffee") || p.includes("library") || p.includes("quiet")) {
    return `Here are top recommendations for safe, halal-friendly study spots in the DMV:

1. **Qamaria Yemeni Coffee Co. (Vienna, VA)**: Very quiet, cozy booths, fast Wi-Fi, 100% Halal pastries, open late (until 11 PM).
2. **Shotted Specialty Coffee (Tysons, VA)**: Vibrant Saudi coffee shop with great desserts and study seating.
3. **Bake & Karak (College Park, MD)**: Quiet upstairs seating area near UMD campus, great for group study sessions.
4. **Local Public Libraries**: Silver Spring Library or Fairfax County Libraries offer free quiet study rooms.

Check out our **Study Cafe** tab on Amanah for interactive filters and opening hours!`;
  }

  if (p.includes("tutor") || p.includes("stem") || p.includes("teach") || p.includes("mentor")) {
    return `Tutoring is one of the most rewarding ways to earn service hours and build college leadership!

• **Local DMV Opportunities**: You can assist weekend Islamic school classes at ADAMS Sterling, ISB Al-Rahmah, or MCC MD.
• **Virtual Mentorship**: Join the Muslim STEM Network to tutor high school students 1-on-1 online in math, chemistry, or college essay writing.
• **Track Impact**: Remember to log your hours on Amanah so you can request supervisor verification and generate SSL forms!

What subjects or grade levels are you most interested in tutoring?`;
  }

  if (p.includes("ap") || p.includes("course") || p.includes("balance") || p.includes("stress") || p.includes("time management") || p.includes("schedule")) {
    return `Balancing rigorous AP/IB coursework with volunteer commitments can feel overwhelming, but consistency is key! Here are 3 practical tips:

1. **Set a Fixed Weekly Window**: Block out a specific 2-hour window every weekend for service (e.g., Saturday morning food pantry or Sunday tutoring).
2. **Quality over Quantity**: Selective, deep involvement in 1-2 meaningful organizations stands out far more to college admissions than fragmented hours across many places.
3. **Log Immediately**: Update your Volunteer Log right after each session so hours don't pile up unverified at the end of the semester.

How many AP classes are you taking this term? Let's build a weekly routine that works for you!`;
  }

  return `BarakAllahu Feek for reaching out! As your AI Goal Coach on Amanah, I'm here to help you:

• Find safe, skill-matched volunteer & internship opportunities in the DMV.
• Earn and track official MCPS/FCPS SSL hours and generate PDF forms.
• Turn your service and extracurriculars into impressive college resume bullet points.
• Discover quiet, halal-friendly study cafes and connect with peer skill swaps.

How can I support your goals today? Feel free to ask about SSL hours, resume bullets, or local volunteer roles!`;
}
