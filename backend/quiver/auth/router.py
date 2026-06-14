from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import JSONResponse
from sqlmodel import Session

from quiver.auth.dependencies import require_authenticated
from quiver.auth.schemas import LoginRequest, MeResponse, TokenResponse
from quiver.auth.service import (
    authenticate_user,
    complete_password_reset,
    create_session,
    initiate_password_reset,
    refresh_session,
    revoke_session,
)
from quiver.database.session import get_db
from quiver.exceptions import QuiverBadRequest, QuiverUnauthorized

_REFRESH_COOKIE = "quiver_refresh_token"
_REFRESH_COOKIE_MAX_AGE = 7 * 24 * 3600  # 7 days


def _set_refresh_cookie(response: Response, token: str, is_production: bool, prefix: str) -> None:
    response.set_cookie(
        key=_REFRESH_COOKIE,
        value=token,
        httponly=True,
        samesite="strict",
        secure=is_production,
        max_age=_REFRESH_COOKIE_MAX_AGE,
        path=f"{prefix}/auth/refresh",
    )


def _clear_refresh_cookie(response: Response, is_production: bool, prefix: str) -> None:
    response.delete_cookie(
        key=_REFRESH_COOKIE,
        httponly=True,
        samesite="strict",
        secure=is_production,
        path=f"{prefix}/auth/refresh",
    )


def create_auth_router(prefix: str, is_production: bool) -> APIRouter:
    router = APIRouter(prefix="/auth", tags=["auth"])

    @router.post("/login", response_model=TokenResponse)
    async def login(body: LoginRequest, request: Request, db: Session = Depends(get_db)):
        user = authenticate_user(body.email, body.password, db)
        if not user:
            raise QuiverUnauthorized("Invalid email or password.")

        access_token, refresh_plain = create_session(
            user,
            db,
            user_agent=request.headers.get("user-agent"),
            ip_address=request.client.host if request.client else None,
        )
        has_admin_role = True  # simplified until E3 — always admin panel
        redirect_to = "/admin" if has_admin_role else "/portal"

        response = JSONResponse(
            content={
                "access_token": access_token,
                "token_type": "bearer",
                "redirect_to": redirect_to,
            }
        )
        _set_refresh_cookie(response, refresh_plain, is_production, prefix)
        return response

    @router.post("/refresh")
    async def refresh(request: Request, db: Session = Depends(get_db)):
        token_plain = request.cookies.get(_REFRESH_COOKIE)
        if not token_plain:
            raise QuiverUnauthorized("Refresh token missing.")

        access_token, user = refresh_session(token_plain, db)
        response = JSONResponse(content={"access_token": access_token, "token_type": "bearer"})
        _set_refresh_cookie(response, token_plain, is_production, prefix)
        return response

    @router.post("/logout")
    async def logout(request: Request, response: Response, db: Session = Depends(get_db)):
        token_plain = request.cookies.get(_REFRESH_COOKIE)
        if token_plain:
            revoke_session(token_plain, db)
        resp = JSONResponse(content={"detail": "Logged out."})
        _clear_refresh_cookie(resp, is_production, prefix)
        return resp

    @router.get("/me", response_model=MeResponse)
    async def me(
        payload: dict[str, Any] = Depends(require_authenticated),
        db: Session = Depends(get_db),
    ):

        from quiver.models.admin_user import AdminUser

        user = db.get(AdminUser, payload["sub"])
        if not user:
            raise QuiverUnauthorized("User not found.")
        return MeResponse(
            id=str(user.id),
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            roles=payload.get("roles", []),
            permissions=payload.get("permissions", []),
            is_superuser=payload.get("is_superuser", False),
        )

    @router.post("/forgot-password")
    async def forgot_password(request: Request, db: Session = Depends(get_db)):
        from quiver.config import QuiverConfig

        body = await request.json()
        email = body.get("email", "")

        cfg = QuiverConfig()
        if cfg.email_sender is None:
            return JSONResponse(
                status_code=503,
                content={
                    "detail": "EmailSender not configured. See documentation.",
                    "code": "QUIVER_EMAIL_NOT_CONFIGURED",
                },
            )

        token_plain = initiate_password_reset(email, db)
        if token_plain:
            reset_url = f"{cfg.QUIVER_FRONTEND_URL}/auth/reset-password?token={token_plain}"
            await cfg.email_sender.send_reset_email(
                to=email, token=token_plain, reset_url=reset_url
            )

        # Always return 200 — do not reveal if email exists
        return JSONResponse(content={"detail": "If that email exists, a reset link has been sent."})

    @router.post("/reset-password")
    async def reset_password(request: Request, db: Session = Depends(get_db)):
        body = await request.json()
        token = body.get("token", "")
        new_password = body.get("new_password", "")
        if len(new_password) < 8:
            raise QuiverBadRequest("Password must be at least 8 characters.")
        complete_password_reset(token, new_password, db)
        return JSONResponse(content={"detail": "Password updated. All sessions have been revoked."})

    return router
