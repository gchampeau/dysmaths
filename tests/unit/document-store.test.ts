import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  type PageIndex,
  type PageMeta,
  type DysmathsFile,
  PAGE_INDEX_KEY,
  loadPageIndex,
  savePageIndex,
  loadPageState,
  savePageState,
  createPage,
  deletePage,
  migrateFromLegacyStorage,
  exportPageToFile,
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

describe("document-store (pages)", () => {
  let mockStorage: Storage;

  beforeEach(() => {
    mockStorage = createMockLocalStorage();
    Object.defineProperty(window, "localStorage", { value: mockStorage, writable: true });
    vi.stubGlobal("crypto", { randomUUID: () => `test-uuid-${Math.random().toString(36).slice(2, 8)}` });
  });

  // -----------------------------------------------------------------------
  // loadPageIndex / savePageIndex
  // -----------------------------------------------------------------------

  describe("loadPageIndex", () => {
    it("returns empty index when nothing stored", () => {
      const index = loadPageIndex();
      expect(index.pages).toEqual([]);
      expect(index.activePageId).toBeNull();
      expect(index.version).toBe(1);
    });

    it("returns empty index when stored data is invalid", () => {
      mockStorage.setItem(PAGE_INDEX_KEY, "not json");
      const index = loadPageIndex();
      expect(index.pages).toEqual([]);
    });

    it("returns empty index when documents/pages is not an array", () => {
      mockStorage.setItem(PAGE_INDEX_KEY, JSON.stringify({ version: 1, documents: "bad" }));
      const index = loadPageIndex();
      expect(index.pages).toEqual([]);
    });

    it("loads a valid index (legacy documents format)", () => {
      const stored = {
        version: 1,
        activeDocumentId: "abc",
        documents: [{ id: "abc", name: "Test", createdAt: "2026-01-01", updatedAt: "2026-01-02" }]
      };
      mockStorage.setItem(PAGE_INDEX_KEY, JSON.stringify(stored));
      const index = loadPageIndex();
      expect(index.pages).toHaveLength(1);
      expect(index.pages[0].name).toBe("Test");
      expect(index.activePageId).toBe("abc");
    });

    it("filters out invalid page entries", () => {
      mockStorage.setItem(PAGE_INDEX_KEY, JSON.stringify({
        version: 1,
        activeDocumentId: null,
        documents: [
          { id: "ok", name: "Good", createdAt: "2026-01-01", updatedAt: "2026-01-02" },
          { id: 123, name: "Bad id" },
          { name: "No id" },
          null
        ]
      }));
      const index = loadPageIndex();
      expect(index.pages).toHaveLength(1);
      expect(index.pages[0].id).toBe("ok");
    });
  });

  describe("savePageIndex", () => {
    it("persists the index to localStorage", () => {
      const index: PageIndex = {
        version: 1,
        activePageId: "x",
        pages: [{ id: "x", name: "X", createdAt: "2026-01-01", updatedAt: "2026-01-02" }]
      };
      savePageIndex(index);
      const raw = mockStorage.getItem(PAGE_INDEX_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed.activePageId).toBe("x");
    });
  });

  // -----------------------------------------------------------------------
  // loadPageState / savePageState
  // -----------------------------------------------------------------------

  describe("loadPageState", () => {
    it("returns null when no state stored", () => {
      const result = loadPageState("nonexistent", "seyes", DEFAULT_LABELS);
      expect(result).toBeNull();
    });

    it("loads and validates stored state", () => {
      const state = makeState({ title: "Loaded" });
      mockStorage.setItem("dysmaths-doc-test1", JSON.stringify(state));
      const result = loadPageState("test1", "seyes", DEFAULT_LABELS);
      expect(result).not.toBeNull();
      expect(result!.title).toBe("Loaded");
    });

    it("returns null for invalid stored state", () => {
      mockStorage.setItem("dysmaths-doc-bad", JSON.stringify({ invalid: true }));
      const result = loadPageState("bad", "seyes", DEFAULT_LABELS);
      expect(result).toBeNull();
    });
  });

  describe("savePageState", () => {
    it("persists state and updates updatedAt in index", () => {
      const meta: PageMeta = { id: "d1", name: "Page 1", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" };
      savePageIndex({ version: 1, activePageId: "d1", pages: [meta] });

      const state = makeState({ title: "Updated" });
      savePageState("d1", state);

      const raw = mockStorage.getItem("dysmaths-doc-d1");
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw!).title).toBe("Updated");

      const index = loadPageIndex();
      expect(index.pages[0].updatedAt).not.toBe("2026-01-01T00:00:00Z");
    });
  });

  // -----------------------------------------------------------------------
  // createPage
  // -----------------------------------------------------------------------

  describe("createPage", () => {
    it("creates a page and adds it to the index", () => {
      const state = makeState({ title: "New Page" });
      const meta = createPage("New Page", state);

      expect(meta.name).toBe("New Page");
      expect(meta.id).toBeTruthy();

      const index = loadPageIndex();
      expect(index.pages).toHaveLength(1);
      expect(index.activePageId).toBe(meta.id);

      const stored = mockStorage.getItem(`dysmaths-doc-${meta.id}`);
      expect(stored).not.toBeNull();
    });

    it("defaults name to Untitled if empty", () => {
      const meta = createPage("", makeState());
      expect(meta.name).toBe("Untitled");
    });
  });

  // -----------------------------------------------------------------------
  // deletePage
  // -----------------------------------------------------------------------

  describe("deletePage", () => {
    it("deletes a page from the index and localStorage", () => {
      const meta1 = createPage("First", makeState());
      const meta2 = createPage("Second", makeState());

      deletePage(meta1.id);

      const index = loadPageIndex();
      expect(index.pages).toHaveLength(1);
      expect(index.pages[0].id).toBe(meta2.id);
      expect(mockStorage.getItem(`dysmaths-doc-${meta1.id}`)).toBeNull();
    });

    it("switches active page if deleted was active", () => {
      const meta1 = createPage("First", makeState());
      const meta2 = createPage("Second", makeState());

      // meta2 is active (last created)
      deletePage(meta2.id);

      const index = loadPageIndex();
      expect(index.activePageId).toBe(meta1.id);
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

      expect(index.pages).toHaveLength(1);
      expect(index.pages[0].name).toBe("Legacy Doc");
      expect(index.activePageId).toBe(index.pages[0].id);

      // Legacy key should be removed
      expect(mockStorage.getItem(STORAGE_KEY)).toBeNull();

      // New key should exist
      expect(mockStorage.getItem(`dysmaths-doc-${index.pages[0].id}`)).not.toBeNull();
    });

    it("returns empty index if no legacy data", () => {
      const index = migrateFromLegacyStorage("seyes", DEFAULT_LABELS);
      expect(index.pages).toHaveLength(0);
    });

    it("cleans up invalid legacy data and returns empty index", () => {
      mockStorage.setItem(STORAGE_KEY, "invalid json");
      const index = migrateFromLegacyStorage("seyes", DEFAULT_LABELS);
      expect(index.pages).toHaveLength(0);
      expect(mockStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // exportPageToFile
  // -----------------------------------------------------------------------

  describe("exportPageToFile", () => {
    it("calls saveAs with a .dysmaths file", async () => {
      const { saveAs } = await import("file-saver");
      const meta: PageMeta = { id: "e1", name: "Export Test", createdAt: "2026-01-01", updatedAt: "2026-01-02" };
      const state = makeState({ title: "Export Test" });

      exportPageToFile(meta, state);

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
