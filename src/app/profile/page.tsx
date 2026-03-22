import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProfileData } from "./actions";
import ProfileClient from "./ProfileClient";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const userId = (session.user as any).id;

  const data = await getProfileData(userId);

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Mi Perfil</h2>
      </div>
      <ProfileClient initialData={data} userId={userId} />
    </div>
  );
}
