"""
Main API router
"""
from fastapi import APIRouter
from app.api.endpoints import auth, flights, users, bookings, clerk

api_router = APIRouter()

# Include routers from endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(flights.router, prefix="/flights", tags=["Flights"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["Bookings"])
api_router.include_router(clerk.router, prefix="/clerk", tags=["Clerk"])
