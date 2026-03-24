import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import "./globals.css";
import AppLayout from "@/components/AppLayout";

export const metadata: Metadata = {
  title: "Soles y Rayos de Oriente No.7 - Gestión Administrativa",
  description: "Sistema interno de gestión para la ONG Soles y Rayos de Oriente No.7",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  return (
    <html lang="es">
      <body>
        <AppLayout role={role}>{children}</AppLayout>
      </body>
    </html>
  );
}
