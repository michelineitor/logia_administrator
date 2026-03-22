import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getExpectedBalance, getCashCountsHistory } from "./actions";
import BalanceClient from "./BalanceClient";

export const dynamic = 'force-dynamic';

export default async function BalancePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string;
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  const expectedData = await getExpectedBalance();
  const history = await getCashCountsHistory();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Arqueo de Caja (Balance)</h2>
      </div>
      
      <BalanceClient 
        expectedData={expectedData}
        history={history}
        userId={userId}
        isAdmin={isAdmin}
      />
    </div>
  );
}
