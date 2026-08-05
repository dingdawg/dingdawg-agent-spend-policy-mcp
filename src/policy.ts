export type Outcome = "ELIGIBLE" | "DENY" | "STEP_UP";

export interface SpendPolicy {
  expectedPrincipalId: string;
  expectedAgentId: string;
  expectedAuthorityId: string;
  expectedAsset: string;
  expectedPayloadHash: string;
  expectedIdempotencyKey: string;
  allowedRails: string[];
  allowedRecipients: string[];
  maxPerActionMicros: string;
  maxDailyMicros: string;
  stepUpAtMicros?: string;
  requirePurpose?: boolean;
}

export interface PaymentAction {
  principalId: string;
  agentId: string;
  authorityId: string;
  rail: string;
  asset: string;
  recipient: string;
  purpose?: string;
  payloadHash: string;
  idempotencyKey: string;
  amountMicros: string;
  expiresAt: string;
}

export interface Evaluation {
  outcome: Outcome;
  reasonCode: string;
}

function parseMicros(value: string, field: string): bigint | Evaluation {
  if (!/^\d+$/.test(value)) {
    return { outcome: "DENY", reasonCode: `INVALID_${field}` };
  }
  return BigInt(value);
}

function denyIfDifferent(actual: string, expected: string, reasonCode: string): Evaluation | undefined {
  if (actual !== expected) return { outcome: "DENY", reasonCode };
  return undefined;
}

/**
 * Evaluates local policy eligibility only. It does not authorize, sign, send,
 * settle, custody, or record a payment. The caller supplies the clock and
 * already-spent total, so a production adapter still needs trusted inputs and
 * durable atomic reservation/replay protection.
 */
export function evaluatePolicy(
  evaluationTime: string,
  policy: SpendPolicy,
  action: PaymentAction,
  alreadySpentMicros: string,
): Evaluation {
  const now = new Date(evaluationTime);
  const expiresAt = new Date(action.expiresAt);
  if (Number.isNaN(now.valueOf())) return { outcome: "DENY", reasonCode: "INVALID_EVALUATION_TIME" };
  if (Number.isNaN(expiresAt.valueOf()) || expiresAt.valueOf() <= now.valueOf()) {
    return { outcome: "DENY", reasonCode: "EXPIRED_ACTION" };
  }

  const bindings: Array<[string, string, string]> = [
    [action.principalId, policy.expectedPrincipalId, "PRINCIPAL_MISMATCH"],
    [action.agentId, policy.expectedAgentId, "AGENT_MISMATCH"],
    [action.authorityId, policy.expectedAuthorityId, "AUTHORITY_MISMATCH"],
    [action.asset, policy.expectedAsset, "ASSET_MISMATCH"],
    [action.payloadHash, policy.expectedPayloadHash, "PAYLOAD_HASH_MISMATCH"],
    [action.idempotencyKey, policy.expectedIdempotencyKey, "IDEMPOTENCY_KEY_MISMATCH"],
  ];
  for (const [actual, expected, reasonCode] of bindings) {
    const failure = denyIfDifferent(actual, expected, reasonCode);
    if (failure) return failure;
  }
  if (policy.allowedRails.length === 0 || !policy.allowedRails.includes(action.rail)) {
    return { outcome: "DENY", reasonCode: "RAIL_NOT_ALLOWED" };
  }
  if (policy.allowedRecipients.length === 0 || !policy.allowedRecipients.includes(action.recipient)) {
    return { outcome: "DENY", reasonCode: "RECIPIENT_NOT_ALLOWED" };
  }
  if (policy.requirePurpose && !action.purpose?.trim()) {
    return { outcome: "DENY", reasonCode: "PURPOSE_REQUIRED" };
  }

  const amount = parseMicros(action.amountMicros, "AMOUNT_MICROS");
  const perAction = parseMicros(policy.maxPerActionMicros, "MAX_PER_ACTION_MICROS");
  const daily = parseMicros(policy.maxDailyMicros, "MAX_DAILY_MICROS");
  const spent = parseMicros(alreadySpentMicros, "ALREADY_SPENT_MICROS");
  if (typeof amount !== "bigint") return amount;
  if (typeof perAction !== "bigint") return perAction;
  if (typeof daily !== "bigint") return daily;
  if (typeof spent !== "bigint") return spent;
  if (amount === 0n) return { outcome: "DENY", reasonCode: "ZERO_AMOUNT" };
  if (amount > perAction) return { outcome: "DENY", reasonCode: "PER_ACTION_CAP_EXCEEDED" };
  if (spent > daily || amount > daily - spent) return { outcome: "DENY", reasonCode: "DAILY_CAP_EXCEEDED" };

  if (policy.stepUpAtMicros !== undefined) {
    const stepUpAt = parseMicros(policy.stepUpAtMicros, "STEP_UP_AT_MICROS");
    if (typeof stepUpAt !== "bigint") return stepUpAt;
    if (amount >= stepUpAt) return { outcome: "STEP_UP", reasonCode: "STEP_UP_REQUIRED" };
  }
  return { outcome: "ELIGIBLE", reasonCode: "LOCAL_POLICY_ELIGIBLE" };
}
