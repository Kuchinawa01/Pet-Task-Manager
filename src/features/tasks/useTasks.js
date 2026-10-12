import { useCallback, useMemo } from 'react';
import { usePersistentState } from '../../shared/hooks/usePersistentState';

const STORAGE_KEY = 'cozy:tasks:v1';

const makeId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/**
 * Chave do dia no fuso LOCAL (YYYY-MM-DD).
 * Atenção: toISOString() é UTC — no Brasil, após as 21h viraria "amanhã".
 */
export const todayKey = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/**
 * Camada de domínio das tarefas. A tela não sabe NADA de AsyncStorage ou de
 * como o "dia" é calculado — só consome { tasks, stats, actions }.
 *
 * Modelo: { id, title, done, day, createdAt }
 * `day` permite histórico/streaks no futuro sem migração de schema.
 *
 * Limitação consciente: `todayKey()` é recalculado quando as tarefas mudam.
 * Para virar o dia com o app aberto, basta ouvir AppState 'active' aqui.
 */
export function useTasks() {
  const [allTasks, setAllTasks, hydrated] = usePersistentState(STORAGE_KEY, []);

  const addTask = useCallback(
    (title) => {
      const clean = title.trim();
      if (!clean) return false;
      setAllTasks((prev) => [
        { id: makeId(), title: clean, done: false, day: todayKey(), createdAt: Date.now() },
        ...prev,
      ]);
      return true;
    },
    [setAllTasks]
  );

  // Updaters funcionais → callbacks estáveis (não dependem do array atual).
  const toggleTask = useCallback(
    (id) => setAllTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))),
    [setAllTasks]
  );

  const removeTask = useCallback(
    (id) => setAllTasks((prev) => prev.filter((t) => t.id !== id)),
    [setAllTasks]
  );

  // Pendentes primeiro; concluídas "afundam" (sort estável preserva a ordem de criação).
  const tasks = useMemo(() => {
    const key = todayKey();
    return allTasks.filter((t) => t.day === key).sort((a, b) => Number(a.done) - Number(b.done));
  }, [allTasks]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.done).length;
    return { total, done, remaining: total - done, progress: total ? done / total : 0 };
  }, [tasks]);

  return { tasks, stats, hydrated, addTask, toggleTask, removeTask };
}
