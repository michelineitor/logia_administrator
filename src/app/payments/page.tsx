import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPayments } from "./actions";
import { getMembers } from "@/app/members/actions";
import { getConfig } from "../settings/actions";
import PaymentsClient from "./PaymentsClient";

export const dynamic = 'force-dynamic';

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role === 'MEMBER' || role === 'GUEST') redirect('/dashboard');
  const isAdmin = role === 'ADMIN';

  const payments = await getPayments();
  const members = await getMembers();
  const config = await getConfig();

  return (
    <PaymentsClient 
      payments={payments} 
      members={members.filter((m: any) => m.status === 'ACTIVE')} 
      config={config}
      isAdmin={isAdmin} 
    />
  );
}
