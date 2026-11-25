from typing import Any
from uuid import UUID

from fastapi import Request
from sqlalchemy.orm import Session

from app.models import AuditEvent


def append_audit_event(
    session: Session,
    request: Request,
    *,
    tenant_id: UUID,
    actor_user_id: UUID | None,
    action: str,
    entity_type: str,
    entity_id: str,
    branch_id: UUID | None = None,
    details: dict[str, Any] | None = None,
) -> None:
    # Callers must pass an allow-listed summary; never put passwords or tokens in details.
    session.add(AuditEvent(
        tenant_id=tenant_id,
        branch_id=branch_id,
        actor_user_id=actor_user_id,
        request_id=request.state.request_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details or {},
    ))
