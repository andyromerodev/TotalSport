---
name: commit-message
description: Generate and apply a git commit for the current staged or unstaged changes in TotalSport/ALKILO. Writes a concise commit message following project conventions. Never adds Co-Authored-By, co-author, or author attribution lines.
---

Generate and execute a git commit for the current changes. Follow these rules strictly.

## Commit Message Format

```
<type>(<scope>): <short description>
```

- **type**: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `perf`
- **scope**: optional, 1-2 words (e.g. `vue`, `catalog`, `admin`, `ci`, `build`)
- **description**: imperative, lowercase, max 72 chars, no period at end

Multi-line body is allowed when the change needs context. Separate with a blank line.

## Rules

1. **NEVER** add `Co-Authored-By`, `co-author`, `Author`, or any attribution lines — not in the body, not as a trailer, not anywhere.
2. **NEVER** add `🤖 Generated with...` or any AI tool disclosure lines.
3. Keep the subject line under 72 characters.
4. Use imperative mood: "add", "fix", "remove", "migrate", "extract" — not "added", "fixed".
5. Describe **what** changed and **why**, not how.
6. If multiple unrelated things changed, split into separate commits when possible.

## Examples

Good:
```
feat(vue): add routes layer to thin Astro page shells
refactor(catalog): extract use cases to application layer
fix(build): exclude CLAUDE.md from Astro page routing
chore(skills): add clean-architecture skill with SOLID guide
```

Bad (never do this):
```
feat(vue): add routes layer

Co-Authored-By: Claude <noreply@anthropic.com>   ← NEVER
🤖 Generated with Claude Code                     ← NEVER
Added the routes layer (past tense)               ← use imperative
```

## Steps to Execute

1. Run `git status` to identify changed files
2. Run `git diff` (or `git diff --cached`) to understand the changes
3. Select files to stage — prefer specific file names over `git add .`
4. Write the commit message following the format above
5. Run `git commit -m "..."` using a heredoc for multi-line messages
6. Run `git status` to confirm the commit succeeded
7. **Do NOT push** — the user handles push manually
