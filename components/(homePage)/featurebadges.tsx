"use client";

import { Leaf, Wind, Zap, Shield } from "lucide-react";

const FEATURES = [
  {
    icon: Leaf,
    title: "Bamboo Soft",
    desc: "Built for the hustle",
  },
  {
    icon: Wind,
    title: "Breathable",
    desc: "30-day freshness",
  },
  {
    icon: Zap,
    title: "4-Way Stretch",
    desc: "Moves with you",
  },
  {
    icon: Shield,
    title: "Anti-Odor",
    desc: "Stay confident",
  },
];

export default function FeatureBadges() {
  return (
    <section
      className="w-full border-y"
      style={{
        background: "#fff",
        borderColor: "var(--nav-border)",
        fontFamily: "var(--nav-font-ui)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div
          className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0"
          style={{ borderColor: "var(--nav-border)" }}
        >
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="flex items-center gap-3 px-4 py-4 md:py-5"
              >
                <div
                  className="w-9 h-9 flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(200,169,126,0.1)",
                    border: "1px solid var(--nav-border)",
                  }}
                >
                  <Icon
                    size={16}
                    strokeWidth={1.75}
                    style={{ color: "var(--nav-accent)" }}
                  />
                </div>
                <div>
                  <p
                    className="text-xs font-bold uppercase tracking-wide"
                    style={{ color: "var(--nav-fg)" }}
                  >
                    {f.title}
                  </p>
                  <p
                    className="text-[0.65rem] mt-0.5"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    {f.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
