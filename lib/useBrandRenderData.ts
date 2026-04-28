import { useMemo } from "react";
import type { MonogramProps } from "@/types/monogram";
import type { LogoConnector, LogoProps } from "@/types/logo";
import {
  useBrandOverridesStore,
  type BrandOverrides,
} from "@/stores/brand-overrides-store";

// Monogram resolves initials, names, date, location, and color.
export interface MonogramRenderData extends MonogramProps {
  overrides: BrandOverrides;
  editedFields: {
    initials: boolean;
    names: boolean;
    date: boolean;
    location: boolean;
    color: boolean;
  };
  hasAnyOverride: boolean;
}

// Logo resolves names, connector, and color. Typography is baked into each
// template by design, so it isn't part of this shape.
export interface LogoRenderData extends LogoProps {
  names: [string, string];
  connector: LogoConnector;
  color: string;
  overrides: BrandOverrides;
  editedFields: {
    names: boolean;
    connector: boolean;
    color: boolean;
  };
  hasAnyOverride: boolean;
}

export interface BrandProfile {
  initials: [string, string];
  names: [string, string];
  date: Date;
  location?: string;
  color?: string;
  // Surface-level default. Each logo template still carries its own
  // defaultConnector — this is only used when no template is selected
  // (e.g., Home preview) or as an absolute fallback.
  connector?: LogoConnector;
}

export function resolveMonogramRenderData(
  profile: BrandProfile,
  overrides: BrandOverrides,
): MonogramRenderData {
  const initials = overrides.initials ?? profile.initials;
  const names = overrides.names ?? profile.names;
  const date = overrides.date ? new Date(overrides.date) : profile.date;
  const location =
    overrides.location !== null ? overrides.location : profile.location;
  const color = overrides.color ?? profile.color;

  const editedFields = {
    initials: overrides.initials !== null,
    names: overrides.names !== null,
    date: overrides.date !== null,
    location: overrides.location !== null,
    color: overrides.color !== null,
  };

  const hasAnyOverride =
    editedFields.initials ||
    editedFields.names ||
    editedFields.date ||
    editedFields.location ||
    editedFields.color;

  return {
    initials,
    names,
    date,
    location,
    color,
    overrides,
    editedFields,
    hasAnyOverride,
  };
}

export function resolveLogoRenderData(
  profile: BrandProfile,
  overrides: BrandOverrides,
  templateDefaultConnector: LogoConnector = "and",
): LogoRenderData {
  const names = overrides.names ?? profile.names;
  const connector =
    overrides.connector ?? profile.connector ?? templateDefaultConnector;
  const color = overrides.color ?? profile.color ?? "#1a1a1a";

  const editedFields = {
    names: overrides.names !== null,
    connector: overrides.connector !== null,
    color: overrides.color !== null,
  };

  const hasAnyOverride =
    editedFields.names || editedFields.connector || editedFields.color;

  return {
    names,
    connector,
    color,
    overrides,
    editedFields,
    hasAnyOverride,
  };
}

export interface BrandRenderData {
  monogram: MonogramRenderData;
  logo: LogoRenderData;
}

export function useBrandRenderData(
  profile: BrandProfile,
  opts?: { logoTemplateDefaultConnector?: LogoConnector },
): BrandRenderData {
  const overrides = useBrandOverridesStore((s) => s.overrides);
  const defaultConnector = opts?.logoTemplateDefaultConnector;

  return useMemo(
    () => ({
      monogram: resolveMonogramRenderData(profile, overrides),
      logo: resolveLogoRenderData(profile, overrides, defaultConnector),
    }),
    [
      profile.initials[0],
      profile.initials[1],
      profile.names[0],
      profile.names[1],
      profile.date.getTime(),
      profile.location,
      profile.color,
      profile.connector,
      defaultConnector,
      overrides.initials?.[0],
      overrides.initials?.[1],
      overrides.names?.[0],
      overrides.names?.[1],
      overrides.date,
      overrides.location,
      overrides.color,
      overrides.connector,
    ],
  );
}

// Back-compat alias — historic callers in monogram/* and studio still expect
// the flat MonogramRenderData shape from this import.
export function useMonogramRenderData(profile: BrandProfile): MonogramRenderData {
  return useBrandRenderData(profile).monogram;
}
