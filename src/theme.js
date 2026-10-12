export const colors = {
  background: '#FDF8F5',
  surface: '#FFFFFF',
  ink: '#4A3F55',
  inkSoft: '#8E8499',
  border: '#EFE6E1',
  lilac: '#E4DAF7',
  lilacDeep: '#B9A3E3',
  mint: '#D4EFE3',
  mintDeep: '#8FD3B6',
  peach: '#FFE0D1',
  peachDeep: '#FFB596',
  rose: '#FFE3E7',
  roseDeep: '#F59BAA',
};

export const radii = { sm: 12, md: 20, lg: 28, pill: 999 };
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const fonts = {
  regular: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  black: 'Nunito_800ExtraBold',
};

export const softShadow = (color = colors.lilacDeep) => ({
  shadowColor: color,
  shadowOpacity: 0.22,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
});