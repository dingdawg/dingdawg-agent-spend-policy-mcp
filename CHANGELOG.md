# Changelog

All notable changes are documented here. Versions follow Semantic Versioning.

## 0.1.0 - 2026-08-05

Initial public release.

- Added a local MCP tool for deterministic agent spend-policy eligibility.
- Uses integer micro-unit strings, never floating-point money.
- Explicitly excludes payment authorization, signing, custody, execution,
  settlement, and durable accounting from this package's scope.
