# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Internationalized frontend (react-i18next): English/Spanish UI with browser-language
  auto-detection and a language switcher. The reference example app is in English.

## [0.1.0] - 2026-06-14

### Added
- Initial public release.
- `QuiverApp` one-line mount for any FastAPI + SQLModel application.
- Automatic CRUD engine: 7 endpoints per `QuiverCRUD` with fields/columns/filters inferred
  from SQLModel annotations, plus lifecycle hooks.
- JWT authentication (access + refresh) with bcrypt password hashing and password reset.
- Role-based access control (RBAC) with granular, import-time permission registration.
- Dashboard widgets (`StatCard`, `Chart`) and a configurable menu.
- Custom pages via `@quiver_page`, and a separate client portal.
- `quiver` CLI: `db migrate`, `db rollback`, `create-superuser`.
- Generic React + TypeScript SPA that builds the admin/portal UI entirely from backend config.
- Bundled SPA: the published wheel includes the built frontend, mounted with
  `QuiverApp.serve_frontend()` at a configurable base path (`QUIVER_FRONTEND_PATH`, default
  `/quiver`) with SPA deep-link fallback. The frontend can still be run separately in development.
- Reference example app (`examples/almacen/`).

[Unreleased]: https://github.com/rnkr69/quiver/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/rnkr69/quiver/releases/tag/v0.1.0
