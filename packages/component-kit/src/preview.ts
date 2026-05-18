export interface ComponentPreviewConstraints {
  maxDurationFrames: number;
  maxWidth: number;
  maxHeight: number;
  maxFps: number;
}

export const COMPONENT_PREVIEW_CONSTRAINTS: ComponentPreviewConstraints = {
  maxDurationFrames: 180,
  maxWidth: 1280,
  maxHeight: 720,
  maxFps: 30,
};

export interface ComponentPreviewPropsEnvelope<TProps extends Record<string, unknown> = Record<string, unknown>> {
  durationFrames: number;
  fps: 30;
  width: number;
  height: number;
  props: TProps;
}

export function assertPreviewWithinConstraints(
  preview: ComponentPreviewPropsEnvelope,
  constraints: ComponentPreviewConstraints = COMPONENT_PREVIEW_CONSTRAINTS,
): void {
  const errors: string[] = [];
  if (preview.durationFrames > constraints.maxDurationFrames) errors.push(`durationFrames must be <= ${constraints.maxDurationFrames}`);
  if (preview.width > constraints.maxWidth) errors.push(`width must be <= ${constraints.maxWidth}`);
  if (preview.height > constraints.maxHeight) errors.push(`height must be <= ${constraints.maxHeight}`);
  if (preview.fps > constraints.maxFps) errors.push(`fps must be <= ${constraints.maxFps}`);
  if (errors.length > 0) throw new Error(errors.join('; '));
}
