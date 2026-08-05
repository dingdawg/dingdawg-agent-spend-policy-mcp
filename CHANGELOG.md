# Changelog

All notable changes are documented here. Versions follow Semantic Versioning.

## 0.1.1 - 2026-08-05

- Added a versioned machine-readable capability contract for agent discovery.
- Documented the local-only, zero-custody safety boundary in the package README.
- Prevented Registry authentication tokens from being accidentally staged by Git.

## 0.1.0 - 2026-08-05

Initial public release.

- Added a local MCP tool for deterministic agent spend-policy eligibility.
- Uses integer micro-unit strings, never floating-point money.
- Explicitly excludes payment authorization, signing, custody, execution,
  settlement, and durable accounting from this package's scope.
