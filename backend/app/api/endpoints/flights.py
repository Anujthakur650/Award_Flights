"""
Flight search and availability endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
import httpx

from app.core.config import settings
from app.core.database import get_db
from app.models.models import User, SearchHistory, Airport
from app.api.endpoints.auth import get_current_user
from app.schemas.flights import FlightSearch, FlightSearchResponse, FlightResult

router = APIRouter()

@router.post("/search", response_model=FlightSearchResponse)
async def search_flights(
    search_params: FlightSearch,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search for award flights using Seats.aero API
    """
    try:
        # Build API request to Seats.aero
        headers = {
            "Authorization": f"Bearer {settings.SEATS_AERO_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # Map our parameters to Seats.aero format
        api_params = {
            "origin": search_params.origin,
            "destination": search_params.destination,
            "departureDate": search_params.departure_date.isoformat(),
            "cabin": search_params.cabin_class.lower(),
            "passengers": search_params.passengers,
            "program": search_params.loyalty_program
        }
        
        # Mock response for development (replace with actual API call)
        # async with httpx.AsyncClient() as client:
        #     response = await client.post(
        #         f"{settings.SEATS_AERO_BASE_URL}/search",
        #         json=api_params,
        #         headers=headers
        #     )
        #     results = response.json()
        
        # Mock flight results for development
        mock_results = [
            {
                "airline": "United Airlines",
                "flight_number": "UA123",
                "origin": search_params.origin,
                "destination": search_params.destination,
                "departure_time": "2024-03-15T08:00:00",
                "arrival_time": "2024-03-15T12:00:00",
                "cabin_class": search_params.cabin_class,
                "points_required": 35000,
                "cash_price": 450.00,
                "availability": 4,
                "aircraft": "Boeing 737-900",
                "duration_minutes": 240,
                "stops": 0
            },
            {
                "airline": "American Airlines",
                "flight_number": "AA456",
                "origin": search_params.origin,
                "destination": search_params.destination,
                "departure_time": "2024-03-15T10:30:00",
                "arrival_time": "2024-03-15T14:45:00",
                "cabin_class": search_params.cabin_class,
                "points_required": 32500,
                "cash_price": 425.00,
                "availability": 2,
                "aircraft": "Airbus A321",
                "duration_minutes": 255,
                "stops": 0
            },
            {
                "airline": "Delta Air Lines",
                "flight_number": "DL789",
                "origin": search_params.origin,
                "destination": search_params.destination,
                "departure_time": "2024-03-15T14:15:00",
                "arrival_time": "2024-03-15T18:30:00",
                "cabin_class": search_params.cabin_class,
                "points_required": 40000,
                "cash_price": 480.00,
                "availability": 6,
                "aircraft": "Boeing 757-200",
                "duration_minutes": 255,
                "stops": 0
            }
        ]
        
        # Save search history if user is logged in
        if current_user:
            search_history = SearchHistory(
                user_id=current_user.id,
                origin=search_params.origin,
                destination=search_params.destination,
                departure_date=search_params.departure_date,
                cabin_class=search_params.cabin_class,
                passengers=search_params.passengers,
                loyalty_program=search_params.loyalty_program,
                results_count=len(mock_results),
                lowest_points=min([r["points_required"] for r in mock_results]) if mock_results else None
            )
            db.add(search_history)
            db.commit()
        
        return {
            "results": mock_results,
            "total_results": len(mock_results),
            "search_params": search_params.dict()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/airports", response_model=List[dict])
async def search_airports(
    query: str = Query(..., min_length=2),
    db: Session = Depends(get_db)
):
    """
    Search for airports by name, city, or IATA code
    """
    # Search in database
    airports = db.query(Airport).filter(
        (Airport.iata_code.ilike(f"%{query}%")) |
        (Airport.name.ilike(f"%{query}%")) |
        (Airport.city.ilike(f"%{query}%"))
    ).limit(10).all()
    
    # If no results, return mock data for development
    if not airports:
        mock_airports = [
            {
                "iata_code": "JFK",
                "name": "John F. Kennedy International Airport",
                "city": "New York",
                "country": "United States"
            },
            {
                "iata_code": "LAX",
                "name": "Los Angeles International Airport",
                "city": "Los Angeles",
                "country": "United States"
            },
            {
                "iata_code": "LHR",
                "name": "London Heathrow Airport",
                "city": "London",
                "country": "United Kingdom"
            }
        ]
        return [a for a in mock_airports if query.lower() in a["iata_code"].lower() or query.lower() in a["city"].lower()]
    
    return [
        {
            "iata_code": a.iata_code,
            "name": a.name,
            "city": a.city,
            "country": a.country
        }
        for a in airports
    ]

@router.get("/popular-routes")
async def get_popular_routes():
    """
    Get popular award flight routes
    """
    return [
        {
            "origin": "JFK",
            "destination": "LHR",
            "origin_city": "New York",
            "destination_city": "London",
            "avg_points": 35000,
            "best_program": "United MileagePlus"
        },
        {
            "origin": "LAX",
            "destination": "NRT",
            "origin_city": "Los Angeles",
            "destination_city": "Tokyo",
            "avg_points": 70000,
            "best_program": "American AAdvantage"
        },
        {
            "origin": "SFO",
            "destination": "CDG",
            "origin_city": "San Francisco",
            "destination_city": "Paris",
            "avg_points": 45000,
            "best_program": "Delta SkyMiles"
        }
    ]

@router.get("/availability/{flight_id}")
async def check_availability(
    flight_id: str,
    date: date,
    passengers: int = 1
):
    """
    Check real-time availability for a specific flight
    """
    # TODO: Implement real-time availability check with Seats.aero
    return {
        "flight_id": flight_id,
        "date": date,
        "available_seats": 4,
        "cabin_class": "business",
        "points_required": 75000,
        "taxes_fees": 125.50
    }
