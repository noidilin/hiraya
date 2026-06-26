# Curated Project Knowledge

Curated Project Knowledge is the reviewed Markdown source for Hiraya Guide. These files are written for Portfolio Visitors and are intended to be synced to the Bedrock Knowledge Base in a later workflow slice.

The starter pack is:

- `PROJECT_BRIEF.md`
- `ARCHITECTURE.md`
- `CICD.md`
- `SECURITY_GATES.md`
- `TEAM_ROLES.md`
- `DECISIONS.md`

Validate the starter pack from the repository root:

```sh
pnpm run portfolio:knowledge:validate
```

The validator checks required frontmatter, the `portfolio_visitor` audience, expected categories, non-empty Markdown body content, and lightweight Markdown lint rules. It does not change the Vintage Storefront `app:baseline` command.
