import {
  useContext,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  createContext,
  type ReactNode,
} from 'react';

// ----------------------------------------------------------------------

export type PageHeaderSearch = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: VoidFunction;
};

export type PageHeaderState = {
  title?: string;
  /** Content rendered inside the filters drawer (opened via filter icon). */
  filters?: ReactNode;
  /** Shows a badge on the filter icon when true. */
  filtersActive?: boolean;
  /** Optional reset action shown in the filters drawer header. */
  onResetFilters?: VoidFunction;
  actions?: ReactNode;
  search?: PageHeaderSearch | null;
};

type Listener = () => void;

function createPageHeaderStore() {
  let state: PageHeaderState = {};
  const listeners = new Set<Listener>();

  return {
    getSnapshot: () => state,
    subscribe: (listener: Listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setHeader: (next: PageHeaderState) => {
      state = next;
      listeners.forEach((listener) => listener());
    },
    clearHeader: () => {
      state = {};
      listeners.forEach((listener) => listener());
    },
  };
}

type PageHeaderStore = ReturnType<typeof createPageHeaderStore>;

const PageHeaderStoreContext = createContext<PageHeaderStore | null>(null);

// ----------------------------------------------------------------------

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const store = useMemo(() => createPageHeaderStore(), []);

  return (
    <PageHeaderStoreContext.Provider value={store}>{children}</PageHeaderStoreContext.Provider>
  );
}

function usePageHeaderStore() {
  const store = useContext(PageHeaderStoreContext);

  if (!store) {
    throw new Error('Page header hooks must be used within PageHeaderProvider');
  }

  return store;
}

/** Used by the dashboard Header to read current page chrome. */
export function usePageHeaderState() {
  const store = usePageHeaderStore();

  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

/**
 * Registers page chrome (title, actions, search) on the dashboard top bar.
 * Clears on unmount. Store updates only re-render Header subscribers.
 */
export function usePageHeader(state: PageHeaderState) {
  const store = usePageHeaderStore();

  useLayoutEffect(() => {
    store.setHeader(state);
  });

  // Clear in layout (not passive effect) so the next page can set the header
  // in the same commit before paint.
  useLayoutEffect(
    () => () => {
      store.clearHeader();
    },
    [store]
  );
}
