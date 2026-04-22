from quiver.rbac.registry import quiver_permission

# Built-in permissions registered automatically when this module is imported
quiver_permission("users.list",       display_name="Listar usuarios",         group="Usuarios")
quiver_permission("users.show",       display_name="Ver detalle de usuario",  group="Usuarios")
quiver_permission("users.create",     display_name="Crear usuarios",          group="Usuarios")
quiver_permission("users.update",     display_name="Editar usuarios",         group="Usuarios")
quiver_permission("users.delete",     display_name="Eliminar usuarios",       group="Usuarios")
quiver_permission("roles.list",       display_name="Listar roles",            group="Roles")
quiver_permission("roles.create",     display_name="Crear roles",             group="Roles")
quiver_permission("roles.update",     display_name="Editar roles",            group="Roles")
quiver_permission("roles.delete",     display_name="Eliminar roles",          group="Roles")
