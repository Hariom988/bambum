import Image from "next/image";
import Link from "next/link";
import AmazonLogo from "@/public/shopon/amazon.png";
import FlipkartLogo from "@/public/shopon/flipkart.png";
import MyntraLogo from "@/public/shopon/myntra.png";
import bannerImage from "@/public/shopon/banner_image.png";
const platforms = [
  {
    name: "Amazon",
    logo: AmazonLogo,
    href: "https://www.amazon.in/s?rh=n%3A1571271031%2Cp_4%3ABAMBUMM&ref=bl_sl_s_ap_web_1571271031",
  },
  {
    name: "Flipkart",
    logo: FlipkartLogo,
    href: "https://www.flipkart.com/clothing-and-accessories/bambumm~brand/pr?sid=clo&p[]=facets.brand%255B%255D%3Dbambumm&otracker=categorytree",
  },
  {
    name: "Myntra",
    logo: MyntraLogo,
    href: "https://www.myntra.com/bambumm?rawQuery=bambumm",
  },
];

const ShopOn = () => {
  return (
    <section
      className="w-full"
      style={{ background: "var(--category-card-bg)" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center md:gap-8">
          <div className="flex-1 flex flex-col gap-6">
            <h2
              className="text-center md:text-left font-bold uppercase tracking-wide text-lg md:text-4xl leading-snug"
              style={{
                fontFamily: "var(--nav-font, 'Montserrat', sans-serif)",
                color: "var(--nav-fg, #0d0d0d)",
              }}
            >
              Shop on your
              <br className="md:hidden" />{" "}
              <span className="hidden md:inline">
                <br />
              </span>
              favorite platforms
            </h2>

            {/* Platform cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3  gap-3 md:gap-4">
              {platforms.map((platform) => (
                <Link
                  key={platform.name}
                  href={platform.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200"
                  style={{
                    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                  }}
                >
                  {/* Logo area */}
                  <div className="flex items-center justify-center px-3 py-4 md:px-5 md:py-2 flex-1">
                    <div className="relative w-full h-16 md:h-20">
                      <Image
                        src={platform.logo.src}
                        alt={platform.name}
                        fill
                        className="mt-3 object-contain"
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="px-3 py-2 md:px-5 md:py-3">
                    <span
                      className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest"
                      style={{
                        fontFamily:
                          "var(--nav-font-ui, 'Montserrat', sans-serif)",
                        color: "var(--nav-fg, #0d0d0d)",
                      }}
                    >
                      Shop now →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right column: product box image — desktop only inline, mobile below */}
          <div className="mt-6 md:mt-0 md:w-[42%] lg:w-[40%] flex-shrink-0 flex items-center justify-center">
            <div className="relative w-full aspect-[4/3]">
              <Image
                src={bannerImage}
                alt="Bambumm premium packaging box"
                fill
                className="object-contain drop-shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopOn;
