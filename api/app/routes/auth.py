import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.dependencies import get_current_user
from app.models import TenantMembership, User
from app.schemas import MeResponse, MembershipView, TokenResponse, UserView
from app.security import issue_access_token, password_hash, verify_password

router = APIRouter(prefix="/auth", tags=["authentication"])
# A dummy Argon2 hash reduces the timing difference for an unknown email.
DUMMY_PASSWORD_HASH = password_hash.hash(secrets.token_urlsafe(32))


@router.post("/token", response_model=TokenResponse)
def create_token(
    form: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_db),
) -> TokenResponse:
    email = form.username.strip().lower()
    user = session.scalar(select(User).where(User.email == email))
    encoded_hash = user.password_hash if user else DUMMY_PASSWORD_HASH
    valid = verify_password(form.password, encoded_hash)
    if not user or not valid or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or password is incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token, seconds = issue_access_token(user.id)
    return TokenResponse(access_token=token, expires_in=seconds)


@router.get("/me", response_model=MeResponse)
def read_me(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> MeResponse:
    memberships = session.scalars(
        select(TenantMembership).where(
            TenantMembership.user_id == user.id,
            TenantMembership.is_active.is_(True),
        )
    ).all()
    return MeResponse(
        user=UserView.model_validate(user),
        memberships=[MembershipView(tenant_id=m.tenant_id, role=m.role) for m in memberships],
    )
