import assert from "node:assert/strict";
import test from "node:test";
import { evaluatePolicy, type PaymentAction, type SpendPolicy } from "../src/policy.js";

const policy: SpendPolicy = {
  expectedPrincipalId: "district-42",
  expectedAgentId: "procurement-agent",
  expectedAuthorityId: "approval-2026-08-05",
  expectedAsset: "USDC",
  expectedPayloadHash: "sha256:approved-payload",
  expectedIdempotencyKey: "purchase-42-1",
  allowedRails: ["provider_checkout"],
  allowedRecipients: ["merchant-17"],
  maxPerActionMicros: "5000000",
  maxDailyMicros: "10000000",
  stepUpAtMicros: "3000000",
  requirePurpose: true,
};
const action: PaymentAction = {
  principalId: "district-42",
  agentId: "procurement-agent",
  authorityId: "approval-2026-08-05",
  rail: "provider_checkout",
  asset: "USDC",
  recipient: "merchant-17",
  purpose: "approved school supplies",
  payloadHash: "sha256:approved-payload",
  idempotencyKey: "purchase-42-1",
  amountMicros: "2000000",
  expiresAt: "2026-08-06T00:00:00Z",
};
const now = "2026-08-05T12:00:00Z";

test("returns local eligibility for an exact, in-policy action", () => {
  assert.deepEqual(evaluatePolicy(now, policy, action, "0"), {
    outcome: "ELIGIBLE",
    reasonCode: "LOCAL_POLICY_ELIGIBLE",
  });
});

test("denies mismatched principal, asset, recipient, payload, and idempotency binding", () => {
  for (const [field, value, reasonCode] of [
    ["principalId", "district-99", "PRINCIPAL_MISMATCH"],
    ["asset", "USD", "ASSET_MISMATCH"],
    ["recipient", "merchant-99", "RECIPIENT_NOT_ALLOWED"],
    ["payloadHash", "sha256:changed", "PAYLOAD_HASH_MISMATCH"],
    ["idempotencyKey", "purchase-42-2", "IDEMPOTENCY_KEY_MISMATCH"],
  ] as const) {
    const changed = { ...action, [field]: value };
    assert.equal(evaluatePolicy(now, policy, changed, "0").reasonCode, reasonCode);
  }
});

test("denies invalid amount, expiry, and daily-cap conditions", () => {
  assert.equal(evaluatePolicy(now, policy, { ...action, amountMicros: "0" }, "0").reasonCode, "ZERO_AMOUNT");
  assert.equal(evaluatePolicy(now, policy, { ...action, expiresAt: now }, "0").reasonCode, "EXPIRED_ACTION");
  assert.equal(evaluatePolicy(now, policy, { ...action, amountMicros: "2000001" }, "8000000").reasonCode, "DAILY_CAP_EXCEEDED");
});

test("requires step-up without turning the result into payment authority", () => {
  assert.deepEqual(evaluatePolicy(now, policy, { ...action, amountMicros: "3000000" }, "0"), {
    outcome: "STEP_UP",
    reasonCode: "STEP_UP_REQUIRED",
  });
});
