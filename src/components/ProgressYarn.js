import React, { memo, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, fonts, radii } from '../theme';

const ICON_SIZE = 34;
const TRACK_HEIGHT = 16;

/**
 * Barra de progresso temática: um novelo (ou ossinho) que ROLA pela trilha.
 *
 * Decisões:
 *  - Tudo é derivado de UM shared value (`p`). Posição, rotação e largura do
 *    preenchimento saem dele → impossível ficar dessincronizado.
 *  - Roda na UI thread (worklets): 60fps mesmo com o JS ocupado.
 *  - withSpring dá o "quique" fofo; o leve overshoot é intencional.
 */
export const ProgressYarn = memo(function ProgressYarn({ progress, icon, color, label }) {
  const p = useSharedValue(0);
  const trackWidth = useSharedValue(0);

  useEffect(() => {
    p.value = withSpring(progress, { damping: 14, stiffness: 110 });
  }, [progress, p]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: p.value * Math.max(trackWidth.value - ICON_SIZE, 0) },
      { rotate: `${p.value * 720}deg` }, // duas voltas completas: o novelo "rola"
    ],
  }));

  // O preenchimento termina no centro do ícone, para parecer que ele puxa a linha.
  const fillStyle = useAnimatedStyle(() => ({
    width: ICON_SIZE / 2 + p.value * Math.max(trackWidth.value - ICON_SIZE, 0),
  }));

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Progresso do dia: ${label}`}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
    >
      <View style={styles.labelRow}>
        <Text style={styles.title}>Progresso do dia</Text>
        <Text style={[styles.count, { color }]}>{label}</Text>
      </View>

      <View style={styles.container} onLayout={(e) => (trackWidth.value = e.nativeEvent.layout.width)}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, { backgroundColor: color }, fillStyle]} />
        </View>
        <Animated.Text style={[styles.icon, iconStyle]}>{icon}</Animated.Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  title: { fontFamily: fonts.bold, fontSize: 14, color: colors.inkSoft },
  count: { fontFamily: fonts.black, fontSize: 14 },
  container: { height: ICON_SIZE, justifyContent: 'center' },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radii.pill },
  icon: { position: 'absolute', left: 0, fontSize: 26, width: ICON_SIZE, textAlign: 'center' },
});
