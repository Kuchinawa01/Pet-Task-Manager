import { useEffect, useState } from 'react';

export const PET_MOOD = { IDLE: 'idle', REWARD: 'reward', COZY: 'cozy' };

const REWARD_DURATION_MS = 1600; // precisa cobrir o tempo dos pulinhos do pet mais enérgico

/**
 * MÁQUINA DE ESTADOS DO PET — função pura, testável sem renderizar nada.
 *
 * Prioridade: REWARD > COZY > IDLE
 *  - REWARD é transitório (evento "concluí uma tarefa").
 *  - COZY é DERIVADO do progresso (done === total && total > 0), nunca
 *    armazenado. Estado derivado não dessincroniza: se o usuário desmarcar
 *    uma tarefa, o pet acorda sozinho. Lista vazia NÃO é cozy.
 *  - Ao concluir a última tarefa, o pet comemora (REWARD) e só então dorme:
 *    narrativa melhor, e COZY continua exclusivo de "100%".
 */
export function derivePetMood({ total, done, rewardActive }) {
  if (rewardActive) return PET_MOOD.REWARD;
  if (total > 0 && done === total) return PET_MOOD.COZY;
  return PET_MOOD.IDLE;
}

/**
 * `rewardSignal` é um contador incrementado a cada conclusão. Usar contador
 * (e não boolean) permite reiniciar a comemoração se o usuário marcar duas
 * tarefas em sequência rápida.
 */
export function usePetMood({ total, done, rewardSignal }) {
  const [rewardActive, setRewardActive] = useState(false);

  useEffect(() => {
    if (rewardSignal === 0) return; // não comemora na hidratação inicial
    setRewardActive(true);
    const id = setTimeout(() => setRewardActive(false), REWARD_DURATION_MS);
    return () => clearTimeout(id);
  }, [rewardSignal]);

  return derivePetMood({ total, done, rewardActive });
}
