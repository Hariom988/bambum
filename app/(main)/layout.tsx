import type { Metadata } from "next";
import "@/app/globals.css";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { CartProvider } from "@/context/cartContext";
import CartDrawer from "@/components/cartDrawer";

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
        <CartProvider>
          <Header />
          {children}
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
