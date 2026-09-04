import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { ingestDocument } from "../src/lib/ai/rag";

const prisma = new PrismaClient();

/** Public demo owner password — safe to share for portfolio visitors. */
const DEMO_OWNER_PASSWORD =
  process.env.DEMO_OWNER_PASSWORD ?? "Demo@NBR2026!";

/** Admin password — keep private; set DEMO_ADMIN_PASSWORD in production. */
const DEMO_ADMIN_PASSWORD =
  process.env.DEMO_ADMIN_PASSWORD ?? "ChangeMe-Admin-NBR!";

const REGULATIONS = [
  {
    title: "VAT Return Filing — Mushak-9.1",
    category: "VAT" as const,
    source: "NBR VAT Guidelines",
    content: `Every registered VAT taxpayer in Bangladesh must file a monthly VAT return using form Mushak-9.1.
The return must be submitted by the 15th day of the following month.
The return includes output tax on sales, input tax on purchases, and net VAT payable or refundable.
Businesses must maintain invoices, debit notes, credit notes, and purchase records for at least six years.
Late filing may result in penalties and interest under the VAT and Supplementary Duty Act.
Small businesses above the turnover threshold must register for VAT with NBR and obtain a Business Identification Number (BIN).`,
  },
  {
    title: "TIN Registration Requirements",
    category: "TIN" as const,
    source: "NBR Income Tax",
    content: `A Taxpayer Identification Number (TIN) is mandatory for individuals and businesses earning taxable income in Bangladesh.
TIN registration is required before opening a business bank account, participating in tenders, or importing goods.
Applicants must provide NID, business address, trade license, and bank account details.
TIN certificates must be displayed at business premises and quoted on invoices and tax documents.
Businesses must update TIN information when ownership, address, or business type changes.
Freelancers earning local or foreign income should obtain TIN and file annual income tax returns.`,
  },
  {
    title: "Income Tax Return Filing",
    category: "INCOME_TAX" as const,
    source: "NBR Income Tax Ordinance",
    content: `Individuals and companies must file annual income tax returns by the deadline announced by NBR each year.
Returns are typically due by November 30 for the previous income year unless extended.
Taxpayers must report all sources of income including salary, business profit, rent, and foreign remittance.
Advance tax installments may be required for businesses with significant tax liability.
Supporting documents include bank statements, audited accounts, TIN certificate, and investment proofs.
Failure to file returns may result in penalties, higher assessment, and restrictions on banking services.`,
  },
  {
    title: "Trade License Compliance",
    category: "TRADE_LICENSE" as const,
    source: "City Corporation Guidelines",
    content: `Every commercial establishment in Bangladesh must obtain a trade license from the local city corporation or municipality.
Trade licenses must be renewed annually before expiry.
The license must be displayed prominently at the business location.
Operating without a valid trade license may result in fines and closure orders.
Trade license applications require proof of address, NID of owner, rent agreement, and fire safety clearance where applicable.
Businesses should align trade license category with actual business activities for VAT and tax compliance.`,
  },
];

async function main() {
  const ownerHash = await bcrypt.hash(DEMO_OWNER_PASSWORD, 12);
  const adminHash = await bcrypt.hash(DEMO_ADMIN_PASSWORD, 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@nbrassist.local" },
    update: { passwordHash: adminHash, role: "ADMIN" },
    create: {
      email: "admin@nbrassist.local",
      name: "NBR Admin",
      passwordHash: adminHash,
      role: "ADMIN",
      businessType: "retail",
    },
  });

  await prisma.user.upsert({
    where: { email: "owner@nbrassist.local" },
    update: { passwordHash: ownerHash, role: "BUSINESS_OWNER" },
    create: {
      email: "owner@nbrassist.local",
      name: "Demo Business Owner",
      passwordHash: ownerHash,
      role: "BUSINESS_OWNER",
      businessType: "retail",
    },
  });

  for (const regulation of REGULATIONS) {
    let document = await prisma.regulationDocument.findFirst({
      where: { title: regulation.title },
      include: { _count: { select: { chunks: true } } },
    });

    if (!document) {
      document = await prisma.regulationDocument.create({
        data: regulation,
        include: { _count: { select: { chunks: true } } },
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.log(`Created document without embeddings: ${document.title}`);
      continue;
    }

    if (document._count.chunks > 0) {
      console.log(`Skipped (already ingested): ${document.title}`);
      continue;
    }

    await ingestDocument(document.id);
    console.log(`Ingested: ${document.title}`);
  }

  console.log("Seed complete.");
  console.log(`Demo owner: owner@nbrassist.local / ${DEMO_OWNER_PASSWORD}`);
  console.log(
    "Admin: admin@nbrassist.local (password from DEMO_ADMIN_PASSWORD — keep private)",
  );
  console.log(`Admin user id: ${admin.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
