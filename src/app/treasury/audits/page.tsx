import AppLayout from "@/components/AppLayout";
import AuditManagementClient from "./AuditManagementClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuditManagementPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/verify");

  const role = (session.user as any).role;
  if (!['ADMIN', 'LUMINAR', 'TESORERO'].includes(role)) {
    redirect("/dashboard");
  }

  return (
    <div className="p-4 md:p-8">
      <AuditManagementClient currentUser={session.user} />
    </div>
  );
}
