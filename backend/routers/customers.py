from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from schemas.customer import CustomerCreate, CustomerRead
from supabase_client import supabase
from routers.transactions import get_business_id

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("/", response_model=List[CustomerRead])
async def list_customers(business_id: str = Depends(get_business_id)):
    try:
        response = (
            supabase
            .table("customers")
            .select("*")
            .eq("business_id", business_id)
            .order("name")
            .execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch customers from Supabase: {str(e)}",
        )


@router.post("/", response_model=CustomerRead, status_code=status.HTTP_201_CREATED)
async def create_customer(
    payload: CustomerCreate,
    business_id: str = Depends(get_business_id),
):
    record = payload.dict()
    record["business_id"] = business_id

    try:
        response = (
            supabase
            .table("customers")
            .insert(record)
            .select("*")
            .single()
            .execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to insert customer into Supabase: {str(e)}",
        )

