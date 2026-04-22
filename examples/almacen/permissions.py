from quiver.rbac.registry import quiver_permission

quiver_permission("almacen.ver_alertas",    display_name="Ver alertas de stock bajo",  group="Almacén")
quiver_permission("almacen.ajustar_stock",  display_name="Registrar movimientos",      group="Almacén")
quiver_permission("almacen.ver_valoracion", display_name="Ver valoración del almacén", group="Almacén")
