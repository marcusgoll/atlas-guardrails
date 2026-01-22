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

## Installation

### 🤖 Agent Extension Install (Recommended)
Install Atlas directly into your favorite AI agent CLI:

| Platform | Command |
| :--- | :--- |
| **Gemini CLI** | `gemini extensions install https://github.com/marcusgoll/atlas-guardrails` |
| **Claude Code** | `claude extensions install https://github.com/marcusgoll/atlas-guardrails` |
| **OpenCode** | [Manual Setup](#mcp-support) |
| **Cursor** | [Manual Setup](#mcp-support) |
| **Codex** | [MCP Config](#mcp-support) |

### 💻 CLI Install
To use Atlas as a standalone terminal tool:
```bash
npm install -g atlas-guardrails
```

### 🛠️ Developer Install (Source)
```bash
git clone https://github.com/marcusgoll/atlas-guardrails.git
cd atlas-guardrails
npm install && npm run build && npm link
```

## Usage
Run this once (and after major changes) to build the map.
```bash
atlas index
```

### 3. Use It
**Pack context for a task** (saves tokens, improves accuracy):
```bash
atlas pack -t "fix the login bug in auth service"
# Outputs: pack.json (feed this to your LLM)
```

**Find duplicates** (before you create new code):
```bash
atlas find-duplicates -i "Button"
# Returns: Existing Button components so you don't make another one.
```

**Check for drift** (in CI):
```bash
atlas check
# Returns: Exit code 1 if public API drifted or index is stale.
```

---

## Features

### 🧠 Smart Context Packing
Don't dump your whole repo into the prompt. `atlas pack` uses recursive graph traversal (Keyword → Symbol → File → Imports) to find *exactly* what's needed for a task within a strict token budget.

### 🛑 Anti-Duplication
Stop the "5 different uuid helper functions" problem.
`atlas find-duplicates` scans your symbol database for code that matches your *intent*, not just the name.

### 🚧 API Drift Gates
`atlas check` freezes your public API surface. If an agent modifies an exported function signature without updating the `approved_api.json` baseline, the build fails.

### 🤖 Native MCP Support
Atlas works out-of-the-box with **Claude Desktop**, **Claude Code**, and **Cursor** via the [Model Context Protocol](https://modelcontextprotocol.io).

See [INTEGRATION.md](./INTEGRATION.md) for full technical specs.

**Claude Desktop Config:**
```json
{
  "mcpServers": {
    "atlas": {
      "command": "atlas",
      "args": ["mcp"]
    }
  }
}
```

### 🧠 Agent Context Files
Atlas provides context prompts to teach LLMs how to use it:
*   [CLAUDE.md](./CLAUDE.md) for Claude Code.
*   [GEMINI.md](./GEMINI.md) for Gemini CLI.

### 🎩 Ralphy Integration
Use [Ralphy](https://github.com/michaelshimeles/ralphy)? Atlas generates your config automatically.
```bash
atlas ralphy-init
```

---

## Contributing

Got a better way to stop entropy? PRs are welcome.

1.  Fork it.
2.  `npm install`
3.  `npm test` (Maintain >80% coverage or the golem gets angry)
4.  Push it.

## License

MIT © [Marcus Gollahon](https://github.com/marcusgoll)
