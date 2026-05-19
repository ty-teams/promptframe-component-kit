import { Player } from '@remotion/player';
import { StrictMode } from 'react';
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

const inputProps: ComponentProps = propsSchema.parse(preview.props ?? {});
const root = document.getElementById('root');

if (!root) {
  throw new Error('Missing preview root element');
}

createRoot(root).render(
  <StrictMode>
    <main
      style={{
        minHeight: '100vh',
        margin: 0,
        background: '#111827',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      <Player
        component={Component}
        inputProps={inputProps}
        durationInFrames={preview.durationFrames}
        compositionWidth={preview.width}
        compositionHeight={preview.height}
        fps={preview.fps}
        controls
        loop
        style={{
          width: 'min(100%, 1280px)',
          aspectRatio: `${preview.width} / ${preview.height}`,
          background: '#000',
          boxShadow: '0 18px 60px rgba(0, 0, 0, 0.38)',
        }}
      />
    </main>
  </StrictMode>,
);
