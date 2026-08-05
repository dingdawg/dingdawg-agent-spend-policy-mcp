# Contributing

Thank you for improving DingDawg Agent Spend Policy MCP.

1. Open an issue before proposing a material change.
2. Create a focused pull request with a clear problem statement and rollback
   note when behavior changes.
3. Run `npm test`, `npm run lint`, and `npm run pack:check` before requesting
   review.
4. Add automated tests for every new behavior and every corrected defect.
5. Do not add payment execution, custody, credential handling, or network
   access to this package. Those are separate, high-risk systems.

Contributions must preserve exact integer money handling, explicit outcome
codes, default-deny policy behavior, and the documented safety boundary.
