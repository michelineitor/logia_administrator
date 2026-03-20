import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Soles y Rayos de Oriente No.7 - Gestión Administrativa",
  description: "Sistema interno de gestión para la ONG Soles y Rayos de Oriente No.7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
