import { create } from "zustand";
import { toast } from "sonner";
import {
  type OpenApiDoc,
  type OperationInfo,
  groupOperationsByTag,
} from "../types/openapi";

const getDefaultUrl = () => `${window.location.origin}/openapi/v1.json`;

interface ApiExplorerState {
  // Swagger doc state
  doc: OpenApiDoc | null;
  loading: boolean;
  error: string | null;

  // UI state
  groups: string[];
  selectedGroup: string | null;
  selectedOperation: OperationInfo | null;
  contentHeight: number | null;

  // URL loading state
  swaggerUrl: string;
  isLoadingUrl: boolean;

  // Actions
  initializeDoc: () => void;
  replaceWithUrl: (url: string) => Promise<void>;
  resetToDefault: () => void;
  setSelectedGroup: (group: string | null) => void;
  setSelectedOperation: (operation: OperationInfo | null) => void;
  setContentHeight: (height: number | null) => void;
  setSwaggerUrl: (url: string) => void;
  updateGroups: () => void;
}

export const useApiExplorerStore = create<ApiExplorerState>((set, get) => ({
  // Initial state
  doc: null,
  loading: true,
  error: null,
  groups: [],
  selectedGroup: null,
  selectedOperation: null,
  contentHeight: null,
  swaggerUrl: "",
  isLoadingUrl: false,

  // Initialize doc from API
  initializeDoc: () => {
    get().replaceWithUrl(getDefaultUrl());
  },

  // Replace doc with one from URL
  replaceWithUrl: async (url: string) => {
    set({ isLoadingUrl: true, loading: true, error: null });
    const loadingToast = toast.loading("Loading swagger documentation...");

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch swagger doc: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // Validate that it's a valid OpenAPI doc structure
      if (!data || typeof data !== "object" || !data.paths) {
        throw new Error(
          "Invalid swagger JSON format: missing 'paths' property"
        );
      }

      set({ doc: data as OpenApiDoc, error: null });
      get().updateGroups();
      toast.success("Swagger documentation loaded successfully", {
        id: loadingToast,
        duration: 3000,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch swagger doc";
      set({ error: errorMessage });
      toast.error("Failed to load swagger doc", {
        description: errorMessage,
        id: loadingToast,
        duration: 5000,
      });
      // Keep the current doc on error, don't clear it
    } finally {
      set({ isLoadingUrl: false, loading: false });
    }
  },

  // Reset to default
  resetToDefault: () => {
    get().replaceWithUrl(getDefaultUrl());
  },

  // Update groups based on current doc
  updateGroups: () => {
    const { doc } = get();
    if (!doc) {
      set({ groups: [], selectedGroup: null, selectedOperation: null });
      return;
    }

    const byTag = groupOperationsByTag(doc);
    const sortedGroups = Array.from(byTag.keys()).sort();
    const firstGroup = sortedGroups[0] || null;

    set({
      groups: sortedGroups,
      selectedGroup: firstGroup,
      selectedOperation: null,
    });
  },

  // UI actions
  setSelectedGroup: (group: string | null) => {
    set({ selectedGroup: group, selectedOperation: null });
  },

  setSelectedOperation: (operation: OperationInfo | null) => {
    set({ selectedOperation: operation });
  },

  setContentHeight: (height: number | null) => {
    set({ contentHeight: height });
  },

  setSwaggerUrl: (url: string) => {
    set({ swaggerUrl: url });
  },
}));
