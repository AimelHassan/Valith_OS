// Modular AI Service for Valith OS
// Supports Gemini API with fallbacks and can be extended to OpenAI/Claude

export type AIProvider = 'Gemini' | 'OpenAI' | 'Claude' | 'Mock';

export interface ParsedCaptureResult {
  organization?: {
    name: string;
    website?: string;
    industry?: string;
    location?: string;
  };
  contact?: {
    full_name: string;
    role_title?: string;
    email?: string;
    whatsapp?: string;
    relationship_strength?: 'Cold' | 'Warm' | 'Strong' | 'Strategic';
  };
  lead?: {
    lead_name: string;
    source_channel: 'LinkedIn' | 'WhatsApp' | 'Email' | 'Referral' | 'Website' | 'Event' | 'Manual' | 'Other';
    segment?: string;
    offer_angle?: string;
    stage?: string;
    deal_value_estimate?: number;
    monthly_retainer_estimate?: number;
    next_action?: string;
    pain_points?: string;
    notes?: string;
  };
  task?: {
    title: string;
    due_date?: string;
    priority?: 'High' | 'Medium' | 'Low';
  };
}

// Helper to get active API Key from Settings or Environment
export function getApiKey(provider: AIProvider = 'Gemini'): string {
  if (provider === 'Gemini') {
    return import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('vos_gemini_api_key') || '';
  }
  return '';
}

// ----------------------------------------------------
// GEMINI PROVIDER ADAPTER
// ----------------------------------------------------
async function callGemini(prompt: string, apiKey: string, systemInstruction?: string, jsonMode: boolean = false): Promise<string> {
  const model = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ],
    generationConfig: jsonMode ? {
      responseMimeType: 'application/json'
    } : undefined,
    systemInstruction: systemInstruction ? {
      parts: [
        { text: systemInstruction }
      ]
    } : undefined
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errText}`);
  }

  const result = await response.json();
  return result.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ----------------------------------------------------
// EXPOSED MODULAR SERVICE
// ----------------------------------------------------
export const aiService = {
  // Parse raw text into structured JSON entities
  async parseCaptureInbox(rawText: string, provider: AIProvider = 'Gemini'): Promise<ParsedCaptureResult> {
    const apiKey = getApiKey(provider);

    if (provider === 'Mock' || !apiKey) {
      console.log('Using Mock/Fallback parser (missing API Key or Provider is Mock)');
      return mockParse(rawText);
    }

    const systemPrompt = `You are a high-performance CRM parser for Valith AI Solutions.
Parse the raw outreach message, meeting transcript snippet, or WhatsApp conversation into structured JSON.
Return ONLY valid JSON matching this schema:
{
  "organization": {
    "name": "Company Name",
    "website": "URL if found",
    "industry": "e.g. Technology, Logistics, PR, legal",
    "location": "City or Country"
  },
  "contact": {
    "full_name": "Person Name",
    "role_title": "Job title",
    "email": "Email address",
    "whatsapp": "Phone or Whatsapp",
    "relationship_strength": "Cold", "Warm", "Strong", or "Strategic"
  },
  "lead": {
    "lead_name": "A descriptive title for this lead",
    "source_channel": "LinkedIn", "WhatsApp", "Email", "Referral", "Website", "Event", "Manual", or "Other",
    "segment": "A1 Whale", "A2 RFP Active", "A3 Smaller RFP Active", "A4 Workflow Fit", "Foreign Partner", "WhatsApp Lead", "Strategic", or "Other",
    "offer_angle": "RFP Intelligence", "WhatsApp Workflow Assistant", "AI Workflow Audit", "Inbox Automation", "Partner/Implementation", or "Other",
    "stage": "New", "Connected", "Messaged", "Replied", "Demo Sent", "Meeting Scheduled", "SOW Sent", "Negotiation", "Closed Won", "Closed Lost", "Cold", or "Archived",
    "deal_value_estimate": 150000, // Number representing local currency PKR or USD value
    "monthly_retainer_estimate": 45000,
    "next_action": "Single immediate next step",
    "pain_points": "Client frustrations or manual bottlenecks",
    "notes": "Any other context"
  },
  "task": {
    "title": "A follow-up task title if implied",
    "due_date": "YYYY-MM-DD",
    "priority": "High", "Medium", or "Low"
  }
}`;

    const prompt = `Parse the following text:
---
${rawText}
---`;

    try {
      const textResponse = await callGemini(prompt, apiKey, systemPrompt, true);
      return JSON.parse(textResponse) as ParsedCaptureResult;
    } catch (error) {
      console.error('Gemini parse failed, falling back to regex parser:', error);
      return mockParse(rawText);
    }
  },

  // Q&A Workspace Advisor
  async askAdvisor(question: string, contextSummary: string, provider: AIProvider = 'Gemini'): Promise<string> {
    const apiKey = getApiKey(provider);

    if (provider === 'Mock' || !apiKey) {
      return `### Valith OS AI Advisor (Offline Mode)
      
> **Notice:** Gemini API key is missing. Set a valid \`GEMINI_API_KEY\` in settings or env file to enable live reasoning.

Based on current dashboard summary data, here is your offline analysis:
- **Priorities:** Follow up on MARCEM today (meeting scheduled, confirm details).
- **Outreach:** Send proposal info to Ahmad Javad / Protribes (CEO replied and wants details).
- **Cash flow:** Optimize Digital is locked (150,000 PKR). Follow up on clearance to unlock delivery.
`;
    }

    const systemPrompt = `You are the Valith OS Senior AI Advisor. 
You analyze pipeline, finance, tasks, and notes of Valith AI Solutions (a premium AI systems agency focusing on Autonomous Infrastructure, custom agent systems, and document workflow automations).
Use the context database summary provided below to provide highly strategic, technical, and concrete recommendations.
Never use words like "Machine Learning", "Synergy", "Transform", or "Unlock".
Format your response in beautiful, premium minimal Markdown.`;

    const prompt = `--- DATABASE CONTEXT SUMMARY ---
${contextSummary}
-------------------------------

User Question: ${question}`;

    try {
      return await callGemini(prompt, apiKey, systemPrompt, false);
    } catch (error: any) {
      return `Error communicating with Gemini: ${error.message || error}`;
    }
  }
};

// ----------------------------------------------------
// REGEX-BASED FALLBACK PARSER
// ----------------------------------------------------
function mockParse(text: string): ParsedCaptureResult {
  // Simple heuristic parser for offline/no-api-key operations
  const lines = text.split('\n');
  let company = 'Unknown Org';
  let name = 'Unknown Contact';
  let email = '';
  let phone = '';

  for (const line of lines) {
    if (line.toLowerCase().includes('company:') || line.toLowerCase().includes('org:')) {
      company = line.split(':')[1]?.trim() || company;
    }
    if (line.toLowerCase().includes('name:') || line.toLowerCase().includes('contact:')) {
      name = line.split(':')[1]?.trim() || name;
    }
    if (line.includes('@')) {
      const match = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (match) email = match[0];
    }
  }

  // Attempt to guess company name if empty
  if (company === 'Unknown Org' && text.includes('at ')) {
    const match = text.match(/at\s+([A-Z][a-zA-Z0-9\s]+)/);
    if (match) company = match[1].trim();
  }

  // Attempt to guess contact name
  if (name === 'Unknown Contact') {
    const match = text.match(/([A-Z][a-z]+)\s+([A-Z][a-z]+)/);
    if (match) name = `${match[1]} ${match[2]}`;
  }

  return {
    organization: {
      name: company,
      website: '',
      industry: 'Technology',
      location: 'Pakistan'
    },
    contact: {
      full_name: name,
      role_title: 'Executive',
      email,
      whatsapp: phone,
      relationship_strength: 'Warm'
    },
    lead: {
      lead_name: `${company} Outreach`,
      source_channel: 'LinkedIn',
      segment: 'A2 RFP Active',
      offer_angle: 'RFP Intelligence',
      stage: 'Replied',
      deal_value_estimate: 150000,
      monthly_retainer_estimate: 30000,
      next_action: 'Email company profile details',
      pain_points: 'Manual information processing',
      notes: `Parsed automatically: "${text.substring(0, 100)}..."`
    },
    task: {
      title: `Send follow-up to ${name}`,
      due_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days from now
      priority: 'Medium'
    }
  };
}
