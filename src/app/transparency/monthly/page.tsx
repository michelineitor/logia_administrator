import AppLayout from "@/components/AppLayout";
import TransparencyClient from "./TransparencyClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MonthlyTransparencyPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/verify");

  return (
    <div className="p-4 md:p-8">
      <TransparencyClient />
    </div>
  );
}
