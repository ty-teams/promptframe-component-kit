import {
  promptFrameStyleIntentSchema,
  type PromptFrameDensity,
  type PromptFrameFontScale,
  type PromptFrameMotionIntensity,
  type PromptFrameStyleIntent,
  type PromptFrameTone,
} from '@promptframe/contracts';

export interface PromptFrameStyleContext {
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
}

export interface ResolvedPromptFrameStyle {
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    accent: string;
    textPrimary: string;
    textSecondary: string;
  };
  spacing: {
    unit: number;
    safeArea: number;
    gap: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
  };
  motion: {
    intensity: PromptFrameMotionIntensity;
    presetId: string;
  };
  typography: {
    fontScale: PromptFrameFontScale;
    fontFamilyHint?: string;
  };
}

const TONE_PALETTES: Record<PromptFrameTone, Omit<ResolvedPromptFrameStyle['colors'], 'accent'>> = {
  business: {
    background: '#0f172a',
    surface: '#1e293b',
    primary: '#e2e8f0',
    secondary: '#94a3b8',
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
  },
  tech: {
    background: '#08111f',
    surface: '#102033',
    primary: '#dff7ff',
    secondary: '#7dd3fc',
    textPrimary: '#f0f9ff',
    textSecondary: '#bae6fd',
  },
  minimal: {
    background: '#fafafa',
    surface: '#ffffff',
    primary: '#111827',
    secondary: '#6b7280',
    textPrimary: '#111827',
    textSecondary: '#4b5563',
  },
  warm: {
    background: '#1c1917',
    surface: '#292524',
    primary: '#fed7aa',
    secondary: '#fdba74',
    textPrimary: '#fff7ed',
    textSecondary: '#fed7aa',
  },
  playful: {
    background: '#111827',
    surface: '#1f2937',
    primary: '#fbcfe8',
    secondary: '#c4b5fd',
    textPrimary: '#ffffff',
    textSecondary: '#e9d5ff',
  },
  luxury: {
    background: '#09090b',
    surface: '#18181b',
    primary: '#fde68a',
    secondary: '#a1a1aa',
    textPrimary: '#fafafa',
    textSecondary: '#d4d4d8',
  },
  documentary: {
    background: '#111111',
    surface: '#262626',
    primary: '#e5e5e5',
    secondary: '#a3a3a3',
    textPrimary: '#fafafa',
    textSecondary: '#d4d4d4',
  },
};

const DENSITY_SPACING: Record<PromptFrameDensity, ResolvedPromptFrameStyle['spacing']> = {
  compact: { unit: 8, safeArea: 40, gap: 12 },
  balanced: { unit: 12, safeArea: 56, gap: 18 },
  spacious: { unit: 16, safeArea: 72, gap: 24 },
};

export function resolvePromptFrameStyle(
  intent: PromptFrameStyleIntent | undefined,
  context: PromptFrameStyleContext,
): ResolvedPromptFrameStyle {
  const parsed = promptFrameStyleIntentSchema.parse(intent ?? {});
  const tone = parsed.tone ?? toneFromAspect(context);
  const density = parsed.density ?? 'balanced';
  const motionIntensity = parsed.motionIntensity ?? 'balanced';
  const fontScale = parsed.fontScale ?? 'normal';
  const palette = TONE_PALETTES[tone];
  const accent = parsed.accentColor ?? parsed.brandTokens?.primaryColor ?? defaultAccentForTone(tone);

  return {
    colors: {
      ...palette,
      accent,
    },
    spacing: DENSITY_SPACING[density],
    radius: radiusForDensity(density),
    motion: {
      intensity: motionIntensity,
      presetId: `${tone}-${motionIntensity}`,
    },
    typography: {
      fontScale,
      ...(parsed.brandTokens?.fontFamilyHint ? { fontFamilyHint: parsed.brandTokens.fontFamilyHint } : {}),
    },
  };
}

function toneFromAspect(context: PromptFrameStyleContext): PromptFrameTone {
  return context.height > context.width ? 'tech' : 'business';
}

function defaultAccentForTone(tone: PromptFrameTone): string {
  switch (tone) {
    case 'business':
      return '#38bdf8';
    case 'tech':
      return '#22d3ee';
    case 'minimal':
      return '#111827';
    case 'warm':
      return '#fb923c';
    case 'playful':
      return '#f472b6';
    case 'luxury':
      return '#facc15';
    case 'documentary':
      return '#e5e5e5';
  }
}

function radiusForDensity(density: PromptFrameDensity): ResolvedPromptFrameStyle['radius'] {
  switch (density) {
    case 'compact':
      return { sm: 4, md: 8, lg: 12 };
    case 'spacious':
      return { sm: 8, md: 14, lg: 20 };
    case 'balanced':
      return { sm: 6, md: 10, lg: 16 };
  }
}

