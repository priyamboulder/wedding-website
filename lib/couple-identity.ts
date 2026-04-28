"use client";

// ── Couple identity ────────────────────────────────────────────
// Derives the signed-in couple's display names + monogram initials
// from auth-store. Anywhere the UI renders "You & Partner" it should
// read through this helper instead of hardcoding names.

import { useMemo } from "react";
import { useAuthStore } from "@/stores/auth-store";
import {
  buildRoleLabel,
  buildWorkspaceRoles,
  type WorkspaceAuthorRole,
  type WorkspaceRoleProfile,
} from "@/types/workspace";

export type CoupleIdentity = {
  person1: string;
  person2: string;
  initials: string;
  fullNames: string;
};

const DEFAULT_PERSON1 = "You";
const DEFAULT_PERSON2 = "Partner";

function firstName(name?: string | null): string {
  if (!name) return "";
  return name.trim().split(/\s+/)[0] ?? "";
}

function initialOf(name: string): string {
  return name ? name.charAt(0).toUpperCase() : "";
}

export function deriveCoupleIdentity(
  userName?: string | null,
  partnerName?: string | null,
): CoupleIdentity {
  const person1 = firstName(userName) || DEFAULT_PERSON1;
  const person2 = firstName(partnerName) || DEFAULT_PERSON2;
  const initials =
    `${initialOf(person1)}${initialOf(person2)}` || "YP";
  return {
    person1,
    person2,
    initials,
    fullNames: `${person1} & ${person2}`,
  };
}

export function useCoupleIdentity(): CoupleIdentity {
  const userName = useAuthStore((s) => s.user?.name);
  const partnerName = useAuthStore((s) => s.user?.wedding?.partnerName);
  return deriveCoupleIdentity(userName, partnerName);
}

export function useWorkspaceRoles(): WorkspaceRoleProfile[] {
  const couple = useCoupleIdentity();
  return useMemo(
    () => buildWorkspaceRoles(couple.person1, couple.person2),
    [couple.person1, couple.person2],
  );
}

export function useRoleLabel(): Record<WorkspaceAuthorRole, string> {
  const couple = useCoupleIdentity();
  return useMemo(
    () => buildRoleLabel(couple.person1, couple.person2),
    [couple.person1, couple.person2],
  );
}
