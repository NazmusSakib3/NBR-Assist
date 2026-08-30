import { TaskType } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import { embedText } from "@/lib/ai/gemini";
import { chunkText, cosineSimilarity } from "@/lib/ai/chunker";

export type RetrievedChunk = {
  id: string;
  content: string;
  documentTitle: string;
  score: number;
};

export async function ingestDocument(documentId: string) {
  const document = await prisma.regulationDocument.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  await prisma.documentChunk.deleteMany({ where: { documentId } });

  const chunks = chunkText(document.content);
  for (let index = 0; index < chunks.length; index += 1) {
    const content = chunks[index];
    const embedding = await embedText(content, TaskType.RETRIEVAL_DOCUMENT);
    await prisma.documentChunk.create({
      data: {
        documentId,
        content,
        embedding,
        chunkIndex: index,
      },
    });
  }

  return chunks.length;
}

export async function retrieveRelevantChunks(
  query: string,
  limit = 5,
): Promise<RetrievedChunk[]> {
  const queryEmbedding = await embedText(query, TaskType.RETRIEVAL_QUERY);

  const chunks = await prisma.documentChunk.findMany({
    include: {
      document: {
        select: { title: true, isPublished: true },
      },
    },
  });

  const scored = chunks
    .filter((chunk) => chunk.document.isPublished)
    .map((chunk) => {
      const embedding = chunk.embedding as number[];
      return {
        id: chunk.id,
        content: chunk.content,
        documentTitle: chunk.document.title,
        score: cosineSimilarity(queryEmbedding, embedding),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.filter((chunk) => chunk.score > 0.35);
}

export function buildRagPrompt(chunks: RetrievedChunk[]) {
  if (!chunks.length) {
    return "No regulation context was retrieved.";
  }

  return chunks
    .map(
      (chunk, index) =>
        `[Source ${index + 1}: ${chunk.documentTitle}]\n${chunk.content}`,
    )
    .join("\n\n---\n\n");
}
