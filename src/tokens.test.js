import { describe, it, expect } from 'vitest';
import { TOKENS } from './tokens';

describe('Design Tokens — Madrugada Viva (T15)', () => {
  it('deve conter as cores da paleta Madrugada Viva em conformidade com DESIGN.md', () => {
    expect(TOKENS.colors.bgBase).toBe('#0A0A0C');
    expect(TOKENS.colors.surface).toBe('#151518');
    expect(TOKENS.colors.primary).toBe('#FACC15');
    expect(TOKENS.colors.success).toBe('#34D399');
    expect(TOKENS.colors.textPrimary).toBe('#FFFFFF');
  });

  it('deve respeitar a regra dos 60px para ergonomia noturna (AD-012)', () => {
    expect(TOKENS.touch.primaryButtonHeight).toBe('60px');
    expect(TOKENS.touch.secondaryButtonHeight).toBe('52px');
  });
});
