# Vintage Storefront

React 19/Vite implementation for the Vintage Storefront, packaged as the existing `frontend` workspace service. Run commands from the repository root so the single root pnpm lockfile remains the source of truth.

## Commands

Use the Vintage Storefront and Docker Compose commands in [`../../../docs/references/commands.md`](../../../docs/references/commands.md#vintage-storefront). Default Compose serves the production build through nginx on `http://localhost:3000` with SPA fallback and `/api/` proxying to the gateway. The `frontend-dev` Compose profile runs Vite hot reload on the same port against the Compose gateway.

## UI System

- shadcn/ui is initialized with the `radix-nova` style in `components.json`.
- Tailwind CSS v4 is wired through `@tailwindcss/vite`.
- shadcn primitives live in `src/components/ui`.
- Motion Primitives components live in `src/components/motion-primitives`.
- The first Motion Primitives component installed is `text-effect`.

## Codex MCP

The shadcn MCP server has been added to `~/.codex/config.toml`:

```toml
[mcp_servers.shadcn]
command = "npx"
args = ["shadcn@latest", "mcp"]
```

Restart Codex to load the new MCP server.
