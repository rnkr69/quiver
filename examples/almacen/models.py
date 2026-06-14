from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


class UnidadMedida(str, Enum):
    unidad = "unit"
    kg = "kg"
    litro = "liter"
    metro = "meter"
    caja = "box"
    palet = "pallet"


class TipoMovimiento(str, Enum):
    entrada = "entrada"
    salida = "salida"
    ajuste = "ajuste"


class Categoria(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    descripcion: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Proveedor(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    contacto: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    activo: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Material(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    referencia: str                                                   # internal code / SKU
    nombre: str
    descripcion: Optional[str] = None
    categoria_id: Optional[int] = Field(default=None, foreign_key="categoria.id")
    proveedor_id: Optional[int] = Field(default=None, foreign_key="proveedor.id")
    unidad: UnidadMedida = UnidadMedida.unidad
    stock_actual: float = 0.0
    stock_minimo: float = 0.0                                         # alert if stock_actual < stock_minimo
    precio_unitario: Optional[float] = None
    activo: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class MovimientoStock(SQLModel, table=True):
    __tablename__ = "movimiento_stock"

    id: Optional[int] = Field(default=None, primary_key=True)
    material_id: int = Field(foreign_key="material.id")
    tipo: TipoMovimiento
    cantidad: float                                                    # always positive
    stock_anterior: float                                             # filled automatically by the hook
    stock_resultante: float                                           # filled automatically by the hook
    motivo: Optional[str] = None
    referencia_doc: Optional[str] = None                             # delivery note / order no., etc.
    creado_por: Optional[str] = None                                 # user email
    created_at: datetime = Field(default_factory=datetime.utcnow)
