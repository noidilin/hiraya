# Root pnpm workspace

- Status: Accepted
- Current reference: [Command reference](../references/commands.md)
- Supersedes: earlier nested `app/microservices` workspace model
- Superseded by: none

Hiraya uses the repository root as the single pnpm workspace for app packages and repository automation. This replaces the earlier nested `app/microservices` workspace because `.github/scripts` participates in app baseline planning, image CI, GitOps assertions, and governance reports, so keeping a separate app-owned tooling boundary made ownership unclear. A single root lockfile gives CI one toolchain and makes repository-level automation first-class while avoiding scattered compatibility wrappers.
