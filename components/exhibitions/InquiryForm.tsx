"use client";

import { useState } from "react";
import { Check, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useExhibitionsStore } from "@/stores/exhibitions-store";
import type { ContactPreference } from "@/types/exhibition";

const PREFS: { value: ContactPreference; label: string }[] = [
  { value: "in_app", label: "In-app" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "phone", label: "Phone" },
];

export function InquiryForm({
  exhibitionId,
  exhibitorId,
  itemId,
  defaultMessage,
  boothName,
}: {
  exhibitionId: string;
  exhibitorId: string;
  itemId?: string;
  defaultMessage?: string;
  boothName: string;
}) {
  const sendInquiry = useExhibitionsStore((s) => s.sendInquiry);

  const [message, setMessage] = useState(defaultMessage ?? "");
  const [pref, setPref] = useState<ContactPreference>("in_app");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendInquiry({
      exhibition_id: exhibitionId,
      exhibitor_id: exhibitorId,
      item_id: itemId,
      message: message.trim(),
      contact_preference: pref,
    });
    setSent(true);
    setMessage("");
  };

  if (sent) {
    return (
      <div className="rounded-lg border border-sage/30 bg-sage-pale/30 p-5 text-center">
        <Check size={18} strokeWidth={1.8} className="mx-auto text-sage" />
        <p className="mt-2 font-serif text-[16px] text-ink">
          Your inquiry has been sent to {boothName}.
        </p>
        <p className="mt-1 text-[12.5px] text-ink-muted">
          They typically reply within 24 hours during exhibitions.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted hover:text-ink"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-gold/20 bg-white p-5">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        placeholder={
          itemId
            ? "I'd love to know more about this piece — is it available in other colors? Can I book a virtual appointment?"
            : "Interested in something from this booth? Tell them what you're looking for."
        }
        className="w-full resize-none rounded-md border border-gold/15 bg-ivory/50 px-3 py-2.5 font-sans text-[13px] leading-snug text-ink placeholder:text-ink-faint focus:border-gold/40 focus:outline-none focus:ring-0"
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p
            className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Preferred contact
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {PREFS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPref(p.value)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] transition-colors",
                  pref === p.value
                    ? "border-ink bg-ink text-ivory"
                    : "border-gold/20 bg-white text-ink-muted hover:border-gold/40 hover:text-ink",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!message.trim()}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors",
            message.trim()
              ? "bg-ink text-ivory hover:bg-gold hover:text-ivory"
              : "bg-ivory-warm text-ink-faint",
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Send size={11} strokeWidth={1.8} />
          Send Inquiry
        </button>
      </div>
    </form>
  );
}
