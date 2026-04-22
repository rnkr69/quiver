from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


class UnidadMedida(str, Enum):
    unidad = "unidad"
    kg = "kg"
    litro = "litro"
    metro = "metro"
    caja = "caja"
    palet = "palet"


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
    referencia: str                                                   # código interno / SKU
    nombre: str
    descripcion: Optional[str] = None
    categoria_id: Optional[int] = Field(default=None, foreign_key="categoria.id")
    proveedor_id: Optional[int] = Field(default=None, foreign_key="proveedor.id")
    unidad: UnidadMedida = UnidadMedida.unidad
    stock_actual: float = 0.0
    stock_minimo: float = 0.0                                         # alerta si stock_actual < stock_minimo
    precio_unitario: Optional[float] = None
    activo: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class MovimientoStock(SQLModel, table=True):
    __tablename__ = "movimiento_stock"

    id: Optional[int] = Field(default=None, primary_key=True)
    material_id: int = Field(foreign_key="material.id")
    tipo: TipoMovimiento
    cantidad: float                                                    # siempre positivo
    stock_anterior: float                                             # rellenado automáticamente por el hook
    stock_resultante: float                                           # rellenado automáticamente por el hook
    motivo: Optional[str] = None
    referencia_doc: Optional[str] = None                             # nº albarán, pedido, etc.
    creado_por: Optional[str] = None                                 # email del usuario
    created_at: datetime = Field(default_factory=datetime.utcnow)
