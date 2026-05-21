export interface ProductVariant {
  colorName: string;       
  colorHex: string;        
  images: string[];      
}

export interface Product {
  id: string;
  slug: string;         
  name: string;
  description: string;
  price: number;           
  category: string;       
  gender?: "Men" | "Women" | "Unisex" | "Boys" | "Girls";
  variants: ProductVariant[];
}