"use client";
import Image from "next/image";
import Link from "next/link";
import Image2 from "@/public/homePage/categorySection/image1.png";
import Image1 from "@/public/homePage/categorySection/image2.png";
import Image3 from "@/public/homePage/categorySection/accessories-Photoroom.png";
interface CategoryCard {
  id: string;
  label: string;
  href: string;
  shopHref: string;
  imageSrc: string;
  imageAlt: string;
}

const categories: CategoryCard[] = [
  {
    id: "mens",
    label: "MEN'S\nUNDERWEAR",
    href: "/products?category=Men",
    shopHref: "/products?category=Men",
    imageSrc: Image1.src,
    imageAlt: "Man wearing BAMBUMM men's underwear",
  },
  {
    id: "womens",
    label: "WOMEN'S\nUNDERWEAR",
    href: "/products?category=Women",
    shopHref: "/products?category=Women",
    imageSrc: Image2.src,
    imageAlt: "Woman wearing BAMBUMM women's underwear",
  },
  {
    id: "accessories",
    label: "Accessories",
    href: "/products?category=accessories",
    shopHref: "/products?category=accessories",
    imageSrc: Image3.src,
    imageAlt: "BAMBUMM accessories",
  },
];

function CategoryCardItem({
  label,
  href,
  shopHref,
  imageSrc,
  imageAlt,
}: CategoryCard) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col rounded-xl overflow-hidden w-[78vw] sm:w-[55vw] lg:w-auto shrink-0 lg:shrink aspect-[4/4]"
      style={{
        background:
          "linear-gradient(90deg, #E5D3C3 0%,#E1CCBA 50%, #D9C0AA 100%)",
      }}
    >
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-contain object-right transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 78vw, (max-width: 1024px) 55vw, 33vw"
        />
      </div>

      {/* ── Category label — top left ── */}
      <div className="relative z-10 p-5 sm:p-6">
        <h3
          className="text-[1.15rem] sm:text-[1.2rem] lg:text-[1.25rem]
                     font-bold leading-[1.2] whitespace-pre-line tracking-wide"
          style={{
            color: "var(--category-label-fg)",
            fontFamily: "var(--nav-font-ui)",
          }}
        >
          {label}
        </h3>
      </div>

      <div className="relative z-10 mt-[20%] p-5 sm:p-6">
        <span
          onClick={(e) => e.preventDefault()}
          className="inline-flex items-center gap-1.5
                     text-xs font-bold tracking-[0.18em] uppercase
                     transition-opacity duration-150 group-hover:opacity-60"
          style={{
            color: "var(--category-cta-fg)",
            fontFamily: "var(--nav-font-ui)",
          }}
        >
          <p>Shop Now</p>
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

export default function CategorySection() {
  return (
    <section
      className="w-full py-20 lg:py-14"
      style={{ background: "var(--brand-background-page)" }}
      aria-label="Shop by category"
    >
      <div className="max-w-screen-xl mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex items-center justify-between mb-5 lg:mb-6">
          <h2
            className="text-2xl font-montserrat  sm:text-3xl font-bold  uppercase"
            style={{
              color: "var(--category-heading-fg)",
              fontFamily: "Montserrat",
            }}
          >
            Shop by Category
          </h2>
          <Link
            href="/products"
            className="text-xs font-bold tracking-[0.14em] uppercase pb-0.5 transition-colors duration-200"
            style={{
              color: "var(--nav-fg-muted)",
              borderBottom: "1px solid var(--nav-border)",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--nav-accent)";
              e.currentTarget.style.borderBottomColor = "var(--nav-accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--nav-fg-muted)";
              e.currentTarget.style.borderBottomColor = "var(--nav-border)";
            }}
          >
            View All
          </Link>
        </div>
        <div
          className="
            flex gap-4 overflow-x-auto
            snap-x snap-mandatory
            [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
            pb-2
            
            lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0
          "
        >
          {categories.map((cat) => (
            <div key={cat.id} className="snap-start">
              <CategoryCardItem {...cat} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
