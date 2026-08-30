export function cosineSimilarity(a: number[], b: number[]) {
  if (a.length !== b.length) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function chunkText(text: string, chunkSize = 900, overlap = 120) {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    const end = Math.min(start + chunkSize, normalized.length);
    chunks.push(normalized.slice(start, end).trim());
    if (end === normalized.length) break;
    start = Math.max(end - overlap, start + 1);
  }

  return chunks.filter(Boolean);
}
