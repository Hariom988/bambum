"use client";

import { useState } from "react";
import Link from "next/link";
import Phone from "@/public/vectors/phone.svg";
import Mail from "@/public/vectors/mail.svg";
import Location from "@/public/vectors/location.svg";
const FOOTER_LINKS = [
  {
    heading: "Shop",
    links: [
      { label: "Men's Wear", href: "/products?category=Men" },
      { label: "Women's Wear", href: "/products?category=Women" },
      { label: "Accessories", href: "/products?category=Accessories" },
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
      <div className="flex w-full  items-center">
        <Link href="/">
          <img src="/logo.png" alt="Bambumm" className="w-30 rounded-2xl" />
        </Link>
        <p className="flex w-full ml-10 items-center gap-5">
          <Link
            href="https://www.instagram.com/bambumm_official/"
            target="_blank"
          >
            <img className="w-7" src="/vectors/instagram.svg" alt="" />
          </Link>
          <Link
            href="https://www.facebook.com/profile.php?id=61590123460790"
            target="_blank"
          >
            <img className="w-7" src="/vectors/facebook.svg" alt="" />
          </Link>
        </p>
      </div>
      {/* ══ MAIN GRID ══ */}
      <div className="max-w-7xl mx-auto px-6 pb-5 grid grid-cols-2 md:grid-cols-4 gap-10 relative z-10">
        {/* Brand column */}
        <div className="col-span-2 md:col-span-1 flex flex-col gap-5">
          <p
            className="text-lg leading-relaxed max-w-[28ch]"
            style={{ color: "var(--ft-fg-muted)" }}
          >
            Premium bamboo comfort for men & women.
          </p>
          <ul className="flex flex-col gap-2 list-none p-0 m-0">
            {[
              {
                icon: Location,
                text: "Plot No. 34B Block D lower ground floor Chhattarpur Enclave, Delhi-110074",
                href: null,
              },
              {
                icon: Mail,
                text: "info@bambumm.in",
                href: "mailto:info@bambumm.in",
              },
              {
                icon: Phone,
                text: "+91 8690889932",
                href: "tel:+918690889932",
              },
            ].map(({ icon: Icon, text, href }) => (
              <li
                key={text}
                className="flex items-center gap-2 text-sm"
                style={{ color: "var(--ft-fg-muted)" }}
              >
                <img src={Icon.src} alt="" className="w-5" />
                {href ? (
                  <Link
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
                  </Link>
                ) : (
                  <span>{text}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Link columns */}
        {FOOTER_LINKS.map((col) => (
          <div key={col.heading} className="flex flex-col gap-2">
            <h3
              className="text-lg font-bold  uppercase pb-3"
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
                    className="text-md tracking-wide no-underline inline-block transition-all duration-150"
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
          style={{ color: "var(--ft-fg-muted)" }}
        >
          © {new Date().getFullYear()} Bambumm. All rights reserved.
        </p>

        <div className="flex items-center gap-2">
          <span
            className="text-[0.77rem] tracking-wide"
            style={{ color: "var(--ft-fg-muted)" }}
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
    </footer>
  );
}
