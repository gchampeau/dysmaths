import { saveAs } from "file-saver";
import {
  type DefaultDocumentLabels,
  type SheetStyle,
  type WriterState,
  STORAGE_KEY,
  WRITER_STATE_SCHEMA_VERSION,
  cloneWriterState,
  parseStoredState,
  safeFileName
} from "./shared";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DocumentMeta = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type DocumentIndex = {
  version: number;
  activeDocumentId: string | null;
  documents: DocumentMeta[];
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

export const DOCUMENT_INDEX_KEY = "dysmaths-documents-v1";
const DOCUMENT_KEY_PREFIX = "dysmaths-doc-";
const DOCUMENT_INDEX_VERSION = 1;
const DYSMATHS_FILE_VERSION = 1;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDocumentStorageKey(docId: string): string {
  return `${DOCUMENT_KEY_PREFIX}${docId}`;
}

function createEmptyIndex(): DocumentIndex {
  return { version: DOCUMENT_INDEX_VERSION, activeDocumentId: null, documents: [] };
}

function nowIso(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Index operations
// ---------------------------------------------------------------------------

export function loadDocumentIndex(): DocumentIndex {
  try {
    const raw = window.localStorage.getItem(DOCUMENT_INDEX_KEY);

    if (!raw) {
      return createEmptyIndex();
    }

    const parsed = JSON.parse(raw) as DocumentIndex;

    if (!parsed || !Array.isArray(parsed.documents)) {
      return createEmptyIndex();
    }

    return {
      version: DOCUMENT_INDEX_VERSION,
      activeDocumentId: typeof parsed.activeDocumentId === "string" ? parsed.activeDocumentId : null,
      documents: parsed.documents.filter(
        (d) =>
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

export function saveDocumentIndex(index: DocumentIndex): void {
  window.localStorage.setItem(DOCUMENT_INDEX_KEY, JSON.stringify(index));
}

// ---------------------------------------------------------------------------
// Document state operations
// ---------------------------------------------------------------------------

export function loadDocumentState(
  docId: string,
  fallbackSheetStyle: SheetStyle,
  labels: DefaultDocumentLabels
): WriterState | null {
  const raw = window.localStorage.getItem(getDocumentStorageKey(docId));

  if (!raw) {
    return null;
  }

  return parseStoredState(raw, fallbackSheetStyle, labels);
}

export function saveDocumentState(docId: string, state: WriterState): void {
  window.localStorage.setItem(getDocumentStorageKey(docId), JSON.stringify(state));

  // Update the updatedAt timestamp in the index
  const index = loadDocumentIndex();
  const entry = index.documents.find((d) => d.id === docId);

  if (entry) {
    entry.updatedAt = nowIso();
    saveDocumentIndex(index);
  }
}

// ---------------------------------------------------------------------------
// CRUD operations
// ---------------------------------------------------------------------------

export function createDocument(name: string, state: WriterState): DocumentMeta {
  const now = nowIso();
  const meta: DocumentMeta = {
    id: crypto.randomUUID(),
    name: name || "Untitled",
    createdAt: now,
    updatedAt: now
  };

  const index = loadDocumentIndex();
  index.documents.push(meta);
  index.activeDocumentId = meta.id;
  saveDocumentIndex(index);
  window.localStorage.setItem(getDocumentStorageKey(meta.id), JSON.stringify(state));

  return meta;
}

export function renameDocument(docId: string, name: string): void {
  const index = loadDocumentIndex();
  const entry = index.documents.find((d) => d.id === docId);

  if (entry) {
    entry.name = name;
    entry.updatedAt = nowIso();
    saveDocumentIndex(index);
  }
}

export function deleteDocument(docId: string): void {
  const index = loadDocumentIndex();
  index.documents = index.documents.filter((d) => d.id !== docId);

  if (index.activeDocumentId === docId) {
    index.activeDocumentId = index.documents[0]?.id ?? null;
  }

  saveDocumentIndex(index);
  window.localStorage.removeItem(getDocumentStorageKey(docId));
}

export function duplicateDocument(
  docId: string,
  newName: string,
  fallbackSheetStyle: SheetStyle,
  labels: DefaultDocumentLabels
): DocumentMeta | null {
  const state = loadDocumentState(docId, fallbackSheetStyle, labels);

  if (!state) {
    return null;
  }

  const cloned = cloneWriterState(state);
  cloned.title = newName;

  return createDocument(newName, cloned);
}

// ---------------------------------------------------------------------------
// Migration from legacy single-document storage
// ---------------------------------------------------------------------------

export function migrateFromLegacyStorage(
  fallbackSheetStyle: SheetStyle,
  labels: DefaultDocumentLabels
): DocumentIndex {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return loadDocumentIndex();
  }

  const parsed = parseStoredState(raw, fallbackSheetStyle, labels);

  if (!parsed) {
    window.localStorage.removeItem(STORAGE_KEY);
    return loadDocumentIndex();
  }

  const meta = createDocument(parsed.title || labels.title, parsed);
  window.localStorage.removeItem(STORAGE_KEY);

  const index = loadDocumentIndex();
  index.activeDocumentId = meta.id;
  saveDocumentIndex(index);

  return index;
}

// ---------------------------------------------------------------------------
// File export / import
// ---------------------------------------------------------------------------

export function exportDocumentToFile(meta: DocumentMeta, state: WriterState): void {
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
