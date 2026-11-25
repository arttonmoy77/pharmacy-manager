from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.audit import append_audit_event
from app.db import get_db
from app.dependencies import get_current_user
from app.models import Branch, BranchMembership, TenantMembership, User
from app.schemas import BranchCreate, BranchView

router = APIRouter(tags=["tenants and branches"])


@router.get("/tenants/{tenant_id}/branches", response_model=list[BranchView])
def list_my_branches(
    tenant_id: UUID,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> list[BranchView]:
    membership = session.get(TenantMembership, (tenant_id, user.id))
    if membership is None or not membership.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
    statement = (
        select(Branch)
        .join(BranchMembership, (BranchMembership.tenant_id == Branch.tenant_id) & (BranchMembership.branch_id == Branch.id))
        .join(TenantMembership, (TenantMembership.tenant_id == BranchMembership.tenant_id) & (TenantMembership.user_id == BranchMembership.user_id))
        .where(
            Branch.tenant_id == tenant_id,
            BranchMembership.user_id == user.id,
            BranchMembership.is_active.is_(True),
            TenantMembership.is_active.is_(True),
            Branch.is_active.is_(True),
        )
        .order_by(Branch.name)
    )
    return [BranchView.model_validate(branch) for branch in session.scalars(statement).all()]


@router.post("/tenants/{tenant_id}/branches", response_model=BranchView, status_code=status.HTTP_201_CREATED)
def create_branch(
    tenant_id: UUID,
    payload: BranchCreate,
    request: Request,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> BranchView:
    membership = session.get(TenantMembership, (tenant_id, user.id))
    if membership is None or not membership.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
    if membership.role not in {"owner", "admin"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tenant administrator access required")
    branch = Branch(
        tenant_id=tenant_id,
        name=payload.name.strip(),
        code=payload.code,
        country_code=payload.country_code,
        currency_code=payload.currency_code,
        timezone=payload.timezone,
    )
    session.add(branch)
    try:
        session.flush()
        session.add(BranchMembership(tenant_id=tenant_id, branch_id=branch.id, user_id=user.id, role="manager"))
        append_audit_event(
            session,
            request,
            tenant_id=tenant_id,
            actor_user_id=user.id,
            action="branch.created",
            entity_type="branch",
            entity_id=str(branch.id),
            branch_id=branch.id,
            details={"code": branch.code},
        )
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Branch code already exists in this tenant") from exc
    session.refresh(branch)
    return BranchView.model_validate(branch)


@router.get("/branches/{branch_id}", response_model=BranchView)
def read_branch(
    branch_id: UUID,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> BranchView:
    statement = (
        select(Branch)
        .join(BranchMembership, (BranchMembership.tenant_id == Branch.tenant_id) & (BranchMembership.branch_id == Branch.id))
        .join(TenantMembership, (TenantMembership.tenant_id == BranchMembership.tenant_id) & (TenantMembership.user_id == BranchMembership.user_id))
        .where(
            Branch.id == branch_id,
            BranchMembership.user_id == user.id,
            BranchMembership.is_active.is_(True),
            TenantMembership.is_active.is_(True),
            Branch.is_active.is_(True),
        )
    )
    branch = session.scalar(statement)
    if branch is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
    return BranchView.model_validate(branch)
