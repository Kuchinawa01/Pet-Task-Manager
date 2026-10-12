import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Fachada de haptics.
 * Decisões:
 *  - A UI pede uma INTENÇÃO (check, success...), nunca um estilo de vibração.
 *    Trocar a "sensação" do app vira edição de um arquivo só.
 *  - Falha silenciosa: aparelhos sem motor háptico (ou web) não podem quebrar o fluxo.
 */
const safe = (fn) => () => {
  if (Platform.OS === 'web') return;
  try {
    Promise.resolve(fn()).catch(() => {});
  } catch {
    /* sem suporte: ignora */
  }
};

export const haptics = {
  tap: safe(() => Haptics.selectionAsync()), // troca de pet, cruzar limiar do swipe
  check: safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)), // marcar tarefa
  add: safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)), // adicionar tarefa
  remove: safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)), // apagar
  success: safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)), // zerou a lista
};
