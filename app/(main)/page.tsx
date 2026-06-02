import CategorySection from "@/components/(homePage)/categorySection";
import HeroSection from "@/components/(homePage)/heroSection";
import ProductsSection from "@/components/(homePage)/productsSection";
import PromoBanner from "@/components/(homePage)/promoBanner";
import ShopByCity from "@/components/(homePage)/shopByCity";
import ShopOn from "@/components/(homePage)/shopOn";
import Testimonials from "@/components/(homePage)/testimonial";
import FAQ from "@/components/FAQ";

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategorySection />
      {/* <ShopByCity /> */}
      <ProductsSection />
      <PromoBanner />
      <ShopOn />
      <Testimonials />
      {/* <FAQ /> */}
    </>
  );
}
