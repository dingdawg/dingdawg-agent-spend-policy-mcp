# Public ICM router

This is the public, product-level entry point for the DingDawg Agent Spend
Policy MCP. It uses the same narrow-context idea as MiLA's ICM workflow while
keeping MiLA's internal prompts, model routing, and policy logic private.

Load exactly one stage for a task:

| Need | Load |
|---|---|
| Verify what this package can and cannot do | `010-public-contract/CONTEXT.md` |
| Validate this package before release | `010-public-contract/done.sh`, then `verify.sh` |

The public contract is deliberately limited to observable behavior. It is not
payment authorization, custody, settlement, signing, or a disclosure of the
private DingDawg or MiLA decision system.
