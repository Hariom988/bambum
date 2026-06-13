// app/(main)/layout.tsx
import type { Metadata } from "next";
import "@/app/globals.css";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { CartProvider } from "@/context/cartContext";
import NavigationTracker from "@/components/navigationTracker";
import FloatingBackButton from "@/components/floatingBackButton";
import CartDrawer from "@/components/cartDrawer";
import { WishlistProvider } from "@/context/wishlistContext";
import WishlistDrawer from "@/components/wishlistDrawer";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AuthProvider } from "@/context/authContext";

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
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Header />
          {children}
          <Footer />
          <CartDrawer />
          <WishlistDrawer />
          <NavigationTracker />
          <FloatingBackButton />
          <Analytics />
          <SpeedInsights />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
