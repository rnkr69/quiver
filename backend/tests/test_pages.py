import pytest
from quiver.pages.registry import (
    quiver_page, QuiverPage, PageDefinition,
    get_admin_pages, get_portal_pages,
    _ADMIN_PAGES, _PORTAL_PAGES,
)


def _clear_pages():
    _ADMIN_PAGES.clear()
    _PORTAL_PAGES.clear()


class TestQuiverPageDecorator:
    def setup_method(self):
        _clear_pages()

    def test_register_admin_page(self):
        @quiver_page(route="/admin/reports", layout="admin", title="Reportes", component="ReportsPage", permission="reports.view")
        class ReportsPage(QuiverPage):
            pass

        pages = get_admin_pages()
        assert len(pages) == 1
        p = pages[0]
        assert p.route == "/admin/reports"
        assert p.component == "ReportsPage"
        assert p.permission == "reports.view"

    def test_register_portal_page(self):
        @quiver_page(route="/portal/tickets", layout="portal", title="Tickets", component="TicketsPage", allowed_roles=["client"])
        class TicketsPage(QuiverPage):
            pass

        pages = get_portal_pages()
        assert len(pages) == 1
        assert pages[0].allowed_roles == ["client"]

    def test_admin_page_requires_permission(self):
        with pytest.raises(ValueError, match="permission"):
            @quiver_page(route="/admin/test", layout="admin", title="Test", component="TestPage")
            class TestPage:
                pass

    def test_portal_page_requires_allowed_roles(self):
        with pytest.raises(ValueError, match="allowed_roles"):
            @quiver_page(route="/portal/test", layout="portal", title="Test", component="TestPage")
            class TestPage:
                pass

    def test_invalid_layout_raises(self):
        with pytest.raises(ValueError, match="layout"):
            @quiver_page(route="/x", layout="unknown", title="X", component="X", permission="x")
            class TestPage:
                pass


class TestPageFiltering:
    def setup_method(self):
        _clear_pages()

    def test_superuser_sees_all_admin_pages(self):
        from quiver.pages.registry import get_admin_pages
        @quiver_page(route="/admin/a", layout="admin", title="A", component="A", permission="a.view")
        class A(QuiverPage): pass
        @quiver_page(route="/admin/b", layout="admin", title="B", component="B", permission="b.view")
        class B(QuiverPage): pass

        pages = get_admin_pages()
        assert len(pages) == 2

    def test_portal_page_filtered_by_role(self):
        from quiver.pages.registry import get_portal_pages
        @quiver_page(route="/portal/x", layout="portal", title="X", component="X", allowed_roles=["premium"])
        class X(QuiverPage): pass

        pages = get_portal_pages()
        assert pages[0].allowed_roles == ["premium"]
