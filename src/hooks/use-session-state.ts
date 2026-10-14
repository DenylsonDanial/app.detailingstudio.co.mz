import { Dispatch, SetStateAction, useEffect, useState } from 'react';

// ----------------------------------------------------------------------

/**
 * useState que sobrevive a navegacao dentro do separador (abrir um registo e
 * voltar a lista mantem filtros e pagina). Usa sessionStorage; com key nula,
 * ou se o armazenamento nao estiver disponivel, comporta-se como useState.
 */
export function useSessionState<T>(
  key: string | null,
  initial: T
): [T, Dispatch<SetStateAction<T>>] {
  const storageKey = key ? `ds.list.${key}` : null;

  const [value, setValue] = useState<T>(() => {
    if (!storageKey) return initial;
    try {
      const stored = sessionStorage.getItem(storageKey);
      return stored === null ? initial : (JSON.parse(stored) as T);
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    if (!storageKey) return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // armazenamento indisponivel: o estado fica so em memoria
    }
  }, [storageKey, value]);

  return [value, setValue];
}
