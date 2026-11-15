"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, ChevronRight, Search } from "lucide-react";
import { errorMessage } from "@/lib/app/api";
import { companies } from "@/lib/app/services";
import type { Company } from "@/lib/app/types";
import { Modal, Notice, Spinner } from "../ui";

export function CompanyField({
  value,
  onChange,
  label = "Company",
}: {
  value: Company | null;
  onChange: (c: Company) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <span className="dash-label">{label}</span>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-auto min-h-11 w-full items-center gap-3 rounded-md border border-brand-hairline bg-white px-3 py-2 text-left text-sm transition-colors hover:bg-brand-canvas-soft/60 focus-visible:outline-2 focus-visible:outline-brand-primary"
      >
        <Building2 aria-hidden className="size-4 shrink-0 text-brand-ink-faint" />
        <span className="min-w-0 flex-1">
          {value ? (
            <>
              <span className="block truncate font-medium text-brand-ink">{value.name || "Your company"}</span>
              {(value.address || value.city) && (
                <span className="block truncate text-xs text-brand-ink-muted">
                  {[value.address, value.city].filter(Boolean).join(", ")}
                </span>
              )}
            </>
          ) : (
            <span className="text-brand-ink-faint">Choose a company</span>
          )}
        </span>
        <ChevronRight aria-hidden className="size-4 shrink-0 text-brand-ink-faint" />
      </button>
      {open && <CompanyPickerModal onClose={() => setOpen(false)} onSelect={(c) => { onChange(c); setOpen(false); }} />}
    </div>
  );
}

function CompanyPickerModal({ onClose, onSelect }: { onClose: () => void; onSelect: (c: Company) => void }) {
  const [list, setList] = useState<Company[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    companies
      .list()
      .then(setList)
      .catch((e) => setError(errorMessage(e, "We couldn't load companies.")));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!list) return [];
    if (!q) return list;
    return list.filter((c) => [c.name, c.address, c.city, c.state].some((v) => v?.toLowerCase().includes(q)));
  }, [list, query]);

  return (
    <Modal open onClose={onClose} title="Choose a company" size="md">
      <div className="relative mb-3">
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-brand-ink-faint" />
        <input
          className="dash-input pl-9"
          placeholder="Search by name or city"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search companies"
        />
      </div>
      {error ? (
        <Notice tone="danger">{error}</Notice>
      ) : !list ? (
        <div className="flex justify-center py-10">
          <Spinner className="text-brand-ink-faint" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-brand-ink-muted">No companies match your search.</p>
      ) : (
        <ul className="-mx-2 divide-y divide-brand-hairline">
          {filtered.map((c) => (
            <li key={c._id}>
              <button
                type="button"
                onClick={() => onSelect(c)}
                className="flex w-full items-center gap-3 rounded-md px-2 py-3 text-left hover:bg-brand-canvas-soft"
              >
                <Building2 aria-hidden className="size-4 shrink-0 text-brand-ink-faint" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{c.name}</span>
                  <span className="block truncate text-xs text-brand-ink-muted">
                    {[c.address, c.city, c.state].filter(Boolean).join(", ")}
                  </span>
                </span>
                <ChevronRight aria-hidden className="size-4 shrink-0 text-brand-ink-faint" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
