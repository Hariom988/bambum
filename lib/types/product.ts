export interface ProductVariant {
  colorName: string;       // e.g. "Black", "Grey", "Orange"
  colorHex: string;        // e.g. "#1a1a1a"
  images: string[];        // paths like "/product1/black1.JPG"
}

export interface Product {
  id: string;
  slug: string;            // used in URL: /products/[slug]
  name: string;
  description: string;
  price: number;           // in INR
  category: string;        // e.g. "Men's Brief"
  variants: ProductVariant[];
}