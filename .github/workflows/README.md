# GitHub Actions workflows

## Scoped `GITHUB_TOKEN` for repository writes

Workflows that commit back to this repository should avoid persisting write-scoped checkout credentials for the whole job.

Use this pattern:

```yaml
permissions:
  contents: write

steps:
  - uses: actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10 # v6
    with:
      persist-credentials: false

  - name: Commit and push changes
    env:
      GITHUB_TOKEN: ${{ github.token }}
    shell: bash
    run: |
      set -euo pipefail
      git -c "http.https://github.com/.extraheader=AUTHORIZATION: bearer ${GITHUB_TOKEN}" fetch origin main
      git -c "http.https://github.com/.extraheader=AUTHORIZATION: bearer ${GITHUB_TOKEN}" push origin HEAD:main
```

Why:

- `permissions: contents: write` grants only the job that needs repository writes the ability to push.
- `persist-credentials: false` prevents `actions/checkout` from leaving the token available to every later step.
- `${{ github.token }}` is GitHub Actions' ephemeral `GITHUB_TOKEN` for the current workflow run; no PAT or long-lived secret is needed.
- `git -c ...extraheader=...` injects the token only for that single `git fetch` or `git push` command instead of storing it in git config.

Current users: `image-ci.yml` and `gitops-manifests-update.yml`.
