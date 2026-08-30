export type ChecklistTemplate = {
  businessType: string;
  title: string;
  items: string[];
};

export const CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  {
    businessType: "retail",
    title: "Retail Shop Compliance Checklist",
    items: [
      "Obtain Trade License from City Corporation",
      "Register for TIN with NBR",
      "Enroll in VAT if turnover exceeds threshold",
      "Display prices and VAT-inclusive receipts",
      "Maintain purchase and sales records for 6 years",
      "File monthly VAT return (Mushak-9.1) by 15th",
      "Renew fire safety certificate if applicable",
    ],
  },
  {
    businessType: "restaurant",
    title: "Restaurant & Food Business Checklist",
    items: [
      "Obtain Trade License and food safety clearance",
      "Register TIN and VAT if applicable",
      "Maintain supplier invoices for raw materials",
      "Issue VAT challan on taxable sales",
      "Keep staff payroll records for tax deduction",
      "File monthly VAT return before deadline",
      "Renew health and trade licenses annually",
    ],
  },
  {
    businessType: "freelancer",
    title: "Freelancer / IT Consultant Checklist",
    items: [
      "Obtain TIN from NBR",
      "Track all local and foreign income",
      "File annual income tax return",
      "Maintain bank statements and invoices",
      "Pay advance tax if assessed",
      "Keep contracts and payment receipts",
      "Report foreign income per NBR guidelines",
    ],
  },
  {
    businessType: "export",
    title: "Export-Oriented Business Checklist",
    items: [
      "Register IRC (Import Registration Certificate)",
      "Register ERC (Export Registration Certificate)",
      "Maintain bonded warehouse records if applicable",
      "File customs and VAT documents on exports",
      "Track input tax credit on export supplies",
      "Reconcile shipping documents with invoices",
      "Submit annual compliance statements",
    ],
  },
];

export function getChecklistTemplate(businessType: string) {
  return (
    CHECKLIST_TEMPLATES.find(
      (template) => template.businessType === businessType.toLowerCase(),
    ) ?? CHECKLIST_TEMPLATES[0]
  );
}
