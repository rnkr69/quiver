"""
Datos de prueba para la demo de gestión de almacén.
Ejecuta: python seed.py
"""
from __future__ import annotations

from datetime import datetime, timedelta
import random

from dotenv import load_dotenv
load_dotenv()

from sqlmodel import Session, SQLModel, create_engine, select
from models import Categoria, Proveedor, Material, MovimientoStock, UnidadMedida, TipoMovimiento

import os
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./almacen.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SQLModel.metadata.create_all(engine)


def seed():
    with Session(engine) as db:
        # Categorías
        cats = [
            Categoria(nombre="Materiales de construcción", descripcion="Cemento, arena, ladrillos"),
            Categoria(nombre="Herramientas",               descripcion="Manuales y eléctricas"),
            Categoria(nombre="Equipos de protección",      descripcion="EPI: cascos, guantes, botas"),
            Categoria(nombre="Consumibles",                descripcion="Tornillería, adhesivos, cinta"),
        ]
        for c in cats:
            db.add(c)
        db.commit()
        for c in cats:
            db.refresh(c)

        # Proveedores
        provs = [
            Proveedor(nombre="Suministros García S.L.", contacto="Luis García",
                      email="pedidos@garcia.es",        telefono="912345678"),
            Proveedor(nombre="Ferretería Martínez",     contacto="Ana Martínez",
                      email="ana@ferreteria.es",         telefono="934567890"),
            Proveedor(nombre="Protecciones Norte S.A.", contacto="Carlos Ruiz",
                      email="ventas@protnorte.es",       telefono="944567891"),
        ]
        for p in provs:
            db.add(p)
        db.commit()
        for p in provs:
            db.refresh(p)

        # Materiales
        materiales_data = [
            ("CEM-001", "Cemento Portland CEM II",        cats[0].id, provs[0].id, UnidadMedida.kg,     500, 100, 0.12),
            ("ARE-001", "Arena lavada fina",              cats[0].id, provs[0].id, UnidadMedida.kg,     1200, 200, 0.05),
            ("LAD-001", "Ladrillo perforado 24x11.5x9",  cats[0].id, provs[0].id, UnidadMedida.unidad, 3000, 500, 0.35),
            ("TAB-001", "Tabla de madera 200x20cm",       cats[0].id, provs[1].id, UnidadMedida.unidad,   80,  20, 4.50),
            ("TAL-001", "Taladro percutor 850W",          cats[1].id, provs[1].id, UnidadMedida.unidad,    5,   2, 89.0),
            ("ESC-001", "Escalera aluminio 3 peldaños",   cats[1].id, provs[1].id, UnidadMedida.unidad,    3,   1, 45.0),
            ("ANG-001", "Amoladora angular 125mm",        cats[1].id, provs[1].id, UnidadMedida.unidad,    4,   2, 65.0),
            ("CAS-001", "Casco de seguridad ABS blanco",  cats[2].id, provs[2].id, UnidadMedida.unidad,   30,  10, 7.50),
            ("GUA-001", "Guantes anticorte nivel 5",      cats[2].id, provs[2].id, UnidadMedida.unidad,   25,   5, 4.20),
            ("BOT-001", "Botas seguridad S3 punta acero", cats[2].id, provs[2].id, UnidadMedida.unidad,   12,   5, 38.0),
            ("TOR-001", "Tornillo madera 4x50 (caja 200)", cats[3].id, provs[1].id, UnidadMedida.caja,    40,  10, 3.80),
            ("SIL-001", "Silicona neutra transparente",   cats[3].id, provs[1].id, UnidadMedida.unidad,   15,   5, 2.90),
            ("CIN-001", "Cinta americana 50mm x 50m",     cats[3].id, provs[1].id, UnidadMedida.unidad,    8,   3, 5.60),
            # Material con stock bajo (para mostrar alerta)
            ("CAL-001", "Cal hidráulica NHL 3.5",         cats[0].id, provs[0].id, UnidadMedida.kg,       15, 100, 0.28),
            ("VIS-001", "Visera facial policarbonato",    cats[2].id, provs[2].id, UnidadMedida.unidad,    2,  10, 12.0),
        ]

        materiales = []
        for ref, nombre, cat_id, prov_id, unidad, stock, minimo, precio in materiales_data:
            m = Material(
                referencia=ref, nombre=nombre, categoria_id=cat_id,
                proveedor_id=prov_id, unidad=unidad, stock_actual=stock,
                stock_minimo=minimo, precio_unitario=precio, activo=True,
            )
            db.add(m)
            materiales.append(m)
        db.commit()
        for m in materiales:
            db.refresh(m)

        # Movimientos históricos (últimos 30 días)
        now = datetime.utcnow()
        movimientos = []
        for i, mat in enumerate(materiales[:10]):   # movimientos para los primeros 10 materiales
            for j in range(random.randint(2, 6)):
                dias_atras = random.randint(0, 29)
                tipo = random.choice([TipoMovimiento.entrada, TipoMovimiento.salida])
                cantidad = random.randint(5, 50)

                if tipo == TipoMovimiento.salida:
                    cantidad = min(cantidad, int(mat.stock_actual * 0.3) or 1)

                stock_ant = mat.stock_actual
                if tipo == TipoMovimiento.entrada:
                    mat.stock_actual += cantidad
                else:
                    mat.stock_actual = max(0, mat.stock_actual - cantidad)

                mov = MovimientoStock(
                    material_id=mat.id,
                    tipo=tipo,
                    cantidad=cantidad,
                    stock_anterior=stock_ant,
                    stock_resultante=mat.stock_actual,
                    motivo="Datos de prueba",
                    referencia_doc=f"DOC-{1000 + i * 10 + j}",
                    creado_por="seed@almacen.local",
                    created_at=now - timedelta(days=dias_atras),
                )
                movimientos.append(mov)
            db.add(mat)

        for mov in movimientos:
            db.add(mov)
        db.commit()

        print(f"Seed completado:")
        print(f"  {len(cats)} categorías")
        print(f"  {len(provs)} proveedores")
        print(f"  {len(materiales)} materiales")
        print(f"  {len(movimientos)} movimientos de stock")


if __name__ == "__main__":
    seed()
