import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Bambum",
  description: "Undergarments for men and women",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
