import { useState, useEffect } from "react";

export function useSessionStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = sessionStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch (error) {
      console.error("Error leyendo sessionStorage", error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error guardando sessionStorage", error);
    }
  }, [key, value]);

  const clear = () => {
    sessionStorage.removeItem(key);
  };

  return [value, setValue, clear];
}
