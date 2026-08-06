#!/usr/bin/env bash
set -euo pipefail

STAGE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$STAGE_DIR/../.." && pwd)"

for file in "$ROOT_DIR/capabilities.json" "$STAGE_DIR/contract.json" "$STAGE_DIR/NEXT"; do
  test -s "$file"
done

node - "$STAGE_DIR/contract.json" <<'NODE'
const fs = require("fs");
const contract = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const required = ["schema_version", "contract_id", "scope", "tool", "outcomes", "side_effects", "network_access", "payment_authority", "custody", "secret_sauce_disclosure", "evidence"];
for (const key of required) if (!(key in contract)) throw new Error(`missing ${key}`);
if (contract.tool !== "evaluate_spend_policy") throw new Error("unexpected tool");
if (JSON.stringify(contract.outcomes) !== JSON.stringify(["ELIGIBLE", "DENY", "STEP_UP"])) throw new Error("unexpected outcomes");
if (contract.side_effects !== "none" || contract.network_access !== false || contract.payment_authority !== false || contract.custody !== false || contract.secret_sauce_disclosure !== false) throw new Error("unsafe public boundary");
NODE

echo "PASS: deterministic public ICM contract is structurally valid"
