# Releasing

Every release must have a unique semantic version and a human-readable entry in
`CHANGELOG.md`.

Before publishing, run:

```bash
npm ci
npm run lint
npm test
npm audit --omit=dev --audit-level=high
npm run pack:check
```

Review the packed-file list for secrets and internal paths. Publish to npm only
after these checks pass, then publish the matching `server.json` through the
official MCP Registry publisher. Do not claim an OpenSSF badge until the badge
site has accepted a truthful self-certification.
