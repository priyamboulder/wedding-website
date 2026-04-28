"use client";

// ── Tab 3 — Menu & Setup ──────────────────────────────────────────────────
// Service style radios, a menu line-item table (label + source), bar radios,
// and a setup checklist. Keeps everything inline-editable so the couple can
// tweak the line items from the same surface they read.

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { useWelcomeEventsStore } from "@/stores/welcome-events-store";
import {
  BAR_OPTIONS,
  SERVICE_OPTIONS,
} from "@/lib/welcome-events-seed";
import {
  Checkbox,
  Field,
  IconButton,
  RadioRow,
  SectionIntro,
  SectionLabel,
  SectionTitle,
  Select,
  TextInput,
} from "../shared";
import type { BarStyle, ServiceStyle } from "@/types/welcome-events";

const SOURCE_OPTIONS = ["Caterer", "Hotel", "Self", "Friend", "TBD"];

const SETUP_ITEMS: {
  key:
    | "soundSystem"
    | "projector"
    | "garbaSticks"
    | "nameTags"
    | "photoDisplay"
    | "welcomeSignage";
  label: string;
}[] = [
  { key: "soundSystem", label: "Sound system for music / announcements" },
  { key: "projector", label: "Projector / screen for slideshow" },
  { key: "garbaSticks", label: "Garba / dandiya sticks (if applicable)" },
  { key: "nameTags", label: "Name tags (if both families are meeting)" },
  { key: "photoDisplay", label: "Photo display of couple's journey" },
  { key: "welcomeSignage", label: "Welcome signage" },
];

export function MenuSetupTab() {
  const serviceStyle = useWelcomeEventsStore((s) => s.serviceStyle);
  const setServiceStyle = useWelcomeEventsStore((s) => s.setServiceStyle);
  const menu = useWelcomeEventsStore((s) => s.menu);
  const addMenuItem = useWelcomeEventsStore((s) => s.addMenuItem);
  const updateMenuItem = useWelcomeEventsStore((s) => s.updateMenuItem);
  const removeMenuItem = useWelcomeEventsStore((s) => s.removeMenuItem);
  const bar = useWelcomeEventsStore((s) => s.bar);
  const setBar = useWelcomeEventsStore((s) => s.setBar);
  const setup = useWelcomeEventsStore((s) => s.setup);
  const toggleSetup = useWelcomeEventsStore((s) => s.toggleSetup);
  const addCustomSetup = useWelcomeEventsStore((s) => s.addCustomSetup);
  const removeCustomSetup = useWelcomeEventsStore((s) => s.removeCustomSetup);

  const [newItem, setNewItem] = useState("");
  const [newItemSource, setNewItemSource] = useState(SOURCE_OPTIONS[0]);
  const [newSetup, setNewSetup] = useState("");

  function handleAddMenu() {
    if (!newItem.trim()) return;
    addMenuItem(newItem.trim(), newItemSource);
    setNewItem("");
  }

  function handleAddSetup() {
    if (!newSetup.trim()) return;
    addCustomSetup(newSetup.trim());
    setNewSetup("");
  }

  return (
    <div className="flex flex-col gap-14 py-10">
      <section>
        <SectionLabel>Menu & setup</SectionLabel>
        <SectionTitle>Food & drink</SectionTitle>
        <SectionIntro>
          What guests eat and drink — plus anything the venue needs set up
          before doors open.
        </SectionIntro>

        <div className="mt-8 grid max-w-2xl grid-cols-1 gap-4">
          <Field label="Service style">
            <RadioRow<ServiceStyle>
              value={serviceStyle}
              options={SERVICE_OPTIONS}
              onChange={setServiceStyle}
            />
          </Field>
        </div>
      </section>

      <section>
        <SectionLabel>Menu</SectionLabel>
        <p className="mt-1 max-w-xl text-[13px] text-ink-muted">
          Line items and who's providing each. Leave the source empty if it's
          not decided yet — you can circle back after you pick a caterer.
        </p>

        <div className="mt-5 overflow-hidden rounded-lg border border-ink/10">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-ink/10 bg-ivory-warm/60 text-left">
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                  Item
                </th>
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                  Source
                </th>
                <th className="w-8 px-2" />
              </tr>
            </thead>
            <tbody>
              {menu.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-ink/5 last:border-b-0"
                >
                  <td className="px-3 py-2">
                    <input
                      value={m.label}
                      onChange={(e) =>
                        updateMenuItem(m.id, { label: e.target.value })
                      }
                      className="w-full bg-transparent text-ink focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={m.source}
                      onChange={(e) =>
                        updateMenuItem(m.id, { source: e.target.value })
                      }
                      className="w-full bg-transparent text-ink-soft focus:outline-none"
                    >
                      {SOURCE_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                      {SOURCE_OPTIONS.includes(m.source) ? null : (
                        <option value={m.source}>{m.source}</option>
                      )}
                    </select>
                  </td>
                  <td className="px-2 py-2 text-right">
                    <IconButton
                      onClick={() => removeMenuItem(m.id)}
                      ariaLabel={`Remove ${m.label}`}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </td>
                </tr>
              ))}
              {menu.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 py-8 text-center text-[13px] italic text-ink-muted"
                  >
                    No menu items yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <Field label="Item" className="min-w-[220px] flex-1">
            <TextInput
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Paneer tikka"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddMenu();
              }}
            />
          </Field>
          <Field label="Source" className="min-w-[150px]">
            <Select
              value={newItemSource}
              onChange={(e) => setNewItemSource(e.target.value)}
            >
              {SOURCE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <button
            type="button"
            onClick={handleAddMenu}
            className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-2 text-[13px] text-ivory transition-colors hover:bg-ink-soft"
          >
            <Plus size={14} strokeWidth={1.8} />
            Add item
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div>
          <SectionLabel>Bar</SectionLabel>
          <p className="mt-1 text-[13px] text-ink-muted">
            Decide how drinks are handled — this is the question most guests
            will ask.
          </p>
          <div className="mt-4">
            <RadioRow<BarStyle>
              value={bar}
              options={BAR_OPTIONS}
              onChange={setBar}
            />
          </div>
        </div>

        <div>
          <SectionLabel>Setup needs</SectionLabel>
          <p className="mt-1 text-[13px] text-ink-muted">
            Anything the venue or coordinator needs to arrange on your behalf.
          </p>
          <div className="mt-4 flex flex-col gap-2.5">
            {SETUP_ITEMS.map((item) => (
              <Checkbox
                key={item.key}
                checked={setup[item.key]}
                onChange={() => toggleSetup(item.key)}
                label={item.label}
              />
            ))}
            {setup.custom.map((c, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-md border border-gold/30 bg-gold-pale/30 px-3 py-1.5 text-[13px] text-ink"
              >
                <span>{c}</span>
                <IconButton
                  onClick={() => removeCustomSetup(idx)}
                  ariaLabel={`Remove ${c}`}
                >
                  <X size={14} />
                </IconButton>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <TextInput
              value={newSetup}
              onChange={(e) => setNewSetup(e.target.value)}
              placeholder="Add a setup need"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddSetup();
              }}
            />
            <button
              type="button"
              onClick={handleAddSetup}
              className="inline-flex items-center gap-1.5 rounded-md border border-ink/10 bg-white px-3 py-2 text-[13px] text-ink-soft transition-colors hover:border-ink/20 hover:text-ink"
            >
              <Plus size={14} strokeWidth={1.8} />
              Add
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
