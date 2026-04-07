// import { Geist, Geist_Mono } from "next/font/google";
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });
import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/header";
import Footer from "@/components/footer";
export const metadata: Metadata = {
  title: "Bambumm",
  description: "Undergarments for men and women",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
