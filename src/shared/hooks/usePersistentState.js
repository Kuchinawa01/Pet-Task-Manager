import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * useState + AsyncStorage.
 *
 * Pontos que importam:
 *  1. `hydrated`: só gravamos DEPOIS de ler. Sem isso, o estado inicial ([])
 *     sobrescreveria os dados salvos no primeiro render (bug clássico).
 *  2. Chave versionada (ex.: ':v1') por quem chama → migrações futuras ficam triviais.
 *  3. Erros de I/O não derrubam a UI: o app continua funcionando em memória.
 *
 * Escalar: se a lista crescer muito, troque por MMKV/SQLite/WatermelonDB —
 * a assinatura do hook não muda, então nenhuma tela é afetada.
 */
export function usePersistentState(key, initialValue) {
  const [state, setState] = useState(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(key);
        if (alive && raw != null) setState(JSON.parse(raw));
      } catch (e) {
        console.warn(`[storage] falha ao ler "${key}"`, e);
      } finally {
        if (alive) setHydrated(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(key, JSON.stringify(state)).catch((e) =>
      console.warn(`[storage] falha ao gravar "${key}"`, e)
    );
  }, [key, state, hydrated]);

  return [state, setState, hydrated];
}
