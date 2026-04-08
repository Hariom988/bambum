import { Product } from "@/lib/types/product";

export const products: Product[] = [
  {
    id: "product1",
    slug: "brief",
    name: "Brief",
    description:
      "Crafted from premium bamboo fabric, this brief offers exceptional softness, breathability, and all-day comfort. Naturally hypoallergenic and moisture-wicking — made for the skin you live in.",
    price: 999,
    category: "Men's Brief",
    variants: [
      {
        colorName: "Black",
        colorHex: "#1a1a1a",
        images: [
          "/product1/black1.JPG",
          "/product1/black2.JPG",
          "/product1/black3.JPG",
          "/product1/black4.JPG",
          "/product1/black5.JPG",
          "/product1/black6.JPG",
        ],
      },
      {
        colorName: "Grey With Black Strap",
        colorHex: "#9e9e9e",
        images: [
          "/product1/grey1.JPG",
          "/product1/grey2.JPG",
          "/product1/grey3.JPG",
          "/product1/grey4.JPG",
          "/product1/grey5.JPG",
          "/product1/grey6.JPG",
        ],
      },
      {
        colorName: "Grey With White Strap",
        colorHex: "#b0b0b0",
        images: [
          "/product1/grey_whitestrap1.JPG",
          "/product1/grey_whitestrap2.JPG",
          "/product1/grey_whitestrap3.JPG",
          "/product1/grey_whitestrap4.JPG",
          "/product1/grey_whitestrap5.JPG",
          "/product1/grey_whitestrap6.JPG",
        ],
      },
      {
        colorName: "Light Green",
        colorHex: "#a8d5a2",
        images: [
          "/product1/light_green1.JPG",
          "/product1/light_green2.JPG",
          "/product1/light_green3.JPG",
          "/product1/light_green4.JPG",
          "/product1/light_green5.JPG",
          "/product1/light_green6.JPG",
        ],
      },
      {
        colorName: "Orange",
        colorHex: "#f4a05a",
        images: [
          "/product1/orange1.JPG",
          "/product1/orange2.JPG",
          "/product1/orange3.JPG",
          "/product1/orange4.JPG",
          "/product1/orange5.JPG",
          "/product1/orange6.JPG",
        ],
      },
    ],
  },
];

// helper — fetch by slug (mirrors how a db call would work)
export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}