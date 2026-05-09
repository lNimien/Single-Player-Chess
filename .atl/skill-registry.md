# Skill Registry

Generated for `C:\Proyectos\ChessWebsite` during `sdd-init`.

## Project Conventions Sources
- `C:\Proyectos\ChessWebsite\AGENTS.md`

## Active Project Conventions (Compact)
- Follow SDD lifecycle: `explore → propose → spec → design → tasks → apply → verify → archive`.
- Spec-first rule: update spec/design artifacts before implementation.
- TDD is expected for all substantial work; keep tests with implementation.
- `src/logic/` and `src/state/` must remain framework-agnostic.
- Plain CSS only; Tailwind is explicitly disallowed.
- TypeScript strict discipline: avoid `any` unless justified.
- Keep commits as small logical work units and avoid mixed unrelated changes.

## Discovered Skills (deduped, non-SDD)

### codebase-navigator
- **Path**: `C:\Users\marcf\.config\opencode\skills\codebase-navigator\SKILL.md`
- **Trigger**: Questions like “where is…”, “how does…”, implementation lookup.
- **Rules**:
  - Prefer semantic code search workflow for code-location questions.
  - Refresh or sync index before semantic search.
  - Do not dump raw search output; synthesize with file/line references.

### vercel-react-best-practices
- **Path**: `C:\Users\marcf\.config\opencode\skills\vercel-react-best-practices\SKILL.md`
- **Trigger**: Writing/reviewing/refactoring React code and performance work.
- **Rules**:
  - Prioritize waterfall elimination and bundle-size reductions.
  - Use memoization and dependency hygiene only when it reduces real rerenders.
  - Favor server/client data-fetching patterns that avoid serial waits.

### web-design-guidelines
- **Path**: `C:\Users\marcf\.config\opencode\skills\web-design-guidelines\SKILL.md`
- **Trigger**: UI/accessibility/UX audits and guideline checks.
- **Rules**:
  - Fetch latest guidelines before each review.
  - Report findings with exact file:line evidence.

### work-unit-commits
- **Path**: `C:\Users\marcf\.config\opencode\skills\work-unit-commits\SKILL.md`
- **Trigger**: Commit splitting, PR scoping, review workload control.
- **Rules**:
  - One commit = one deliverable behavior/fix/docs unit.
  - Keep tests/docs with the related behavioral change.
  - Split early when forecasted review size becomes high.

### branch-pr
- **Path**: `C:\Users\marcf\.config\opencode\skills\branch-pr\SKILL.md`
- **Trigger**: Creating/opening/preparing pull requests.
- **Rules**:
  - PRs require approved issue linkage and one `type:*` label.
  - Enforce branch naming format and PR template completeness.

### caveman
- **Path**: `C:\Users\marcf\.agents\skills\caveman\SKILL.md`
- **Trigger**: User asks for compressed/token-efficient communication.
- **Rules**:
  - Use concise reduced-language mode only when explicitly requested.

## Excluded by Rule
- All `sdd-*` skills, `_shared`, and `skill-registry` (excluded by init registry policy).
