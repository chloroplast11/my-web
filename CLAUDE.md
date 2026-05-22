# CLAUDE.md

## General Principles

- Prefer simple, maintainable solutions.
- Avoid over-engineering.
- Keep functions small and focused.
- Prioritize readability over cleverness.
- Refactor duplicated logic when appropriate.
- Preserve existing architecture unless asked to redesign.

---

## Code Style

- Write self-documenting code.
- Use clear variable and function names.
- Add comments only when necessary.
- Keep files reasonably modular.
- Avoid large files with mixed responsibilities.

---

## Workflow

- Before major changes, explain the plan briefly.
- After changes, summarize what was modified.
- When debugging, identify root cause before patching.
- If uncertain, inspect surrounding code patterns first.
- Prefer incremental changes over full rewrites.

---

## Safety Rules

- Do not delete unrelated code.
- Do not change environment/config files unless necessary.
- Do not introduce new dependencies without justification.
- Confirm before making irreversible changes.

---

## Testing

- Prefer fixing failing tests over bypassing them.
- Do not mock excessively unless required.

---

## Git

- Make atomic commits.
- Write concise commit messages.
- Avoid committing generated files unless required.

---

## Environment Configuration
- Store all user-provided configuration values in the `.env` file.
- Do not hardcode secrets, API keys, tokens, URLs, or credentials.
- If new configuration is required, add it to `.env.example`.

---

## Communication

- Be concise and technical.
- State assumptions clearly.
- Mention tradeoffs when relevant.