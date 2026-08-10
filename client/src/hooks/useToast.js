import { useCallback, useRef, useState } from "react";

let idCounter = 0;

export default function useToast() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const showToast = useCallback((message, variant = "success", duration = 3000) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, variant }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  return { toasts, showToast, dismiss };
}
