import { products } from "@/lib/data/products";
import ProductCard from "@/components/productCard";

export default function ProductsSection() {
  return (
    <section
      className="w-full"
      style={{
        background: "var(--nav-bg)",
        fontFamily: "var(--nav-font-ui)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <p
            className="text-[0.65rem] font-bold tracking-[0.2em] uppercase mb-3"
            style={{ color: "var(--nav-accent)" }}
          >
            Our Collection
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold uppercase tracking-widest mb-4"
            style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
          >
            Shop Now
          </h2>
          <div className="flex items-center gap-3">
            <div
              className="h-px w-10"
              style={{ background: "var(--nav-border)" }}
            />
            <div
              className="w-1 h-1 rounded-full"
              style={{ background: "var(--nav-accent)" }}
            />
            <div
              className="h-px w-10"
              style={{ background: "var(--nav-border)" }}
            />
          </div>
        </div>

        {/* Grid — works for 1 card now, expands naturally as more products are added */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
