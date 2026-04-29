"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Mail, Phone } from "lucide-react";

const FOOTER_LINKS = [
  {
    heading: "Shop",
    links: [
      { label: "Men's Wear", href: "/" },
      { label: "Women's Wear", href: "/" },
      { label: "Accessories", href: "/" },
    ],
  },
  {
    heading: "Policies",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms And Conditions", href: "/terms-conditions" },
      { label: "Refund Policy", href: "/return-refund" },
      { label: "Cancellation Policy", href: "/cancellation" },
      { label: "Shipping Policy", href: "/shipping-policy" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "Contact Us", href: "/contactus" },
      { label: "About Us", href: "/aboutus" },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer
      className="relative overflow-hidden"
      style={{
        background: "var(--ft-bg)",
        color: "var(--ft-fg)",
        fontFamily: "var(--nav-font-ui)",
      }}
    >
      {/* ══ NEWSLETTER BAND ══ */}
      <div
        className="relative border-b"
        style={{
          background: "var(--ft-bg-band)",
          borderColor: "var(--ft-border)",
        }}
      ></div>

      {/* ══ MAIN GRID ══ */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-5 grid grid-cols-2 md:grid-cols-4 gap-10 relative z-10">
        {/* Brand column */}
        <div className="col-span-2 md:col-span-1 flex flex-col gap-5">
          <div className="flex w-full items-center justify-between">
            <Link href="/">
              <img
                src="/logo.png"
                alt="Bambumm"
                className="w-15 rounded-2xl bg-white"
              />
            </Link>
            <p className="flex w-full items-center justify-center gap-5">
              <Link href="https://www.facebook.com/bambumm.in" target="_blank">
                <img className="w-3" src="/vectors/facebook.svg" alt="" />
              </Link>
              <Link href="https://www.instagram.com/bambumm.in" target="_blank">
                <img className="w-5" src="/vectors/instagram.svg" alt="" />
              </Link>
              <Link href="https://www.x.com/bambumm.in" target="_blank">
                <img className="w-5" src="/vectors/twitter.svg" alt="" />
              </Link>
            </p>
          </div>

          <p
            className="text-sm leading-relaxed max-w-[28ch]"
            style={{ color: "var(--ft-fg-muted)" }}
          >
            Crafted for the skin you live in. Premium bamboo-blend essentials
            built to breathe, move and last.
          </p>
          <ul className="flex flex-col gap-2 list-none p-0 m-0">
            {[
              {
                icon: MapPin,
                text: "Plot No. 34B Block D Basement Chhattarpur Enclave Delhi-110074",
                href: null,
              },
              {
                icon: Mail,
                text: "support@bambumm.in",
                href: "mailto:support@bambumm.in",
              },
              {
                icon: Phone,
                text: "+91 9953532262",
                href: "tel:+919953532262",
              },
            ].map(({ icon: Icon, text, href }) => (
              <li
                key={text}
                className="flex items-center gap-2 text-[0.8rem]"
                style={{ color: "var(--ft-fg-muted)" }}
              >
                <Icon
                  size={13}
                  style={{ color: "var(--ft-accent)", flexShrink: 0 }}
                />
                {href ? (
                  <a
                    href={href}
                    className="no-underline transition-colors duration-150"
                    style={{ color: "var(--ft-fg-muted)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--ft-accent)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--ft-fg-muted)")
                    }
                  >
                    {text}
                  </a>
                ) : (
                  <span>{text}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Link columns */}
        {FOOTER_LINKS.map((col) => (
          <div key={col.heading} className="flex flex-col gap-4">
            <h3
              className="text-[0.68rem] font-bold tracking-[0.18em] uppercase pb-3"
              style={{
                color: "var(--ft-fg)",
              }}
            >
              {col.heading}
            </h3>
            <ul className="flex flex-col gap-[0.55rem] list-none p-0 m-0">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[0.84rem] tracking-wide no-underline inline-block transition-all duration-150"
                    style={{ color: "var(--ft-fg-muted)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--ft-accent)";
                      e.currentTarget.style.paddingLeft = "4px";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--ft-fg-muted)";
                      e.currentTarget.style.paddingLeft = "0px";
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ══ DIVIDER ══ */}
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div
          className="h-px mb-6"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--ft-border-strong) 20%, var(--ft-accent) 50%, var(--ft-border-strong) 80%, transparent)",
          }}
        />
      </div>

      {/* ══ BOTTOM BAR ══ */}
      <div className="max-w-7xl mx-auto px-6 pb-8 flex flex-wrap items-center justify-between gap-4 relative z-10">
        <p
          className="text-[0.77rem] tracking-wide"
          style={{ color: "var(--adm-bg-white)" }}
        >
          © {new Date().getFullYear()} Bambumm. All rights reserved.
        </p>

        <div className="flex items-center gap-2">
          <span
            className="text-[0.77rem] tracking-wide"
            style={{ color: "var(--adm-bg-white)" }}
          >
            Design & Powered by{" "}
            <Link
              href="https://www.ynrsgroup.com/"
              target="_blank"
              className="text-[0.77rem] font-bold tracking-wide underline"
              style={{ color: "var(--ft-fg-link)" }}
            >
              YNRS Group.
            </Link>
          </span>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none select-none z-0 leading-none"
        style={{
          fontFamily: "var(--nav-font)",
          fontSize: "clamp(5rem, 14vw, 11rem)",
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: "transparent",
          WebkitTextStroke: "1px rgb(7, 33, 32)",
          whiteSpace: "nowrap",
        }}
        aria-hidden="true"
      >
        BAMBUMM
      </div>
    </footer>
  );
}
