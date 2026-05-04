"use client";

// ──────────────────────────────────────────────────────────────────────────
// Shared client hook for the three AI advisor surfaces.
//
// Behavior:
//  • If the user isn't signed in → set state to 'auth_required' so the card
//    can render the SaveAuthGate.
//  • If signed in → grab their JWT, POST to /api/tools/ai, hold the
//    response. Caches in component memory; the consumer can call refresh().
//  • Cycles loading copy between Marigold-voice phrases.
// ──────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from "react";

import { supabaseBrowser } from "@/lib/supabase/browser-client";
import { useAuthStore } from "@/stores/auth-store";
import {
  AI_LOADING_PHRASES,
  type AiAdvisorErrorResponse,
  type AiAdvisorRequest,
  type AiAdvisorResponse,
  type AiBudgetResponse,
  type AiDestinationResponse,
  type AiVendorResponse,
} from "@/types/ai-advisor";

export type AiAdvisorStatus =
  | "idle"
  | "auth_required"
  | "loading"
  | "ok"
  | "rate_limited"
  | "error";

type ResponseMap = {
  budget: AiBudgetResponse;
  destination: AiDestinationResponse;
  vendor: AiVendorResponse;
};

export interface UseAiAdvisorState<A extends AiAdvisorRequest["action"]> {
  status: AiAdvisorStatus;
  data: ResponseMap[A] | null;
  errorMessage: string;
  loadingPhrase: string;
  run: () => Promise<void>;
  reset: () => void;
}

export function useAiAdvisor<A extends AiAdvisorRequest["action"]>(
  buildRequest: () => AiAdvisorRequest & { action: A },
): UseAiAdvisorState<A> {
  const user = useAuthStore((s) => s.user);
  const [status, setStatus] = useState<AiAdvisorStatus>("idle");
  const [data, setData] = useState<ResponseMap[A] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loadingPhrase, setLoadingPhrase] = useState<string>(
    AI_LOADING_PHRASES[0],
  );
  const phraseTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cycle loading phrases while we're waiting on the API.
  useEffect(() => {
    if (status !== "loading") {
      if (phraseTimer.current) {
        clearInterval(phraseTimer.current);
        phraseTimer.current = null;
      }
      return;
    }
    let i = 0;
    setLoadingPhrase(AI_LOADING_PHRASES[0]);
    phraseTimer.current = setInterval(() => {
      i = (i + 1) % AI_LOADING_PHRASES.length;
      setLoadingPhrase(AI_LOADING_PHRASES[i]);
    }, 2200);
    return () => {
      if (phraseTimer.current) clearInterval(phraseTimer.current);
    };
  }, [status]);

  const run = useCallback(async () => {
    setErrorMessage("");

    if (!user) {
      setStatus("auth_required");
      return;
    }

    setStatus("loading");

    let token: string | null = null;
    try {
      const session = await supabaseBrowser.auth.getSession();
      token = session.data.session?.access_token ?? null;
    } catch {
      token = null;
    }

    if (!token) {
      // Local-dev fallback path: the auth store is hydrated but Supabase
      // hasn't issued a JWT (demo persona, etc). Treat as auth_required.
      setStatus("auth_required");
      return;
    }

    try {
      const res = await fetch("/api/tools/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(buildRequest()),
      });
      const json = (await res.json().catch(() => ({}))) as AiAdvisorResponse;
      if (!res.ok || json.ok === false) {
        const err = json as AiAdvisorErrorResponse;
        if (err.code === "rate_limited") {
          setStatus("rate_limited");
          setErrorMessage(err.error ?? "Rate limit reached.");
          return;
        }
        if (err.code === "auth_required") {
          setStatus("auth_required");
          return;
        }
        throw new Error(err.error ?? "Request failed.");
      }
      setData(json as ResponseMap[A]);
      setStatus("ok");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }, [user, buildRequest]);

  const reset = useCallback(() => {
    setStatus("idle");
    setData(null);
    setErrorMessage("");
  }, []);

  return { status, data, errorMessage, loadingPhrase, run, reset };
}
