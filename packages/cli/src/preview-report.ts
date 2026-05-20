import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, join, relative } from 'node:path';
import { PROMPTFRAME_PUBLIC_STANDARD_POLICY } from '@promptframe/contracts';

export interface CliDiagnostic {
  code: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
}

export interface LocalPreviewReportSummary {
  path: string;
  source: string;
  caseCount: number;
  diagnostic: CliDiagnostic;
}

export type FailWithDiagnostic = (message: string, code: string, exitCode?: number) => never;

export function writeLocalPreviewReport({
  dir,
  component,
  canonicalPreview,
  fail,
}: {
  dir: string;
  component: Record<string, string | undefined>;
  canonicalPreview: Record<string, unknown>;
  fail: FailWithDiagnostic;
}): LocalPreviewReportSummary {
  const reportDir = join(dir, '.promptframe/local-previews');
  mkdirSync(reportDir, { recursive: true });
  const cases = collectLocalPreviewCases(dir, canonicalPreview, fail);
  const report = {
    reportVersion: 'promptframe-local-preview-report.v1',
    generatedAt: new Date().toISOString(),
    component,
    renderingSystem: 'remotion',
    cases,
    diagnostic: diagnostic(
      'preview.local_report.ready',
      'info',
      'Local preview report was generated from canonical and saved local preview cases.',
    ),
  };
  const reportPath = join(reportDir, 'preview-report.json');
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  return {
    path: reportPath,
    source: '.promptframe/local-previews/preview-report.json',
    caseCount: cases.length,
    diagnostic: diagnostic('preview.local_report.written', 'info', 'Local preview report written.'),
  };
}

export function assertPreviewEnvelope(
  preview: Record<string, unknown> | undefined,
  source: string,
  fail: FailWithDiagnostic,
): void {
  if (!preview) fail(`${source} must be a JSON object.`, 'component_standard.preview.object');
  const limits = PROMPTFRAME_PUBLIC_STANDARD_POLICY.previewLimits;
  const allowedFps: readonly number[] = limits.allowedFps;
  const durationFrames = Number(preview.durationFrames);
  const width = Number(preview.width);
  const height = Number(preview.height);
  const fps = Number(preview.fps);

  if (!Number.isInteger(durationFrames) || durationFrames <= 0) {
    fail(`${source} durationFrames must be a positive integer.`, 'component_standard.preview.duration_frames.positive');
  }
  if (durationFrames > limits.maxDurationFrames) {
    fail(`${source} durationFrames exceeds the public standard limit: ${durationFrames} > ${limits.maxDurationFrames}.`, 'component_standard.preview.duration_frames.max');
  }
  if (!Number.isInteger(width) || width <= 0) {
    fail(`${source} width must be a positive integer.`, 'component_standard.preview.width.positive');
  }
  if (width > limits.maxWidth) {
    fail(`${source} width exceeds the public standard limit: ${width} > ${limits.maxWidth}.`, 'component_standard.preview.width.max');
  }
  if (!Number.isInteger(height) || height <= 0) {
    fail(`${source} height must be a positive integer.`, 'component_standard.preview.height.positive');
  }
  if (height > limits.maxHeight) {
    fail(`${source} height exceeds the public standard limit: ${height} > ${limits.maxHeight}.`, 'component_standard.preview.height.max');
  }
  if (!Number.isInteger(fps) || !allowedFps.includes(fps)) {
    fail(`${source} fps must be one of: ${allowedFps.join(', ')}.`, 'component_standard.preview.fps.allowed');
  }
  if (!asRecord(preview.props)) {
    fail(`${source} must include a props object.`, 'component_standard.preview.props.object');
  }
}

function collectLocalPreviewCases(
  dir: string,
  canonicalPreview: Record<string, unknown>,
  fail: FailWithDiagnostic,
): Array<Record<string, unknown>> {
  const cases = [
    summarizePreviewCase('canonical', 'Canonical preview', 'src/preview-props.json', canonicalPreview),
  ];
  const previewDir = join(dir, '.promptframe/local-previews');
  if (!existsSync(previewDir)) return cases;
  for (const fileName of readdirSync(previewDir).sort()) {
    if (!fileName.endsWith('.json') || fileName === 'preview-report.json') continue;
    const fullPath = join(previewDir, fileName);
    if (!statSync(fullPath).isFile()) continue;
    const source = normalizeRelativePath(relative(dir, fullPath));
    const previewCase = asRecord(JSON.parse(readFileSync(fullPath, 'utf8')));
    if (!previewCase) fail(`${source} must be a JSON object.`, 'preview.local_case.object');
    assertPreviewEnvelope(previewCase, source, fail);
    cases.push(summarizePreviewCase(
      basename(fileName, '.json'),
      stringValue(previewCase.name) ?? basename(fileName, '.json'),
      source,
      previewCase,
    ));
  }
  return cases;
}

function summarizePreviewCase(
  id: string,
  name: string,
  source: string,
  previewCase: Record<string, unknown>,
): Record<string, unknown> {
  return {
    id,
    name,
    source,
    width: Number(previewCase.width),
    height: Number(previewCase.height),
    fps: Number(previewCase.fps),
    durationFrames: Number(previewCase.durationFrames),
    propsHash: hashStableJson(asRecord(previewCase.props) ?? {}),
    envelopeHash: hashStableJson(previewCase),
  };
}

function diagnostic(
  code: string,
  severity: 'info' | 'warning' | 'error',
  message: string,
): CliDiagnostic {
  return { code, severity, message };
}

function normalizeRelativePath(path: string): string {
  return path.replaceAll('\\', '/');
}

function hashStableJson(value: unknown): string {
  return `sha256:${createHash('sha256').update(JSON.stringify(sortJson(value))).digest('hex')}`;
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => sortJson(item));
  const record = asRecord(value);
  if (!record) return value;
  const output: Record<string, unknown> = {};
  for (const key of Object.keys(record).sort()) output[key] = sortJson(record[key]);
  return output;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
