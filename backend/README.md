# Quiver

[![CI](https://github.com/rnkr69/quiver/actions/workflows/ci.yml/badge.svg)](https://github.com/rnkr69/quiver/actions/workflows/ci.yml)
[![PyPI](https://img.shields.io/pypi/v/fastapi-quiver.svg)](https://pypi.org/project/fastapi-quiver/)
[![Python](https://img.shields.io/pypi/pyversions/fastapi-quiver.svg)](https://pypi.org/project/fastapi-quiver/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/rnkr69/quiver/blob/main/LICENSE)

**A complete admin panel and user portal for any FastAPI + SQLModel app — declared in Python.**

Quiver is a library, not a standalone app. Mount it on your existing FastAPI application in one
line, declare your CRUDs, widgets, pages and permissions in Python, and get a full admin panel
(list/create/edit/delete UI, dashboard, RBAC) plus a client portal — without writing any
frontend code. The generic React SPA reads everything (columns, fields, filters, menu, pages)
from the backend at runtime.

> The PyPI package is named **`fastapi-quiver`**; the import name is **`quiver`**.

## Install

```bash
pip install fastapi-quiver
```

## Use

```python
# main.py
from fastapi import FastAPI
from quiver import QuiverApp
import permissions  # noqa: F401 — register permissions at import time

app = FastAPI()
quiver = QuiverApp(app)  # mounts auth, RBAC, users, dashboard, menu, pages and portal
```

`SECRET_KEY` and `DATABASE_URL` are required. Then:

```bash
quiver db migrate          # apply Quiver's auth/RBAC migrations
quiver create-superuser    # interactive first-user creation
uvicorn main:app --reload  # API served under /quiver/v1
```

The package ships the API only; the admin/portal SPA lives in the
[`frontend/`](https://github.com/rnkr69/quiver/tree/main/frontend) directory of the repo and is
served separately.

## Documentation

Full documentation, the reference example app and the frontend live in the repository:
**https://github.com/rnkr69/quiver**

## License

[MIT](https://github.com/rnkr69/quiver/blob/main/LICENSE) © rnkr69
