import type { ComponentType } from "react";
import type { MonogramProps, MonogramTemplate, MonogramTemplateSlug } from "@/types/monogram";
import { Rose } from "./Rose";
import { Malin } from "./Malin";
import { Acadia } from "./Acadia";
import { Gianna } from "./Gianna";
import { Cybil } from "./Cybil";
import { Chloe } from "./Chloe";

export { Rose, Malin, Acadia, Gianna, Cybil, Chloe };

export const MONOGRAM_COMPONENTS: Record<MonogramTemplateSlug, ComponentType<MonogramProps>> = {
  rose: Rose,
  malin: Malin,
  acadia: Acadia,
  gianna: Gianna,
  cybil: Cybil,
  chloe: Chloe,
};

// Seed templates. The canonical list lives in scripts/seed-monogram-templates.ts
// (which writes to the `monogram_templates` table) — this array mirrors it so
// the UI works before Supabase is wired up.
export const MONOGRAM_TEMPLATES: MonogramTemplate[] = [
  {
    id: "mgr-rose",
    slug: "rose",
    name: "Rose monogram",
    category: "classic",
    componentKey: "rose",
    previewSvgStatic: "",
  },
  {
    id: "mgr-malin",
    slug: "malin",
    name: "Malin monogram",
    category: "arched",
    componentKey: "malin",
    previewSvgStatic: "",
  },
  {
    id: "mgr-acadia",
    slug: "acadia",
    name: "Acadia monogram",
    category: "ampersand",
    componentKey: "acadia",
    previewSvgStatic: "",
  },
  {
    id: "mgr-gianna",
    slug: "gianna",
    name: "Gianna monogram",
    category: "editorial",
    componentKey: "gianna",
    previewSvgStatic: "",
  },
  {
    id: "mgr-cybil",
    slug: "cybil",
    name: "Cybil monogram",
    category: "framed",
    componentKey: "cybil",
    previewSvgStatic: "",
  },
  {
    id: "mgr-chloe",
    slug: "chloe",
    name: "Chloe monogram",
    category: "circular",
    componentKey: "chloe",
    previewSvgStatic: "",
  },
];
