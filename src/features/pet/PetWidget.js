import React, { memo, useEffect } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  ZoomIn,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { PET_MOOD } from './usePetMood';
import { colors, fonts, radii, softShadow, spacing } from '../../theme';

/**
 * PetWidget — componente APRESENTACIONAL puro.
 * Recebe (pet, mood) e não sabe de tarefas, storage ou regras de negócio.
 * Quem decide o mood é a máquina de estados (usePetMood).
 */
export const PetWidget = memo(function PetWidget({ pet, mood, remaining, total }) {
  const { motion } = pet;
  const y = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);

  // Uma animação por estado. O cleanup cancela a anterior → sem animações "fantasmas" empilhadas.
  useEffect(() => {
    if (mood === PET_MOOD.IDLE) {
      // Atenção: pulinho + balanço contínuos (energia definida pelo pet)
      y.value = withRepeat(
        withSequence(
          withTiming(-motion.idleAmp, { duration: motion.idlePeriod, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: motion.idlePeriod, easing: Easing.in(Easing.quad) })
        ),
        -1
      );
      rotate.value = withRepeat(
        withSequence(
          withTiming(motion.wobbleDeg, { duration: motion.idlePeriod * 2 }),
          withTiming(-motion.wobbleDeg, { duration: motion.idlePeriod * 2 })
        ),
        -1,
        true
      );
      scale.value = withTiming(1, { duration: 200 });
    } else if (mood === PET_MOOD.REWARD) {
      // Comemoração: N pulos com giro + "squash" de escala
      y.value = withRepeat(
        withSequence(
          withTiming(-motion.hopHeight, { duration: 170, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 170, easing: Easing.in(Easing.quad) })
        ),
        motion.hops
      );
      rotate.value = withRepeat(
        withSequence(withTiming(-12, { duration: 170 }), withTiming(12, { duration: 170 })),
        motion.hops,
        true
      );
      scale.value = withSequence(withSpring(1.15, { damping: 6 }), withSpring(1));
    } else {
      // Cozy: encolhe no chão e "respira" bem devagar
      y.value = withTiming(6, { duration: 600 });
      rotate.value = withTiming(0, { duration: 600 });
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) })
        ),
        -1
      );
    }
    return () => {
      cancelAnimation(y);
      cancelAnimation(rotate);
      cancelAnimation(scale);
    };
  }, [mood, pet.id, motion, y, rotate, scale]);

  const spriteStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { rotate: `${rotate.value}deg` }, { scale: scale.value }],
  }));

  const message =
    mood === PET_MOOD.REWARD
      ? pet.lines.reward()
      : mood === PET_MOOD.COZY
        ? pet.lines.cozy()
        : total === 0
          ? pet.lines.empty()
          : pet.lines.idle(remaining);

  return (
    <View style={[styles.card, { backgroundColor: pet.tint }]}>
      <View style={styles.stage}>
        {/* Renderiza a imagem do mascote baseada no estado atual (idle, reward, cozy) */}
        <Animated.View style={spriteStyle}>
          <Animated.Image
            key={mood}
            entering={ZoomIn.duration(220)}
            source={pet.sprites[mood]}
            style={styles.sprite}
            resizeMode="contain"
          />
        </Animated.View>

        {mood === PET_MOOD.REWARD && (
          <View pointerEvents="none" style={styles.fx}>
            {[0, 1, 2].map((i) => (
              <Heart key={i} index={i} />
            ))}
          </View>
        )}
        {mood === PET_MOOD.COZY && <Zzz />}
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{pet.name}</Text>
        <Text style={styles.personality}>{pet.personality}</Text>
        {/* key na mensagem → fade-in a cada troca de estado; liveRegion avisa leitores de tela */}
        <Animated.Text
          key={message}
          entering={FadeIn.duration(250)}
          style={styles.message}
          accessibilityLiveRegion="polite"
        >
          {message}
        </Animated.Text>
      </View>
    </View>
  );
});

/** Coração que sobe, abre em leque e some. Escalonado por `index`. */
function Heart({ index }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(index * 140, withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) }));
  }, [index, p]);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0, 0.15, 0.8, 1], [0, 1, 1, 0]),
    transform: [
      { translateY: -70 * p.value },
      { translateX: (index - 1) * 28 * p.value },
      { scale: 0.6 + 0.6 * p.value },
    ],
  }));

  return <Animated.Text style={[styles.heart, style]}>{['💗', '💖', '💕'][index % 3]}</Animated.Text>;
}

/** "z Z z" flutuando — sinaliza o estado cozy. */
function Zzz() {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.out(Easing.quad) }), -1, false);
    return () => cancelAnimation(t);
  }, [t]);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.2, 0.8, 1], [0, 1, 1, 0]),
    transform: [{ translateY: -30 * t.value }, { translateX: 14 * t.value }],
  }));

  return <Animated.Text style={[styles.zzz, style]}>z Z z</Animated.Text>;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    ...softShadow(),
  },
  stage: {
    width: 104,
    height: 104,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sprite: { 
    width: 76, 
    height: 76 
  },
  fx: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  heart: { position: 'absolute', fontSize: 22 },
  zzz: { position: 'absolute', top: 6, right: 8, fontFamily: fonts.black, fontSize: 16, color: colors.inkSoft },
  info: { flex: 1 },
  name: { fontFamily: fonts.black, fontSize: 20, color: colors.ink },
  personality: { fontFamily: fonts.bold, fontSize: 12, color: colors.inkSoft, marginBottom: 6 },
  message: { fontFamily: fonts.bold, fontSize: 14, lineHeight: 20, color: colors.ink },
});