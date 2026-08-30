import { addMonths, addQuarters, endOfMonth, setDate, startOfMonth } from "date-fns";
import type { ComplianceType } from "@prisma/client";

export type DeadlineTemplate = {
  title: string;
  type: ComplianceType;
  description: string;
  dayOfMonth: number;
  recurring: "monthly" | "quarterly" | "yearly";
};

export const DEFAULT_DEADLINE_TEMPLATES: DeadlineTemplate[] = [
  {
    title: "Monthly VAT Return (Mushak-9.1)",
    type: "VAT",
    description: "Submit VAT return for the previous month to NBR.",
    dayOfMonth: 15,
    recurring: "monthly",
  },
  {
    title: "Quarterly VAT Summary",
    type: "VAT",
    description: "Review quarterly VAT position and reconcile input/output tax.",
    dayOfMonth: 20,
    recurring: "quarterly",
  },
  {
    title: "Income Tax Advance Payment",
    type: "INCOME_TAX",
    description: "Pay advance income tax installment if applicable.",
    dayOfMonth: 15,
    recurring: "quarterly",
  },
  {
    title: "Annual Income Tax Return",
    type: "INCOME_TAX",
    description: "File annual income tax return for the assessment year.",
    dayOfMonth: 30,
    recurring: "yearly",
  },
  {
    title: "TIN Certificate Renewal Check",
    type: "TIN",
    description: "Verify TIN status and update business information if changed.",
    dayOfMonth: 10,
    recurring: "yearly",
  },
  {
    title: "Trade License Renewal",
    type: "TRADE_LICENSE",
    description: "Renew municipal trade license before expiry.",
    dayOfMonth: 30,
    recurring: "yearly",
  },
];

function nextMonthlyDate(from: Date, dayOfMonth: number) {
  const candidate = setDate(startOfMonth(from), Math.min(dayOfMonth, 28));
  if (candidate <= from) {
    return setDate(startOfMonth(addMonths(from, 1)), Math.min(dayOfMonth, 28));
  }
  return candidate;
}

function nextQuarterlyDate(from: Date, dayOfMonth: number) {
  const quarterStart = startOfMonth(addQuarters(from, 0));
  let candidate = setDate(quarterStart, Math.min(dayOfMonth, 28));
  if (candidate <= from) {
    candidate = setDate(startOfMonth(addQuarters(from, 1)), Math.min(dayOfMonth, 28));
  }
  return candidate;
}

function nextYearlyDate(from: Date, dayOfMonth: number) {
  const yearStart = new Date(from.getFullYear(), 6, 1);
  let candidate = setDate(yearStart, Math.min(dayOfMonth, 28));
  if (candidate <= from) {
    candidate = setDate(new Date(from.getFullYear() + 1, 6, 1), Math.min(dayOfMonth, 28));
  }
  return endOfMonth(candidate);
}

export function generateUpcomingDeadlines(from = new Date()) {
  return DEFAULT_DEADLINE_TEMPLATES.map((template) => {
    let dueDate: Date;
    switch (template.recurring) {
      case "monthly":
        dueDate = nextMonthlyDate(from, template.dayOfMonth);
        break;
      case "quarterly":
        dueDate = nextQuarterlyDate(from, template.dayOfMonth);
        break;
      default:
        dueDate = nextYearlyDate(from, template.dayOfMonth);
    }

    return {
      title: template.title,
      type: template.type,
      description: template.description,
      dueDate,
    };
  });
}
