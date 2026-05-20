"use client";
import { useState, useEffect, useCallback, useId } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Plus,
  Loader2,
  Trash2,
  Edit3,
  Save,
  X,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Link2,
  FolderOpen,
  Navigation,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavLink {
  label: string;
  href: string;
}

interface NavCategory {
  id: string;
  title: string;
  order: number;
  links: NavLink[];
}

interface NavItem {
  _id: string;
  label: string;
  order: number;
  isActive: boolean;
  categories: NavCategory[];
}

interface DBProduct {
  _id: string;
  name: string;
  slug: string;
  category: string;
}

interface DBCategory {
  _id: string;
  name: string;
}

type Toast = { type: "success" | "error"; msg: string } | null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function reorder<T>(list: T[], from: number, to: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(from, 1);
  result.splice(to, 0, removed);
  return result;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Shared label styles ──────────────────────────────────────────────────────

const sectionLabel =
  "font-sans text-[9px] font-bold tracking-[0.18em] uppercase";
const inputCls =
  "w-full px-3.5 py-2.5 border font-sans text-[13px] outline-none transition-all duration-150 bg-[var(--adm-bg-input)] border-[var(--adm-border)] text-[var(--adm-fg)] placeholder-[var(--adm-fg-faint)] focus:border-[var(--adm-accent)] focus:bg-white";

// ─── SlugPicker — searchable product dropdown ─────────────────────────────────

function SlugPicker({
  products,
  value,
  onChange,
}: {
  products: DBProduct[];
  value: string;
  onChange: (href: string, label: string) => void;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = q.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          p.slug.toLowerCase().includes(q.toLowerCase()),
      )
    : products;

  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 px-3 py-2 border cursor-pointer select-none"
        style={{
          background: "var(--adm-bg-input)",
          borderColor: open ? "var(--adm-accent)" : "var(--adm-border)",
          color: "var(--adm-fg)",
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <Link2
          size={11}
          style={{ color: "var(--adm-accent)", flexShrink: 0 }}
        />
        <span className="flex-1 font-sans text-[12px] truncate">
          {value || (
            <span style={{ color: "var(--adm-fg-faint)" }}>
              Pick a product…
            </span>
          )}
        </span>
        {open ? (
          <ChevronDown
            size={12}
            style={{ color: "var(--adm-fg-muted)", flexShrink: 0 }}
          />
        ) : (
          <ChevronRight
            size={12}
            style={{ color: "var(--adm-fg-muted)", flexShrink: 0 }}
          />
        )}
      </div>

      {open && (
        <div
          className="absolute left-0 right-0 top-full z-50 border border-t-0 overflow-hidden"
          style={{
            background: "var(--adm-bg-white)",
            borderColor: "var(--adm-accent)",
            maxHeight: 240,
            display: "flex",
            flexDirection: "column",
            boxShadow: "var(--adm-shadow-modal)",
          }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 border-b"
            style={{ borderColor: "var(--adm-border-soft)" }}
          >
            <Search size={11} style={{ color: "var(--adm-fg-muted)" }} />
            <input
              autoFocus
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="flex-1 bg-transparent border-none outline-none font-sans text-[12px]"
              style={{ color: "var(--adm-fg)" }}
            />
          </div>
          <div className="overflow-y-auto">
            {filtered.length === 0 ? (
              <div
                className="px-3 py-4 text-center font-sans text-[12px]"
                style={{ color: "var(--adm-fg-muted)" }}
              >
                No products found
              </div>
            ) : (
              filtered.map((p) => (
                <button
                  key={p._id}
                  className="w-full flex flex-col px-3 py-2 text-left border-b transition-colors duration-100"
                  style={{ borderColor: "var(--adm-border-soft)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--adm-bg-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                  onClick={() => {
                    onChange(`/products/${p.slug}`, p.name);
                    setOpen(false);
                    setQ("");
                  }}
                >
                  <span
                    className="font-sans text-[12px] font-semibold"
                    style={{ color: "var(--adm-fg)" }}
                  >
                    {p.name}
                  </span>
                  <span
                    className="font-sans text-[10px]"
                    style={{ color: "var(--adm-accent)" }}
                  >
                    /products/{p.slug}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── LinkRow ──────────────────────────────────────────────────────────────────

function LinkRow({
  link,
  index,
  draggableId,
  products,
  onUpdate,
  onRemove,
}: {
  link: NavLink;
  index: number;
  draggableId: string;
  products: DBProduct[];
  onUpdate: (l: NavLink) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(link);

  const save = () => {
    if (!draft.label.trim() || !draft.href.trim()) return;
    onUpdate({ label: draft.label.trim(), href: draft.href.trim() });
    setEditing(false);
  };

  return (
    <Draggable draggableId={draggableId} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="border-b last:border-b-0"
          style={{
            borderColor: "var(--adm-border-soft)",
            background: snapshot.isDragging
              ? "var(--adm-bg-active)"
              : "transparent",
            ...provided.draggableProps.style,
          }}
        >
          {editing ? (
            <div className="p-3 flex flex-col gap-2">
              <input
                autoFocus
                type="text"
                value={draft.label}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, label: e.target.value }))
                }
                placeholder="Link label (e.g. BAMBUMM CORE)"
                className={inputCls}
                style={{ fontSize: "12px", padding: "8px 12px" }}
              />
              <SlugPicker
                products={products}
                value={draft.href}
                onChange={(href, name) =>
                  setDraft((d) => ({ ...d, href, label: d.label || name }))
                }
              />
              <div className="flex gap-2">
                <button
                  onClick={save}
                  className="flex items-center gap-1.5 px-3 py-1.5 font-sans text-[10px] font-bold tracking-widest uppercase text-white border-none cursor-pointer"
                  style={{ background: "var(--adm-accent)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--adm-accent-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "var(--adm-accent)")
                  }
                >
                  <Save size={10} /> Save
                </button>
                <button
                  onClick={() => {
                    setDraft(link);
                    setEditing(false);
                  }}
                  className="flex items-center justify-center p-1.5 border cursor-pointer transition-all duration-150"
                  style={{
                    borderColor: "var(--adm-border)",
                    color: "var(--adm-fg-muted)",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--adm-accent)";
                    e.currentTarget.style.color = "var(--adm-accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--adm-border)";
                    e.currentTarget.style.color = "var(--adm-fg-muted)";
                  }}
                >
                  <X size={11} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 group">
              <span
                {...provided.dragHandleProps}
                className="cursor-grab active:cursor-grabbing flex-shrink-0"
                style={{ color: "var(--adm-fg-faint)" }}
              >
                <GripVertical size={13} />
              </span>
              <div className="flex-1 min-w-0">
                <div
                  className="font-sans text-[12px] font-semibold truncate"
                  style={{ color: "var(--adm-fg)" }}
                >
                  {link.label}
                </div>
                <div
                  className="font-sans text-[10px] truncate"
                  style={{ color: "var(--adm-accent)" }}
                >
                  {link.href}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1 px-2 py-1 border font-sans text-[9px] font-bold tracking-widest uppercase cursor-pointer transition-all duration-150"
                  style={{
                    borderColor: "var(--adm-border)",
                    color: "var(--adm-fg-muted)",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--adm-accent)";
                    e.currentTarget.style.color = "var(--adm-accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--adm-border)";
                    e.currentTarget.style.color = "var(--adm-fg-muted)";
                  }}
                >
                  <Edit3 size={9} /> Edit
                </button>
                <button
                  onClick={onRemove}
                  className="flex items-center justify-center p-1 border cursor-pointer transition-all duration-150"
                  style={{
                    borderColor: "var(--adm-border)",
                    color: "var(--adm-fg-muted)",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--adm-danger)";
                    e.currentTarget.style.color = "var(--adm-danger)";
                    e.currentTarget.style.background =
                      "var(--adm-bg-danger-lt)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--adm-border)";
                    e.currentTarget.style.color = "var(--adm-fg-muted)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

// ─── CategoryBlock ────────────────────────────────────────────────────────────

function CategoryBlock({
  cat,
  catIndex,
  draggableId,
  navItemId,
  products,
  dbCategories,
  onUpdate,
  onRemove,
}: {
  cat: NavCategory;
  catIndex: number;
  draggableId: string;
  navItemId: string;
  products: DBProduct[];
  dbCategories: DBCategory[];
  onUpdate: (c: NavCategory) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(cat.title);
  const [addingLink, setAddingLink] = useState(false);
  const [newLink, setNewLink] = useState<NavLink>({ label: "", href: "" });

  const linksDropId = `links-${navItemId}-${cat.id}`;

  const saveTitle = () => {
    if (!titleDraft.trim()) return;
    onUpdate({ ...cat, title: titleDraft.trim() });
    setEditingTitle(false);
  };

  const handleLinkDrop = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = reorder(
      cat.links,
      result.source.index,
      result.destination.index,
    );
    onUpdate({ ...cat, links: reordered });
  };

  const addLink = () => {
    if (!newLink.label.trim() || !newLink.href.trim()) return;
    onUpdate({
      ...cat,
      links: [
        ...cat.links,
        { label: newLink.label.trim(), href: newLink.href.trim() },
      ],
    });
    setNewLink({ label: "", href: "" });
    setAddingLink(false);
  };

  return (
    <Draggable draggableId={draggableId} index={catIndex}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="border overflow-visible"
          style={{
            borderColor: snapshot.isDragging
              ? "var(--adm-accent)"
              : "var(--adm-border)",
            background: "var(--adm-bg-white)",
            boxShadow: snapshot.isDragging
              ? "var(--adm-shadow-modal)"
              : "var(--adm-shadow-card)",
            ...provided.draggableProps.style,
          }}
        >
          {/* Category header */}
          <div
            className="flex items-center gap-2 px-3 py-2.5 border-b"
            style={{
              background: "var(--adm-bg-soft)",
              borderColor: "var(--adm-border-soft)",
            }}
          >
            <span
              {...provided.dragHandleProps}
              className="cursor-grab active:cursor-grabbing shrink-0"
              style={{ color: "var(--adm-fg-faint)" }}
            >
              <GripVertical size={14} />
            </span>

            {editingTitle ? (
              <>
                <input
                  autoFocus
                  type="text"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveTitle();
                    if (e.key === "Escape") {
                      setTitleDraft(cat.title);
                      setEditingTitle(false);
                    }
                  }}
                  className="flex-1 px-2 py-1 border font-sans text-[12px] font-semibold outline-none"
                  style={{
                    borderColor: "var(--adm-accent)",
                    color: "var(--adm-fg)",
                    background: "var(--adm-bg-white)",
                  }}
                />
                <button
                  onClick={saveTitle}
                  className="flex items-center gap-1 px-2 py-1 border-none cursor-pointer font-sans text-[9px] font-bold tracking-widest uppercase text-white"
                  style={{ background: "var(--adm-accent)" }}
                >
                  <Save size={9} /> Save
                </button>
                <button
                  onClick={() => {
                    setTitleDraft(cat.title);
                    setEditingTitle(false);
                  }}
                  className="flex items-center justify-center p-1 border cursor-pointer"
                  style={{
                    borderColor: "var(--adm-border)",
                    color: "var(--adm-fg-muted)",
                    background: "transparent",
                  }}
                >
                  <X size={10} />
                </button>
              </>
            ) : (
              <>
                <button
                  className="flex-1 text-left font-sans text-[12px] font-bold bg-transparent border-none cursor-pointer"
                  style={{ color: "var(--adm-fg)" }}
                  onClick={() => setExpanded((e) => !e)}
                >
                  {cat.title}
                  <span
                    className="ml-2 font-sans text-[9px] font-bold px-1.5 py-0.5"
                    style={{
                      background: "var(--adm-bg-accent-md)",
                      border: "1px solid var(--adm-accent-border)",
                      color: "var(--adm-accent)",
                    }}
                  >
                    {cat.links.length}
                  </span>
                </button>
                <button
                  onClick={() => setEditingTitle(true)}
                  className="flex items-center gap-1 px-2 py-1 border font-sans text-[9px] font-bold tracking-widest uppercase cursor-pointer transition-all duration-150"
                  style={{
                    borderColor: "var(--adm-border)",
                    color: "var(--adm-fg-muted)",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--adm-accent)";
                    e.currentTarget.style.color = "var(--adm-accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--adm-border)";
                    e.currentTarget.style.color = "var(--adm-fg-muted)";
                  }}
                >
                  <Edit3 size={9} /> Rename
                </button>
                <button
                  onClick={onRemove}
                  className="flex items-center justify-center p-1 border cursor-pointer transition-all duration-150"
                  style={{
                    borderColor: "var(--adm-border)",
                    color: "var(--adm-fg-muted)",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--adm-danger)";
                    e.currentTarget.style.color = "var(--adm-danger)";
                    e.currentTarget.style.background =
                      "var(--adm-bg-danger-lt)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--adm-border)";
                    e.currentTarget.style.color = "var(--adm-fg-muted)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <Trash2 size={10} />
                </button>
                <button
                  onClick={() => setExpanded((e) => !e)}
                  className="flex items-center justify-center p-1 border-none cursor-pointer bg-transparent"
                  style={{ color: "var(--adm-fg-muted)" }}
                >
                  {expanded ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </button>
              </>
            )}
          </div>

          {/* Links list */}
          {expanded && (
            <DragDropContext onDragEnd={handleLinkDrop}>
              <Droppable droppableId={linksDropId} type="LINK">
                {(droppableProvided, droppableSnapshot) => (
                  <div
                    ref={droppableProvided.innerRef}
                    {...droppableProvided.droppableProps}
                    style={{
                      background: droppableSnapshot.isDraggingOver
                        ? "var(--adm-bg-hover)"
                        : "transparent",
                      minHeight: cat.links.length === 0 ? 32 : "auto",
                      transition: "background 0.15s",
                    }}
                  >
                    {cat.links.length === 0 &&
                      !droppableSnapshot.isDraggingOver && (
                        <div
                          className="px-4 py-3 font-sans text-[11px] text-center"
                          style={{ color: "var(--adm-fg-faint)" }}
                        >
                          No product links yet — add one below
                        </div>
                      )}
                    {cat.links.map((link, li) => (
                      <LinkRow
                        key={`${cat.id}-link-${li}`}
                        link={link}
                        index={li}
                        draggableId={`${cat.id}-link-${li}`}
                        products={products}
                        onUpdate={(updated) => {
                          const newLinks = [...cat.links];
                          newLinks[li] = updated;
                          onUpdate({ ...cat, links: newLinks });
                        }}
                        onRemove={() => {
                          const newLinks = cat.links.filter(
                            (_, idx) => idx !== li,
                          );
                          onUpdate({ ...cat, links: newLinks });
                        }}
                      />
                    ))}
                    {droppableProvided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {/* Add link form */}
          {expanded && (
            <div
              className="border-t px-3 py-2"
              style={{ borderColor: "var(--adm-border-soft)" }}
            >
              {addingLink ? (
                <div className="flex flex-col gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={newLink.label}
                    onChange={(e) =>
                      setNewLink((l) => ({ ...l, label: e.target.value }))
                    }
                    placeholder="Link label (e.g. BAMBUMM CORE)"
                    className={inputCls}
                    style={{ fontSize: "12px", padding: "7px 12px" }}
                  />
                  <SlugPicker
                    products={products}
                    value={newLink.href}
                    onChange={(href, name) =>
                      setNewLink((l) => ({
                        ...l,
                        href,
                        label: l.label || name,
                      }))
                    }
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={addLink}
                      disabled={!newLink.label.trim() || !newLink.href.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 font-sans text-[10px] font-bold tracking-widest uppercase text-white border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: "var(--adm-accent)" }}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled)
                          e.currentTarget.style.background =
                            "var(--adm-accent-hover)";
                      }}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "var(--adm-accent)")
                      }
                    >
                      <Plus size={10} /> Add Link
                    </button>
                    <button
                      onClick={() => {
                        setAddingLink(false);
                        setNewLink({ label: "", href: "" });
                      }}
                      className="flex items-center justify-center p-1.5 border cursor-pointer"
                      style={{
                        borderColor: "var(--adm-border)",
                        color: "var(--adm-fg-muted)",
                        background: "transparent",
                      }}
                    >
                      <X size={11} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingLink(true)}
                  className="flex items-center gap-1.5 font-sans text-[10px] font-bold tracking-widest uppercase border-none bg-transparent cursor-pointer transition-colors duration-150"
                  style={{ color: "var(--adm-fg-muted)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--adm-accent)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--adm-fg-muted)")
                  }
                >
                  <Plus size={11} /> Add Product Link
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

// ─── NavItemBlock ─────────────────────────────────────────────────────────────

function NavItemBlock({
  item,
  index,
  products,
  dbCategories,
  onUpdate,
  onDelete,
  saving,
}: {
  item: NavItem;
  index: number;
  products: DBProduct[];
  dbCategories: DBCategory[];
  onUpdate: (updated: NavItem) => void;
  onDelete: (id: string) => void;
  saving: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState(item.label);
  const [addingCat, setAddingCat] = useState(false);
  const [newCatTitle, setNewCatTitle] = useState("");
  const [newCatIsProductPage, setNewCatIsProductPage] = useState(false);
  const [selectedCatName, setSelectedCatName] = useState("");

  const catsDropId = `cats-${item._id}`;

  const saveLabel = () => {
    if (!labelDraft.trim()) return;
    onUpdate({ ...item, label: labelDraft.trim() });
    setEditingLabel(false);
  };

  const handleCatDrop = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = reorder(
      item.categories,
      result.source.index,
      result.destination.index,
    ).map((c, i) => ({ ...c, order: i }));
    onUpdate({ ...item, categories: reordered });
  };

  const addCategory = () => {
    const title = newCatTitle.trim();
    if (!title) return;
    // For "category page" type, auto-set a single link to /products?category=...
    const links: NavLink[] = newCatIsProductPage
      ? [
          {
            label: selectedCatName || title,
            href: `/products?category=${encodeURIComponent(selectedCatName || title)}`,
          },
        ]
      : [];
    const newCat: NavCategory = {
      id: uid(),
      title,
      order: item.categories.length,
      links,
    };
    onUpdate({ ...item, categories: [...item.categories, newCat] });
    setNewCatTitle("");
    setNewCatIsProductPage(false);
    setSelectedCatName("");
    setAddingCat(false);
  };

  const updateCategory = (idx: number, updated: NavCategory) => {
    const cats = [...item.categories];
    cats[idx] = updated;
    onUpdate({ ...item, categories: cats });
  };

  const removeCategory = (idx: number) => {
    onUpdate({
      ...item,
      categories: item.categories.filter((_, i) => i !== idx),
    });
  };

  return (
    <Draggable draggableId={item._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="border overflow-visible"
          style={{
            borderColor: snapshot.isDragging
              ? "var(--adm-accent)"
              : "var(--adm-border)",
            background: "var(--adm-bg-white)",
            boxShadow: snapshot.isDragging
              ? "var(--adm-shadow-modal)"
              : "var(--adm-shadow-card)",
            opacity: item.isActive ? 1 : 0.6,
            ...provided.draggableProps.style,
          }}
        >
          {/* Nav item header */}
          <div
            className="flex items-center gap-2.5 px-4 py-3 border-b"
            style={{
              background: "var(--adm-bg-soft)",
              borderColor: "var(--adm-border)",
            }}
          >
            <span
              {...provided.dragHandleProps}
              className="cursor-grab active:cursor-grabbing shrink-0"
              style={{ color: "var(--adm-fg-faint)" }}
            >
              <GripVertical size={16} />
            </span>

            {editingLabel ? (
              <>
                <input
                  autoFocus
                  type="text"
                  value={labelDraft}
                  onChange={(e) => setLabelDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveLabel();
                    if (e.key === "Escape") {
                      setLabelDraft(item.label);
                      setEditingLabel(false);
                    }
                  }}
                  className="flex-1 px-2.5 py-1.5 border font-sans text-[14px] font-bold outline-none"
                  style={{
                    borderColor: "var(--adm-accent)",
                    color: "var(--adm-fg)",
                    background: "var(--adm-bg-white)",
                  }}
                />
                <button
                  onClick={saveLabel}
                  className="flex items-center gap-1.5 px-3 py-1.5 border-none cursor-pointer font-sans text-[10px] font-bold tracking-widest uppercase text-white"
                  style={{ background: "var(--adm-accent)" }}
                >
                  <Save size={10} /> Save
                </button>
                <button
                  onClick={() => {
                    setLabelDraft(item.label);
                    setEditingLabel(false);
                  }}
                  className="p-1 border cursor-pointer"
                  style={{
                    borderColor: "var(--adm-border)",
                    color: "var(--adm-fg-muted)",
                    background: "transparent",
                  }}
                >
                  <X size={11} />
                </button>
              </>
            ) : (
              <>
                <button
                  className="flex-1 text-left font-serif text-[15px] font-bold bg-transparent border-none cursor-pointer"
                  style={{ color: "var(--adm-fg)" }}
                  onClick={() => setExpanded((e) => !e)}
                >
                  {item.label}
                  <span
                    className="ml-2 font-sans text-[9px] font-bold px-1.5 py-0.5"
                    style={{
                      background: "var(--adm-bg-accent-md)",
                      border: "1px solid var(--adm-accent-border)",
                      color: "var(--adm-accent)",
                    }}
                  >
                    {item.categories.length} categories
                  </span>
                </button>

                {/* Toggle active */}
                <button
                  onClick={() =>
                    onUpdate({ ...item, isActive: !item.isActive })
                  }
                  className="flex items-center gap-1.5 px-2.5 py-1.5 border font-sans text-[9px] font-bold tracking-widest uppercase cursor-pointer transition-all duration-150"
                  style={{
                    borderColor: item.isActive
                      ? "var(--adm-accent-border-md)"
                      : "var(--adm-border)",
                    background: item.isActive
                      ? "var(--adm-bg-active)"
                      : "transparent",
                    color: item.isActive
                      ? "var(--adm-accent)"
                      : "var(--adm-fg-muted)",
                  }}
                >
                  {item.isActive ? <Eye size={10} /> : <EyeOff size={10} />}
                  {item.isActive ? "Visible" : "Hidden"}
                </button>

                <button
                  onClick={() => setEditingLabel(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 border font-sans text-[9px] font-bold tracking-widest uppercase cursor-pointer transition-all duration-150"
                  style={{
                    borderColor: "var(--adm-border)",
                    color: "var(--adm-fg-muted)",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--adm-accent)";
                    e.currentTarget.style.color = "var(--adm-accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--adm-border)";
                    e.currentTarget.style.color = "var(--adm-fg-muted)";
                  }}
                >
                  <Edit3 size={9} /> Rename
                </button>

                <button
                  onClick={() => onDelete(item._id)}
                  className="flex items-center justify-center p-1.5 border cursor-pointer transition-all duration-150"
                  style={{
                    borderColor: "var(--adm-border)",
                    color: "var(--adm-fg-muted)",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--adm-danger)";
                    e.currentTarget.style.color = "var(--adm-danger)";
                    e.currentTarget.style.background =
                      "var(--adm-bg-danger-lt)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--adm-border)";
                    e.currentTarget.style.color = "var(--adm-fg-muted)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <Trash2 size={12} />
                </button>

                <button
                  onClick={() => setExpanded((e) => !e)}
                  className="flex items-center justify-center p-1 border-none cursor-pointer bg-transparent"
                  style={{ color: "var(--adm-fg-muted)" }}
                >
                  {expanded ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
              </>
            )}
          </div>

          {/* Categories */}
          {expanded && (
            <div className="p-4">
              <DragDropContext onDragEnd={handleCatDrop}>
                <Droppable droppableId={catsDropId} type="CATEGORY">
                  {(droppableProvided, droppableSnapshot) => (
                    <div
                      ref={droppableProvided.innerRef}
                      {...droppableProvided.droppableProps}
                      className="flex flex-col gap-2.5"
                      style={{
                        background: droppableSnapshot.isDraggingOver
                          ? "var(--adm-bg-hover)"
                          : "transparent",
                        minHeight: item.categories.length === 0 ? 40 : "auto",
                        padding: droppableSnapshot.isDraggingOver ? "8px" : 0,
                        borderRadius: 2,
                        transition: "background 0.15s, padding 0.15s",
                      }}
                    >
                      {item.categories.length === 0 &&
                        !droppableSnapshot.isDraggingOver && (
                          <div
                            className="py-5 text-center font-sans text-[12px] border border-dashed"
                            style={{
                              borderColor: "var(--adm-border)",
                              color: "var(--adm-fg-faint)",
                            }}
                          >
                            No categories yet — add one below
                          </div>
                        )}
                      {item.categories.map((cat, ci) => (
                        <CategoryBlock
                          key={cat.id}
                          cat={cat}
                          catIndex={ci}
                          draggableId={`cat-${item._id}-${cat.id}`}
                          navItemId={item._id}
                          products={products}
                          dbCategories={dbCategories}
                          onUpdate={(updated) => updateCategory(ci, updated)}
                          onRemove={() => removeCategory(ci)}
                        />
                      ))}
                      {droppableProvided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              {/* Add category */}
              <div className="mt-3">
                {addingCat ? (
                  <div
                    className="border p-3 flex flex-col gap-2.5"
                    style={{
                      borderColor: "var(--adm-accent-border)",
                      background: "var(--adm-bg-accent-lt)",
                    }}
                  >
                    <div
                      className={`${sectionLabel}`}
                      style={{ color: "var(--adm-fg-muted)" }}
                    >
                      New Category Column
                    </div>
                    <input
                      autoFocus
                      type="text"
                      value={newCatTitle}
                      onChange={(e) => setNewCatTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCategory()}
                      placeholder="Column title (e.g. Trunks)"
                      className={inputCls}
                      style={{ fontSize: "12px", padding: "8px 12px" }}
                    />

                    {/* Link to product category page toggle */}
                    <label
                      className="flex items-center gap-2 cursor-pointer"
                      style={{ color: "var(--adm-fg)" }}
                    >
                      <input
                        type="checkbox"
                        checked={newCatIsProductPage}
                        onChange={(e) => {
                          setNewCatIsProductPage(e.target.checked);
                          setSelectedCatName("");
                        }}
                        className="accent-[var(--adm-accent)]"
                      />
                      <span className="font-sans text-[11px] font-semibold">
                        Auto-link to a product category page
                      </span>
                    </label>

                    {newCatIsProductPage && (
                      <select
                        value={selectedCatName}
                        onChange={(e) => setSelectedCatName(e.target.value)}
                        className={inputCls}
                        style={{ fontSize: "12px", padding: "8px 12px" }}
                      >
                        <option value="">Pick a product category…</option>
                        {dbCategories.map((c) => (
                          <option key={c._id} value={c.name}>
                            {c.name} → /products?category={c.name}
                          </option>
                        ))}
                      </select>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={addCategory}
                        disabled={!newCatTitle.trim()}
                        className="flex items-center gap-1.5 px-3 py-1.5 border-none cursor-pointer font-sans text-[10px] font-bold tracking-widest uppercase text-white disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: "var(--adm-accent)" }}
                        onMouseEnter={(e) => {
                          if (!e.currentTarget.disabled)
                            e.currentTarget.style.background =
                              "var(--adm-accent-hover)";
                        }}
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            "var(--adm-accent)")
                        }
                      >
                        <Plus size={10} /> Add Category
                      </button>
                      <button
                        onClick={() => {
                          setAddingCat(false);
                          setNewCatTitle("");
                          setNewCatIsProductPage(false);
                          setSelectedCatName("");
                        }}
                        className="flex items-center justify-center p-1.5 border cursor-pointer"
                        style={{
                          borderColor: "var(--adm-border)",
                          color: "var(--adm-fg-muted)",
                          background: "transparent",
                        }}
                      >
                        <X size={11} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingCat(true)}
                    className="flex items-center gap-1.5 px-3 py-2 border border-dashed w-full justify-center font-sans text-[10px] font-bold tracking-widest uppercase cursor-pointer transition-all duration-150"
                    style={{
                      borderColor: "var(--adm-border)",
                      color: "var(--adm-fg-muted)",
                      background: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--adm-accent)";
                      e.currentTarget.style.color = "var(--adm-accent)";
                      e.currentTarget.style.background =
                        "var(--adm-bg-accent-lt)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--adm-border)";
                      e.currentTarget.style.color = "var(--adm-fg-muted)";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <FolderOpen size={11} /> Add Category Column
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

// ─── Main NavManager ──────────────────────────────────────────────────────────

export default function NavManager() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [dbCategories, setDbCategories] = useState<DBCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const [addingItem, setAddingItem] = useState(false);
  const [newItemLabel, setNewItemLabel] = useState("");

  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    label: string;
  } | null>(null);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Fetch everything on mount
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [navRes, prodRes, catRes] = await Promise.all([
        fetch("/api/admin/navconfig"),
        fetch("/api/admin/inventory"),
        fetch("/api/admin/category"),
      ]);
      if (navRes.ok) {
        const d = await navRes.json();
        setItems(d.items || []);
      }
      if (prodRes.ok) {
        const d = await prodRes.json();
        setProducts(
          (d.products || []).map((p: DBProduct) => ({
            _id: p._id,
            name: p.name,
            slug: p.slug,
            category: p.category,
          })),
        );
      }
      if (catRes.ok) {
        const d = await catRes.json();
        setDbCategories(d.categories || []);
      }
    } catch {
      setToast({ type: "error", msg: "Failed to load data." });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Mark dirty on items change (except initial load)
  const updateItem = useCallback((updated: NavItem) => {
    setItems((prev) =>
      prev.map((it) => (it._id === updated._id ? updated : it)),
    );
    setDirty(true);
  }, []);

  const handleNavDrop = useCallback((result: DropResult) => {
    if (!result.destination) return;
    setItems((prev) =>
      reorder(prev, result.source.index, result.destination!.index).map(
        (it, i) => ({ ...it, order: i }),
      ),
    );
    setDirty(true);
  }, []);

  // Add top-level nav item
  const addNavItem = async () => {
    if (!newItemLabel.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/navconfig", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: newItemLabel.trim(),
          order: items.length,
        }),
      });
      const d = await res.json();
      if (res.ok) {
        setToast({ type: "success", msg: `"${newItemLabel.trim()}" added.` });
        setNewItemLabel("");
        setAddingItem(false);
        await fetchAll();
      } else {
        setToast({ type: "error", msg: d.error || "Failed to add." });
      }
    } catch {
      setToast({ type: "error", msg: "Network error." });
    }
    setSaving(false);
  };

  // Delete a nav item
  const deleteNavItem = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/navconfig?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setToast({ type: "success", msg: "Nav item deleted." });
        setItems((prev) => prev.filter((it) => it._id !== id));
        setDirty(false);
      }
    } catch {
      setToast({ type: "error", msg: "Failed to delete." });
    }
    setConfirmDelete(null);
  };

  // Save all changes
  const saveAll = async () => {
    setSaving(true);
    try {
      // Save each item with PUT
      const results = await Promise.all(
        items.map((item) =>
          fetch("/api/admin/navconfig", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
          }),
        ),
      );
      const allOk = results.every((r) => r.ok);
      if (allOk) {
        setToast({ type: "success", msg: "Navigation saved successfully!" });
        setDirty(false);
      } else {
        setToast({ type: "error", msg: "Some items failed to save." });
      }
    } catch {
      setToast({ type: "error", msg: "Network error while saving." });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center gap-2.5 py-20 font-sans text-[13px]"
        style={{ color: "var(--adm-fg-muted)" }}
      >
        <Loader2 size={18} className="animate-spin" /> Loading nav config…
      </div>
    );
  }

  return (
    <div className="max-w-full px-2 py-7 md:pb-16 pb-24">
      {/* Header with save button */}
      <div
        className="flex items-center justify-between mb-5 px-3 py-4 border"
        style={{
          background: "var(--adm-bg-white)",
          borderColor: "var(--adm-border)",
          boxShadow: "var(--adm-shadow-card)",
        }}
      >
        <div>
          <div
            className="font-serif text-[17px] font-bold"
            style={{ color: "var(--adm-fg)" }}
          >
            Navigation Config
          </div>
          <div
            className="font-sans text-[11px] mt-0.5"
            style={{ color: "var(--adm-fg-muted)" }}
          >
            {items.length} top-level items · Drag to reorder
          </div>
        </div>
        <button
          onClick={saveAll}
          disabled={!dirty || saving}
          className="flex items-center gap-2 px-4 py-2.5 border-none cursor-pointer font-sans text-[11px] font-bold tracking-widest uppercase text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: dirty ? "var(--adm-accent)" : "var(--adm-fg-faint)",
          }}
          onMouseEnter={(e) => {
            if (dirty && !saving)
              e.currentTarget.style.background = "var(--adm-accent-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = dirty
              ? "var(--adm-accent)"
              : "var(--adm-fg-faint)";
          }}
        >
          {saving ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Save size={12} />
          )}
          {saving ? "Saving…" : dirty ? "Save Changes" : "Saved"}
        </button>
      </div>

      {/* Dirty banner */}
      {dirty && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 mb-4 font-sans text-[11px] font-semibold border"
          style={{
            background: "rgba(42,122,114,0.06)",
            borderColor: "var(--adm-accent-border)",
            color: "var(--adm-accent)",
          }}
        >
          <AlertCircle size={13} />
          You have unsaved changes click "Save Changes" to publish to the site.
        </div>
      )}

      {/* Top-level DnD list */}
      <DragDropContext onDragEnd={handleNavDrop}>
        <Droppable droppableId="nav-items" type="NAV_ITEM">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-col gap-3"
              style={{
                background: snapshot.isDraggingOver
                  ? "var(--adm-bg-hover)"
                  : "transparent",
                padding: snapshot.isDraggingOver ? "8px" : 0,
                borderRadius: 2,
                minHeight: items.length === 0 ? 80 : "auto",
                transition: "background 0.15s, padding 0.15s",
              }}
            >
              {items.length === 0 && !snapshot.isDraggingOver && (
                <div
                  className="py-10 text-center font-sans text-[12px] border border-dashed"
                  style={{
                    borderColor: "var(--adm-border)",
                    color: "var(--adm-fg-faint)",
                  }}
                >
                  No nav items yet — add one below
                </div>
              )}
              {items.map((item, idx) => (
                <NavItemBlock
                  key={item._id}
                  item={item}
                  index={idx}
                  products={products}
                  dbCategories={dbCategories}
                  onUpdate={updateItem}
                  onDelete={(id) => setConfirmDelete({ id, label: item.label })}
                  saving={saving}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add top-level nav item */}
      <div className="mt-4">
        {addingItem ? (
          <div
            className="border p-4 flex flex-col gap-3"
            style={{
              borderColor: "var(--adm-accent-border)",
              background: "var(--adm-bg-white)",
              boxShadow: "var(--adm-shadow-card)",
            }}
          >
            <div
              className={`${sectionLabel}`}
              style={{ color: "var(--adm-fg-muted)" }}
            >
              New Nav Item (e.g. Men, Women, Accessories)
            </div>
            <input
              autoFocus
              type="text"
              value={newItemLabel}
              onChange={(e) => setNewItemLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNavItem()}
              placeholder="Label (e.g. Men)"
              className={inputCls}
            />
            <div className="flex gap-2">
              <button
                onClick={addNavItem}
                disabled={saving || !newItemLabel.trim()}
                className="flex items-center gap-1.5 px-4 py-2 border-none cursor-pointer font-sans text-[10px] font-bold tracking-widest uppercase text-white disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "var(--adm-accent)" }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled)
                    e.currentTarget.style.background =
                      "var(--adm-accent-hover)";
                }}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "var(--adm-accent)")
                }
              >
                {saving ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <Plus size={11} />
                )}
                Add Nav Item
              </button>
              <button
                onClick={() => {
                  setAddingItem(false);
                  setNewItemLabel("");
                }}
                className="flex items-center justify-center p-2 border cursor-pointer"
                style={{
                  borderColor: "var(--adm-border)",
                  color: "var(--adm-fg-muted)",
                  background: "transparent",
                }}
              >
                <X size={12} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingItem(true)}
            className="flex items-center gap-2 px-4 py-3 border border-dashed w-full justify-center font-sans text-[11px] font-bold tracking-widest uppercase cursor-pointer transition-all duration-150"
            style={{
              borderColor: "var(--adm-border)",
              color: "var(--adm-fg-muted)",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--adm-accent)";
              e.currentTarget.style.color = "var(--adm-accent)";
              e.currentTarget.style.background = "var(--adm-bg-accent-lt)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--adm-border)";
              e.currentTarget.style.color = "var(--adm-fg-muted)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <Navigation size={13} /> Add Top-Level Nav Item
          </button>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[999] flex items-center gap-2.5 px-4 py-3 bg-white border shadow-[0_4px_24px_rgba(0,0,0,0.10)]"
          style={{
            borderColor:
              toast.type === "success"
                ? "var(--adm-accent)"
                : "var(--adm-danger)",
          }}
        >
          {toast.type === "success" ? (
            <CheckCircle2
              size={15}
              style={{ color: "var(--adm-accent)", flexShrink: 0 }}
            />
          ) : (
            <AlertCircle
              size={15}
              style={{ color: "var(--adm-danger)", flexShrink: 0 }}
            />
          )}
          <span
            className="font-sans text-[13px] font-semibold"
            style={{ color: "var(--adm-fg)" }}
          >
            {toast.msg}
          </span>
        </div>
      )}

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-5">
          <div
            className="p-7 max-w-sm w-full border"
            style={{
              background: "var(--adm-bg-white)",
              borderColor: "var(--adm-border)",
              boxShadow: "var(--adm-shadow-modal)",
            }}
          >
            <h3
              className="font-serif text-[16px] font-bold mb-2"
              style={{ color: "var(--adm-fg)" }}
            >
              Delete Nav Item?
            </h3>
            <p
              className="font-sans text-[13px] leading-relaxed mb-5"
              style={{ color: "var(--adm-fg-muted)" }}
            >
              Permanently delete{" "}
              <strong style={{ color: "var(--adm-fg)" }}>
                "{confirmDelete.label}"
              </strong>{" "}
              and all its categories and links? This cannot be undone.
            </p>
            <div className="flex gap-2.5">
              <button
                className="flex-1 py-2.5 border cursor-pointer font-sans text-[11px] font-bold tracking-widest uppercase transition-all duration-150"
                style={{
                  borderColor: "var(--adm-border)",
                  color: "var(--adm-fg-muted)",
                  background: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--adm-accent)";
                  e.currentTarget.style.color = "var(--adm-fg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--adm-border)";
                  e.currentTarget.style.color = "var(--adm-fg-muted)";
                }}
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                className="flex-[1.5] py-2.5 border-none cursor-pointer font-sans text-[11px] font-bold tracking-widest uppercase text-white hover:opacity-90 transition-opacity duration-150"
                style={{ background: "var(--adm-danger)" }}
                onClick={() => deleteNavItem(confirmDelete.id)}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
