"""
Flight search schemas
"""
from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime
from enum import Enum

class CabinClassEnum(str, Enum):
    economy = "economy"
    premium_economy = "premium_economy"
    business = "business"
    first = "first"

class FlightSearch(BaseModel):
    origin: str
    destination: str
    departure_date: date
    cabin_class: CabinClassEnum
    passengers: int = 1
    loyalty_program: str

class FlightResult(BaseModel):
    airline: str
    flight_number: str
    origin: str
    destination: str
    departure_time: str
    arrival_time: str
    cabin_class: str
    points_required: int
    cash_price: float
    availability: int
    aircraft: str
    duration_minutes: int
    stops: int

class FlightSearchResponse(BaseModel):
    results: List[FlightResult]
    total_results: int
    search_params: dict
