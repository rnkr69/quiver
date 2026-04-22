from __future__ import annotations


class QuiverException(Exception):
    status_code: int = 500
    code: str = "QUIVER_ERROR"
    detail: str = "An unexpected error occurred."

    def __init__(self, detail: str | None = None) -> None:
        self.detail = detail or self.__class__.detail
        super().__init__(self.detail)


class QuiverNotFound(QuiverException):
    status_code = 404
    code = "QUIVER_NOT_FOUND"
    detail = "Resource not found."


class QuiverUnauthorized(QuiverException):
    status_code = 401
    code = "QUIVER_UNAUTHORIZED"
    detail = "Authentication required."


class QuiverForbidden(QuiverException):
    status_code = 403
    code = "QUIVER_FORBIDDEN"
    detail = "You do not have permission to perform this action."


class QuiverBadRequest(QuiverException):
    status_code = 400
    code = "QUIVER_BAD_REQUEST"
    detail = "Bad request."
