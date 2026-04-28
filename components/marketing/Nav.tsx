"use client";

// ── Marketing site navigation ──────────────────────────────────
// Persistent bar across every public page. Transparent at the top
// of each route, picks up a subtle parchment blur once the user
// scrolls past the hero. Collapses to a hamburger on mobile, which
// opens a full-screen warm parchment overlay.
//
// Right-side actions: cart icon (with count badge) + either a
// "Sign In" button (logged out) or an avatar menu (logged in).

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";

const DISPLAY = "'Playfair Display', Georgia, serif";
const BODY = "'DM Sans', system-ui, sans-serif";

const NAV_LINKS = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/stationery", label: "Stationery" },
  { href: "/platform", label: "Platform" },
  { href: "/for-vendors", label: "For Vendors" },
  { href: "/community", label: "Community" },
];

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const cartItems = useCartStore((s) => s.items);
  const cartCount = useMemo(
    () => cartItems.reduce((n, i) => n + i.qty, 0),
    [cartItems],
  );
  const user = useAuthStore((s) => s.user);
  const openSignIn = useAuthStore((s) => s.openSignIn);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500"
        style={{
          backgroundColor: scrolled
            ? "rgba(247, 245, 240, 0.82)"
            : "rgba(247, 245, 240, 0)",
          backdropFilter: scrolled ? "blur(12px) saturate(120%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px) saturate(120%)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(28, 25, 23, 0.08)"
            : "1px solid rgba(28, 25, 23, 0)",
        }}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-12 md:py-7">
          <Link
            href="/"
            className="text-[22px] tracking-[0.04em] text-[#1C1917] transition-colors hover:text-[#B8755D]"
            style={{ fontFamily: DISPLAY, fontWeight: 500 }}
          >
            Ananya
          </Link>

          <nav
            className="hidden items-center gap-11 text-[13px] font-normal md:flex"
            style={{ fontFamily: BODY, letterSpacing: "0.02em" }}
          >
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative transition-colors"
                  style={{ color: active ? "#B8755D" : "rgba(28,25,23,0.65)" }}
                >
                  <span className="hover:text-[#B8755D]">{link.label}</span>
                  {active && (
                    <span
                      aria-hidden
                      className="absolute -bottom-1.5 left-1/2 h-[3px] w-[3px] -translate-x-1/2 rotate-45 bg-[#B8755D]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-5 md:gap-6">
            <CartIcon count={cartCount} />

            <div className="hidden md:block">
              {user ? (
                <UserMenu />
              ) : (
                <button
                  type="button"
                  onClick={() => openSignIn("generic")}
                  className="text-[13px] tracking-[0.02em] text-[#1C1917] transition-colors hover:text-[#B8755D]"
                  style={{ fontFamily: BODY }}
                >
                  Sign In
                </button>
              )}
            </div>

            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className="relative flex h-9 w-9 items-center justify-center md:hidden"
            >
              <span className="sr-only">Menu</span>
              <span
                aria-hidden
                className="absolute h-px w-6 bg-[#1C1917] transition-transform duration-400"
                style={{
                  transform: menuOpen
                    ? "rotate(45deg)"
                    : "translateY(-4px) rotate(0deg)",
                }}
              />
              <span
                aria-hidden
                className="absolute h-px w-6 bg-[#1C1917] transition-transform duration-400"
                style={{
                  transform: menuOpen
                    ? "rotate(-45deg)"
                    : "translateY(4px) rotate(0deg)",
                }}
              />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 flex flex-col bg-[#F7F5F0] pt-24 md:hidden"
          >
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-start gap-2 px-8 py-12"
            >
              {NAV_LINKS.map((link, i) => {
                const active = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block py-3 transition-colors"
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: 34,
                      lineHeight: 1.1,
                      letterSpacing: "-0.01em",
                      fontWeight: 400,
                      color: active ? "#B8755D" : "#1C1917",
                      fontStyle: i % 2 === 1 ? "italic" : "normal",
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </motion.nav>

            <div
              className="mt-auto flex flex-col gap-5 px-8 pb-12"
              style={{ fontFamily: BODY }}
            >
              <Link
                href="/cart"
                className="inline-flex items-center gap-2 text-[14px] tracking-[0.04em] text-[#1C1917]"
              >
                Cart {cartCount > 0 && <span>({cartCount})</span>}
              </Link>
              {user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-[14px] tracking-[0.04em] text-[#B8755D]"
                >
                  Your dashboard →
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    openSignIn("generic");
                  }}
                  className="inline-flex items-center gap-2 text-left text-[14px] tracking-[0.04em] text-[#B8755D]"
                >
                  Sign In →
                </button>
              )}
              <span
                className="text-[11px] uppercase text-[#A8998A]"
                style={{ letterSpacing: "0.3em" }}
              >
                Dallas — Fort Worth · Launching 2026
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function CartIcon({ count }: { count: number }) {
  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `Cart, ${count} items` : "Cart"}
      className="relative inline-flex items-center justify-center text-[#1C1917] transition-colors hover:text-[#B8755D]"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {count > 0 && (
        <span
          className="absolute -right-2 -top-2 inline-flex min-w-[18px] items-center justify-center rounded-full bg-[#B8755D] px-1.5 text-[10px] text-[#F7F5F0]"
          style={{ fontFamily: BODY, fontWeight: 600, lineHeight: "18px" }}
        >
          {count}
        </span>
      )}
    </Link>
  );
}

function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!user) return null;
  const initial = user.name?.trim()?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1C1917]/15 bg-white text-[13px] text-[#1C1917] transition-colors hover:border-[#B8755D] hover:text-[#B8755D]"
        style={{ fontFamily: DISPLAY, fontWeight: 500 }}
        aria-label={`Account menu for ${user.name}`}
      >
        {initial}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-[44px] w-[240px] bg-[#F7F5F0] py-2 shadow-[0_24px_48px_-16px_rgba(28,25,23,0.2)]"
            style={{ fontFamily: BODY }}
            role="menu"
          >
            <div className="border-b border-[#1C1917]/10 px-4 py-3">
              <p className="text-[13px] text-[#1C1917]" style={{ fontWeight: 500 }}>
                {user.name}
              </p>
              <p className="text-[11px] text-[#A8998A]" style={{ letterSpacing: "0.02em" }}>
                {user.email}
              </p>
            </div>
            <MenuLink href="/dashboard" onSelect={() => setOpen(false)}>
              Dashboard
            </MenuLink>
            <MenuLink href="/workspace" onSelect={() => setOpen(false)}>
              Planning platform
            </MenuLink>
            <MenuLink href="/cart" onSelect={() => setOpen(false)}>
              Your selections
            </MenuLink>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                signOut();
                router.push("/");
              }}
              className="block w-full border-t border-[#1C1917]/10 px-4 py-3 text-left text-[12.5px] text-[#1C1917]/70 transition-colors hover:bg-[#EDE8E0] hover:text-[#B8755D]"
              role="menuitem"
            >
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuLink({
  href,
  children,
  onSelect,
}: {
  href: string;
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      role="menuitem"
      className="block px-4 py-2.5 text-[12.5px] text-[#1C1917]/80 transition-colors hover:bg-[#EDE8E0] hover:text-[#B8755D]"
      style={{ letterSpacing: "0.02em" }}
    >
      {children}
    </Link>
  );
}
