# Contributing to Quiver

Thanks for your interest in contributing! This document explains how to set up the project
locally, the conventions we follow, and the pull-request workflow.

## Project layout

- `backend/` — the installable Python package `quiver` (published to PyPI as `fastapi-quiver`).
- `frontend/` — the generic Vite + React + TypeScript admin/portal SPA.
- `examples/almacen/` — a complete reference host app.
- `docs/` — guides (English, with Spanish copies under `docs/es/`).

## Backend setup

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
```

Run the checks:

```bash
ruff check .        # lint
ruff format .       # format
pytest              # test suite
```

Tests are self-contained: each builds an in-memory SQLite engine and injects it via
`override_engine(...)`. Follow the pattern at the top of `tests/test_crud_router.py` when
adding tests.

## Frontend setup

```bash
cd frontend
npm install
npm run dev          # dev server on :5173
npm run typecheck    # tsc --noEmit
npm run build        # production build
```

## Conventions

- **Backend code and identifiers are in English.** Docs and example code may be bilingual.
- Python: type hints everywhere, modern syntax (PEP 585/604), `from __future__ import annotations`.
- TypeScript: `strict` mode, no `any`.
- Keep changes focused and match the style of the surrounding code.

## Pull-request workflow

1. Fork and create a feature branch (`feat/...`, `fix/...`, `docs/...`).
2. Make your change and ensure `ruff check`, `pytest` and `npm run typecheck`/`build` all pass.
3. Update the relevant docs and `CHANGELOG.md` (under "Unreleased").
4. Open a PR with a clear description of the change and the motivation.

## Reporting issues

Please include reproduction steps, the expected vs. actual behavior, and your Python / Node
versions. Security issues should be reported privately rather than via a public issue.
