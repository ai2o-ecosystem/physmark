import type { PhysMarkThemeTokens } from '@physmark/core';

/**
 * Injects theme tokens as CSS custom properties on the given element (default: :root)
 */
export function applyTheme(tokens: PhysMarkThemeTokens, element: HTMLElement = document.documentElement): void {
  const style = element.style;
  style.setProperty('--pm-color-background', tokens.colorBackground);
  style.setProperty('--pm-color-surface', tokens.colorSurface);
  style.setProperty('--pm-color-border', tokens.colorBorder);
  style.setProperty('--pm-color-text', tokens.colorText);
  style.setProperty('--pm-color-text-muted', tokens.colorTextMuted);
  style.setProperty('--pm-color-accent', tokens.colorAccent);
  style.setProperty('--pm-color-error', tokens.colorError);
  style.setProperty('--pm-color-error-bg', tokens.colorErrorBg);
  style.setProperty('--pm-font-family', tokens.fontFamily);
  style.setProperty('--pm-font-family-mono', tokens.fontFamilyMono);
  style.setProperty('--pm-font-size', tokens.fontSize);
  style.setProperty('--pm-line-height', tokens.lineHeight);
  style.setProperty('--pm-border-radius', tokens.borderRadius);
}
