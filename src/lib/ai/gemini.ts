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
  const model = process.env.GEMINI_CHAT_MODEL ?? "gemini-3.5-flash-lite";
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
  const history = messages.slice(0, -1).map((message) => ({
    role: message.role,
    parts: [{ text: message.content }],
  }));

  const chat = model.startChat({
    history,
    systemInstruction: systemPrompt,
  });

  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessage(lastMessage.content);
  return result.response.text();
}
