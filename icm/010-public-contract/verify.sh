#!/usr/bin/env bash
set -euo pipefail

STAGE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$STAGE_DIR/../.." && pwd)"

# Independent release check: inspect the actual npm tarball file list, not the
# source-tree existence test performed by done.sh.
PACK_LIST="$(cd "$ROOT_DIR" && npm pack --dry-run --ignore-scripts 2>&1)"
printf '%s\n' "$PACK_LIST" | grep -q 'icm/010-public-contract/contract.json'
printf '%s\n' "$PACK_LIST" | grep -q 'icm/010-public-contract/done.sh'

# Public artifacts may explain their safety boundary (for example, "no custody")
# but must not expose actual secrets, private host paths/endpoints, or policy
# mechanics that would make reverse engineering easier.
if rg -n -i --glob '!verify.sh' '(/home/|sk_(live|test)_|pk_(live|test)_|whsec_|api\.dingdawg\.com|DINGDAWG_API_KEY=|keyword.?weight|score.?threshold)' "$ROOT_DIR/icm"; then
  echo "FAIL: public ICM folder contains a prohibited implementation disclosure" >&2
  exit 1
fi

echo "PASS: packaged ICM contract is present and public boundary scan is clean"
