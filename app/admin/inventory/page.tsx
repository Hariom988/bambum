"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Package,
  X,
  ChevronLeft,
  Trash2,
  Save,
  Loader2,
  Tag,
  FileText,
  Layers,
  LogOut,
  ShieldCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Upload,
  LayoutGrid,
  ArrowLeft,
} from "lucide-react";

interface ProductVariant {
  colorName: string;
  colorHex: string;
  images: string[];
  imageFiles?: File[];
}

interface Product {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  variants: ProductVariant[];
  createdAt?: string;
}

const CATEGORIES = [
  "Men's Brief",
  "Men's Trunk",
  "Men's Boxer",
  "Women's Panty",
  "Women's Bra",
  "Accessories",
  "Other",
];

const EMPTY_PRODUCT: Omit<Product, "_id" | "createdAt"> = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  category: "",
  variants: [
    { colorName: "", colorHex: "#c8a97e", images: [], imageFiles: [] },
  ],
};

type View = "products" | "add" | "edit";

// ─── CSS injected once ────────────────────────────────────────────────────────
const STYLES = `
  :root {
    --inv-bg: #f7f3ee;
    --inv-surface: #ffffff;
    --inv-border: #e8e0d5;
    --inv-border-light: #f0ebe3;
    --inv-accent: #b8945e;
    --inv-accent-hover: #9a7a4a;
    --inv-accent-faint: rgba(184,148,94,0.10);
    --inv-accent-faint2: rgba(184,148,94,0.06);
    --inv-text: #1c1813;
    --inv-muted: #7a7068;
    --inv-danger: #c0392b;
    --inv-danger-faint: rgba(192,57,43,0.08);
    --inv-sidebar-w: 260px;
    --inv-header-h: 60px;
    --inv-mob-nav-h: 58px;
    --inv-radius: 2px;
    --inv-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
    --inv-shadow-lg: 0 4px 24px rgba(0,0,0,0.10);
  }
  .inv-root * { box-sizing: border-box; }
  .inv-root { font-family: 'Georgia', serif; background: var(--inv-bg); min-height: 100vh; color: var(--inv-text); }

  /* ── Header ── */
  .inv-header {
    position: sticky; top: 0; z-index: 100;
    height: var(--inv-header-h);
    background: var(--inv-surface);
    border-bottom: 1px solid var(--inv-border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 20px;
    box-shadow: 0 1px 0 var(--inv-border);
  }
  .inv-header-left { display: flex; align-items: center; gap: 12px; }
  .inv-back-btn {
    display: flex; align-items: center; gap: 6px;
    font-family: system-ui, sans-serif;
    font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--inv-muted); background: none; border: none; cursor: pointer;
    padding: 6px 10px; transition: color 0.15s;
  }
  .inv-back-btn:hover { color: var(--inv-text); }
  .inv-header-badge {
    display: flex; align-items: center; gap: 6px;
    padding: 4px 10px;
    background: var(--inv-accent-faint);
    border: 1px solid rgba(184,148,94,0.25);
    font-family: system-ui, sans-serif;
    font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--inv-accent);
  }
  .inv-header-right { display: flex; align-items: center; gap: 16px; }
  .inv-clock {
    font-family: system-ui, sans-serif; font-size: 11px; color: var(--inv-muted);
    letter-spacing: 0.04em;
  }
  .inv-logout {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 12px;
    border: 1px solid var(--inv-border);
    background: none; cursor: pointer;
    font-family: system-ui, sans-serif;
    font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--inv-muted); transition: all 0.15s;
  }
  .inv-logout:hover { border-color: var(--inv-danger); color: var(--inv-danger); background: var(--inv-danger-faint); }

  /* ── Body layout ── */
  .inv-body {
    display: flex;
    height: calc(100vh - var(--inv-header-h));
  }

  /* ── Sidebar ── */
  .inv-sidebar {
    width: var(--inv-sidebar-w);
    flex-shrink: 0;
    background: var(--inv-surface);
    border-right: 1px solid var(--inv-border);
    display: flex; flex-direction: column;
    position: sticky; top: var(--inv-header-h);
    height: calc(100vh - var(--inv-header-h));
    overflow-y: auto;
  }
  .inv-sidebar-brand {
    padding: 20px 20px 16px;
    border-bottom: 1px solid var(--inv-border-light);
  }
  .inv-sidebar-brand-label {
    font-family: system-ui, sans-serif;
    font-size: 9px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase;
    color: var(--inv-accent); margin-bottom: 3px;
  }
  .inv-sidebar-brand-title {
    font-size: 18px; font-weight: 700; color: var(--inv-text); letter-spacing: 0.01em;
  }
  .inv-nav { padding: 12px 0; }
  .inv-nav-item {
    display: flex; align-items: center; gap: 10px;
    width: 100%; padding: 10px 20px;
    background: none; border: none; cursor: pointer;
    font-family: system-ui, sans-serif;
    font-size: 13px; font-weight: 600; color: var(--inv-muted);
    text-align: left; transition: all 0.15s;
    border-right: 2px solid transparent;
    position: relative;
  }
  .inv-nav-item:hover { background: var(--inv-accent-faint2); color: var(--inv-text); }
  .inv-nav-item.active {
    background: var(--inv-accent-faint); color: var(--inv-text);
    border-right-color: var(--inv-accent);
  }
  .inv-nav-item.active svg { color: var(--inv-accent); }
  .inv-nav-badge {
    margin-left: auto;
    font-size: 9px; font-weight: 700; padding: 2px 6px;
    background: rgba(184,148,94,0.15);
    border: 1px solid rgba(184,148,94,0.25);
    color: var(--inv-accent);
  }
  .inv-sidebar-divider {
    height: 1px; background: var(--inv-border-light); margin: 4px 0;
  }
  .inv-sidebar-list-label {
    padding: 12px 20px 6px;
    font-family: system-ui, sans-serif;
    font-size: 9px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--inv-muted);
  }
  .inv-sidebar-product {
    display: flex; align-items: center; gap: 10px;
    width: 100%; padding: 8px 20px;
    background: none; border: none; cursor: pointer; text-align: left;
    transition: all 0.15s; border-right: 2px solid transparent;
  }
  .inv-sidebar-product:hover { background: var(--inv-accent-faint2); }
  .inv-sidebar-product.active { background: var(--inv-accent-faint); border-right-color: var(--inv-accent); }
  .inv-sidebar-product-icon {
    width: 30px; height: 30px; flex-shrink: 0;
    background: var(--inv-bg); border: 1px solid var(--inv-border);
    display: flex; align-items: center; justify-content: center;
    color: var(--inv-accent);
  }
  .inv-sidebar-product-name {
    font-family: system-ui, sans-serif;
    font-size: 12px; font-weight: 600; color: var(--inv-text);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .inv-sidebar-product-meta {
    font-family: system-ui, sans-serif;
    font-size: 10px; color: var(--inv-muted);
  }

  /* ── Main ── */
  .inv-main { flex: 1; overflow-y: auto; }

  /* ── Products view ── */
  .inv-page-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 28px 32px 20px;
    border-bottom: 1px solid var(--inv-border-light);
  }
  .inv-page-title { font-size: 22px; font-weight: 700; color: var(--inv-text); }
  .inv-page-subtitle {
    font-family: system-ui, sans-serif;
    font-size: 12px; color: var(--inv-muted); margin-top: 2px;
  }
  .inv-btn-primary {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 18px;
    background: var(--inv-accent); color: #fff;
    border: none; cursor: pointer;
    font-family: system-ui, sans-serif;
    font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
    transition: background 0.15s; white-space: nowrap;
  }
  .inv-btn-primary:hover { background: var(--inv-accent-hover); }
  .inv-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;
    padding: 24px 32px;
  }
  .inv-card {
    background: var(--inv-surface);
    border: 1px solid var(--inv-border);
    transition: all 0.2s;
    overflow: hidden;
  }
  .inv-card:hover { border-color: var(--inv-accent); box-shadow: var(--inv-shadow); }
  .inv-card.selected { border-color: var(--inv-accent); box-shadow: 0 0 0 2px rgba(184,148,94,0.15); }
  .inv-card-top { height: 3px; background: var(--inv-accent); opacity: 0.35; }
  .inv-card-body { padding: 16px; }
  .inv-card-name { font-size: 15px; font-weight: 700; color: var(--inv-text); }
  .inv-card-cat {
    font-family: system-ui, sans-serif;
    font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--inv-accent); margin-top: 2px;
  }
  .inv-card-price {
    font-size: 16px; font-weight: 700; color: var(--inv-text);
  }
  .inv-card-desc {
    font-family: system-ui, sans-serif;
    font-size: 12px; color: var(--inv-muted); line-height: 1.5;
    margin: 10px 0;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .inv-swatches { display: flex; align-items: center; gap: 5px; margin-bottom: 14px; }
  .inv-swatch { width: 16px; height: 16px; border-radius: 50%; border: 2px solid var(--inv-border); }
  .inv-swatch-label {
    font-family: system-ui, sans-serif;
    font-size: 10px; color: var(--inv-muted); margin-left: 2px;
  }
  .inv-card-actions {
    display: flex; gap: 8px; padding-top: 12px;
    border-top: 1px solid var(--inv-border-light);
  }
  .inv-btn-edit {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
    padding: 8px;
    border: 1px solid var(--inv-border); background: none; cursor: pointer;
    font-family: system-ui, sans-serif;
    font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--inv-muted); transition: all 0.15s;
  }
  .inv-btn-edit:hover { border-color: var(--inv-accent); color: var(--inv-accent); }
  .inv-btn-delete {
    display: flex; align-items: center; justify-content: center;
    padding: 8px 12px;
    border: 1px solid var(--inv-border); background: none; cursor: pointer;
    color: var(--inv-muted); transition: all 0.15s;
  }
  .inv-btn-delete:hover { border-color: var(--inv-danger); color: var(--inv-danger); background: var(--inv-danger-faint); }

  /* ── Empty state ── */
  .inv-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 80px 20px; text-align: center;
  }
  .inv-empty-icon {
    width: 56px; height: 56px;
    background: var(--inv-accent-faint);
    border: 1px solid rgba(184,148,94,0.2);
    display: flex; align-items: center; justify-content: center;
    color: var(--inv-accent); margin-bottom: 16px;
  }
  .inv-empty-title { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
  .inv-empty-sub { font-family: system-ui, sans-serif; font-size: 13px; color: var(--inv-muted); margin-bottom: 20px; }

  /* ── Form view ── */
  .inv-form-wrap { max-width: 680px; padding: 28px 32px 60px; }
  .inv-form-breadcrumb {
    display: flex; align-items: center; gap: 8px; margin-bottom: 20px;
    font-family: system-ui, sans-serif; font-size: 11px; color: var(--inv-muted);
  }
  .inv-form-breadcrumb button {
    background: none; border: none; cursor: pointer; color: var(--inv-muted);
    font-family: system-ui, sans-serif; font-size: 11px;
    display: flex; align-items: center; gap: 4px; padding: 0;
    transition: color 0.15s;
  }
  .inv-form-breadcrumb button:hover { color: var(--inv-accent); }
  .inv-form-title { font-size: 22px; font-weight: 700; margin-bottom: 24px; }
  .inv-section {
    background: var(--inv-surface);
    border: 1px solid var(--inv-border);
    margin-bottom: 16px; overflow: hidden;
  }
  .inv-section-header {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 20px;
    border-bottom: 1px solid var(--inv-border-light);
    background: #fdfaf7;
  }
  .inv-section-icon {
    width: 24px; height: 24px; flex-shrink: 0;
    background: var(--inv-accent-faint);
    border: 1px solid rgba(184,148,94,0.2);
    display: flex; align-items: center; justify-content: center;
    color: var(--inv-accent);
  }
  .inv-section-title {
    font-family: system-ui, sans-serif;
    font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--inv-text);
  }
  .inv-section-body { padding: 20px; }
  .inv-field { margin-bottom: 16px; }
  .inv-field:last-child { margin-bottom: 0; }
  .inv-label {
    display: block;
    font-family: system-ui, sans-serif;
    font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--inv-muted); margin-bottom: 6px;
  }
  .inv-input {
    width: 100%; padding: 10px 14px;
    border: 1px solid var(--inv-border);
    background: var(--inv-bg);
    font-family: system-ui, sans-serif; font-size: 13px; color: var(--inv-text);
    outline: none; transition: border-color 0.15s;
  }
  .inv-input:focus { border-color: var(--inv-accent); background: #fff; }
  .inv-input::placeholder { color: #bdb5a8; }
  .inv-input-price { padding-left: 30px; }
  .inv-price-wrap { position: relative; }
  .inv-price-symbol {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    font-family: system-ui, sans-serif; font-size: 13px; font-weight: 700;
    color: var(--inv-accent);
  }
  .inv-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .inv-textarea {
    width: 100%; padding: 10px 14px; resize: none;
    border: 1px solid var(--inv-border);
    background: var(--inv-bg);
    font-family: system-ui, sans-serif; font-size: 13px; color: var(--inv-text);
    outline: none; transition: border-color 0.15s; line-height: 1.6;
  }
  .inv-textarea:focus { border-color: var(--inv-accent); background: #fff; }
  .inv-textarea::placeholder { color: #bdb5a8; }

  /* Variant */
  .inv-variant-card {
    border: 1px solid var(--inv-border); margin-bottom: 12px; overflow: hidden;
  }
  .inv-variant-card:last-child { margin-bottom: 0; }
  .inv-variant-header {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; background: #fdfaf7;
    border-bottom: 1px solid var(--inv-border-light);
  }
  .inv-color-input {
    width: 30px; height: 30px; border: 2px solid var(--inv-border);
    cursor: pointer; border-radius: 2px; flex-shrink: 0; padding: 0;
  }
  .inv-color-name {
    flex: 1; background: none; border: none; outline: none;
    font-family: system-ui, sans-serif; font-size: 13px; font-weight: 600;
    color: var(--inv-text);
  }
  .inv-color-name::placeholder { color: #bdb5a8; }
  .inv-variant-remove {
    width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
    background: none; border: none; cursor: pointer; color: #bdb5a8; transition: color 0.15s;
  }
  .inv-variant-remove:hover { color: var(--inv-danger); }
  .inv-variant-body { padding: 14px; }
  .inv-images-label {
    font-family: system-ui, sans-serif;
    font-size: 9px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
    color: var(--inv-muted); margin-bottom: 10px;
  }
  .inv-img-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 10px; }
  .inv-img-thumb {
    position: relative; aspect-ratio: 1;
    border: 1px solid var(--inv-border); overflow: hidden;
  }
  .inv-img-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .inv-img-remove {
    position: absolute; top: 3px; right: 3px;
    width: 18px; height: 18px;
    background: rgba(192,57,43,0.9); color: #fff;
    display: flex; align-items: center; justify-content: center;
    border: none; cursor: pointer; opacity: 0; transition: opacity 0.15s;
  }
  .inv-img-thumb:hover .inv-img-remove { opacity: 1; }
  .inv-upload-zone {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 8px; padding: 24px 12px;
    border: 2px dashed var(--inv-border);
    cursor: pointer; transition: all 0.2s;
  }
  .inv-upload-zone:hover { border-color: var(--inv-accent); background: var(--inv-accent-faint2); }
  .inv-upload-icon {
    width: 36px; height: 36px;
    background: var(--inv-accent-faint);
    border: 1px solid rgba(184,148,94,0.2);
    display: flex; align-items: center; justify-content: center;
    color: var(--inv-accent);
  }
  .inv-upload-text {
    font-family: system-ui, sans-serif; font-size: 12px; font-weight: 600; color: var(--inv-muted);
  }
  .inv-upload-hint {
    font-family: system-ui, sans-serif; font-size: 10px; color: #bdb5a8;
  }
  .inv-add-variant-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 12px;
    border: 1px solid rgba(184,148,94,0.3);
    background: none; cursor: pointer;
    font-family: system-ui, sans-serif;
    font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--inv-accent); transition: all 0.15s;
  }
  .inv-add-variant-btn:hover { background: var(--inv-accent-faint); }

  /* Form actions */
  .inv-form-actions {
    background: var(--inv-surface);
    border: 1px solid var(--inv-border);
    padding: 16px 20px;
  }
  .inv-btn-danger-text {
    display: flex; align-items: center; gap: 6px;
    background: none; border: none; cursor: pointer;
    font-family: system-ui, sans-serif;
    font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--inv-danger); padding: 0; margin-bottom: 14px; transition: opacity 0.15s;
  }
  .inv-btn-danger-text:hover { opacity: 0.7; }
  .inv-form-btns { display: flex; gap: 10px; }
  .inv-btn-secondary {
    flex: 1; padding: 11px;
    border: 1px solid var(--inv-border); background: none; cursor: pointer;
    font-family: system-ui, sans-serif;
    font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--inv-muted); transition: all 0.15s;
  }
  .inv-btn-secondary:hover { border-color: var(--inv-accent); color: var(--inv-text); }
  .inv-btn-save {
    flex: 1.5; display: flex; align-items: center; justify-content: center; gap: 7px;
    padding: 11px;
    background: var(--inv-accent); border: none; cursor: pointer;
    font-family: system-ui, sans-serif;
    font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
    color: #fff; transition: background 0.15s;
  }
  .inv-btn-save:hover { background: var(--inv-accent-hover); }
  .inv-btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Toast */
  .inv-toast {
    position: fixed; bottom: 24px; right: 24px; z-index: 999;
    display: flex; align-items: center; gap: 10px;
    padding: 12px 18px;
    background: var(--inv-surface);
    border: 1px solid var(--inv-border);
    box-shadow: var(--inv-shadow-lg);
    animation: toastIn 0.3s ease;
  }
  @keyframes toastIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .inv-toast-text {
    font-family: system-ui, sans-serif; font-size: 13px; font-weight: 600; color: var(--inv-text);
  }

  /* Loading */
  .inv-loading {
    display: flex; align-items: center; justify-content: center;
    padding: 80px; color: var(--inv-muted);
    font-family: system-ui, sans-serif; font-size: 13px; gap: 10px;
  }
  .inv-spin { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ═══════════════════════════════════════
     MOBILE  (≤ 767px)
  ═══════════════════════════════════════ */
  @media (max-width: 767px) {
    :root {
      --inv-header-h: 52px;
      --inv-mob-nav-h: 56px;
    }

    /* Sidebar hidden on mobile */
    .inv-sidebar { display: none; }

    /* Body takes full width */
    .inv-body { height: auto; flex-direction: column; }
    .inv-main { overflow-y: visible; }

    /* Mobile bottom nav */
    .inv-mob-nav {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 90;
      height: var(--inv-mob-nav-h);
      background: var(--inv-surface);
      border-top: 1px solid var(--inv-border);
      display: flex;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
    }
    .inv-mob-nav-btn {
      flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 3px; background: none; border: none; cursor: pointer;
      font-family: system-ui, sans-serif;
      font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
      color: var(--inv-muted); transition: all 0.15s;
      border-top: 2px solid transparent;
    }
    .inv-mob-nav-btn.active { color: var(--inv-accent); border-top-color: var(--inv-accent); }
    .inv-mob-nav-btn svg { width: 18px; height: 18px; }

    /* Page bottom padding for fixed nav */
    .inv-main { padding-bottom: var(--inv-mob-nav-h); }

    /* Form wrap adjustments */
    .inv-form-wrap { padding: 20px 16px 80px; max-width: 100%; }
    .inv-page-header { padding: 20px 16px 14px; }
    .inv-grid { grid-template-columns: 1fr; padding: 16px; gap: 12px; }
    .inv-grid-2 { grid-template-columns: 1fr 1fr; }
    .inv-img-grid { grid-template-columns: repeat(4, 1fr); }

    /* Mobile page title row */
    .inv-mob-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 16px 12px;
      border-bottom: 1px solid var(--inv-border-light);
    }
    .inv-mob-title { font-size: 18px; font-weight: 700; }
    .inv-mob-subtitle {
      font-family: system-ui, sans-serif; font-size: 11px; color: var(--inv-muted); margin-top: 1px;
    }
  }

  /* Hide mobile nav on desktop */
  @media (min-width: 768px) {
    .inv-mob-nav { display: none; }
  }
`;

export default function InventoryPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("products");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] =
    useState<Omit<Product, "_id" | "createdAt">>(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [time, setTime] = useState("");
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inventory");
      if (res.ok) {
        const d = await res.json();
        setProducts(d.products || []);
      }
    } catch {}
    setLoading(false);
  };
  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // slug auto-gen
  useEffect(() => {
    setForm((f) => ({
      ...f,
      slug: f.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    }));
  }, [form.name]);

  const openAdd = () => {
    setEditingProduct(null);
    setForm(EMPTY_PRODUCT);
    setView("add");
  };
  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      category: p.category,
      variants: p.variants.map((v) => ({ ...v, imageFiles: [] })),
    });
    setView("add");
  };
  const cancel = () => {
    setEditingProduct(null);
    setForm(EMPTY_PRODUCT);
    setView("products");
  };

  const addVariant = () =>
    setForm((f) => ({
      ...f,
      variants: [
        ...f.variants,
        { colorName: "", colorHex: "#c8a97e", images: [], imageFiles: [] },
      ],
    }));
  const removeVariant = (i: number) =>
    setForm((f) => ({
      ...f,
      variants: f.variants.filter((_, idx) => idx !== i),
    }));
  const updateVariant = (
    i: number,
    field: "colorName" | "colorHex",
    value: string,
  ) =>
    setForm((f) => {
      const v = [...f.variants];
      v[i] = { ...v[i], [field]: value };
      return { ...f, variants: v };
    });

  const handleImageUpload = (vi: number, files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    Promise.all(
      arr.map(
        (f) =>
          new Promise<string>((res) => {
            const r = new FileReader();
            r.onload = () => res(r.result as string);
            r.readAsDataURL(f);
          }),
      ),
    ).then((b64s) => {
      setForm((f) => {
        const v = [...f.variants];
        v[vi] = {
          ...v[vi],
          images: [...v[vi].images, ...b64s],
          imageFiles: [...(v[vi].imageFiles || []), ...arr],
        };
        return { ...f, variants: v };
      });
    });
  };

  const removeImg = (vi: number, ii: number) =>
    setForm((f) => {
      const v = [...f.variants];
      v[vi] = {
        ...v[vi],
        images: v[vi].images.filter((_, i) => i !== ii),
        imageFiles: (v[vi].imageFiles || []).filter((_, i) => i !== ii),
      };
      return { ...f, variants: v };
    });

  const handleSave = async () => {
    if (!form.name || !form.category || form.price <= 0) {
      setToast({
        type: "error",
        msg: "Name, category and price are required.",
      });
      return;
    }
    setSaving(true);
    try {
      const body = editingProduct ? { ...form, _id: editingProduct._id } : form;
      const res = await fetch("/api/admin/inventory", {
        method: editingProduct ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setToast({
          type: "success",
          msg: editingProduct ? "Product updated!" : "Product added!",
        });
        await fetchProducts();
        cancel();
      } else {
        const d = await res.json();
        setToast({ type: "error", msg: d.error || "Failed to save." });
      }
    } catch {
      setToast({ type: "error", msg: "Network error." });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/inventory?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setToast({ type: "success", msg: "Product deleted." });
        fetchProducts();
        if (editingProduct?._id === id) cancel();
      }
    } catch {}
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  // ─── Form JSX (shared desktop/mobile) ──────────────────────────────────────
  const FormView = () => (
    <div className="inv-form-wrap">
      {/* Breadcrumb */}
      <div className="inv-form-breadcrumb">
        <button onClick={cancel}>
          <ArrowLeft size={12} /> All Products
        </button>
        <span>/</span>
        <span style={{ color: "var(--inv-text)" }}>
          {editingProduct ? "Edit" : "New Product"}
        </span>
      </div>

      <div className="inv-form-title">
        {editingProduct ? editingProduct.name : "Add to Inventory"}
      </div>

      {/* Basic Info */}
      <div className="inv-section">
        <div className="inv-section-header">
          <div className="inv-section-icon">
            <Tag size={11} />
          </div>
          <span className="inv-section-title">Basic Info</span>
        </div>
        <div className="inv-section-body">
          <div className="inv-field">
            <label className="inv-label">Product Name *</label>
            <input
              className="inv-input"
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Classic Brief"
            />
          </div>
          <div className="inv-grid-2">
            <div className="inv-field">
              <label className="inv-label">Price (₹) *</label>
              <div className="inv-price-wrap">
                <span className="inv-price-symbol">₹</span>
                <input
                  className="inv-input inv-input-price"
                  type="number"
                  value={form.price || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: Number(e.target.value) }))
                  }
                  placeholder="0"
                />
              </div>
            </div>
            <div className="inv-field">
              <label className="inv-label">Category *</label>
              <select
                className="inv-input"
                style={{ appearance: "none" }}
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
              >
                <option value="">Select…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="inv-section">
        <div className="inv-section-header">
          <div className="inv-section-icon">
            <FileText size={11} />
          </div>
          <span className="inv-section-title">Description</span>
        </div>
        <div className="inv-section-body">
          <textarea
            className="inv-textarea"
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Describe your product — fabric, comfort, use case…"
          />
        </div>
      </div>

      {/* Variants */}
      <div className="inv-section">
        <div
          className="inv-section-header"
          style={{ justifyContent: "space-between" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="inv-section-icon">
              <Layers size={11} />
            </div>
            <span className="inv-section-title">Colour Variants</span>
          </div>
          <button className="inv-add-variant-btn" onClick={addVariant}>
            <Plus size={10} /> Add Variant
          </button>
        </div>
        <div className="inv-section-body">
          {form.variants.map((variant, vi) => (
            <div key={vi} className="inv-variant-card">
              <div className="inv-variant-header">
                <input
                  type="color"
                  className="inv-color-input"
                  value={variant.colorHex}
                  onChange={(e) =>
                    updateVariant(vi, "colorHex", e.target.value)
                  }
                />
                <input
                  type="text"
                  className="inv-color-name"
                  value={variant.colorName}
                  onChange={(e) =>
                    updateVariant(vi, "colorName", e.target.value)
                  }
                  placeholder="Colour name (e.g. Black)"
                />
                {form.variants.length > 1 && (
                  <button
                    className="inv-variant-remove"
                    onClick={() => removeVariant(vi)}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
              <div className="inv-variant-body">
                <div className="inv-images-label">Images</div>
                {variant.images.length > 0 && (
                  <div className="inv-img-grid">
                    {variant.images.map((img, ii) => (
                      <div key={ii} className="inv-img-thumb">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="image-preview" />
                        <button
                          className="inv-img-remove"
                          onClick={() => removeImg(vi, ii)}
                        >
                          <X size={9} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div
                  className="inv-upload-zone"
                  onClick={() => fileInputRefs.current[vi]?.click()}
                >
                  <div className="inv-upload-icon">
                    <Upload size={14} />
                  </div>
                  <span className="inv-upload-text">
                    Click to upload images
                  </span>
                  <span className="inv-upload-hint">
                    JPG, PNG, WEBP · Multiple allowed
                  </span>
                </div>
                <input
                  ref={(el) => {
                    fileInputRefs.current[vi] = el;
                  }}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  style={{ display: "none" }}
                  onChange={(e) => handleImageUpload(vi, e.target.files)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="inv-form-actions">
        {editingProduct && (
          <button
            className="inv-btn-danger-text"
            onClick={() =>
              editingProduct._id && handleDelete(editingProduct._id)
            }
          >
            <Trash2 size={11} /> Delete this product
          </button>
        )}
        <div className="inv-form-btns">
          <button className="inv-btn-secondary" onClick={cancel}>
            Cancel
          </button>
          <button
            className="inv-btn-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 size={13} className="inv-spin" />
            ) : (
              <Save size={13} />
            )}
            {saving
              ? "Saving…"
              : editingProduct
                ? "Update Product"
                : "Save Product"}
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Products grid JSX ──────────────────────────────────────────────────────
  const ProductsView = () => (
    <>
      <div className="inv-page-header">
        <div>
          <div className="inv-page-title">All Products</div>
          <div className="inv-page-subtitle">
            {products.length} product{products.length !== 1 ? "s" : ""} in
            inventory
          </div>
        </div>
        <button className="inv-btn-primary" onClick={openAdd}>
          <Plus size={13} /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="inv-loading">
          <Loader2 size={18} className="inv-spin" /> Loading inventory…
        </div>
      ) : products.length === 0 ? (
        <div className="inv-empty">
          <div className="inv-empty-icon">
            <Package size={22} />
          </div>
          <div className="inv-empty-title">No products yet</div>
          <div className="inv-empty-sub">
            Add your first product to get started.
          </div>
          <button className="inv-btn-primary" onClick={openAdd}>
            <Plus size={13} /> Add Product
          </button>
        </div>
      ) : (
        <div className="inv-grid">
          {products.map((product) => (
            <div
              key={product._id}
              className={`inv-card${editingProduct?._id === product._id ? " selected" : ""}`}
            >
              <div className="inv-card-top" />
              <div className="inv-card-body">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 6,
                  }}
                >
                  <div>
                    <div className="inv-card-name">{product.name}</div>
                    <div className="inv-card-cat">{product.category}</div>
                  </div>
                  <div className="inv-card-price">₹{product.price}</div>
                </div>
                <div className="inv-card-desc">
                  {product.description || "No description."}
                </div>
                <div className="inv-swatches">
                  {product.variants.map((v, i) => (
                    <div
                      key={i}
                      className="inv-swatch"
                      title={v.colorName}
                      style={{ background: v.colorHex }}
                    />
                  ))}
                  <span className="inv-swatch-label">
                    {product.variants.length} colour
                    {product.variants.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="inv-card-actions">
                  <button
                    className="inv-btn-edit"
                    onClick={() => openEdit(product)}
                  >
                    <Edit3 size={11} /> Edit
                  </button>
                  <button
                    className="inv-btn-delete"
                    onClick={() => product._id && handleDelete(product._id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <>
      <style>{STYLES}</style>
      <div className="inv-root">
        {/* ── Header ── */}
        <header className="inv-header">
          <div className="inv-header-left">
            <button
              className="inv-back-btn"
              onClick={() => router.push("/admin/dashboard")}
            >
              <ChevronLeft size={13} /> Dashboard
            </button>
            <div
              style={{ width: 1, height: 20, background: "var(--inv-border)" }}
            />
            <div className="inv-header-badge">
              <ShieldCheck size={10} /> Inventory
            </div>
          </div>
          <div className="inv-header-right">
            {time && <span className="inv-clock">{time}</span>}
            <button className="inv-logout" onClick={handleLogout}>
              <LogOut size={11} /> Sign Out
            </button>
          </div>
        </header>

        {/* ── Body ── */}
        <div className="inv-body">
          {/* Desktop Sidebar */}
          <aside className="inv-sidebar">
            <div className="inv-sidebar-brand">
              <div className="inv-sidebar-brand-label">Bambumm Admin</div>
              <div className="inv-sidebar-brand-title">Inventory</div>
            </div>

            <nav className="inv-nav">
              <button
                className={`inv-nav-item${view === "products" ? " active" : ""}`}
                onClick={() => {
                  setView("products");
                  setEditingProduct(null);
                }}
              >
                <LayoutGrid size={15} /> All Products
                <span className="inv-nav-badge">{products.length}</span>
              </button>
              <button
                className={`inv-nav-item${view === "add" ? " active" : ""}`}
                onClick={openAdd}
              >
                <Plus size={15} />{" "}
                {editingProduct ? "Edit Product" : "Add Product"}
              </button>
            </nav>

            <div className="inv-sidebar-divider" />
            <div className="inv-sidebar-list-label">Products</div>

            {loading ? (
              <div
                style={{
                  padding: "12px 20px",
                  fontFamily: "system-ui",
                  fontSize: 12,
                  color: "var(--inv-muted)",
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <Loader2 size={12} className="inv-spin" /> Loading…
              </div>
            ) : products.length === 0 ? (
              <div
                style={{
                  padding: "12px 20px",
                  fontFamily: "system-ui",
                  fontSize: 12,
                  color: "var(--inv-muted)",
                }}
              >
                No products yet.
              </div>
            ) : (
              products.map((p) => (
                <button
                  key={p._id}
                  className={`inv-sidebar-product${editingProduct?._id === p._id ? " active" : ""}`}
                  onClick={() => openEdit(p)}
                >
                  <div className="inv-sidebar-product-icon">
                    <Package size={12} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="inv-sidebar-product-name">{p.name}</div>
                    <div className="inv-sidebar-product-meta">
                      ₹{p.price} · {p.variants.length} variant
                      {p.variants.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </button>
              ))
            )}
          </aside>

          {/* Main Content */}
          <main className="inv-main">
            {view === "products" && <ProductsView />}
            {view === "add" && <FormView />}
          </main>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="inv-mob-nav">
          <button
            className={`inv-mob-nav-btn${view === "products" ? " active" : ""}`}
            onClick={() => {
              setView("products");
              setEditingProduct(null);
            }}
          >
            <LayoutGrid size={18} />
            Products
          </button>
          <button
            className={`inv-mob-nav-btn${view === "add" ? " active" : ""}`}
            onClick={openAdd}
          >
            <Plus size={18} />
            Add
          </button>
          <button
            className="inv-mob-nav-btn"
            onClick={() => router.push("/admin/dashboard")}
          >
            <ChevronLeft size={18} />
            Dashboard
          </button>
        </nav>

        {/* Toast */}
        {toast && (
          <div
            className="inv-toast"
            style={{
              borderColor:
                toast.type === "success"
                  ? "var(--inv-accent)"
                  : "var(--inv-danger)",
            }}
          >
            {toast.type === "success" ? (
              <CheckCircle2
                size={15}
                style={{ color: "var(--inv-accent)", flexShrink: 0 }}
              />
            ) : (
              <AlertCircle
                size={15}
                style={{ color: "var(--inv-danger)", flexShrink: 0 }}
              />
            )}
            <span className="inv-toast-text">{toast.msg}</span>
          </div>
        )}
      </div>
    </>
  );
}
