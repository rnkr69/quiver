"""
Sample data for the warehouse management demo.
Run: python seed.py
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
        # Categories
        cats = [
            Categoria(nombre="Construction materials", descripcion="Cement, sand, bricks"),
            Categoria(nombre="Tools",                  descripcion="Manual and power tools"),
            Categoria(nombre="Protective equipment",   descripcion="PPE: helmets, gloves, boots"),
            Categoria(nombre="Consumables",            descripcion="Fasteners, adhesives, tape"),
        ]
        for c in cats:
            db.add(c)
        db.commit()
        for c in cats:
            db.refresh(c)

        # Suppliers
        provs = [
            Proveedor(nombre="García Supplies Ltd.",    contacto="Luis García",
                      email="orders@garcia.com",        telefono="912345678"),
            Proveedor(nombre="Martínez Hardware",       contacto="Ana Martínez",
                      email="ana@hardware.com",          telefono="934567890"),
            Proveedor(nombre="Northern Protection Inc.", contacto="Carlos Ruiz",
                      email="sales@northprot.com",       telefono="944567891"),
        ]
        for p in provs:
            db.add(p)
        db.commit()
        for p in provs:
            db.refresh(p)

        # Materials
        materiales_data = [
            ("CEM-001", "Portland cement CEM II",          cats[0].id, provs[0].id, UnidadMedida.kg,     500, 100, 0.12),
            ("ARE-001", "Fine washed sand",                cats[0].id, provs[0].id, UnidadMedida.kg,     1200, 200, 0.05),
            ("LAD-001", "Perforated brick 24x11.5x9",      cats[0].id, provs[0].id, UnidadMedida.unidad, 3000, 500, 0.35),
            ("TAB-001", "Wooden board 200x20cm",           cats[0].id, provs[1].id, UnidadMedida.unidad,   80,  20, 4.50),
            ("TAL-001", "Hammer drill 850W",               cats[1].id, provs[1].id, UnidadMedida.unidad,    5,   2, 89.0),
            ("ESC-001", "Aluminium 3-step ladder",         cats[1].id, provs[1].id, UnidadMedida.unidad,    3,   1, 45.0),
            ("ANG-001", "Angle grinder 125mm",             cats[1].id, provs[1].id, UnidadMedida.unidad,    4,   2, 65.0),
            ("CAS-001", "White ABS safety helmet",         cats[2].id, provs[2].id, UnidadMedida.unidad,   30,  10, 7.50),
            ("GUA-001", "Level 5 cut-resistant gloves",    cats[2].id, provs[2].id, UnidadMedida.unidad,   25,   5, 4.20),
            ("BOT-001", "S3 steel-toe safety boots",       cats[2].id, provs[2].id, UnidadMedida.unidad,   12,   5, 38.0),
            ("TOR-001", "Wood screw 4x50 (box of 200)",    cats[3].id, provs[1].id, UnidadMedida.caja,    40,  10, 3.80),
            ("SIL-001", "Clear neutral silicone",          cats[3].id, provs[1].id, UnidadMedida.unidad,   15,   5, 2.90),
            ("CIN-001", "Duct tape 50mm x 50m",            cats[3].id, provs[1].id, UnidadMedida.unidad,    8,   3, 5.60),
            # Material with low stock (to show an alert)
            ("CAL-001", "Hydraulic lime NHL 3.5",          cats[0].id, provs[0].id, UnidadMedida.kg,       15, 100, 0.28),
            ("VIS-001", "Polycarbonate face shield",       cats[2].id, provs[2].id, UnidadMedida.unidad,    2,  10, 12.0),
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

        # Historical movements (last 30 days)
        now = datetime.utcnow()
        movimientos = []
        for i, mat in enumerate(materiales[:10]):   # movements for the first 10 materials
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
                    motivo="Sample data",
                    referencia_doc=f"DOC-{1000 + i * 10 + j}",
                    creado_por="seed@almacen.local",
                    created_at=now - timedelta(days=dias_atras),
                )
                movimientos.append(mov)
            db.add(mat)

        for mov in movimientos:
            db.add(mov)
        db.commit()

        print(f"Seed completed:")
        print(f"  {len(cats)} categories")
        print(f"  {len(provs)} suppliers")
        print(f"  {len(materiales)} materials")
        print(f"  {len(movimientos)} stock movements")


if __name__ == "__main__":
    seed()
