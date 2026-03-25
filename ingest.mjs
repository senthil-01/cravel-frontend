// ingest.mjs  — place this in project ROOT (next to package.json)
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const SUPABASE_URL = "https://yfgbkwyrbrhctsqtognm.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZ2Jrd3lyYnJoY3RzcXRvZ25tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjg3NDAzNCwiZXhwIjoyMDg4NDUwMDM0fQ.ObXf5h-ThPkkicE37EC9Aw1BoSg7qHsfwRuGI1bnK0k"; // use service role key not anon key

const GOOGLE_API_KEY = "AIzaSyDt5cQJLXiNH7AhIiJou8SyRdAH7yQPgXE";


const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Load chunks from file ──────────────────────────────────────────────────
const allChunks = JSON.parse(fs.readFileSync("./chunks.json", "utf-8"));

console.log("Total chunks:", allChunks.length);

// ── Get embedding from Google ──────────────────────────────────────────────
async function getEmbedding(text) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: { parts: [{ text: text }] },
      }),
    }
  );
  const data = await response.json();
  if (!response.ok) throw new Error(`Google error: ${JSON.stringify(data.error)}`);
  return data.embedding.values;
}

// ── Ingest ─────────────────────────────────────────────────────────────────
async function ingest() {
  console.log(`Starting ingestion of ${allChunks.length} chunks...`);
  let success = 0;
  let failed = 0;

  for (let i = 0; i < allChunks.length; i++) {
    const chunk = allChunks[i];
    try {
      console.log(`[${i + 1}/${allChunks.length}] Embedding: ${chunk.id}`);
      const embedding = await getEmbedding(chunk.content);
      const { error } = await supabase.from("documents").upsert({
        id: chunk.id,
        content: chunk.content,
        metadata: chunk.metadata,
        embedding,
      });
      if (error) throw new Error(error.message);
      success++;
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      console.error(`❌ Failed: ${chunk.id} —`, err);
      failed++;
    }
  }
  console.log(`\n✅ Done! Success: ${success} | Failed: ${failed}`);
}

ingest();