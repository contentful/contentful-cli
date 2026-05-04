# Yargs as CLI Framework

## Status

Accepted

## Context

When the CLI was created in 2017 (`feat(init): A new beginning`), a framework was needed to handle command parsing, argument validation, help generation, and hierarchical subcommand routing (e.g., `contentful space environment create`).

The major options at the time were yargs, commander, and oclif. Yargs was widely adopted, lightweight, and supported the nested command pattern (`commandDir`) that maps well to the CLI's file-based command structure.

## Decision

Use yargs (~13.3.2) as the CLI framework. Commands are organized as files in `lib/cmds/`, with subcommands in `lib/cmds/<parent>_cmds/` directories. Yargs auto-discovers these via its `commandDir` pattern.

The version is pinned to the 13.x range. Upgrading has not been prioritized since the current version is stable and meets all requirements.

## Consequences

- The `lib/cmds/` directory structure directly maps to the CLI's command hierarchy, making it easy to find and add commands
- Yargs 13.x is significantly behind current versions (17.x) — a major version bump would require updating all command definitions
- The pinned version means some newer yargs features (middleware improvements, async completions) are unavailable
- Interactive prompts are handled separately via `inquirer`, not yargs
