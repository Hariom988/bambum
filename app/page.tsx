import BambooProcess from "@/components/(mobilePage)/bambooProcess";
import HeroSection from "@/components/(mobilePage)/heroSection";
import Testimonials from "@/components/(mobilePage)/testimonial";
import WhyUs from "@/components/(mobilePage)/why";

export default function Home() {
  return (
    <>
      <HeroSection />
      <BambooProcess />
      <WhyUs />
      <Testimonials />
    </>
  );
}
