// lib/types/wishlist.ts
export interface WishlistItem {
  productId: string;      
  slug: string;           
  name: string;           
  price: number;         
  originalPrice?: number; 
  image: string;         
  category: string;
  addedAt: number;       
}