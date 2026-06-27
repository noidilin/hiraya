# Curated Project Knowledge

Curated Project Knowledge is the reviewed Markdown source for Hiraya Guide. These files are written for Portfolio Visitors. The deploy workflow stages exactly these six files, syncs them to the Bedrock Knowledge Base S3 knowledge prefix, and excludes this README.

The curated set is:

- `PROJECT_BRIEF.md`
- `ARCHITECTURE.md`
- `CICD.md`
- `SECURITY_GATES.md`
- `TEAM_ROLES.md`
- `DECISIONS.md`

Validate the curated set from the repository root:

```sh
pnpm run portfolio:knowledge:validate
```

The validator checks required frontmatter, the `portfolio_visitor` audience, expected categories, non-empty Markdown body content, and lightweight Markdown lint rules. It does not change the Vintage Storefront `app:baseline` command.
