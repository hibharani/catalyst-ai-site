// ─── Priya's identity context (embedded from CLAUDE.md) ───

const PRIYA_CONTEXT = `# Priya Sharma — Catalyst AI Advisory

## About Me

I'm Priya Sharma, founder of Catalyst AI Advisory. I help mid-market Indian companies operationalize AI without hiring a data science team.

Background: 8 years at McKinsey (Mumbai office — industrial and tech clients), then 3 years as Head of Strategy at Flipkart where I built the seller analytics platform from scratch. Went independent 2 years ago because I kept seeing the same problem: companies sitting on goldmines of data with zero idea how to use it.

Based in: Indiranagar, Bangalore. Work with clients across India and SE Asia.

My edge: I'm not a data scientist and I'm not a pure management consultant. I'm the person who sits between the two — I understand the business problem deeply enough to know WHERE AI helps, and I'm technical enough to BUILD the first version myself. Most consultants do one or the other. I do both.

## What I Offer

1. AI Operations Audit (2-week diagnostic, ₹3-5L) — Embedded with the team, map every process where AI can help, test Claude/GPT on real data, deliver prioritized roadmap with estimated ROI.
2. AI Workflow Sprint (6-8 weeks, ₹8-15L) — Take 2-3 high-impact use cases and build working AI workflows. Build, test, iterate, document, train.
3. Executive AI Workshop (2-day intensive, ₹2-3L) — Hands-on session for leadership teams using AI on their own business problems.
4. Retained Advisory (ongoing, ₹1.5-2.5L/month) — Monthly retainer: review AI initiatives, troubleshoot, train, keep updated.

Typical clients: ₹50Cr-500Cr revenue, 100-1000 employees, Series A-C SaaS, D2C brands, manufacturing, financial services.

## My Writing Voice

Tone: Direct but warm. No corporate speak. I write like I talk — like a smart friend who happens to know AI. Confident but not arrogant.

Patterns:
- Opens with a concrete example or story, never an abstract statement
- Uses "here's the thing" as a transition into the real insight
- Asks rhetorical questions to set up a point
- Uses numbers and specifics over vague claims: "saved 14 hours/week" not "significant time savings"
- Short paragraphs. Often just 2-3 sentences.
- Ends with a clear action item or takeaway

Avoids: Buzzwords (synergy, leverage, disrupt, paradigm shift), hedging language, passive voice, overclaiming, jargon without explanation.

Indian English (natural, not forced): "lakh" and "crore" not "100K" and "10M", "prepone", "do one thing" as a suggestion opener.`;

// ─── Inline SVG logo ───

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 80" width="280" height="60">
  <defs>
    <linearGradient id="accentGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e8503a"/>
      <stop offset="100%" stop-color="#d4a044"/>
    </linearGradient>
    <clipPath id="aClip">
      <text x="0" y="52" font-family="'Bricolage Grotesque', 'Segoe UI', Arial, sans-serif"
            font-weight="800" font-size="46" letter-spacing="-1.5">CATALYST</text>
    </clipPath>
  </defs>
  <text x="0" y="52" font-family="'Bricolage Grotesque', 'Segoe UI', Arial, sans-serif"
        font-weight="800" font-size="46" fill="#f0f0f2" letter-spacing="-1.5">CATALYST</text>
  <line x1="55" y1="52" x2="78" y2="14"
        stroke="url(#accentGrad2)" stroke-width="3.5" stroke-linecap="round"/>
  <polygon points="78,10 81,14 78,18 75,14" fill="#e8503a"/>
  <text x="295" y="52" font-family="'Bricolage Grotesque', 'Segoe UI', Arial, sans-serif"
        font-weight="800" font-size="46" fill="#e8503a" letter-spacing="-1.5">AI</text>
  <circle cx="286" cy="42" r="3" fill="#d4a044"/>
  <text x="1" y="72" font-family="'Urbanist', 'Segoe UI', Arial, sans-serif"
        font-weight="500" font-size="11" fill="#a0a3b1" letter-spacing="5.5">A D V I S O R Y</text>
</svg>`;

// ─── Helper: call OpenRouter ───

async function callOpenRouter(apiKey, systemPrompt, messages, instruction) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://catalystai.in',
      'X-Title': 'Catalyst AI Advisory',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
        { role: 'user', content: instruction },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// ─── STEP 1: Generate proposal content ───

async function generateProposalContent(apiKey, messages, intake) {
  const systemPrompt = `You are Priya Sharma writing a formal proposal for a prospective client. Use Priya's voice and style throughout.\n\n${PRIYA_CONTEXT}`;

  const instruction = `Generate a personalized proposal for this visitor. Here is their intake information:

Company: ${intake.company || 'Not provided'}
Industry: ${intake.industry || 'Not provided'}
Company size: ${intake.size || 'Not provided'}
Challenge: ${intake.challenge || 'Not provided'}
What they've tried: ${intake.tried || 'Not provided'}
What success looks like: ${intake.success || 'Not provided'}
Budget range: ${intake.budget || 'Not provided'}
Contact: ${intake.name || 'Not provided'} (${intake.email || 'Not provided'})

Reference their specific situation, challenges, and goals. Use Priya's voice and style. Structure as:

1. Executive Summary (reference THEIR company and challenge)
2. Understanding Your Challenge (mirror THEIR words)
3. Proposed Approach (tailored to THEIR situation, not generic)
4. Timeline (mapped to THEIR stated goals)
5. Investment (scoped to THEIR budget range)
6. Next Steps

Write in plain text with clear section headers. No markdown formatting — no #, no **, no -, no *. Just plain text with line breaks.`;

  return await callOpenRouter(apiKey, systemPrompt, messages, instruction);
}

// ─── STEP 2: Generate HTML proposal ───

function generateProposalHTML(proposalContent, intake) {
  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const companyName = intake.company || 'Your Company';
  const contactName = intake.name || 'Valued Client';

  // Convert plain text sections into HTML paragraphs
  const contentHTML = proposalContent
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      // Detect section headers (lines that look like "1. Title" or all-caps short lines)
      if (/^\d+\.\s+/.test(trimmed) && trimmed.length < 80) {
        return `<h2 class="section-heading">${trimmed}</h2>`;
      }
      return `<p>${trimmed}</p>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proposal for ${companyName} — Catalyst AI Advisory</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&family=Urbanist:wght@300;400;500;600&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background: #08090e;
      color: #d0d1d8;
      font-family: 'Urbanist', 'Segoe UI', Arial, sans-serif;
      font-weight: 400;
      font-size: 15px;
      line-height: 1.75;
      padding: 0;
    }

    .proposal-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 60px 48px;
    }

    .header {
      border-bottom: 1px solid #1e2030;
      padding-bottom: 40px;
      margin-bottom: 40px;
    }

    .logo {
      margin-bottom: 32px;
    }

    .header-meta {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 16px;
    }

    .prepared-for {
      font-family: 'Urbanist', sans-serif;
      font-weight: 300;
      font-size: 13px;
      color: #a0a3b1;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .company-name {
      font-family: 'Bricolage Grotesque', sans-serif;
      font-weight: 800;
      font-size: 28px;
      color: #f0f0f2;
      letter-spacing: -0.5px;
    }

    .date {
      font-size: 13px;
      color: #a0a3b1;
      text-align: right;
    }

    .author {
      font-size: 13px;
      color: #d4a044;
      margin-top: 4px;
    }

    .proposal-body {
      margin-bottom: 48px;
    }

    .proposal-body p {
      margin-bottom: 14px;
      color: #d0d1d8;
    }

    .section-heading {
      font-family: 'Bricolage Grotesque', sans-serif;
      font-weight: 600;
      font-size: 20px;
      color: #e8503a;
      margin-top: 36px;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #1a1b28;
    }

    .footer {
      border-top: 1px solid #1e2030;
      padding-top: 32px;
      margin-top: 48px;
      text-align: center;
    }

    .footer-brand {
      font-family: 'Bricolage Grotesque', sans-serif;
      font-weight: 600;
      font-size: 14px;
      color: #a0a3b1;
      margin-bottom: 8px;
    }

    .footer-contact {
      font-size: 13px;
      color: #6b6e80;
    }

    .footer-contact a {
      color: #d4a044;
      text-decoration: none;
    }

    .accent-bar {
      width: 48px;
      height: 3px;
      background: linear-gradient(90deg, #e8503a, #d4a044);
      border-radius: 2px;
      margin: 0 auto 16px auto;
    }

    @media print {
      body { background: #fff; color: #222; }
      .proposal-container { padding: 40px 32px; }
      .section-heading { color: #c0392b; }
      .company-name { color: #111; }
      .proposal-body p { color: #333; }
    }
  </style>
</head>
<body>
  <div class="proposal-container">
    <div class="header">
      <div class="logo">
        ${LOGO_SVG}
      </div>
      <div class="header-meta">
        <div>
          <div class="prepared-for">Prepared for</div>
          <div class="company-name">${companyName}</div>
        </div>
        <div>
          <div class="date">${today}</div>
          <div class="author">Priya Sharma</div>
          <div class="author" style="color: #a0a3b1; font-size: 12px;">Catalyst AI Advisory</div>
        </div>
      </div>
    </div>

    <div class="proposal-body">
      ${contentHTML}
    </div>

    <div class="footer">
      <div class="accent-bar"></div>
      <div class="footer-brand">Catalyst AI Advisory</div>
      <div class="footer-contact">
        Priya Sharma &middot; <a href="mailto:priya@catalystai.in">priya@catalystai.in</a> &middot; Bangalore, India
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ─── STEP 3: Generate personalized email ───

async function generateEmail(apiKey, messages, intake) {
  const systemPrompt = `You are Priya Sharma writing a quick follow-up email to a prospective client you just chatted with on your website.\n\n${PRIYA_CONTEXT}`;

  const instruction = `Write a short personalized email to ${intake.name || 'the visitor'} at ${intake.company || 'their company'}.

Their challenge: ${intake.challenge || 'Not specified'}
Their budget: ${intake.budget || 'Not specified'}
What success looks like for them: ${intake.success || 'Not specified'}

Rules:
- First line should be just the subject line, prefixed with "Subject: "
- Then a blank line
- Then the email body
- The subject line should reference their specific challenge
- Open with a reference to the conversation we just had
- Include a hook from something specific they said or their situation
- Close with a personalized next step
- Written in Priya's voice — direct, warm, no jargon
- 4-5 sentences max for the body
- No markdown. Plain text only. Write like a human sending a quick email.
- Sign off with just "Priya"`;

  const result = await callOpenRouter(apiKey, systemPrompt, messages, instruction);

  // Parse subject and body
  const lines = result.trim().split('\n');
  let subject = 'Your AI Advisory Proposal — Catalyst AI';
  let body = result;

  const subjectLine = lines.find(l => l.toLowerCase().startsWith('subject:'));
  if (subjectLine) {
    subject = subjectLine.replace(/^subject:\s*/i, '').trim();
    const subjectIndex = lines.indexOf(subjectLine);
    body = lines
      .slice(subjectIndex + 1)
      .join('\n')
      .trim();
  }

  return { subject, body };
}

// ─── STEP 4: Send email via Resend ───

async function sendEmail(intake, subject, emailBody, proposalHTML) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log('RESEND_API_KEY not set — skipping email send');
    return false;
  }

  const proposalBase64 = Buffer.from(proposalHTML, 'utf-8').toString('base64');
  const companySlug = (intake.company || 'proposal').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Priya Sharma <onboarding@resend.dev>',
      to: [intake.email],
      subject: subject,
      text: emailBody,
      attachments: [
        {
          filename: `catalyst-ai-proposal-${companySlug}.html`,
          content: proposalBase64,
          type: 'text/html',
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Resend API error:', response.status, errorText);
    return false;
  }

  return true;
}

// ─── STEP 5: Score the lead ───

function scoreLead(intake) {
  const fields = [
    intake.challenge,
    intake.budget,
    intake.tried,
    intake.success,
    intake.size,
    intake.industry,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // HIGH signals
  const highSignals = [
    /(\d+)\s*lakh/i.test(fields) && parseInt(fields.match(/(\d+)\s*lakh/i)?.[1] || '0') >= 5,
    /₹\s*5l/i.test(fields),
    /₹\s*[5-9]\d*l/i.test(fields),
    /₹?\s*([8-9]|[1-9]\d)\s*-?\s*\d*\s*l/i.test(fields),
    /10\+?\s*lakh|15\s*lakh|20\s*lakh|crore/i.test(fields),
    /decision\s*maker|ceo|coo|cto|vp|head of|director|founder/i.test(fields),
    /before\s*q[1-4]|this\s*quarter|next\s*month|urgent|asap|immediately/i.test(fields),
    /clear\s*timeline|ready\s*to\s*start|want\s*to\s*begin/i.test(fields),
    /budget\s*(allocated|approved|ready|set)/i.test(fields),
  ];

  // LOW signals
  const lowSignals = [
    /just\s*exploring|just\s*curious|no\s*budget|not\s*sure|thinking\s*about/i.test(fields),
    /catch\s*up\s*sometime|maybe\s*later|no\s*rush|no\s*timeline/i.test(fields),
    !intake.budget || intake.budget.trim() === '',
    !intake.challenge || intake.challenge.trim() === '',
  ];

  const highCount = highSignals.filter(Boolean).length;
  const lowCount = lowSignals.filter(Boolean).length;

  if (highCount >= 2) return 'HIGH';
  if (lowCount >= 3) return 'LOW';
  if (highCount >= 1) return 'MEDIUM';
  if (lowCount >= 2) return 'LOW';
  return 'MEDIUM';
}

// ─── STEP 6: Store in Supabase ───

async function storeInSupabase(intake, score, messages) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('SUPABASE_URL or SUPABASE_KEY not set — skipping lead storage');
    return false;
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/leads`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({
      name: intake.name || null,
      company: intake.company || null,
      email: intake.email || null,
      industry: intake.industry || null,
      challenge: intake.challenge || null,
      budget: intake.budget || null,
      score: score,
      conversation_transcript: JSON.stringify(messages),
      status: 'proposal_sent',
      created_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Supabase API error:', response.status, errorText);
    return false;
  }

  return true;
}

// ─── STEP 7: Alert via Telegram ───

async function alertTelegram(intake, score) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — skipping Telegram alert');
    return false;
  }

  const challengeSummary = (intake.challenge || 'Not specified').substring(0, 100);
  const message = `🔔 New lead: ${intake.name || 'Unknown'} from ${intake.company || 'Unknown'}
Challenge: ${challengeSummary}
Budget: ${intake.budget || 'Not specified'}
Score: ${score}
Proposal sent to: ${intake.email || 'No email'}`;

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Telegram API error:', response.status, errorText);
    return false;
  }

  return true;
}

// ─── Main handler ───

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { messages, intake } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    if (!intake || typeof intake !== 'object') {
      return res.status(400).json({ error: 'intake object is required' });
    }

    const steps = {
      proposal: false,
      email: false,
      stored: false,
      alerted: false,
    };

    // ── STEP 1: Generate proposal content ──
    console.log('Step 1: Generating proposal content...');
    const proposalContent = await generateProposalContent(apiKey, messages, intake);
    steps.proposal = true;

    // ── STEP 2: Generate HTML proposal ──
    console.log('Step 2: Generating HTML proposal...');
    const proposalHTML = generateProposalHTML(proposalContent, intake);

    // ── STEP 3: Generate personalized email ──
    console.log('Step 3: Generating personalized email...');
    let emailSubject = '';
    let emailBody = '';
    try {
      const emailResult = await generateEmail(apiKey, messages, intake);
      emailSubject = emailResult.subject;
      emailBody = emailResult.body;
    } catch (err) {
      console.error('Step 3 failed (email generation):', err.message);
      // Fallback email
      emailSubject = `Your AI Advisory Proposal — ${intake.company || 'Catalyst AI'}`;
      emailBody = `Hi ${intake.name || 'there'},\n\nGreat chatting with you! I've put together a proposal based on our conversation. Take a look at the attached document and let me know what you think.\n\nHappy to jump on a quick call this week to walk through it.\n\nPriya`;
    }

    // ── STEP 4: Send email via Resend ──
    console.log('Step 4: Sending email via Resend...');
    try {
      if (intake.email) {
        steps.email = await sendEmail(intake, emailSubject, emailBody, proposalHTML);
      } else {
        console.log('No email provided — skipping email send');
      }
    } catch (err) {
      console.error('Step 4 failed (email send):', err.message);
    }

    // ── STEP 5: Score the lead ──
    console.log('Step 5: Scoring lead...');
    const score = scoreLead(intake);

    // ── STEP 6: Store in Supabase ──
    console.log('Step 6: Storing in Supabase...');
    try {
      steps.stored = await storeInSupabase(intake, score, messages);
    } catch (err) {
      console.error('Step 6 failed (Supabase):', err.message);
    }

    // ── STEP 7: Alert via Telegram ──
    console.log('Step 7: Sending Telegram alert...');
    try {
      steps.alerted = await alertTelegram(intake, score);
    } catch (err) {
      console.error('Step 7 failed (Telegram):', err.message);
    }

    console.log('Pipeline complete:', { score, steps });

    return res.status(200).json({
      success: true,
      score,
      steps,
    });
  } catch (err) {
    console.error('Proposal generation error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
