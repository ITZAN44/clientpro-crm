# CLAUDE.md — Operating Rules

> `AGENTS.md` describes **how the project is built** (commands, style, structure, git).
> This file defines **how you are allowed to work** in it. Read both. Do not duplicate them.

---

## 0. Ground truth ranking (non-negotiable)

When two sources disagree about what exists, trust them in this exact order:

1. **Committed code** — `git show HEAD:<path>` and the schema/lockfiles
2. **Runtime** — a container/process you personally rebuilt from the current source
3. **Uncommitted working tree** — *suspect until proven otherwise*
4. **Documentation** (`AGENTS.md`, `docs/**`, plan files) — **lowest**. Treat as a lead, never as evidence.

Docs in this repo are **verifiably stale**. As of 2026-07-16, `AGENTS.md` lists enum values
that do not exist in `backend/prisma/schema.prisma` (`CALIFICACION`, `CERRADO_GANADO`,
`CERRADO_PERDIDO`, `COP`) and claims tests are unimplemented when 138 pass. Writing code from
that doc produces code that does not compile against the real schema.

**Never state that something is missing, broken, or unimplemented based on a doc.**
Verify against committed code first, or say "unverified".

---

## 1. Audit before you touch (MANDATORY)

Before proposing, implementing, or "fixing" anything, run this and report it:

```bash
git status --short                    # what is dirty?
git log --oneline -10                 # what recently landed?
git show HEAD:<file>                  # what does the committed version say?
git diff HEAD -- <file>               # what did someone change but not commit?
```

**Hard stop rule:** if `git status` is dirty, the working tree is a crime scene, not a baseline.
Uncommitted changes may be someone else's abandoned or destructive work. Report the diff and
**ask before building on top of it**.

This is not optional even when the task "looks small". This exact step being skipped is what
caused an entire remediation cycle to be built on a false premise: `HEAD` already had helmet,
throttler, terminus, winston and metrics wired, while the dirty working tree had gutted them.
Nobody ran `git show HEAD:backend/package.json`. Ten seconds would have caught it.

---

## 2. Does it already exist? (anti-duplication)

Before writing ANY new module, dependency, config, endpoint, util, or doc:

```bash
git show HEAD:backend/package.json | rg "<lib>"    # is the dep already there?
rg "<SymbolOrDecorator>" backend/src frontend/src  # is it already wired?
ls backend/src/                                     # does the module already exist?
```

Concrete checks, by kind of thing:

- **Dependency** → `HEAD:package.json`, both `backend/` and `frontend/`
- **NestJS wiring** → `HEAD:backend/src/app.module.ts` (providers, `APP_GUARD`, imports)
- **Module/endpoint** → `ls backend/src/` and `rg "@Controller\('<name>'\)"`
- **Component/util** → `rg` the symbol name across `frontend/src`
- **Doc** → `ls` the target directory before creating a new file

If it already exists: **say so and stop.** Do not "re-add it properly". Do not rewrite it to your
taste. The correct output is a report, not a diff.

---

## 3. Scope from the symptom outward

Do not read the codebase to "understand the project". Start at the observable symptom and walk
outward only as far as the evidence pulls you:

1. Reproduce the symptom (a request, a test, a screen).
2. `rg` the literal string, error, field, or endpoint from that symptom.
3. Follow only the files on that path.
4. Stop when you can explain the symptom. Report the map before changing anything.

Reading 4+ files to build general context means the scope was never defined. Ask for a symptom.

---

## 4. Sequence discipline

Auditing and fixing are **separate phases with a stop between them**.

```
AUDIT → report → wait for approval → FIX → verify → report
```

Crossing from audit into fix without an explicit go-ahead is a process failure, even if the fix
turns out correct. When you find something during an audit, write it down and keep auditing.

---

## 5. Verify against what is actually deployed

A green test suite is not proof the running system has your change.

- After changing backend deps or `app.module.ts` → **rebuild the container**, do not restart it.
- Verify against a build **you** just produced. A stale container corroborates stale beliefs —
  that is precisely how the false premise above survived so long.
- Compiled output lives at `/app/dist/src/*.js` (nested), not `/app/dist/*.js`.
- The backend has **no global `api` prefix**. Routes are at root (`/health`, `/auth/login`).
  `/api` is nginx-only and is stripped by the proxy. Testing `:4000/api/...` gives false 404s.
- NestJS guards do **not** run on unmatched (404) routes. Rate-limit tests must hit a real route.

---

## 6. Documentation changes

Documentation is only updated from **verified code reading**, never from other documentation and
never from memory. If you cannot cite the file and line you read, do not write the doc.

Stale-doc cleanup is tracked as REM-010 in `docs/remediacion/PLAN-DE-REMEDIACION.md`. Until then,
assume every doc in this repo is guilty until proven innocent.

---

## 7. Never commit

`.env.docker` · `backup_local_db.sql` · `backend/logs-backend*.txt` · `.atl/` · `.opencode/` ·
`bash.exe.stackdump` — secrets, dumps, and local noise. Check `git status` before every `git add`.
Never use `git add .` with a dirty tree you did not audit.

---

## 8. Reporting

When reporting an audit, state each claim with its evidence and its confidence:

- **Verified** — "`HEAD:backend/src/app.module.ts:42` wires `ThrottlerGuard` as `APP_GUARD`."
- **Unverified** — "The plan claims X; I have not confirmed it against code."

Never blend the two. "I think it's missing" and "it is missing" are different statements, and only
one of them is allowed to trigger work.
