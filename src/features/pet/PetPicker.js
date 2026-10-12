import React, { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, Image } from 'react-native';
import { PETS, PET_IDS } from './petConfig';
import { colors, fonts, radii, spacing } from '../../theme';

/** Seletor de mascote em pílulas. Horizontal para caber em telas pequenas. */
export const PetPicker = memo(function PetPicker({ selectedId, onSelect }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.row}
    >
      {PET_IDS.map((id) => {
        const pet = PETS[id];
        const selected = id === selectedId;
        return (
          <Pressable
            key={id}
            onPress={() => onSelect(id)}
            accessibilityRole="button"
            accessibilityLabel={`Escolher ${pet.name}`}
            accessibilityState={{ selected }}
            style={[styles.pill, selected && { backgroundColor: pet.tint, borderColor: pet.accent }]}
          >
            {/* Usamos o componente Image em vez de colocar o require dentro de Text */}
            <Image source={pet.sprites.idle} style={styles.avatar} resizeMode="cover" />
            <Text style={[styles.name, selected && styles.nameSelected]} numberOfLines={1}>
              {pet.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: 4, alignItems: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  avatar: { 
    width: 28, 
    height: 28, 
    borderRadius: 14 
  },
  name: { fontFamily: fonts.bold, fontSize: 14, color: colors.inkSoft },
  nameSelected: { color: colors.ink },
});