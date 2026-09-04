import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";

let client: GoogleGenerativeAI | null = null;

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  if (!client) {
    client = new GoogleGenerativeAI(apiKey);
  }
  return client;
}

export function getChatModel() {
  const model =
    process.env.GEMINI_CHAT_MODEL ?? "gemini-2.5-flash-lite";
  return getClient().getGenerativeModel({ model });
}

export async function embedText(
  text: string,
  taskType: TaskType = TaskType.RETRIEVAL_DOCUMENT,
): Promise<number[]> {
  const model = process.env.GEMINI_EMBED_MODEL ?? "gemini-embedding-001";
  const result = await getClient()
    .getGenerativeModel({ model })
    .embedContent({
      content: { role: "user", parts: [{ text }] },
      taskType,
    });
  const values = result.embedding.values;
  if (!values?.length) {
    throw new Error("Failed to generate embedding");
  }
  return values;
}

export async function generateChatResponse(
  systemPrompt: string,
  messages: { role: "user" | "model"; content: string }[],
) {
  const model = getChatModel();

  // Prefer generateContent over startChat — more reliable with systemInstruction
  // and avoids empty-history edge cases on some Gemini models.
  const contents = messages.map((message) => ({
    role: message.role,
    parts: [{ text: message.content }],
  }));

  const result = await model.generateContent({
    contents,
    systemInstruction: systemPrompt,
  });

  const text = result.response.text();
  if (!text?.trim()) {
    throw new Error("Empty response from Gemini");
  }
  return text;
}
