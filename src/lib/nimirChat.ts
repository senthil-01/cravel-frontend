// ─────────────────────────────────────────────────────────────────────────────
// nimirChat.ts
// Simple Groq LLM wrapper for the NIMIR chatbot.
// Context = live menu from MongoDB + businessInfo.
// ─────────────────────────────────────────────────────────────────────────────

import { businessChunks } from "@/lib/businessInfo";
import { MenuItem } from "@/lib/nimirApi";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions";
const MODEL        = "llama-3.1-8b-instant";

// ─── Exported Types ───────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

// ─── Build menu context string from live DB data ──────────────────────────────
// Only dish name + veg/non-veg label — no itemCode, no prices.

function buildMenuContext(menu: MenuItem[]): string {
  const grouped: Record<string, MenuItem[]> = {};
  for (const item of menu) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  }

  const lines: string[] = ["=== NIMIR MENU ==="];
  for (const [category, items] of Object.entries(grouped)) {
    lines.push(`[${category}]`);
    for (const item of items) {
      lines.push(`  ${item.menuName} (${item.vegNonVeg})`);
    }
  }
  return lines.join("\n");
}

// ─── Build compressed business context from businessChunks ───────────────────
// Instead of joining all verbose chunk content (~3500 tokens), we pick only
// the most customer-relevant chunks and strip whitespace aggressively.
// Chunks included: hours, halal, packages, tray sizes, ordering, delivery.
// Excluded (too verbose, low chat value): about-us, achievements, website-pages,
// event-types, services (all covered by the shorter chunks anyway).

const INCLUDED_CHUNK_IDS = new Set([
  "business-hours",
  "business-location",
  "faq-halal",
  "faq-delivery",
  "faq-custom",
  "tray-serving-sizes",
  "corporate-packages",
  "ordering",
]);

function buildBusinessContext(): string {
  return businessChunks
    .filter((c) => INCLUDED_CHUNK_IDS.has(c.id))
    .map((c) =>
      // Collapse multiple spaces/newlines into single space to cut tokens
      c.content.replace(/\s+/g, " ").trim()
    )
    .join("\n");
}

// ─── Pre-compute once at module load (not per request) ───────────────────────
const BUSINESS_CONTEXT = buildBusinessContext();

// ─── System prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(menu: MenuItem[]): string {
  return `You are a friendly ordering assistant for NIMIR Indian Catering.
Help customers choose dishes and answer questions about the service.

RULES:
- Only mention dishes listed in the MENU below.
- If a dish is not in the menu, say so clearly.
- Keep replies concise and friendly.
- Never invent prices — direct price questions to NIMIR staff.
- For order submission, direct customers to the order form in this chat.

${buildMenuContext(menu)}

=== BUSINESS INFO ===
${BUSINESS_CONTEXT}`;
}

// ─── Main exported function ───────────────────────────────────────────────────

export async function askNimir(
  question: string,
  history:  ChatMessage[],
  menu:     MenuItem[]
): Promise<string> {
  try {
    const systemPrompt = buildSystemPrompt(menu);

    const messages = [
      { role: "system", content: systemPrompt },
      // Only last 4 messages (2 exchanges) to keep token count low
      ...history.slice(-4).map((m) => ({ role: m.role, content: m.text })),
      { role: "user",   content: question },
    ];

    const res = await fetch(GROQ_URL, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:       MODEL,
        max_tokens:  400,
        temperature: 0.3,
        messages,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message ?? "Groq error");
    return data.choices[0].message.content as string;

  } catch (err) {
    console.error("[nimirChat] askNimir error:", err);
    return "Sorry, I had a technical issue. Please try again in a moment.";
  }
}