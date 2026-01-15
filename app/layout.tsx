import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STEINS;GATE LIFE OS",
  description: "Temporal Life Management System — El Psy Kongroo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-mono antialiased bg-sg-dark text-sg-green">
        {children}
      </body>
    </html>
  );
}
