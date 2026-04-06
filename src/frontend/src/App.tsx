import { Toaster } from "@/components/ui/sonner";
import {
  Instagram,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Truck,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { CartItem } from "./backend.d";
import {
  useAddToCart,
  useGetCart,
  useRemoveFromCart,
} from "./hooks/useQueries";

// ─────────────────────────────────────────────
// Product catalog (hardcoded)
// ─────────────────────────────────────────────
type Category = "jeans" | "shirts" | "tshirts";

interface Product {
  id: bigint;
  name: string;
  price: number;
  image: string;
  category: Category;
}

const PRODUCTS: Product[] = [
  // Jeans ₹750
  {
    id: 0n,
    name: "Baggy Jeans",
    price: 750,
    image: "/assets/jeans_1chat_gpt-019d53ad-4194-76e0-8f95-77e06532936d.jpg",
    category: "jeans",
  },
  {
    id: 1n,
    name: "Wide Leg Jeans",
    price: 750,
    image: "/assets/jeans_2_gpt-019d53ad-3ff7-7395-8ec2-038a659d58df.jpg",
    category: "jeans",
  },
  {
    id: 2n,
    name: "Bootcut Jeans",
    price: 750,
    image: "/assets/jeans_3_gpt-019d53ad-4098-7737-aeb8-b88f7154282b.jpg",
    category: "jeans",
  },
  // Shirts ₹500
  {
    id: 3n,
    name: "White Shirt",
    price: 500,
    image: "/assets/generated/shirt-white.dim_600x600.jpg",
    category: "shirts",
  },
  {
    id: 4n,
    name: "Black Shirt",
    price: 500,
    image: "/assets/generated/shirt-black.dim_600x600.jpg",
    category: "shirts",
  },
  {
    id: 5n,
    name: "Navy Shirt",
    price: 500,
    image: "/assets/generated/shirt-navy.dim_600x600.jpg",
    category: "shirts",
  },
  {
    id: 6n,
    name: "Olive Shirt",
    price: 500,
    image: "/assets/generated/shirt-olive.dim_600x600.jpg",
    category: "shirts",
  },
  // T-Shirts ₹300
  {
    id: 7n,
    name: "Round Neck Tee",
    price: 300,
    image: "/assets/t_shirt_1-019d53ad-40f9-71ae-b54c-36750c2733f4.jpg",
    category: "tshirts",
  },
  {
    id: 8n,
    name: "Graphic Round Neck Tee",
    price: 300,
    image: "/assets/t_shirt_2-019d53ad-4099-775b-81ca-c0b00e43d699.jpg",
    category: "tshirts",
  },
  {
    id: 9n,
    name: "Printed Round Neck Tee",
    price: 300,
    image: "/assets/t_shirt_3-019d53ad-4111-7038-a9c5-e36bb1da28a1.jpg",
    category: "tshirts",
  },
];

const jeans = PRODUCTS.filter((p) => p.category === "jeans");
const shirts = PRODUCTS.filter((p) => p.category === "shirts");
const tshirts = PRODUCTS.filter((p) => p.category === "tshirts");

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function formatRupee(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─────────────────────────────────────────────
// ProductCard component
// ─────────────────────────────────────────────
function ProductCard({ product, index }: { product: Product; index: number }) {
  const addToCart = useAddToCart();
  const [flashing, setFlashing] = useState(false);

  const handleAddToCart = useCallback(async () => {
    setFlashing(true);
    try {
      const item: CartItem = { productId: product.id, quantity: 1n };
      await addToCart.mutateAsync([item]);
      toast.success(`${product.name} added to cart!`, {
        style: {
          background: "oklch(0.14 0 0)",
          border: "1px solid oklch(0.93 0.24 130)",
          color: "oklch(0.95 0 0)",
        },
      });
    } catch {
      toast.error("Failed to add item. Try again.");
    } finally {
      setTimeout(() => setFlashing(false), 600);
    }
  }, [product, addToCart]);

  return (
    <motion.div
      className="product-card flex flex-col"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: "easeOut" }}
      data-ocid={`product.item.${index + 1}`}
    >
      {/* Product image */}
      <div className="aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-display uppercase font-bold text-[13px] tracking-wide text-foreground leading-tight">
            {product.name}
          </p>
          <span
            className="font-display font-extrabold text-base text-foreground whitespace-nowrap"
            style={{ color: "oklch(0.95 0 0)" }}
          >
            {formatRupee(product.price)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={addToCart.isPending}
          className={`btn-lime w-full py-2.5 rounded-[10px] text-[12px] tracking-widest transition-all duration-200 ${
            flashing ? "animate-cart-flash" : ""
          }`}
          data-ocid={`product.add_to_cart.${index + 1}`}
        >
          {addToCart.isPending ? "ADDING..." : "ADD TO CART"}
        </button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Product Section
// ─────────────────────────────────────────────
function ProductSection({
  id,
  title,
  subtitle,
  products,
  accentClass,
}: {
  id: string;
  title: string;
  subtitle: string;
  products: Product[];
  accentClass: string;
}) {
  return (
    <section id={id} className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2
          className={`font-display uppercase font-extrabold text-3xl md:text-4xl tracking-tight mb-2 ${accentClass}`}
        >
          {title}
        </h2>
        <p className="text-muted-foreground text-sm uppercase tracking-widest">
          {subtitle}
        </p>
        <div
          className="mx-auto mt-4 w-16 h-0.5"
          style={{
            background: "oklch(0.93 0.24 130)",
            boxShadow: "0 0 10px oklch(0.93 0.24 130 / 0.6)",
          }}
        />
      </motion.div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.map((p, i) => (
          <ProductCard key={String(p.id)} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Cart Drawer
// ─────────────────────────────────────────────
function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: cart, isLoading } = useGetCart();
  const removeFromCart = useRemoveFromCart();
  const addToCart = useAddToCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Trap focus and handle Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    drawerRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const cartItems = cart?.items ?? [];

  const enrichedItems = cartItems
    .map((item) => {
      const product = PRODUCTS.find((p) => p.id === item.productId);
      return { item, product };
    })
    .filter((x) => x.product != null) as { item: CartItem; product: Product }[];

  const total = enrichedItems.reduce(
    (sum, { item, product }) => sum + product.price * Number(item.quantity),
    0,
  );

  const handleRemove = async (productId: bigint) => {
    try {
      await removeFromCart.mutateAsync(productId);
    } catch {
      toast.error("Failed to remove item.");
    }
  };

  const handleIncrease = async (item: CartItem) => {
    try {
      await addToCart.mutateAsync([
        { productId: item.productId, quantity: 1n },
      ]);
    } catch {
      toast.error("Failed to update quantity.");
    }
  };

  const handleDecrease = async (item: CartItem) => {
    if (Number(item.quantity) <= 1) {
      await handleRemove(item.productId);
    } else {
      // Re-add with quantity -1 approach: remove and re-add with new qty
      // Since backend only has addItems (increments) and removeItem (removes entirely),
      // we remove and add with (qty - 1)
      try {
        await removeFromCart.mutateAsync(item.productId);
        if (Number(item.quantity) - 1 > 0) {
          await addToCart.mutateAsync([
            {
              productId: item.productId,
              quantity: BigInt(Number(item.quantity) - 1),
            },
          ]);
        }
      } catch {
        toast.error("Failed to update quantity.");
      }
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 cart-overlay z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            data-ocid="cart.modal"
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            aria-label="Shopping cart"
            aria-modal="true"
            tabIndex={-1}
            className="fixed right-0 top-0 h-full w-full max-w-sm z-50 flex flex-col focus:outline-none"
            style={{ background: "oklch(0.11 0 0)" }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            data-ocid="cart.sheet"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: "1px solid oklch(0.28 0 0)" }}
            >
              <div className="flex items-center gap-2">
                <ShoppingCart
                  size={20}
                  style={{ color: "oklch(0.93 0.24 130)" }}
                />
                <span className="font-display uppercase font-extrabold text-base tracking-widest text-foreground">
                  YOUR CART
                </span>
                {cartItems.length > 0 && (
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: "oklch(0.93 0.24 130)",
                      color: "oklch(0.09 0.003 260)",
                    }}
                  >
                    {cartItems.reduce((s, i) => s + Number(i.quantity), 0)}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Close cart"
                data-ocid="cart.close_button"
              >
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto cart-scroll px-6 py-4">
              {isLoading ? (
                <div
                  className="flex flex-col gap-3"
                  data-ocid="cart.loading_state"
                >
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-20 rounded-xl animate-pulse"
                      style={{ background: "oklch(0.17 0 0)" }}
                    />
                  ))}
                </div>
              ) : enrichedItems.length === 0 ? (
                <motion.div
                  className="flex flex-col items-center justify-center h-full gap-4 text-center py-16"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  data-ocid="cart.empty_state"
                >
                  <ShoppingCart size={48} className="text-muted-foreground" />
                  <p className="font-display uppercase font-bold text-foreground text-lg">
                    Cart is Empty
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Add some drip to your cart!
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-lime px-6 py-2 rounded-lg text-sm mt-2"
                    data-ocid="cart.secondary_button"
                  >
                    SHOP NOW
                  </button>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-3">
                  {enrichedItems.map(({ item, product }, idx) => (
                    <motion.div
                      key={String(item.productId)}
                      className="flex gap-3 p-3 rounded-xl"
                      style={{
                        background: "oklch(0.14 0 0)",
                        border: "1px solid oklch(0.28 0 0)",
                      }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.04 }}
                      data-ocid={`cart.item.${idx + 1}`}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <p className="font-display uppercase font-bold text-xs text-foreground truncate">
                          {product.name}
                        </p>
                        <p
                          className="font-bold text-sm"
                          style={{ color: "oklch(0.93 0.24 130)" }}
                        >
                          {formatRupee(product.price)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => handleDecrease(item)}
                            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted transition-colors"
                            style={{ border: "1px solid oklch(0.28 0 0)" }}
                            aria-label="Decrease quantity"
                            data-ocid={`cart.item.${idx + 1}`}
                          >
                            <Minus size={12} className="text-foreground" />
                          </button>
                          <span className="font-bold text-sm text-foreground w-4 text-center">
                            {String(item.quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleIncrease(item)}
                            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted transition-colors"
                            style={{ border: "1px solid oklch(0.28 0 0)" }}
                            aria-label="Increase quantity"
                            data-ocid={`cart.item.${idx + 1}`}
                          >
                            <Plus size={12} className="text-foreground" />
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.productId)}
                        className="self-start p-1 rounded hover:bg-muted transition-colors"
                        aria-label={`Remove ${product.name}`}
                        data-ocid={`cart.delete_button.${idx + 1}`}
                      >
                        <X size={14} className="text-muted-foreground" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {enrichedItems.length > 0 && (
              <div
                className="px-6 py-5"
                style={{ borderTop: "1px solid oklch(0.28 0 0)" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display uppercase font-bold text-sm text-muted-foreground tracking-widest">
                    SUBTOTAL
                  </span>
                  <span className="font-display font-extrabold text-xl text-foreground">
                    {formatRupee(total)}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-lime w-full py-3.5 rounded-xl text-sm tracking-widest"
                  data-ocid="cart.confirm_button"
                >
                  PROCEED TO CHECKOUT
                </button>
                <p className="text-center text-xs text-muted-foreground mt-2">
                  Free delivery in Ahmedabad!
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────
export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: cart } = useGetCart();

  const totalItems =
    cart?.items.reduce((s, i) => s + Number(i.quantity), 0) ?? 0;

  const navLinks = [
    { label: "HOME", id: "hero" },
    { label: "JEANS", id: "jeans" },
    { label: "SHIRTS", id: "shirts" },
    { label: "T-SHIRTS", id: "tshirts" },
    { label: "ABOUT", id: "why" },
    { label: "CONTACT", id: "footer" },
  ];

  const handleNavClick = (id: string) => {
    setMenuOpen(false);
    scrollToSection(id);
  };

  return (
    <div
      className="min-h-screen bg-background"
      style={{ position: "relative" }}
    >
      <Toaster position="top-right" />

      {/* ──────────── STICKY HEADER ──────────── */}
      <header
        className="sticky top-0 z-30"
        style={{ background: "oklch(0.10 0 0)" }}
        data-ocid="nav.section"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              type="button"
              onClick={() => scrollToSection("hero")}
              className="font-display uppercase font-black text-2xl md:text-3xl tracking-tight text-foreground leading-none hover:opacity-80 transition-opacity"
              data-ocid="nav.link"
            >
              DRIP
              <span style={{ color: "oklch(0.93 0.24 130)" }}>&</span>
              DRAG
            </button>

            {/* Desktop nav */}
            <nav
              className="hidden md:flex items-center gap-6"
              aria-label="Main navigation"
            >
              {navLinks.map((link) => (
                <button
                  type="button"
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className="font-body uppercase font-bold text-[13px] tracking-wider text-muted-foreground hover:text-foreground transition-colors relative group"
                  data-ocid="nav.link"
                >
                  {link.label}
                  <span
                    className="absolute -bottom-0.5 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                    style={{ background: "oklch(0.93 0.24 130)" }}
                  />
                </button>
              ))}
            </nav>

            {/* Right: cart + hamburger */}
            <div className="flex items-center gap-3">
              {/* Cart button */}
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="relative p-2 rounded-xl hover:bg-muted transition-colors"
                aria-label={`Open cart (${totalItems} items)`}
                data-ocid="cart.open_modal_button"
              >
                <ShoppingCart size={22} className="text-foreground" />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center"
                    style={{
                      background: "oklch(0.93 0.24 130)",
                      color: "oklch(0.09 0.003 260)",
                    }}
                  >
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile hamburger */}
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors"
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
                data-ocid="nav.toggle"
              >
                {menuOpen ? (
                  <X size={22} className="text-foreground" />
                ) : (
                  <Menu size={22} className="text-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Neon divider */}
        <div className="neon-divider" />

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden md:hidden"
              style={{
                background: "oklch(0.10 0 0)",
                borderBottom: "1px solid oklch(0.28 0 0)",
              }}
              aria-label="Mobile navigation"
            >
              <div className="flex flex-col px-4 py-3 gap-1">
                {navLinks.map((link) => (
                  <button
                    type="button"
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className="text-left font-body uppercase font-bold text-sm tracking-wider text-muted-foreground hover:text-foreground py-2.5 px-3 rounded-lg hover:bg-muted transition-colors"
                    data-ocid="nav.link"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* ──────────── HERO ──────────── */}
      <section
        id="hero"
        className="relative min-h-[92vh] flex items-center overflow-hidden"
        data-ocid="hero.section"
      >
        {/* Model background image */}
        <div className="absolute inset-0">
          <img
            src="/assets/generated/hero-model.dim_1200x700.jpg"
            alt="DRIP AND DRAG hero model"
            className="w-full h-full object-cover object-top"
            loading="eager"
          />
          {/* Dark overlay gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(105deg, oklch(0.09 0.003 260 / 0.92) 0%, oklch(0.09 0.003 260 / 0.80) 50%, oklch(0.09 0.003 260 / 0.45) 100%)",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 w-full">
          <div className="max-w-xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
              style={{
                background: "oklch(0.93 0.24 130 / 0.15)",
                border: "1px solid oklch(0.93 0.24 130 / 0.4)",
              }}
            >
              <Zap size={12} style={{ color: "oklch(0.93 0.24 130)" }} />
              <span
                className="font-display uppercase text-[11px] font-bold tracking-widest"
                style={{ color: "oklch(0.93 0.24 130)" }}
              >
                Ahmedabad's Most Affordable Drip
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display uppercase leading-[0.9] mb-4"
              style={{ fontWeight: 900, fontSize: "clamp(52px, 10vw, 88px)" }}
            >
              <span style={{ color: "oklch(0.93 0.24 130)" }}>DRIP</span>
              <br />
              <span className="text-foreground">AND</span>
              <br />
              <span style={{ color: "oklch(0.72 0.21 42)" }}>DRAG</span>
            </motion.h1>

            {/* Sub-copy */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="text-foreground text-lg md:text-xl font-medium mb-8 leading-relaxed"
            >
              Affordable Drip Starts at{" "}
              <span
                style={{ color: "oklch(0.93 0.24 130)" }}
                className="font-extrabold"
              >
                ₹300
              </span>
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex flex-wrap gap-3"
            >
              <button
                type="button"
                onClick={() => scrollToSection("jeans")}
                className="btn-orange px-7 py-3.5 rounded-xl text-sm"
                data-ocid="hero.primary_button"
              >
                SHOP NOW
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("tshirts")}
                className="btn-lime px-7 py-3.5 rounded-xl text-sm"
                data-ocid="hero.secondary_button"
              >
                EXPLORE ALL
              </button>
            </motion.div>

            {/* Quick stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="flex flex-wrap gap-6 mt-10"
            >
              {[
                { label: "Jeans", price: "₹750" },
                { label: "Shirts", price: "₹500" },
                { label: "T-Shirts", price: "₹300" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col">
                  <span className="font-display font-extrabold text-xl text-foreground">
                    {item.price}
                  </span>
                  <span className="text-muted-foreground text-xs uppercase tracking-widest">
                    {item.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, oklch(0.09 0.003 260), transparent)",
          }}
        />
      </section>

      {/* ──────────── PRODUCT SECTIONS ──────────── */}
      <div className="py-4">
        <ProductSection
          id="jeans"
          title="JEANS"
          subtitle="Streetwear-ready denim — only ₹750"
          products={jeans}
          accentClass="text-foreground"
        />

        {/* Section divider */}
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div style={{ height: "1px", background: "oklch(0.28 0 0)" }} />
        </div>

        <ProductSection
          id="shirts"
          title="PLAIN SHIRTS"
          subtitle="Clean solid-color shirts — only ₹500"
          products={shirts}
          accentClass="text-foreground"
        />

        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div style={{ height: "1px", background: "oklch(0.28 0 0)" }} />
        </div>

        <ProductSection
          id="tshirts"
          title="ROUND NECK TEES"
          subtitle="Fresh basics for every vibe — only ₹300"
          products={tshirts}
          accentClass="text-foreground"
        />
      </div>

      {/* ──────────── WHY SECTION ──────────── */}
      <section
        id="why"
        className="py-20 px-4 md:px-8"
        style={{ background: "oklch(0.11 0 0)" }}
        data-ocid="why.section"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display uppercase font-extrabold text-3xl md:text-4xl tracking-tight text-foreground mb-2">
              WHY{" "}
              <span style={{ color: "oklch(0.93 0.24 130)" }}>AHMEDABAD</span>{" "}
              LOVES US
            </h2>
            <p className="text-muted-foreground text-sm uppercase tracking-widest">
              Real reasons. Real drip.
            </p>
            <div
              className="mx-auto mt-4 w-16 h-0.5"
              style={{
                background: "oklch(0.72 0.21 42)",
                boxShadow: "0 0 10px oklch(0.72 0.21 42 / 0.6)",
              }}
            />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <Star size={32} style={{ color: "oklch(0.72 0.21 42)" }} />
                ),
                label: "SUPER AFFORDABLE",
                stat: "Starts at ₹300",
                desc: "₹300 se shuru — because drip shouldn't cost a fortune.",
              },
              {
                icon: (
                  <Zap size={32} style={{ color: "oklch(0.72 0.21 42)" }} />
                ),
                label: "PREMIUM QUALITY",
                stat: "ISI Certified Fabric",
                desc: "Soft, durable fabric that feels premium without the premium price tag.",
              },
              {
                icon: (
                  <Truck size={32} style={{ color: "oklch(0.72 0.21 42)" }} />
                ),
                label: "FAST LOCAL DELIVERY",
                stat: "Same-day in Ahmedabad",
                desc: "Order before 2PM and get it today. Because real drip can't wait.",
              },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                className="flex flex-col items-center text-center p-8 rounded-xl"
                style={{
                  background: "oklch(0.14 0 0)",
                  border: "1px solid oklch(0.28 0 0)",
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                data-ocid={`why.card.${i + 1}`}
              >
                <div className="mb-4">{card.icon}</div>
                <p
                  className="font-display uppercase font-extrabold text-[11px] tracking-[0.2em] mb-2"
                  style={{ color: "oklch(0.72 0.21 42)" }}
                >
                  {card.label}
                </p>
                <p className="font-display font-extrabold text-xl text-foreground mb-2">
                  {card.stat}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── FOOTER ──────────── */}
      <footer
        id="footer"
        className="py-12 px-4 md:px-8"
        style={{
          background: "oklch(0.09 0.003 260)",
          borderTop: "1px solid oklch(0.28 0 0)",
        }}
        data-ocid="footer.section"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            {/* Brand */}
            <div>
              <h3 className="font-display uppercase font-black text-3xl tracking-tight mb-3">
                DRIP
                <span style={{ color: "oklch(0.93 0.24 130)" }}>&</span>
                DRAG
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Ahmedabad's most affordable streetwear store. Real drip, real
                price.
              </p>
            </div>

            {/* Address */}
            <div>
              <p
                className="font-display uppercase font-bold text-[11px] tracking-[0.2em] mb-3"
                style={{ color: "oklch(0.93 0.24 130)" }}
              >
                FIND US
              </p>
              <div className="flex gap-2 text-muted-foreground text-sm">
                <MapPin
                  size={16}
                  className="mt-0.5 flex-shrink-0"
                  style={{ color: "oklch(0.72 0.21 42)" }}
                />
                <span>
                  Shop No. 12, Manek Chowk,
                  <br />
                  Ahmedabad, Gujarat 380001
                </span>
              </div>
            </div>

            {/* Contact */}
            <div>
              <p
                className="font-display uppercase font-bold text-[11px] tracking-[0.2em] mb-3"
                style={{ color: "oklch(0.93 0.24 130)" }}
              >
                GET IN TOUCH
              </p>
              <div className="flex flex-col gap-3">
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm group"
                  data-ocid="footer.link"
                >
                  <MessageCircle
                    size={18}
                    className="flex-shrink-0"
                    style={{ color: "oklch(0.72 0.21 42)" }}
                  />
                  <span>+91 98765 43210</span>
                </a>
                <a
                  href="https://instagram.com/dripanddrag"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm group"
                  data-ocid="footer.link"
                >
                  <Instagram
                    size={18}
                    className="flex-shrink-0"
                    style={{ color: "oklch(0.72 0.21 42)" }}
                  />
                  <span>@dripanddrag</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3"
            style={{ borderTop: "1px solid oklch(0.22 0 0)" }}
          >
            <p className="text-muted-foreground text-xs text-center">
              © {new Date().getFullYear()} DRIP AND DRAG. All rights reserved.
            </p>
            <p className="text-muted-foreground text-xs text-center">
              Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
                style={{ color: "oklch(0.93 0.24 130)" }}
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* ──────────── CART DRAWER ──────────── */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
