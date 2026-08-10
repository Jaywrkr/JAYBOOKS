import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "JAYBOOKS · Biblioteca de ideas",
  description: "Convierte resúmenes de libros en tarjetas aplicables.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={GeistMono.variable}>
      <body className={GeistMono.className}>{children}</body>
    </html>
  );
}
