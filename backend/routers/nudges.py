from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from schemas.nudge import NudgeCreate, NudgeRead
from supabase_client import supabase
from routers.transactions import get_business_id

router = APIRouter(prefix="/nudges", tags=["nudges"])


@router.get("/", response_model=List[NudgeRead])
async def list_nudges(business_id: str = Depends(get_business_id)):
    try:
        # To filter by business_id, we inner join transactions where transactions.business_id = auth.uid()
        response = (
            supabase
            .table("recovery_nudges")
            .select("*, transactions!inner(business_id)")
            .eq("transactions.business_id", business_id)
            .execute()
        )
        # Clean nested relation metadata before outputting
        data = []
        for item in response.data:
            cleaned = {k: v for k, v in item.items() if k != 'transactions'}
            data.append(cleaned)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch nudges from Supabase: {str(e)}",
        )


@router.post("/", response_model=NudgeRead, status_code=status.HTTP_201_CREATED)
async def create_nudge(
    payload: NudgeCreate,
    business_id: str = Depends(get_business_id),
):
    try:
        # Verify the customer belongs to this business
        customer_check = (
            supabase
            .table("customers")
            .select("business_id")
            .eq("id", str(payload.customer_id))
            .single()
            .execute()
        )
        if customer_check.data.get("business_id") != business_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized: Customer does not belong to this business"
            )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to verify customer in Supabase: {str(e)}",
        )

    record = payload.dict()
    try:
        response = (
            supabase
            .table("recovery_nudges")
            .insert(record)
            .select("*")
            .single()
            .execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to insert nudge into Supabase: {str(e)}",
        )


@router.post("/{nudge_id}/send", response_model=NudgeRead)
async def send_nudge(
    nudge_id: str,
    business_id: str = Depends(get_business_id),
):
    try:
        # First get the nudge to make sure business owns it
        nudge_check = (
            supabase
            .table("recovery_nudges")
            .select("*, transactions!inner(business_id)")
            .eq("id", nudge_id)
            .eq("transactions.business_id", business_id)
            .single()
            .execute()
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nudge not found or unauthorized"
        )

    # Update status to SENT and log sent time
    try:
        response = (
            supabase
            .table("recovery_nudges")
            .update({"status": "SENT", "sent_at": datetime.now().isoformat()})
            .eq("id", nudge_id)
            .select("*")
            .single()
            .execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to send/update nudge in Supabase: {str(e)}",
        )

