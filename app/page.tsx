import BambooProcess from "@/components/(homePage)/bambooProcess";
import HeroSection from "@/components/(homePage)/heroSection";
import ProductsSection from "@/components/productsSection";
import Testimonials from "@/components/(homePage)/testimonial";
import WhyUs from "@/components/(homePage)/why";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ProductsSection />
      <BambooProcess />
      <WhyUs />
      <Testimonials />
    </>
  );
}
