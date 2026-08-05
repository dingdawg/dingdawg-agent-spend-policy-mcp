# DingDawg Agent Spend Policy MCP

A small, local MCP server that deterministically evaluates whether a proposed
agent spend action matches a supplied policy.

It returns one of `ELIGIBLE`, `DENY`, or `STEP_UP`, with a stable reason code.
`ELIGIBLE` is local policy evidence only. It is **not** payment authorization.

## Safety boundary

This package does not hold funds, private keys, payment credentials, customer
data, or settlement authority. It does not sign, send, settle, custody, or
record payments. It makes no network requests.

A production payment adapter needs separate, independently verified controls
for authenticated policy/action provenance, canonical payload hashing, durable
atomic budget reservation and replay protection, customer-controlled signing,
rail validation, and settlement reconciliation.

## Install

```bash
npx -y @dingdawg/agent-spend-policy-mcp
```

Configure it as a local stdio MCP server:

```json
{
  "mcpServers": {
    "dingdawg-agent-spend-policy": {
      "command": "npx",
      "args": ["-y", "@dingdawg/agent-spend-policy-mcp"]
    }
  }
}
```

## Tool

`evaluate_spend_policy` accepts an evaluation time, a policy, a proposed action,
and the already-spent amount. All money is passed as integer micro-unit strings,
never JavaScript floating-point numbers.

The caller supplies the clock and already-spent value; therefore this tool is
safe for dry runs and local evidence, not a replacement for a trusted payment
or accounting system.

## Agent contract

The versioned machine-readable contract is
[`capabilities.json`](./capabilities.json). It describes the only tool this
package exposes, its required inputs, its three possible outcomes, and its
non-negotiable safety boundary.

- Transport: local stdio MCP
- Tool: `evaluate_spend_policy`
- Required inputs: `evaluationTime`, `policy`, `action`, and
  `alreadySpentMicros`
- Outputs: `ELIGIBLE`, `DENY`, or `STEP_UP`, each with a stable reason code
- Side effects: none
- Credentials, payment execution, custody, signing, settlement, and network
  access: not supported

The manifest is package-source evidence for this release, not a promise of a
hosted agent-discovery endpoint. `ELIGIBLE` remains local policy evidence only,
not payment authorization.

## Development

```bash
npm install
npm test
npm run pack:check
```
