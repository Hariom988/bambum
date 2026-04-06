import BambooProcess from "@/components/(mobilePage)/bambooProcess";
import HeroSection from "@/components/(mobilePage)/heroSection";
import ProductsSection from "@/components/productsSection";
import Testimonials from "@/components/(mobilePage)/testimonial";
import WhyUs from "@/components/(mobilePage)/why";

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
