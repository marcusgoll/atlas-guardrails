<div align="center">

# Atlas Guardrails 🗺️

**Stop LLM agents from turning your codebase into a landfill.**

[![npm version](https://img.shields.io/npm/v/atlas-guardrails.svg?style=flat-square)](https://www.npmjs.com/package/atlas-guardrails)
[![Build Status](https://img.shields.io/github/actions/workflow/status/marcusgoll/atlas-guardrails/ci.yml?branch=main&style=flat-square)](https://github.com/marcusgoll/atlas-guardrails/actions)
[![License](https://img.shields.io/npm/l/atlas-guardrails.svg?style=flat-square)](LICENSE)
[![Downloads](https://img.shields.io/npm/dm/atlas-guardrails.svg?style=flat-square)](https://www.npmjs.com/package/atlas-guardrails)

[Quick Start](#quick-start) •
[Features](#features) •
[MCP Support](#mcp-support) •
[Contributing](#contributing)

</div>

---

## The Problem

Coding agents (Claude Code, Cursor, Windsurf) are fast, but they have the memory of a goldfish. They:
1.  **Re-invent the wheel**: Creating `utils/date.ts` when `lib/time.ts` already exists.
2.  **Hallucinate APIs**: Guessing method signatures instead of looking them up.
3.  **Drift APIs**: Changing public exports without you realizing it until CI explodes.

## The Solution: Atlas

Atlas is a **local-first guardrail** that forces agents to "read the map" before they write code. It indexes your repo, packs relevant context deterministically, and screams at agents when they try to duplicate code or break APIs.

## Installation & Integration 🤖

Atlas is built for **AI Agents**, not humans. To give your agent "eyes" into your repository, choose your client below:

<details>
<summary><b>Gemini CLI</b></summary>

Install Atlas as a native extension:
```bash
gemini extensions install https://github.com/marcusgoll/atlas-guardrails
```

**If installation fails**, add it as a manual MCP extension:
```bash
gemini mcp add atlas -- command npx -y atlas-guardrails mcp
```
**Capabilities added:** `atlas_index`, `atlas_pack`, `atlas_find_duplicates`.
</details>

<details>
<summary><b>Claude Code</b></summary>

Install Atlas as a native skill:
```bash
claude extensions install https://github.com/marcusgoll/atlas-guardrails
```
Claude will automatically utilize `SKILL.md` and `CLAUDE.md` context to manage your repo entropy.
</details>

<details>
<summary><b>Cursor / Windsurf</b></summary>

Add Atlas as an **MCP Server** in your IDE settings:

1. Open **Settings** -> **Features** -> **MCP**.
2. Click **+ Add Server**:
   - **Name**: `Atlas`
   - **Type**: `command`
   - **Command**: `npx -y atlas-guardrails mcp`
</details>

<details>
<summary><b>Claude Desktop</b></summary>

Add Atlas to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "atlas": {
      "command": "npx",
      "args": ["-y", "atlas-guardrails", "mcp"]
    }
  }
}
```
</details>

---

## Agent Workflow

Once installed, your AI agent will follow this deterministic loop:

1.  **Map the Terrain**: Agent calls `atlas_index` to build/update the symbol graph.
2.  **Gather Context**: Agent calls `atlas_pack` with your task description. It receives a token-optimized pack of relevant files and their dependency trails.
3.  **Prevent Duplication**: Before the agent writes a new helper, it calls `atlas_find_duplicates` to see if the code already exists.
4.  **Enforce Guardrails**: Agent runs `atlas check` (or you run it in CI) to ensure no public API drift occurred.

---

## Documentation & Specs

*   [INTEGRATION.md](./INTEGRATION.md) - Full MCP & API Schema.
*   [CLAUDE.md](./CLAUDE.md) - Instruction set for Claude.
*   [GEMINI.md](./GEMINI.md) - Instruction set for Gemini.
*   [API Documentation](./docs/index.html) - TypeDoc output.

## Contributing

We aim for **>80% test coverage** to keep the guardrails stable.
1. Fork & Clone.
2. `npm install`
3. `npm test`
4. PR.

## License

MIT © [Marcus Gollahon](https://github.com/marcusgoll)
