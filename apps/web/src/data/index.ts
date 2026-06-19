import type { DataSource } from "./dataSource";

type AsyncMethod = (...args: never[]) => Promise<unknown>;

/**
 * Wraps a deferred backend loader behind the {@link DataSource} seam.
 *
 * Every DataSource method is async, so the real backend can be dynamically
 * imported + initialised on first use, then delegated to. This keeps each
 * backend (and the Firebase SDK in particular) out of the main bundle — they
 * become code-split chunks loaded on demand. The loader runs at most once.
 *
 * Generic over any loader, so it stays reusable and the selection logic below
 * is the single source of truth for which backend is active.
 */
function createLazyDataSource(load: () => Promise<DataSource>): DataSource {
  let pending: Promise<DataSource> | null = null;
  const resolve = (): Promise<DataSource> => (pending ??= load());

  return new Proxy({} as DataSource, {
    get(_target, prop) {
      return (...args: unknown[]) =>
        resolve().then((ds) =>
          (ds[prop as keyof DataSource] as AsyncMethod)(...(args as never[])),
        );
    },
  });
}

/**
 * The single active backend. Controlled by VITE_BACKEND ("firebase" | "mock").
 * Defaults to the localStorage mock so the app runs with zero setup. Both
 * backends are lazily loaded, so neither ships in the main bundle.
 */
export const dataSource: DataSource =
  import.meta.env.VITE_BACKEND === "firebase"
    ? createLazyDataSource(() =>
        import("./firebase/firebaseDataSource").then((m) => m.createFirebaseDataSource()),
      )
    : createLazyDataSource(() =>
        import("./mock/mockDataSource").then((m) => m.createMockDataSource()),
      );

export * from "./types";
export type { DataSource } from "./dataSource";
