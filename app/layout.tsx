import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JAYBOOKS · Biblioteca de ideas",
  description: "Convierte resúmenes de libros en tarjetas aplicables.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
