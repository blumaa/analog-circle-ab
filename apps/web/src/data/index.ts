import type { DataSource } from "./dataSource";
import { createMockDataSource } from "./mock/mockDataSource";
import { createFirebaseDataSource } from "./firebase/firebaseDataSource";

/**
 * The single active backend. Controlled by VITE_BACKEND ("firebase" | "mock").
 * Defaults to the localStorage mock so the app runs with zero setup.
 */
export const dataSource: DataSource =
  import.meta.env.VITE_BACKEND === "firebase"
    ? createFirebaseDataSource()
    : createMockDataSource();

export * from "./types";
export type { DataSource } from "./dataSource";
