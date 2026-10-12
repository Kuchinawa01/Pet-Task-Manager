import React, { memo, useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  FadeInDown,
  LinearTransition,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, fonts, radii, softShadow } from '../../theme';
import { haptics } from '../../shared/services/haptics';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DELETE_THRESHOLD = -96; // arrastou além disso → solta e apaga
const FLICK_VELOCITY = -900; // ...ou um "flick" rápido com algum deslocamento

/**
 * Linha da tarefa: checkbox animado + swipe-to-delete.
 *
 * Arquitetura:
 *  - React.memo + callbacks estáveis vindos da tela: marcar UMA tarefa
 *    re-renderiza UMA linha, não a lista inteira.
 *  - Gesto e animação rodam na UI thread (Gesture API + worklets). O JS só é
 *    acionado (runOnJS) em dois momentos discretos: haptic ao cruzar o
 *    limiar e a remoção no estado. Por isso o arrasto não engasga.
 *  - activeOffsetX(-12) + failOffsetY([-10,10]): o pan só "pega" no arrasto
 *    horizontal para a ESQUERDA. Scroll vertical da FlatList e taps no
 *    checkbox continuam livres — o erro mais comum em swipe rows.
 *  - Remoção: a linha sai da tela, o item é removido do estado e as demais
 *    linhas deslizam para cima via `layout={LinearTransition}` — sem medir altura.
 */
function TaskItemBase({ task, onToggle, onDelete, accent }) {
  const translateX = useSharedValue(0);
  const checked = useSharedValue(task.done ? 1 : 0);
  const pop = useSharedValue(1);

  // Fonte da verdade = prop `task.done`; o shared value só ANIMA a transição.
  useEffect(() => {
    checked.value = withSpring(task.done ? 1 : 0, { damping: 14, stiffness: 200 });
  }, [task.done, checked]);

  const pan = Gesture.Pan()
    .activeOffsetX(-12)
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      translateX.value = Math.min(0, e.translationX); // nunca arrasta para a direita
    })
    .onEnd((e) => {
      const passed =
        translateX.value < DELETE_THRESHOLD ||
        (e.velocityX < FLICK_VELOCITY && translateX.value < -40);

      if (passed) {
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 180 }, (finished) => {
          if (finished) runOnJS(onDelete)(task.id);
        });
      } else {
        translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
      }
    });

  // Feedback tátil quando o gesto "arma" ou "desarma" a exclusão (como o iOS Mail).
  useAnimatedReaction(
    () => translateX.value < DELETE_THRESHOLD,
    (armed, wasArmed) => {
      if (wasArmed != null && armed !== wasArmed) runOnJS(haptics.tap)();
    }
  );

  const handlePress = () => {
    pop.value = withSequence(withTiming(0.82, { duration: 70 }), withSpring(1, { damping: 8, stiffness: 260 }));
    onToggle(task.id);
  };

  // ---- estilos animados (todos derivados de shared values) ----
  const rowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));

  const deleteLayerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-24, 0], [1, 0], Extrapolation.CLAMP),
    backgroundColor: interpolateColor(translateX.value, [DELETE_THRESHOLD, 0], [colors.roseDeep, colors.rose]),
  }));

  const trashStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(translateX.value, [DELETE_THRESHOLD, -24], [1.15, 0.7], Extrapolation.CLAMP) },
    ],
  }));

  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
    backgroundColor: interpolateColor(checked.value, [0, 1], [colors.surface, accent]),
    borderColor: interpolateColor(checked.value, [0, 1], [colors.lilacDeep, accent]),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: interpolate(checked.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    transform: [{ scale: checked.value }], // spring estoura >1 → "pop" do check
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(checked.value, [0, 1], [1, 0.5], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(16)}
      layout={LinearTransition.springify().damping(18)}
      style={styles.wrapper}
    >
      {/* Camada de fundo revelada pelo arrasto */}
      <Animated.View style={[styles.deleteLayer, deleteLayerStyle]}>
        <Animated.View style={trashStyle}>
          <Ionicons name="trash-outline" size={24} color={colors.ink} />
        </Animated.View>
      </Animated.View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.row, rowStyle]}>
          {/* A linha inteira é a área de toque (alvo grande = melhor ergonomia).
              Swipe não tem equivalente para leitores de tela → ação de acessibilidade. */}
          <Pressable
            style={styles.content}
            onPress={handlePress}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: task.done }}
            accessibilityLabel={task.title}
            accessibilityActions={[{ name: 'delete', label: 'Apagar tarefa' }]}
            onAccessibilityAction={(e) => {
              if (e.nativeEvent.actionName === 'delete') onDelete(task.id);
            }}
          >
            <Animated.View style={[styles.checkbox, boxStyle]}>
              <Animated.View style={checkStyle}>
                <Ionicons name="checkmark" size={18} color={colors.ink} />
              </Animated.View>
            </Animated.View>

            <Animated.Text
              style={[styles.title, task.done && styles.titleDone, titleStyle]}
              numberOfLines={3}
            >
              {task.title}
            </Animated.Text>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

export const TaskItem = memo(TaskItemBase);

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  deleteLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radii.lg,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 28,
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    ...softShadow(),
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, paddingHorizontal: 16 },
  checkbox: {
    width: 30,
    height: 30,
    borderRadius: radii.pill,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  // textDecorationLine não é animável no RN; opacidade animada + risco estático é o melhor custo/benefício.
  titleDone: { textDecorationLine: 'line-through', color: colors.inkSoft },
});
