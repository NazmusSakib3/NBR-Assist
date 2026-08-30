import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatAuthError(error: unknown) {
  if (typeof error === "string") return error;
  if (!error || typeof error !== "object") return "Request failed";

  const record = error as {
    formErrors?: string[];
    fieldErrors?: Record<string, string[]>;
  };

  const fieldMessages = Object.values(record.fieldErrors ?? {}).flat();
  const messages = [...(record.formErrors ?? []), ...fieldMessages];
  return messages.join(". ") || "Request failed";
}
