import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors, fonts, radii, softShadow, spacing } from '../theme';

/**
 * Barra de entrada ancorada embaixo (zona do polegar).
 *
 * Teclado "inteligente":
 *  - returnKeyType="done" + onSubmitEditing: o Enter adiciona.
 *  - blurOnSubmit={false}: o teclado fica aberto → dá para anotar várias tarefas em sequência.
 *  - enablesReturnKeyAutomatically (iOS): Enter só habilita com texto.
 *  - autoCapitalize="sentences": a tarefa já nasce com inicial maiúscula.
 * O "dismiss ao tocar fora" é responsabilidade da TELA (ela conhece o layout).
 */
export function TaskInput({ onSubmit, accent }) {
  const [text, setText] = useState('');
  const scale = useSharedValue(1);
  const canAdd = text.trim().length > 0;

  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const submit = () => {
    if (!canAdd) return;
    onSubmit(text);
    setText('');
  };

  return (
    <View style={styles.bar}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="O que vamos fazer hoje?"
        placeholderTextColor={colors.inkSoft}
        returnKeyType="done"
        blurOnSubmit={false}
        onSubmitEditing={submit}
        enablesReturnKeyAutomatically
        autoCapitalize="sentences"
        maxLength={80}
        selectionColor={accent}
      />
      <Pressable
        onPress={submit}
        onPressIn={() => (scale.value = withSpring(0.88))}
        onPressOut={() => (scale.value = withSpring(1, { damping: 8 }))}
        accessibilityRole="button"
        accessibilityLabel="Adicionar tarefa"
        accessibilityState={{ disabled: !canAdd }}
        hitSlop={8}
      >
        <Animated.View
          style={[styles.addButton, { backgroundColor: accent, opacity: canAdd ? 1 : 0.5 }, btnStyle]}
        >
          <Ionicons name="add" size={30} color={colors.ink} />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingLeft: spacing.lg,
    paddingRight: 6,
    paddingVertical: 6,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    ...softShadow(),
  },
  input: { flex: 1, height: 48, fontFamily: fonts.regular, fontSize: 16, color: colors.ink },
  addButton: { width: 52, height: 52, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
});
