# @promptframe/contracts

Public contracts for PromptFrame component manifests, component references, diagnostics, layout capability cards, and public authoring policy metadata.

This package is intentionally small and safe to consume from authoring tools, templates, and platform integration code. It exports the public standard/security policy IDs used by `@promptframe/cli` so automation can rely on stable diagnostics without reading platform-internal docs.

Key public exports:

- `PROMPTFRAME_AUTHORING_STANDARD_RELEASE`: current authoring standard release metadata, source hash, package floors, supported component types, and upload target policy.
- `authoringStandardFreshnessDecisionSchema`: shared shape for local tooling and platform admission to explain whether an authoring package is current, warning-only, upload-blocking, or security-breaking.
- `authoringUploadTargetSchema`: public upload lanes for `marketplace_authoring` and `project_private_generation`.
