import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Toast, type ToastVariant } from "./Toast";
import styles from "./ToastProvider.module.css";

const AUTO_DISMISS_MS = 4000;
const MAX_VISIBLE = 4;

interface ToastEntry {
  id: number;
  variant: ToastVariant;
  message: string;
}

export interface ToastContextValue {
  /** Push a success toast. */
  success: (message: string) => void;
  /** Push an error toast. */
  error: (message: string) => void;
  /** Push an info toast. */
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Provides toast context and renders a fixed top-right stack into a portal.
 * Each toast auto-dismisses after ~4s; the visible stack is capped. The stack
 * wraps a polite live region so screen readers announce queued toasts.
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const nextId = useRef(0);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (variant: ToastVariant, message: string) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, variant, message }].slice(-MAX_VISIBLE));
      const timer = setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => clearTimeout(timer));
      pending.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
      info: (message) => push("info", message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <div className={styles.stack} aria-live="polite" data-testid="toast-stack">
            {toasts.map((t) => (
              <Toast
                key={t.id}
                variant={t.variant}
                message={t.message}
                onDismiss={() => dismiss(t.id)}
              />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

/** Access the toast API. Must be called within a {@link ToastProvider}. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
