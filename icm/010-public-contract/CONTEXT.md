# Stage 010 — public contract

## Goal

Prove that the published contract matches the package's safe, deterministic
boundary without exposing internal implementation details.

## Public contract

Read `contract.json`. It is the machine-readable contract for agents and
integrators. The canonical detailed tool schema remains `../../capabilities.json`.

## Binary workflow

1. Run `done.sh`: required files exist and `contract.json` has the required
   fixed fields.
2. Run `verify.sh`: independently check that the package tarball contains the
   ICM folder and that its public files do not claim custody or expose private
   MiLA implementation terms.
3. Read `NEXT`: it states the pass and failure routes.

## Boundary

This folder may describe inputs, outputs, side effects, limits, and evidence.
It must never contain prompts, secret keys, internal URLs, model-routing rules,
private policy thresholds, or hidden governance logic.
