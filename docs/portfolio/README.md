# Curated Project Knowledge

Curated Project Knowledge is the reviewed Markdown source for Hiraya Guide. These files explain only the **Hiraya microservice project**: the Vintage Storefront workload, its AWS EKS platform, CI/CD path, GitOps delivery model, security gates, and operating assumptions.

The deploy workflow stages exactly these six files, syncs them to the Bedrock Knowledge Base S3 knowledge prefix, and excludes this README.

The curated set is:

- `PROJECT_BRIEF.md`
- `ARCHITECTURE.md`
- `CICD.md`
- `SECURITY_GATES.md`
- `TEAM_ROLES.md`
- `DECISIONS.md`

These documents should stay polished but truthful. They may explain target-state ideas when clearly labeled, but they should not claim live operational access, formal compliance, production readiness, or implementation work that the repository does not support.

Validate the curated set from the repository root with the Portfolio knowledge command in [`../references/commands.md#portfolio`](../references/commands.md#portfolio).

The validator checks required frontmatter, the expected user / technical reviewer audience, expected categories, non-empty Markdown body content, and lightweight Markdown lint rules. It does not change the Vintage Storefront `app:baseline` command.
