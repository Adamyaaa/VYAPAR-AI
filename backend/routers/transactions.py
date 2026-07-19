from fastapi import APIRouter, Depends, HTTPException, Request, status
from typing import List

from schemas.transaction import TransactionCreate, TransactionRead
from supabase_client import supabase

router = APIRouter(prefix="/transactions", tags=["transactions"])


def get_business_id(request: Request) -> str:
    business_id = request.headers.get("x-user-id")
    if not business_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing x-user-id header",
        )
    return business_id


@router.get("/", response_model=List[TransactionRead])
async def list_transactions(business_id: str = Depends(get_business_id)):
    try:
        response = (
            supabase
            .table("transactions")
            .select("*")
            .eq("business_id", business_id)
            .order("created_at", desc=True)
            .execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch transactions from Supabase: {str(e)}",
        )


@router.post("/", response_model=TransactionRead, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    payload: TransactionCreate,
    business_id: str = Depends(get_business_id),
):
    record = payload.dict()
    record["business_id"] = business_id

    try:
        response = (
            supabase
            .table("transactions")
            .insert(record)
            .select("*")
            .single()
            .execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to insert transaction into Supabase: {str(e)}",
        )

