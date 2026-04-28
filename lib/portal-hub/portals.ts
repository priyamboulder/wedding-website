// Canonical definition of every Ananya portal and module.
// Consumed by: /portal-hub page, each portal layout sidebar, and placeholder pages.

export type ModuleStatus = "not-started" | "in-progress" | "complete";

export type PortalModule = {
  slug: string;           // URL segment under the portal, e.g. "vendors"
  href: string;           // absolute route, e.g. "/app/vendors"
  name: string;
  description: string;
  status: ModuleStatus;
  icon?: string;          // single character / emoji-free glyph for the sidebar
};

export type Portal = {
  id: string;
  name: string;
  tagline: string;
  subdomain: string;
  basePath: string;       // "/", "/app", "/vendor", "/seller"
  userType: string;
  auth: string;
  accent: string;         // tailwind gradient for the hub card
  icon: string;           // short symbol for sidebar header
  modules: PortalModule[];
};

export const PORTALS: Portal[] = [
  {
    id: "public",
    name: "Public Site",
    tagline: "Discovery, marketing, and the front door to Ananya.",
    subdomain: "ananya.com",
    basePath: "/",
    userType: "Visitors, prospective couples, vendors, sellers",
    auth: "No authentication",
    accent: "from-champagne/60 to-ivory",
    icon: "A",
    modules: [
      { slug: "",            href: "/",                name: "Landing & Marketing",     description: "Editorial homepage, hero narrative, SEO copy.",      status: "in-progress", icon: "◈" },
      { slug: "vendors",     href: "/vendors",         name: "Vendor Directory",        description: "Read-only vendor search with limited detail.",       status: "in-progress", icon: "◇" },
      { slug: "stationery",  href: "/stationery",      name: "Stationery Showcase",     description: "Editorial gallery of invitation suites and artisans.", status: "not-started", icon: "◇" },
      { slug: "blog",        href: "/blog",            name: "Blog / Editorial",        description: "Stories, guides, and real wedding features.",        status: "not-started", icon: "◇" },
      { slug: "pricing",     href: "/pricing",         name: "Pricing & Plans",         description: "Subscription tiers for couples, vendors, sellers.",  status: "not-started", icon: "◇" },
      { slug: "signup/couple", href: "/signup/couple", name: "Couple Signup",           description: "Entry point for engaged couples to join Ananya.",    status: "not-started", icon: "◇" },
      { slug: "signup/vendor", href: "/signup/vendor", name: "Vendor Application",      description: "Approval-gated application for service providers.",   status: "not-started", icon: "◇" },
      { slug: "signup/seller", href: "/signup/seller", name: "Seller Signup",           description: "Approval-gated application for marketplace sellers.", status: "not-started", icon: "◇" },
    ],
  },
  {
    id: "couple",
    name: "Couple Portal",
    tagline: "The full wedding planning suite — every workspace in one place.",
    subdomain: "couple.ananya.com",
    basePath: "/app",
    userType: "Engaged couples and their planners",
    auth: "Email/password + Google OAuth",
    accent: "from-gold/30 to-champagne/40",
    icon: "♥",
    modules: [
      { slug: "",               href: "/app",               name: "Dashboard",              description: "Orientation, next moves, flags, event themes.",      status: "in-progress", icon: "◈" },
      { slug: "vendors",        href: "/app/vendors",       name: "Vendor Marketplace",     description: "Search, shortlist, and book vendors.",                status: "in-progress", icon: "◇" },
      { slug: "inquiries",      href: "/app/inquiries",     name: "Inquiries",              description: "Your vendor conversations, grouped by status.",       status: "in-progress", icon: "◇" },
      { slug: "guests",         href: "/app/guests",        name: "Guest Management",       description: "Guest list, RSVPs, seating, dietary notes.",         status: "in-progress", icon: "◇" },
      { slug: "transportation", href: "/app/transportation",name: "Transportation & Logistics", description: "Shuttles, routes, vehicle assignments.",         status: "not-started", icon: "◇" },
      { slug: "stationery",     href: "/app/stationery",    name: "Stationery & Invitations", description: "Suite builder, guest addressing, production.",    status: "in-progress", icon: "◇" },
      { slug: "hmua",           href: "/app/hmua",          name: "HMUA Workspace",         description: "Trials, bride looks, touch-up kits.",                 status: "not-started", icon: "◇" },
      { slug: "entertainment",  href: "/app/entertainment", name: "Entertainment Workspace", description: "Soundscapes, sangeet, equipment.",                   status: "in-progress", icon: "◇" },
      { slug: "catering",       href: "/app/catering",      name: "Catering & Dining",      description: "Menu builder, tastings, dietary needs.",              status: "in-progress", icon: "◇" },
      { slug: "decor",          href: "/app/decor",         name: "Decor Workspace",        description: "Spaces, floral plan, install timeline.",              status: "in-progress", icon: "◇" },
      { slug: "wardrobe",       href: "/app/wardrobe",      name: "Wardrobe & Outfits",     description: "Outfits, fittings, accessories.",                     status: "in-progress", icon: "◇" },
      { slug: "mehndi",         href: "/app/mehndi",        name: "Mehndi Workspace",       description: "Design collab, guest mehendi, aftercare.",            status: "in-progress", icon: "◇" },
      { slug: "cake-sweets",    href: "/app/cake-sweets",   name: "Cake & Sweets",          description: "Wedding cake design, mithai, dessert stations.",      status: "in-progress", icon: "◇" },
      { slug: "priest",         href: "/app/priest",        name: "Officiant Collaboration", description: "Script, family roles, samagri.",                     status: "in-progress", icon: "◇" },
      { slug: "budget",         href: "/app/budget",        name: "Budget Tracker",         description: "Envelopes, milestones, running totals.",              status: "in-progress", icon: "◇" },
      { slug: "timeline",       href: "/app/timeline",      name: "Timeline & Checklist",   description: "Unified day-of schedule across workspaces.",          status: "in-progress", icon: "◇" },
      { slug: "people",         href: "/app/people",        name: "People & Task Management", description: "Planners, family roles, shared tasks.",              status: "not-started", icon: "◇" },
      { slug: "guest-view",     href: "/app/guest-view",    name: "Guest Mobile Experience", description: "Shared links, no login for guests.",                 status: "not-started", icon: "◇" },
    ],
  },
  {
    id: "vendor",
    name: "Vendor Portal",
    tagline: "Service providers listed on Ananya — photographers, caterers, decorators, and more.",
    subdomain: "vendor.ananya.com",
    basePath: "/vendor",
    userType: "Photographers, decorators, caterers, DJs, MUAs, priests, venues",
    auth: "Email/password + Google OAuth · approval-gated",
    accent: "from-gold/40 to-champagne/50",
    icon: "✦",
    modules: [
      { slug: "",          href: "/vendor",           name: "Dashboard",                  description: "Overview of inquiries, bookings, and performance.",   status: "not-started", icon: "◈" },
      { slug: "profile",   href: "/vendor/profile",   name: "Profile Manager",            description: "Bio, portfolio, pricing tiers, languages, specialties.", status: "not-started", icon: "◇" },
      { slug: "portfolio", href: "/vendor/portfolio", name: "Portfolio & Past Weddings",  description: "Real wedding galleries with couple + vendor tags.",   status: "not-started", icon: "◇" },
      { slug: "inquiries", href: "/vendor/inquiries", name: "Inquiry Inbox",              description: "Couple inquiries, statuses, response threads.",        status: "not-started", icon: "◇" },
      { slug: "proposals", href: "/vendor/proposals", name: "Proposals & Contracts",      description: "Templates, e-signatures, signing status.",             status: "not-started", icon: "◇" },
      { slug: "invoicing", href: "/vendor/invoicing", name: "Invoicing & Payments",       description: "Milestones, payouts, refund requests.",                status: "not-started", icon: "◇" },
      { slug: "calendar",  href: "/vendor/calendar",  name: "Calendar & Availability",    description: "Block dates, Google Calendar sync.",                   status: "not-started", icon: "◇" },
      { slug: "reviews",   href: "/vendor/reviews",   name: "Reviews & Ratings",          description: "Respond to reviews, flag inappropriate ones.",         status: "not-started", icon: "◇" },
      { slug: "analytics", href: "/vendor/analytics", name: "Analytics Dashboard",        description: "Profile views, conversion, booking trends.",           status: "not-started", icon: "◇" },
      { slug: "team",      href: "/vendor/team",      name: "Team & Staff Access",        description: "Invite teammates, manage permissions.",                status: "not-started", icon: "◇" },
      { slug: "settings",  href: "/vendor/settings",  name: "Settings & Payouts",         description: "Notifications, payout, tax documents.",                status: "not-started", icon: "◇" },
    ],
  },
  {
    id: "seller",
    name: "Marketplace Seller",
    tagline: "Artisans and makers selling physical or digital products.",
    subdomain: "seller.ananya.com",
    basePath: "/seller",
    userType: "Stationery designers, jewelry makers, favor vendors, artisans",
    auth: "Email/password · approval-gated",
    accent: "from-champagne/70 to-gold/20",
    icon: "❖",
    modules: [
      { slug: "",          href: "/seller",           name: "Dashboard",               description: "Overview of orders, revenue, and listings.",         status: "not-started", icon: "◈" },
      { slug: "shop",      href: "/seller/shop",      name: "Shop Manager",            description: "Branding, about, shipping & return policies.",       status: "not-started", icon: "◇" },
      { slug: "products",  href: "/seller/products",  name: "Product Listings",        description: "Photos, variants, pricing, inventory, SKUs.",        status: "not-started", icon: "◇" },
      { slug: "orders",    href: "/seller/orders",    name: "Order Management",        description: "Fulfillment, labels, tracking.",                     status: "not-started", icon: "◇" },
      { slug: "payouts",   href: "/seller/payouts",   name: "Invoicing & Payouts",     description: "Transactions, commission, payout schedule.",         status: "not-started", icon: "◇" },
      { slug: "reviews",   href: "/seller/reviews",   name: "Product Reviews",         description: "Product reviews with response capability.",          status: "not-started", icon: "◇" },
      { slug: "analytics", href: "/seller/analytics", name: "Sales Analytics",         description: "Sales trends, top products, traffic sources.",       status: "not-started", icon: "◇" },
      { slug: "shipping",  href: "/seller/shipping",  name: "Shipping & Fulfillment",  description: "Labels, carriers, return workflow.",                 status: "not-started", icon: "◇" },
      { slug: "settings",  href: "/seller/settings",  name: "Settings & Tax Info",     description: "Payout, tax, team access.",                          status: "not-started", icon: "◇" },
    ],
  },
];

export const STATUS_COPY: Record<ModuleStatus, { label: string; dot: string; chip: string }> = {
  "not-started": {
    label: "Not started",
    dot: "bg-stone-300",
    chip: "bg-stone-100 text-stone-500 ring-1 ring-stone-200",
  },
  "in-progress": {
    label: "In progress",
    dot: "bg-[#D4AF37]",
    chip: "bg-[#F7E7CE] text-[#7a5a16] ring-1 ring-[#D4AF37]/40",
  },
  complete: {
    label: "Complete",
    dot: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  },
};

export function getPortal(id: string): Portal | undefined {
  return PORTALS.find((p) => p.id === id);
}

export function getModule(portalId: string, slug: string): PortalModule | undefined {
  return getPortal(portalId)?.modules.find((m) => m.slug === slug);
}
