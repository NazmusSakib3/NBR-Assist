import { jsPDF } from "jspdf";

type ChecklistItem = {
  id: string;
  text: string;
  completed: boolean;
};

type Checklist = {
  id: string;
  title: string;
  businessType: string;
  items: ChecklistItem[];
};

export function downloadChecklistPdf(checklist: Checklist) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 48;
  let y = 56;
  const lineHeight = 18;
  const maxWidth = 500;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("NBR Assist — Compliance Checklist", marginX, y);
  y += 28;

  doc.setFontSize(13);
  doc.text(checklist.title, marginX, y);
  y += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(`Business type: ${checklist.businessType}`, marginX, y);
  y += 14;
  doc.text(`Generated: ${new Date().toLocaleDateString("en-BD")}`, marginX, y);
  y += 24;
  doc.setTextColor(0);

  const done = checklist.items.filter((item) => item.completed).length;
  doc.text(`Progress: ${done}/${checklist.items.length} completed`, marginX, y);
  y += 22;

  checklist.items.forEach((item, index) => {
    const mark = item.completed ? "[x]" : "[ ]";
    const lines = doc.splitTextToSize(
      `${mark} ${index + 1}. ${item.text}`,
      maxWidth,
    );

    if (y + lines.length * lineHeight > 780) {
      doc.addPage();
      y = 56;
    }

    doc.text(lines, marginX, y);
    y += lines.length * lineHeight + 6;
  });

  y += 12;
  if (y > 760) {
    doc.addPage();
    y = 56;
  }
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    "For guidance only — verify requirements with NBR or a qualified professional.",
    marginX,
    y,
  );

  const safeName = checklist.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  doc.save(`${safeName || "checklist"}.pdf`);
}
