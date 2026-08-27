import { NextResponse } from "next/server";
import { searchOrthodoxCorpus, buildOrthodoxRAGPrompt } from "@/lib/orthodox-rag";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, category, author, limit = 5, threshold = 0.4 } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "Query is required." },
        { status: 400 }
      );
    }

    const documents = await searchOrthodoxCorpus(query.trim(), {
      limit: Math.min(Number(limit) || 5, 20),
      threshold: Number(threshold) || 0.4,
      category,
      author,
    });

    const ragContextPrompt = buildOrthodoxRAGPrompt(query, documents);

    return NextResponse.json({
      success: true,
      query,
      resultsCount: documents.length,
      documents,
      ragContextPrompt,
    });
  } catch (error: any) {
    console.error("Orthodox RAG API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during RAG retrieval." },
      { status: 500 }
    );
  }
}
