import { saveAs } from "file-saver";
import {
  type DefaultDocumentLabels,
  type SheetStyle,
  type WriterState,
  STORAGE_KEY,
  WRITER_STATE_SCHEMA_VERSION,
  parseStoredState,
  safeFileName
} from "./shared";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PageMeta = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type PageIndex = {
  version: number;
  activePageId: string | null;
  pages: PageMeta[];
};

export type DysmathsFile = {
  format: "dysmaths";
  version: number;
  schemaVersion: number;
  exportedAt: string;
  name: string;
  state: WriterState;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Keep the legacy localStorage keys for backward compatibility with existing user data
export const PAGE_INDEX_KEY = "dysmaths-documents-v1";
const PAGE_KEY_PREFIX = "dysmaths-doc-";
const PAGE_INDEX_VERSION = 1;
const DYSMATHS_FILE_VERSION = 1;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getPageStorageKey(pageId: string): string {
  return `${PAGE_KEY_PREFIX}${pageId}`;
}

function createEmptyIndex(): PageIndex {
  return { version: PAGE_INDEX_VERSION, activePageId: null, pages: [] };
}

function nowIso(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Index operations
// ---------------------------------------------------------------------------

export function loadPageIndex(): PageIndex {
  try {
    const raw = window.localStorage.getItem(PAGE_INDEX_KEY);

    if (!raw) {
      return createEmptyIndex();
    }

    const parsed = JSON.parse(raw);

    if (!parsed || !Array.isArray(parsed.documents ?? parsed.pages)) {
      return createEmptyIndex();
    }

    const docs = parsed.documents ?? parsed.pages;
    const activeId = parsed.activeDocumentId ?? parsed.activePageId;

    return {
      version: PAGE_INDEX_VERSION,
      activePageId: typeof activeId === "string" ? activeId : null,
      pages: docs.filter(
        (d: Record<string, unknown>) =>
          d &&
          typeof d.id === "string" &&
          typeof d.name === "string" &&
          typeof d.createdAt === "string" &&
          typeof d.updatedAt === "string"
      )
    };
  } catch {
    return createEmptyIndex();
  }
}

export function savePageIndex(index: PageIndex): void {
  window.localStorage.setItem(PAGE_INDEX_KEY, JSON.stringify(index));
}

// ---------------------------------------------------------------------------
// Page state operations
// ---------------------------------------------------------------------------

export function loadPageState(
  pageId: string,
  fallbackSheetStyle: SheetStyle,
  labels: DefaultDocumentLabels
): WriterState | null {
  const raw = window.localStorage.getItem(getPageStorageKey(pageId));

  if (!raw) {
    return null;
  }

  return parseStoredState(raw, fallbackSheetStyle, labels);
}

export function savePageState(pageId: string, state: WriterState): void {
  window.localStorage.setItem(getPageStorageKey(pageId), JSON.stringify(state));

  const index = loadPageIndex();
  const entry = index.pages.find((d) => d.id === pageId);

  if (entry) {
    entry.updatedAt = nowIso();
    savePageIndex(index);
  }
}

// ---------------------------------------------------------------------------
// CRUD operations
// ---------------------------------------------------------------------------

export function createPage(name: string, state: WriterState): PageMeta {
  const now = nowIso();
  const meta: PageMeta = {
    id: crypto.randomUUID(),
    name: name || "Untitled",
    createdAt: now,
    updatedAt: now
  };

  const index = loadPageIndex();
  index.pages.push(meta);
  index.activePageId = meta.id;
  savePageIndex(index);
  window.localStorage.setItem(getPageStorageKey(meta.id), JSON.stringify(state));

  return meta;
}

export function deletePage(pageId: string): void {
  const index = loadPageIndex();
  index.pages = index.pages.filter((d) => d.id !== pageId);

  if (index.activePageId === pageId) {
    index.activePageId = index.pages[0]?.id ?? null;
  }

  savePageIndex(index);
  window.localStorage.removeItem(getPageStorageKey(pageId));
}

// ---------------------------------------------------------------------------
// Migration from legacy single-document storage
// ---------------------------------------------------------------------------

export function migrateFromLegacyStorage(
  fallbackSheetStyle: SheetStyle,
  labels: DefaultDocumentLabels
): PageIndex {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return loadPageIndex();
  }

  const parsed = parseStoredState(raw, fallbackSheetStyle, labels);

  if (!parsed) {
    window.localStorage.removeItem(STORAGE_KEY);
    return loadPageIndex();
  }

  const meta = createPage(parsed.title || labels.title, parsed);
  window.localStorage.removeItem(STORAGE_KEY);

  const index = loadPageIndex();
  index.activePageId = meta.id;
  savePageIndex(index);

  return index;
}

// ---------------------------------------------------------------------------
// File export / import
// ---------------------------------------------------------------------------

export function exportPageToFile(meta: PageMeta, state: WriterState): void {
  const file: DysmathsFile = {
    format: "dysmaths",
    version: DYSMATHS_FILE_VERSION,
    schemaVersion: WRITER_STATE_SCHEMA_VERSION,
    exportedAt: nowIso(),
    name: meta.name,
    state
  };

  const blob = new Blob([JSON.stringify(file, null, 2)], { type: "application/json" });
  const fileName = `${safeFileName(meta.name) || "dysmaths"}.dysmaths`;
  saveAs(blob, fileName);
}

export function parseImportedFile(
  raw: string,
  fallbackSheetStyle: SheetStyle,
  labels: DefaultDocumentLabels
): { name: string; state: WriterState } | null {
  try {
    const parsed = JSON.parse(raw) as DysmathsFile;

    // Accept both wrapped .dysmaths files and raw WriterState JSON
    if (parsed && parsed.format === "dysmaths" && parsed.state) {
      const state = parseStoredState(JSON.stringify(parsed.state), fallbackSheetStyle, labels);

      if (!state) {
        return null;
      }

      return { name: parsed.name || state.title || "Imported", state };
    }

    // Fallback: try parsing as raw WriterState
    const state = parseStoredState(raw, fallbackSheetStyle, labels);

    if (!state) {
      return null;
    }

    return { name: state.title || "Imported", state };
  } catch {
    return null;
  }
}
