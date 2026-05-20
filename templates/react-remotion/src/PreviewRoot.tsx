import { Player } from '@remotion/player';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Component from './Component';
import previewEnvelope from './preview-props.json';
import { propsSchema, type ComponentProps } from './schema';

const preview = previewEnvelope as {
  durationFrames: number;
  fps: number;
  width: number;
  height: number;
  props?: unknown;
};

const initialPropsParse = propsSchema.safeParse(preview.props ?? {});
const initialProps: ComponentProps = initialPropsParse.success
  ? initialPropsParse.data
  : propsSchema.parse({});

const previewAspectPresets = [
  { label: '16:9', width: 1280, height: 720 },
  { label: '9:16', width: 720, height: 1280 },
  { label: '1:1', width: 960, height: 960 },
] as const;

const initialSize =
  previewAspectPresets.find(({ width, height }) => width === preview.width && height === preview.height) ??
  { label: 'Custom', width: preview.width, height: preview.height };

const root = document.getElementById('root');

if (!root) {
  throw new Error('Missing preview root element');
}

function isColorValue(value: unknown): value is string {
  return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);
}

function coerceControlValue(currentValue: unknown, rawValue: string): unknown {
  if (typeof currentValue === 'number') {
    const numeric = Number(rawValue);
    return Number.isFinite(numeric) ? numeric : currentValue;
  }
  if (typeof currentValue === 'boolean') {
    return rawValue === 'true';
  }
  return rawValue;
}

function PreviewApp() {
  const [inputProps, setInputProps] = useState<ComponentProps>(initialProps);
  const [previewSize, setPreviewSize] = useState(initialSize);

  const updateInputProp = (key: string, rawValue: string) => {
    setInputProps((current) => {
      const currentValue = current[key as keyof ComponentProps];
      const nextCandidate = {
        ...current,
        [key]: coerceControlValue(currentValue, rawValue),
      };
      const parsed = propsSchema.safeParse(nextCandidate);
      return parsed.success ? parsed.data : current;
    });
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        margin: 0,
        background: '#111827',
        color: '#f8fafc',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 360px)',
        gap: 24,
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      <section
        style={{
          minWidth: 0,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Player
          component={Component}
          inputProps={inputProps}
          durationInFrames={preview.durationFrames}
          compositionWidth={previewSize.width}
          compositionHeight={previewSize.height}
          fps={preview.fps}
          controls
          loop
          style={{
            width: 'min(100%, 1280px)',
            aspectRatio: `${previewSize.width} / ${previewSize.height}`,
            background: '#000',
            boxShadow: '0 18px 60px rgba(0, 0, 0, 0.38)',
          }}
        />
      </section>

      <aside
        aria-label="PromptFrame preview controls"
        style={{
          alignSelf: 'stretch',
          background: '#f8fafc',
          color: '#111827',
          borderRadius: 8,
          padding: 18,
          boxSizing: 'border-box',
          overflowY: 'auto',
        }}
      >
        <section>
          <h2 style={{ fontSize: 16, margin: '0 0 12px', letterSpacing: 0 }}>Preview</h2>
          <div
            aria-label="Aspect ratio"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}
          >
            {previewAspectPresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setPreviewSize(preset)}
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  background: previewSize.label === preset.label ? '#111827' : '#fff',
                  color: previewSize.label === preset.label ? '#fff' : '#111827',
                  font: 'inherit',
                  padding: '8px 10px',
                  cursor: 'pointer',
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 22 }}>
          <h2 style={{ fontSize: 16, margin: '0 0 12px', letterSpacing: 0 }}>Props</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {Object.entries(inputProps).map(([key, value]) => (
              <label key={key} style={{ display: 'grid', gap: 6, fontSize: 13 }}>
                <span style={{ color: '#334155', fontWeight: 700 }}>{key}</span>
                <input
                  type={isColorValue(value) ? 'color' : typeof value === 'number' ? 'number' : 'text'}
                  value={typeof value === 'string' || typeof value === 'number' ? value : String(value)}
                  onChange={(event) => updateInputProp(key, event.currentTarget.value)}
                  style={{
                    width: '100%',
                    minWidth: 0,
                    boxSizing: 'border-box',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    padding: isColorValue(value) ? 4 : '8px 10px',
                    font: 'inherit',
                  }}
                />
              </label>
            ))}
          </div>
        </section>
      </aside>
    </main>
  );
}

createRoot(root).render(
  <StrictMode>
    <PreviewApp />
  </StrictMode>,
);
