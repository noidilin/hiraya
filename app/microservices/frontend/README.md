# Hiraya FE

React 19 frontend foundation using pnpm, TypeScript, Vite, TanStack Router,
TanStack Query, shadcn/ui, Motion Primitives, Zod, Zustand, and nuqs.

## Commands

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
```

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
