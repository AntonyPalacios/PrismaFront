import { createContext, useContext } from 'react';

export const NotifyContext = createContext(() => {});

/** notify('Guardado') or notify('Algo falló', 'error') — see NotificationProvider. */
export function useNotify() {
  return useContext(NotifyContext);
}
