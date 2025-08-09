"""
Database models for AeroPoints
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Float, JSON, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class UserRole(str, enum.Enum):
    USER = "user"
    PREMIUM = "premium"
    ADMIN = "admin"

class CabinClass(str, enum.Enum):
    ECONOMY = "economy"
    PREMIUM_ECONOMY = "premium_economy"
    BUSINESS = "business"
    FIRST = "first"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    avatar_url = Column(String)
    role = Column(Enum(UserRole), default=UserRole.USER)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # OAuth fields
    provider = Column(String)  # google, apple, etc
    provider_id = Column(String)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime)
    
    # Relationships
    searches = relationship("SearchHistory", back_populates="user")
    bookings = relationship("Booking", back_populates="user")
    saved_searches = relationship("SavedSearch", back_populates="user")

class SearchHistory(Base):
    __tablename__ = "search_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Search parameters
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    departure_date = Column(DateTime, nullable=False)
    return_date = Column(DateTime)
    cabin_class = Column(Enum(CabinClass))
    passengers = Column(Integer, default=1)
    loyalty_program = Column(String)
    
    # Results
    results_count = Column(Integer)
    lowest_points = Column(Integer)
    
    # Timestamp
    searched_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="searches")

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    booking_reference = Column(String, unique=True, index=True)
    
    # Flight details
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    airline = Column(String, nullable=False)
    flight_number = Column(String)
    departure_date = Column(DateTime, nullable=False)
    arrival_date = Column(DateTime, nullable=False)
    cabin_class = Column(Enum(CabinClass))
    
    # Points and pricing
    points_used = Column(Integer)
    cash_price = Column(Float)
    taxes_fees = Column(Float)
    loyalty_program = Column(String)
    
    # Status
    status = Column(String, default="pending")  # pending, confirmed, cancelled
    
    # Passenger info
    passengers = Column(JSON)  # Store passenger details as JSON
    
    # Timestamps
    booked_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="bookings")

class SavedSearch(Base):
    __tablename__ = "saved_searches"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    
    # Search parameters
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    departure_date = Column(DateTime)
    return_date = Column(DateTime)
    cabin_class = Column(Enum(CabinClass))
    passengers = Column(Integer, default=1)
    loyalty_program = Column(String)
    
    # Alert settings
    alert_enabled = Column(Boolean, default=False)
    alert_threshold_points = Column(Integer)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="saved_searches")

class Airport(Base):
    __tablename__ = "airports"
    
    id = Column(Integer, primary_key=True, index=True)
    iata_code = Column(String(3), unique=True, index=True, nullable=False)
    icao_code = Column(String(4))
    name = Column(String, nullable=False)
    city = Column(String)
    country = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    timezone = Column(String)
    
    # Additional info
    is_major_hub = Column(Boolean, default=False)
    has_lounge = Column(Boolean, default=False)

class LoyaltyProgram(Base):
    __tablename__ = "loyalty_programs"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    airline = Column(String)
    alliance = Column(String)  # Star Alliance, OneWorld, SkyTeam
    
    # Transfer partners
    transfer_partners = Column(JSON)  # List of credit card programs
    transfer_ratio = Column(Float, default=1.0)
    
    # Program details
    sweet_spots = Column(JSON)  # Popular redemption routes
    website_url = Column(String)
    phone_number = Column(String)
