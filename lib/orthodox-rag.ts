import { GoogleGenAI } from "@google/genai";
import { supabase } from "@/lib/supabase";

export interface OrthodoxDocument {
  id?: string;
  corpus_category:
    | "patristic_commentary"
    | "early_church_fathers"
    | "liturgy"
    | "dogmatics"
    | "prayers";
  author: string;
  work_title: string;
  reference_location?: string;
  content: string;
  embedding?: number[];
  metadata?: Record<string, any>;
  similarity?: number;
}

export interface RAGSearchOptions {
  threshold?: number;
  limit?: number;
  category?: string;
  author?: string;
}

/**
 * Generate 768-dimension text embedding using Google Gemini Embedding Model
 */
export async function generateOrthodoxEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY in environment variables");
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
    config: {
      outputDimensionality: 768,
    },
  });

  const values = (response as any).embedding?.values || (response as any).embeddings?.[0]?.values;
  if (!values || !Array.isArray(values) || values.length === 0) {
    throw new Error("Failed to generate embedding from Gemini API");
  }

  return values;
}

/**
 * Retrieve top-k relevant patristic / orthodox corpus citations from Supabase pgvector
 */
export async function searchOrthodoxCorpus(
  query: string,
  options: RAGSearchOptions = {}
): Promise<OrthodoxDocument[]> {
  const { threshold = 0.45, limit = 5, category, author } = options;

  try {
    const queryEmbedding = await generateOrthodoxEmbedding(query);

    const { data, error } = await supabase.rpc("match_orthodox_documents", {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      filter_category: category || null,
      filter_author: author || null,
    });

    if (error) {
      console.warn("Supabase RPC match_orthodox_documents error:", error);
      return [];
    }

    return (data as OrthodoxDocument[]) || [];
  } catch (err) {
    console.warn("Orthodox RAG search error:", err);
    return [];
  }
}

/**
 * Split large Patristic / Liturgical text into chunks preserving semantic context
 */
export function chunkOrthodoxText(
  text: string,
  maxChunkSize: number = 800,
  overlap: number = 100
): string[] {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    if ((currentChunk + "\n\n" + trimmed).length <= maxChunkSize) {
      currentChunk = currentChunk ? `${currentChunk}\n\n${trimmed}` : trimmed;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      // If a single paragraph is longer than maxChunkSize, split by sentences
      if (trimmed.length > maxChunkSize) {
        const sentences = trimmed.split(/([.؟!؛\n]+)/);
        let sentenceChunk = "";
        for (const sentence of sentences) {
          if ((sentenceChunk + sentence).length <= maxChunkSize) {
            sentenceChunk += sentence;
          } else {
            if (sentenceChunk) chunks.push(sentenceChunk.trim());
            sentenceChunk = sentence;
          }
        }
        if (sentenceChunk.trim()) {
          currentChunk = sentenceChunk.trim();
        } else {
          currentChunk = "";
        }
      } else {
        // start new chunk with overlap if available
        const overlapText = currentChunk.slice(-overlap);
        currentChunk = overlapText ? `${overlapText}...\n${trimmed}` : trimmed;
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Strict Orthodox guardrail system prompt with RAG citations injection
 */
export function buildOrthodoxRAGPrompt(
  userQuery: string,
  retrievedDocs: OrthodoxDocument[]
): string {
  const formattedCitations = retrievedDocs.length > 0
    ? retrievedDocs
        .map(
          (doc, i) =>
            `[مرجع ${i + 1}]
المصدر: ${doc.work_title} - ${doc.author} (${doc.reference_location || "عام"})
التصنيف: ${doc.corpus_category}
النص:
${doc.content}`
        )
        .join("\n\n---\n\n")
    : "لا توجد مقتطفات مسترجعة مطابقة مباشرة من قاعدة المعرفة للبحث الحالي.";

  return `
[مراجع آبائية وليتورجية مسترجعة بنظام RAG الأرثوذكسي]
${formattedCitations}

[توجيهات الإجابة بالاعتماد على مراجع RAG]
- التزم بنصوص وتفاسير الآباء المذكورة أعلاه أولاً وأخيراً.
- عند الاستشهاد بأي تفسير أو قول، اذكر المرجع والمؤلف بوضوح (مثال: بحسب القديس يوحنا ذهبي الفم، أو بحسب أبونا تادرس يعقوب ملطي).
- ممنوع منعاً باتاً ذكر أي آراء لاهوتية مخالفة للعقيدة القبطية الأرثوذكسية أو الخروج عن التقليد الآبائي المقدس.
`;
}
