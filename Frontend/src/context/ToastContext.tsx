import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ApiError } from "@/api/http";

interface ToastItem {
  id: number;
  text: string;
  variant: "info" | "error";
}

interface ToastContextValue {
  notify: (text: string) => void;
  notifyError: (err: unknown, fallback?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function messageOf(err: unknown, fallback = "出错了，请稍后再试"): string {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const push = useCallback((text: string, variant: "info" | "error") => {
    const id = ++idRef.current;
    setItems((prev) => [...prev, { id, text, variant }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const notify = useCallback((text: string) => push(text, "info"), [push]);
  const notifyError = useCallback(
    (err: unknown, fallback?: string) => push(messageOf(err, fallback), "error"),
    [push],
  );

  const value = useMemo(() => ({ notify, notifyError }), [notify, notifyError]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast${t.variant === "error" ? " error" : ""}`}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast 必须在 ToastProvider 内使用");
  return ctx;
}
