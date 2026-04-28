import type { ComponentType } from "react";
import type { LogoProps, LogoTemplate, LogoTemplateSlug } from "@/types/logo";
import { Lisbeth } from "./Lisbeth";
import { Elaine } from "./Elaine";
import { Gizelle } from "./Gizelle";
import { Murphey } from "./Murphey";
import { Chloe } from "./Chloe";
import { Rowan } from "./Rowan";
import { Rosa } from "./Rosa";
import { Janie } from "./Janie";
import { Royal } from "./Royal";

export { Lisbeth, Elaine, Gizelle, Murphey, Chloe, Rowan, Rosa, Janie, Royal };

export const LOGO_COMPONENTS: Record<LogoTemplateSlug, ComponentType<LogoProps>> = {
  lisbeth: Lisbeth,
  elaine: Elaine,
  gizelle: Gizelle,
  murphey: Murphey,
  chloe: Chloe,
  rowan: Rowan,
  rosa: Rosa,
  janie: Janie,
  royal: Royal,
};

// Seed templates. The canonical list lives in
// scripts/seed-logo-templates.mjs (which writes to the `logo_templates`
// table) — this array mirrors it so the UI works before Supabase is wired up.
export const LOGO_TEMPLATES: LogoTemplate[] = [
  {
    id: "lgo-lisbeth",
    slug: "lisbeth",
    name: "Lisbeth Logo",
    category: "script",
    componentKey: "lisbeth",
    defaultConnector: "and",
    compatibleConnectors: ["and", "&"],
    previewSvgStatic: "",
  },
  {
    id: "lgo-elaine",
    slug: "elaine",
    name: "Elaine Logo",
    category: "script",
    componentKey: "elaine",
    defaultConnector: "and",
    compatibleConnectors: ["and", "&"],
    previewSvgStatic: "",
  },
  {
    id: "lgo-gizelle",
    slug: "gizelle",
    name: "Gizelle Logo",
    category: "condensed",
    componentKey: "gizelle",
    defaultConnector: "&",
    compatibleConnectors: ["&", "and"],
    previewSvgStatic: "",
  },
  {
    id: "lgo-murphey",
    slug: "murphey",
    name: "Murphey Logo",
    category: "script",
    componentKey: "murphey",
    defaultConnector: "*",
    compatibleConnectors: ["*", "•", "and"],
    previewSvgStatic: "",
  },
  {
    id: "lgo-chloe",
    slug: "chloe",
    name: "Chloe Logo",
    category: "script",
    componentKey: "chloe",
    defaultConnector: "|",
    compatibleConnectors: ["|", "&", "and"],
    previewSvgStatic: "",
  },
  {
    id: "lgo-rowan",
    slug: "rowan",
    name: "Rowan Logo",
    category: "display",
    componentKey: "rowan",
    defaultConnector: "and",
    compatibleConnectors: ["and", "&"],
    previewSvgStatic: "",
  },
  {
    id: "lgo-rosa",
    slug: "rosa",
    name: "Rosa Logo",
    category: "tracked",
    componentKey: "rosa",
    defaultConnector: "and",
    compatibleConnectors: ["and", "&"],
    previewSvgStatic: "",
  },
  {
    id: "lgo-janie",
    slug: "janie",
    name: "Janie Logo",
    category: "editorial",
    componentKey: "janie",
    defaultConnector: "and",
    compatibleConnectors: ["and", "&"],
    previewSvgStatic: "",
  },
  {
    id: "lgo-royal",
    slug: "royal",
    name: "Royal Logo",
    category: "deco",
    componentKey: "royal",
    defaultConnector: "&",
    compatibleConnectors: ["&", "and"],
    previewSvgStatic: "",
  },
];
