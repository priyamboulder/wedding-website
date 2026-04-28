// lib/supabase/auth-helpers.ts
// Server-side auth helpers for API routes.
// Use these instead of reading auth state from the client directly.

import { NextRequest } from "next/server";
import { supabase } from "./client";

export interface AuthUser {
  id: string;
  email: string;
  role: "couple" | "vendor" | "admin";
  name: string;
}

/**
 * Extract and verify the JWT from an incoming API request.
 * Returns null if no valid token is present.
 *
 * Checks (in order):
 *  1. Authorization: Bearer <token> header
 *  2. x-couple-id header (legacy — for stores that send couple_id directly)
 */
export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "").trim();

    if (!token) return null;

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;

    const meta = user.user_metadata ?? {};
    return {
      id: user.id,
      email: user.email ?? "",
      role: (meta.role as AuthUser["role"]) ?? "couple",
      name: (meta.name as string) ?? (meta.full_name as string) ?? "",
    };
  } catch {
    return null;
  }
}

/**
 * Same as getAuthUser but returns a 401 response if not authenticated.
 * Use with: const { user, response } = await requireAuth(req);
 *           if (response) return response;
 */
export async function requireAuth(req: NextRequest): Promise<
  { user: AuthUser; response: null } | { user: null; response: Response }
> {
  const user = await getAuthUser(req);
  if (!user) {
    return {
      user: null,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }
  return { user, response: null };
}

/**
 * Check if the authenticated user has a specific role.
 */
export function hasRole(user: AuthUser, role: AuthUser["role"]): boolean {
  return user.role === role;
}

/**
 * Get couple ID from the authenticated user.
 * For couple accounts this is their auth user ID.
 */
export function getCoupleId(user: AuthUser): string {
  return user.id;
}
