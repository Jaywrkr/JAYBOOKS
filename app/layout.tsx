import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistMono = localFont({
  variable: "--font-geist-mono",
  display: "swap",
  src: [
    { path: "./fonts/GeistMono-Thin.ttf", weight: "100", style: "normal" },
    { path: "./fonts/GeistMono-Light.ttf", weight: "300", style: "normal" },
    { path: "./fonts/GeistMono-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/GeistMono-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/GeistMono-SemiBold.ttf", weight: "600", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "JAYBOOKS · Biblioteca de ideas",
  description: "Convierte resúmenes de libros en tarjetas aplicables.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={geistMono.variable}>
      <body className={geistMono.className}>{children}</body>
    </html>
  );
}
