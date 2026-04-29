import BambooProcess from "@/components/(homePage)/bambooProcess";
import BestsellersSection from "@/components/(homePage)/bestsellerssection";
import CollectionsSection from "@/components/(homePage)/collectionssection";
import FeatureBadges from "@/components/(homePage)/featurebadges";
import HeroSection from "@/components/(homePage)/heroSection";
import HeroSection2 from "@/components/(homePage)/heroSection2";
import ProductsSection from "@/components/(homePage)/productsSection";
import PromoBanner from "@/components/(homePage)/promoBanner";
import ShopByCity from "@/components/(homePage)/shopByCity";
import Testimonials from "@/components/(homePage)/testimonial";
import WhyUs from "@/components/(homePage)/why";
import FAQ from "@/components/FAQ";

export default function Home() {
  return (
    <>
      <HeroSection />
      {/* <HeroSection2 /> */}
      <ShopByCity />
      {/* <FeatureBadges /> */}
      {/* <BestsellersSection /> */}
      {/* <CollectionsSection /> */}
      <ProductsSection />
      <PromoBanner />
      {/* <BambooProcess /> */}
      {/* <WhyUs /> */}
      {/* <Testimonials /> */}
      {/* <FAQ /> */}
    </>
  );
}
