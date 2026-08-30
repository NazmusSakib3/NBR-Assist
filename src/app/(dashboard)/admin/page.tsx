import { redirect } from "next/navigation";
import { AdminPanel } from "@/components/admin-panel";
import { getSession } from "@/lib/auth";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/chat");
  }

  return <AdminPanel />;
}
