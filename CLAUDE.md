# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Homework project for the it-incubator.io back-end bootcamp: a NestJS 12 REST API (bloggers platform: blogs, posts, comments, users) backed by **PostgreSQL via TypeORM** (`@nestjs/typeorm` + `pg`). Package manager is **pnpm**.

## Commands

```bash
docker compose up -d           # start Postgres 17 on :5432
pnpm start:dev                 # run with watch (port: $PORT or 5005)
pnpm build                     # nest build -> dist/
pnpm lint                      # oxlint --type-aware over src/ and test/
pnpm format                    # prettier (single quotes, trailing commas)
pnpm test                      # unit tests (vitest, **/*.spec.ts)
pnpm test:e2e                  # e2e tests (vitest, **/*.e2e-spec.ts, uses supertest)
pnpm vitest run src/path/to/file.spec.ts   # single unit test file
pnpm vitest run -t "test name"             # tests matching a name
pnpm test:e2e test/app.e2e-spec.ts         # single e2e file
```

`test.http` holds manual requests (REST Client format) against `localhost:5005`.

## Tooling gotchas

- **ESM + `nodenext`**: `package.json` has `"type": "module"` and tsconfig uses `module`/`moduleResolution: nodenext`. Relative imports **must** include the `.js` extension (e.g. `import { X } from './x.service.js'`), even though the source is `.ts`. Top-level `await` is used in `src/main.ts`.
- **ESM + TypeORM relations**: use `type Relation<T>` from `typeorm` for relation properties (e.g. `post: Relation<Post>`) to avoid circular-import issues between entity files.
- Tests use Vitest (not Jest) with `globals: true` — `describe`/`it`/`expect`/`vi` are global. Unit and e2e use separate configs (`vitest.config.ts`, `vitest.config.e2e.ts`).
- Linting is oxlint, not ESLint. `no-floating-promises` is an error; `no-explicit-any` is off.
- **DB credentials mismatch**: `TypeOrmModule.forRoot` in `src/app.module.ts` is hardcoded (`postgres` / `pass123`, database `postgres`), while `docker-compose.yml` creates `postgres` / `postgres`, database `nest`. Align them before expecting the app to connect. `synchronize: true` auto-creates tables from entities (no migrations).

## Architecture

App bootstrap: `src/main.ts` creates the app and calls `appSetup()` (`src/app.setup.ts`), which wires per-concern setup from `src/setup/`. Currently only `pipesSetup` is active — a global `ValidationPipe({ transform: true })`, which query/body DTOs rely on to apply class defaults. Global prefix and Swagger (`swagger.setup.ts`, served at `/api`) are still commented out.

Shared code lives in `src/core/dto/`: `BaseQueryParams` (pagination/sorting with defaults, `calculateSkip()`, `SortDirection`) and `PaginatedViewDto.mapToView(...)` for paginated responses.

`src/testing/testing.controller.ts` exposes `DELETE /testing/all-data` (used by the bootcamp test suite to wipe the DB) — currently a stub.

Feature modules live in `src/modules/<feature>/` and are imported into `src/app.module.ts`:

- `user-accounts/` — users and security devices (sessions). `auth.controller.ts` and `security-devices.controller.ts` are empty placeholders; auth-related user fields are commented out in `user.entity.ts`.
- `bloggers-platform/` — blogs, posts, comments, and post/comment likes

Each module is layered by folder:

- `domain/` — TypeORM entities (`@Entity`/`@Column`, uuid primary keys via `@PrimaryGeneratedColumn('uuid')`, `timestamptz` dates). Registered with `TypeOrmModule.forFeature([...])` in the feature module; `autoLoadEntities` picks them up.
- `api/` — controllers (`*.controller.ts`)
- `dto/` — request/response DTOs; view DTOs expose a static `mapToView(entity)`
- `application/` — services with business logic (`*-service.ts`)
- `infrastructure/` — repositories injecting `Repository<Entity>` via `@InjectRepository`, with read-side `*.query-repository.ts` split from write-side `*.repository.ts` (CQRS-style: a service performs the command and returns an id, then the controller returns the view from the query repository, e.g. `getByIdOrNotFoundFail`).

Repository conventions:

- Check ids with `isUUID` (class-validator) before querying — Postgres errors on malformed uuids, so treat them as not found.
- Query repositories whitelist `sortBy` against a list of entity columns before passing it to `order`, falling back to `createdAt`.
- Cascading deletes are done via `onDelete: 'CASCADE'` on relations (e.g. deleting a blog removes its posts).

New controllers/services/repositories must be registered in their feature module's `controllers`/`providers`.

DTO file names matter: the `@nestjs/swagger` CLI plugin (`nest-cli.json`) only auto-generates Swagger metadata for files ending in `.input-dto.ts` or `.view-dto.ts`. Most current DTO files (e.g. `create-blog.dto.ts`, `blog-view.dto.ts`) don't follow this suffix yet.
