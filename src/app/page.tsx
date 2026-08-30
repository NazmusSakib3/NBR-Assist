import Link from "next/link";
import { Bot, CalendarDays, CheckSquare, Shield } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Compliance Chat",
    description:
      "Ask questions about VAT, TIN, and income tax. Answers are grounded in NBR regulations with source citations.",
  },
  {
    icon: CalendarDays,
    title: "Deadline Tracker",
    description:
      "Never miss a VAT return, tax installment, or license renewal with auto-generated compliance calendars.",
  },
  {
    icon: CheckSquare,
    title: "Business Checklists",
    description:
      "Generate tailored compliance checklists for retail, restaurants, freelancers, and exporters.",
  },
  {
    icon: Shield,
    title: "Admin Knowledge Base",
    description:
      "Upload regulation documents, chunk them, embed them, and power the RAG pipeline.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="font-semibold">NBR Assist</div>
        <div className="flex gap-3">
          <Link href="/login" className="rounded-xl px-4 py-2 text-sm hover:bg-slate-900">
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400"
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <section className="mb-16 max-w-3xl">
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-emerald-400">
            AI Compliance Copilot
          </p>
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
            Bangladesh tax compliance, explained and organized.
          </h1>
          <p className="mb-8 text-lg text-slate-300">
            NBR Assist helps SMEs understand VAT, TIN, and income tax obligations with
            RAG-powered answers, deadline tracking, and business-specific checklists.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-medium text-slate-950 hover:bg-emerald-400"
            >
              Start free
            </Link>
            <a
              href="https://github.com/NazmusSakib3"
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm hover:bg-slate-900"
            >
              View portfolio
            </a>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mb-2 text-lg font-semibold">{feature.title}</h2>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
