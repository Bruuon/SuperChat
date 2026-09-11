# SuperChat

Spring Boot 3.5 / Java 17 multi-module Maven project (`com.bruon`). Modules:
`UserService` (8104, JWT auth), `AiService` (8105, LangChain4j + DashScope,
pgvector RAG, MCP tools), `GateWay` (10010), `RedPacketService`,
`OfflineDataService`, `RealTimeService`, `Common`.

## Language

- Always reply to the user in Chinese (中文). Explanations, questions, summaries
  and any conversational text must be in Chinese.
- The only exception is commit messages, which must be written in English
  (see below).

## Commit message convention

All commit messages MUST follow the Conventional Commits spec and be written
in English only.

Format:

```
<type>(<optional scope>): <short summary>

<body line 1>
<body line 2>
<body line 3>
<body line 4>
```

Rules:
- `type` is one of: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`,
  `build`, `ci`, `perf`, `style`.
- Summary line: a 4-5 word imperative phrase describing what the commit does
  (e.g. `feat(user): add JWT refresh endpoint`). Lowercase, no trailing period,
  under 72 characters.
- Body: 4-5 lines, each a concrete statement of what was implemented or
  changed and why. Plain sentences or `-` bullets, wrapped at 72 characters.
- Leave one blank line between the summary and the body.
- Never include Chinese or other non-English text in commit messages.

## Security note

`application*.yml` files under each module contain real database, Redis and
SMTP credentials. Do not commit new secrets; prefer environment variables or
an untracked `application-local.yml`.
