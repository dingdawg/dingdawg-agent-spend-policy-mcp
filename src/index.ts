#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { evaluatePolicy } from "./policy.js";

const micros = z.string().regex(/^\d+$/, "must be an unsigned integer micro-unit string");
const identifier = z.string().min(1);
const policySchema = z.object({
  expectedPrincipalId: identifier,
  expectedAgentId: identifier,
  expectedAuthorityId: identifier,
  expectedAsset: identifier,
  expectedPayloadHash: identifier,
  expectedIdempotencyKey: identifier,
  allowedRails: z.array(identifier).min(1),
  allowedRecipients: z.array(identifier).min(1),
  maxPerActionMicros: micros,
  maxDailyMicros: micros,
  stepUpAtMicros: micros.optional(),
  requirePurpose: z.boolean().optional(),
});
const actionSchema = z.object({
  principalId: identifier,
  agentId: identifier,
  authorityId: identifier,
  rail: identifier,
  asset: identifier,
  recipient: identifier,
  purpose: z.string().optional(),
  payloadHash: identifier,
  idempotencyKey: identifier,
  amountMicros: micros,
  expiresAt: z.string().datetime({ offset: true }),
});

const server = new McpServer({
  name: "DingDawg Agent Spend Policy",
  version: "0.1.0",
});

server.registerTool(
  "evaluate_spend_policy",
  {
    title: "Evaluate agent spend-policy eligibility",
    description:
      "Deterministically evaluates a proposed action against caller-supplied policy. This is local policy evidence only: it never authorizes, signs, sends, settles, custodies, or records a payment.",
    inputSchema: {
      evaluationTime: z.string().datetime({ offset: true }),
      policy: policySchema,
      action: actionSchema,
      alreadySpentMicros: micros,
    },
    outputSchema: {
      outcome: z.enum(["ELIGIBLE", "DENY", "STEP_UP"]),
      reasonCode: z.string(),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ evaluationTime, policy, action, alreadySpentMicros }) => {
    const result = evaluatePolicy(evaluationTime, policy, action, alreadySpentMicros);
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
      structuredContent: { ...result },
    };
  },
);

await server.connect(new StdioServerTransport());
