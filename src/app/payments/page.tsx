import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPayments } from "./actions";
import { getMembers } from "@/app/members/actions";
import PaymentsClient from "./PaymentsClient";

export const dynamic = 'force-dynamic';

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role === 'MEMBER' || role === 'GUEST') redirect('/dashboard');
  const isAdmin = role === 'ADMIN';

  const payments = await getPayments();
  const members = await getMembers();

  // Filter out inactive members for the dropdown, mostly, but we can pass all so old payments still show their names if needed.
  // The client component can handle it.
  
  return (
    <PaymentsClient 
      payments={payments} 
      members={members.filter((m: any) => m.status === 'ACTIVE')} 
      isAdmin={isAdmin} 
    />
  );
}
