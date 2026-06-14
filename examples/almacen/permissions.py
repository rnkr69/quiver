from quiver.rbac.registry import quiver_permission

quiver_permission("almacen.ver_alertas",    display_name="View low stock alerts",    group="Warehouse")
quiver_permission("almacen.ajustar_stock",  display_name="Record stock movements",   group="Warehouse")
quiver_permission("almacen.ver_valoracion", display_name="View warehouse valuation", group="Warehouse")
