import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  type DocumentIndex,
  type DocumentMeta,
  type DysmathsFile,
  DOCUMENT_INDEX_KEY,
  loadDocumentIndex,
  saveDocumentIndex,
  loadDocumentState,
  saveDocumentState,
  createDocument,
  renameDocument,
  deleteDocument,
  duplicateDocument,
  migrateFromLegacyStorage,
  exportDocumentToFile,
  parseImportedFile
} from "@/components/math-workbook/document-store";
import {
  STORAGE_KEY,
  WRITER_STATE_SCHEMA_VERSION,
  createDefaultState,
  type WriterState
} from "@/components/math-workbook/shared";

// ---------------------------------------------------------------------------
// Mock file-saver
// ---------------------------------------------------------------------------

vi.mock("file-saver", () => ({
  saveAs: vi.fn()
}));

// ---------------------------------------------------------------------------
// Mock localStorage
// ---------------------------------------------------------------------------

function createMockLocalStorage(): Storage {
  const store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { for (const key of Object.keys(store)) delete store[key]; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] ?? null
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_LABELS = {
  title: "Test document",
  fullName: "Full name:",
  className: "Class:",
  date: "Date:"
};

function makeState(overrides?: Partial<WriterState>): WriterState {
  return { ...createDefaultState("seyes", DEFAULT_LABELS), ...overrides };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("document-store", () => {
  let mockStorage: Storage;

  beforeEach(() => {
    mockStorage = createMockLocalStorage();
    Object.defineProperty(window, "localStorage", { value: mockStorage, writable: true });
    vi.stubGlobal("crypto", { randomUUID: () => `test-uuid-${Math.random().toString(36).slice(2, 8)}` });
  });

  // -----------------------------------------------------------------------
  // loadDocumentIndex / saveDocumentIndex
  // -----------------------------------------------------------------------

  describe("loadDocumentIndex", () => {
    it("returns empty index when nothing stored", () => {
      const index = loadDocumentIndex();
      expect(index.documents).toEqual([]);
      expect(index.activeDocumentId).toBeNull();
      expect(index.version).toBe(1);
    });

    it("returns empty index when stored data is invalid", () => {
      mockStorage.setItem(DOCUMENT_INDEX_KEY, "not json");
      const index = loadDocumentIndex();
      expect(index.documents).toEqual([]);
    });

    it("returns empty index when documents is not an array", () => {
      mockStorage.setItem(DOCUMENT_INDEX_KEY, JSON.stringify({ version: 1, documents: "bad" }));
      const index = loadDocumentIndex();
      expect(index.documents).toEqual([]);
    });

    it("loads a valid index", () => {
      const stored: DocumentIndex = {
        version: 1,
        activeDocumentId: "abc",
        documents: [{ id: "abc", name: "Test", createdAt: "2026-01-01", updatedAt: "2026-01-02" }]
      };
      mockStorage.setItem(DOCUMENT_INDEX_KEY, JSON.stringify(stored));
      const index = loadDocumentIndex();
      expect(index.documents).toHaveLength(1);
      expect(index.documents[0].name).toBe("Test");
      expect(index.activeDocumentId).toBe("abc");
    });

    it("filters out invalid document entries", () => {
      mockStorage.setItem(DOCUMENT_INDEX_KEY, JSON.stringify({
        version: 1,
        activeDocumentId: null,
        documents: [
          { id: "ok", name: "Good", createdAt: "2026-01-01", updatedAt: "2026-01-02" },
          { id: 123, name: "Bad id" },
          { name: "No id" },
          null
        ]
      }));
      const index = loadDocumentIndex();
      expect(index.documents).toHaveLength(1);
      expect(index.documents[0].id).toBe("ok");
    });
  });

  describe("saveDocumentIndex", () => {
    it("persists the index to localStorage", () => {
      const index: DocumentIndex = {
        version: 1,
        activeDocumentId: "x",
        documents: [{ id: "x", name: "X", createdAt: "2026-01-01", updatedAt: "2026-01-02" }]
      };
      saveDocumentIndex(index);
      const raw = mockStorage.getItem(DOCUMENT_INDEX_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed.activeDocumentId).toBe("x");
    });
  });

  // -----------------------------------------------------------------------
  // loadDocumentState / saveDocumentState
  // -----------------------------------------------------------------------

  describe("loadDocumentState", () => {
    it("returns null when no state stored", () => {
      const result = loadDocumentState("nonexistent", "seyes", DEFAULT_LABELS);
      expect(result).toBeNull();
    });

    it("loads and validates stored state", () => {
      const state = makeState({ title: "Loaded" });
      mockStorage.setItem("dysmaths-doc-test1", JSON.stringify(state));
      const result = loadDocumentState("test1", "seyes", DEFAULT_LABELS);
      expect(result).not.toBeNull();
      expect(result!.title).toBe("Loaded");
    });

    it("returns null for invalid stored state", () => {
      mockStorage.setItem("dysmaths-doc-bad", JSON.stringify({ invalid: true }));
      const result = loadDocumentState("bad", "seyes", DEFAULT_LABELS);
      expect(result).toBeNull();
    });
  });

  describe("saveDocumentState", () => {
    it("persists state and updates updatedAt in index", () => {
      const meta: DocumentMeta = { id: "d1", name: "Doc 1", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" };
      saveDocumentIndex({ version: 1, activeDocumentId: "d1", documents: [meta] });

      const state = makeState({ title: "Updated" });
      saveDocumentState("d1", state);

      const raw = mockStorage.getItem("dysmaths-doc-d1");
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw!).title).toBe("Updated");

      const index = loadDocumentIndex();
      expect(index.documents[0].updatedAt).not.toBe("2026-01-01T00:00:00Z");
    });
  });

  // -----------------------------------------------------------------------
  // createDocument
  // -----------------------------------------------------------------------

  describe("createDocument", () => {
    it("creates a document and adds it to the index", () => {
      const state = makeState({ title: "New Doc" });
      const meta = createDocument("New Doc", state);

      expect(meta.name).toBe("New Doc");
      expect(meta.id).toBeTruthy();

      const index = loadDocumentIndex();
      expect(index.documents).toHaveLength(1);
      expect(index.activeDocumentId).toBe(meta.id);

      const stored = mockStorage.getItem(`dysmaths-doc-${meta.id}`);
      expect(stored).not.toBeNull();
    });

    it("defaults name to Untitled if empty", () => {
      const meta = createDocument("", makeState());
      expect(meta.name).toBe("Untitled");
    });
  });

  // -----------------------------------------------------------------------
  // renameDocument
  // -----------------------------------------------------------------------

  describe("renameDocument", () => {
    it("renames a document in the index", () => {
      const meta = createDocument("Original", makeState());
      renameDocument(meta.id, "Renamed");

      const index = loadDocumentIndex();
      expect(index.documents[0].name).toBe("Renamed");
    });

    it("does nothing for non-existent docId", () => {
      createDocument("A", makeState());
      renameDocument("nonexistent", "Renamed");
      const index = loadDocumentIndex();
      expect(index.documents[0].name).toBe("A");
    });
  });

  // -----------------------------------------------------------------------
  // deleteDocument
  // -----------------------------------------------------------------------

  describe("deleteDocument", () => {
    it("deletes a document from the index and localStorage", () => {
      const meta1 = createDocument("First", makeState());
      const meta2 = createDocument("Second", makeState());

      deleteDocument(meta1.id);

      const index = loadDocumentIndex();
      expect(index.documents).toHaveLength(1);
      expect(index.documents[0].id).toBe(meta2.id);
      expect(mockStorage.getItem(`dysmaths-doc-${meta1.id}`)).toBeNull();
    });

    it("switches active document if deleted was active", () => {
      const meta1 = createDocument("First", makeState());
      const meta2 = createDocument("Second", makeState());

      // meta2 is active (last created)
      deleteDocument(meta2.id);

      const index = loadDocumentIndex();
      expect(index.activeDocumentId).toBe(meta1.id);
    });
  });

  // -----------------------------------------------------------------------
  // duplicateDocument
  // -----------------------------------------------------------------------

  describe("duplicateDocument", () => {
    it("duplicates a document with a new name", () => {
      const state = makeState({ title: "Original" });
      const meta = createDocument("Original", state);

      const dup = duplicateDocument(meta.id, "Original (copy)", "seyes", DEFAULT_LABELS);

      expect(dup).not.toBeNull();
      expect(dup!.name).toBe("Original (copy)");

      const index = loadDocumentIndex();
      expect(index.documents).toHaveLength(2);
    });

    it("returns null for non-existent docId", () => {
      const result = duplicateDocument("nonexistent", "Copy", "seyes", DEFAULT_LABELS);
      expect(result).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // migrateFromLegacyStorage
  // -----------------------------------------------------------------------

  describe("migrateFromLegacyStorage", () => {
    it("migrates the legacy single-document key", () => {
      const state = makeState({ title: "Legacy Doc" });
      mockStorage.setItem(STORAGE_KEY, JSON.stringify(state));

      const index = migrateFromLegacyStorage("seyes", DEFAULT_LABELS);

      expect(index.documents).toHaveLength(1);
      expect(index.documents[0].name).toBe("Legacy Doc");
      expect(index.activeDocumentId).toBe(index.documents[0].id);

      // Legacy key should be removed
      expect(mockStorage.getItem(STORAGE_KEY)).toBeNull();

      // New key should exist
      expect(mockStorage.getItem(`dysmaths-doc-${index.documents[0].id}`)).not.toBeNull();
    });

    it("returns empty index if no legacy data", () => {
      const index = migrateFromLegacyStorage("seyes", DEFAULT_LABELS);
      expect(index.documents).toHaveLength(0);
    });

    it("cleans up invalid legacy data and returns empty index", () => {
      mockStorage.setItem(STORAGE_KEY, "invalid json");
      const index = migrateFromLegacyStorage("seyes", DEFAULT_LABELS);
      expect(index.documents).toHaveLength(0);
      expect(mockStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // exportDocumentToFile
  // -----------------------------------------------------------------------

  describe("exportDocumentToFile", () => {
    it("calls saveAs with a .dysmaths file", async () => {
      const { saveAs } = await import("file-saver");
      const meta: DocumentMeta = { id: "e1", name: "Export Test", createdAt: "2026-01-01", updatedAt: "2026-01-02" };
      const state = makeState({ title: "Export Test" });

      exportDocumentToFile(meta, state);

      expect(saveAs).toHaveBeenCalledTimes(1);
      const [blob, fileName] = (saveAs as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(blob).toBeInstanceOf(Blob);
      expect(fileName).toBe("Export-Test.dysmaths");
    });
  });

  // -----------------------------------------------------------------------
  // parseImportedFile
  // -----------------------------------------------------------------------

  describe("parseImportedFile", () => {
    it("parses a valid .dysmaths file", () => {
      const state = makeState({ title: "Imported" });
      const file: DysmathsFile = {
        format: "dysmaths",
        version: 1,
        schemaVersion: WRITER_STATE_SCHEMA_VERSION,
        exportedAt: "2026-01-01",
        name: "Imported Doc",
        state
      };

      const result = parseImportedFile(JSON.stringify(file), "seyes", DEFAULT_LABELS);
      expect(result).not.toBeNull();
      expect(result!.name).toBe("Imported Doc");
      expect(result!.state.title).toBe("Imported");
    });

    it("parses a raw WriterState JSON (fallback)", () => {
      const state = makeState({ title: "Raw Import" });
      const result = parseImportedFile(JSON.stringify(state), "seyes", DEFAULT_LABELS);
      expect(result).not.toBeNull();
      expect(result!.name).toBe("Raw Import");
    });

    it("returns null for invalid JSON", () => {
      const result = parseImportedFile("not json at all", "seyes", DEFAULT_LABELS);
      expect(result).toBeNull();
    });

    it("returns null for valid JSON but invalid state", () => {
      const result = parseImportedFile(JSON.stringify({ foo: "bar" }), "seyes", DEFAULT_LABELS);
      expect(result).toBeNull();
    });

    it("returns null for .dysmaths file with invalid inner state", () => {
      const file = {
        format: "dysmaths",
        version: 1,
        schemaVersion: 2,
        exportedAt: "2026-01-01",
        name: "Bad State",
        state: { invalid: true }
      };
      const result = parseImportedFile(JSON.stringify(file), "seyes", DEFAULT_LABELS);
      expect(result).toBeNull();
    });
  });
});
