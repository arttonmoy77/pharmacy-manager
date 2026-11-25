from getpass import getpass

from sqlalchemy import select

from app.db import SessionLocal
from app.models import Branch, BranchMembership, Tenant, TenantMembership, User
from app.security import hash_password


def ask(label: str) -> str:
    value = input(f"{label}: ").strip()
    if not value:
        raise SystemExit(f"{label} is required")
    return value


def main() -> None:
    tenant_name = ask("Pharmacy business name")
    branch_name = ask("First branch name")
    branch_code = ask("Branch code (e.g. MAIN)").upper()
    country_code = ask("Country code (2 letters)").upper()
    currency_code = ask("Currency code (3 letters)").upper()
    timezone = ask("IANA time zone (e.g. Asia/Dhaka)")
    display_name = ask("Owner name")
    email = ask("Owner email").lower()
    if "@" not in email:
        raise SystemExit("Enter a valid email address")
    password = getpass("Owner password (at least 12 characters): ")
    confirmation = getpass("Repeat owner password: ")
    if len(password) < 12 or password != confirmation:
        raise SystemExit("Passwords must match and contain at least 12 characters")

    with SessionLocal() as session:
        if session.scalar(select(Tenant.id).limit(1)) is not None:
            raise SystemExit("A tenant already exists. This bootstrap command only creates the first tenant.")
        user = User(email=email, display_name=display_name, password_hash=hash_password(password))
        tenant = Tenant(name=tenant_name)
        session.add_all([user, tenant])
        session.flush()
        branch = Branch(
            tenant_id=tenant.id, name=branch_name, code=branch_code,
            country_code=country_code, currency_code=currency_code, timezone=timezone,
        )
        session.add(branch)
        session.flush()
        session.add(TenantMembership(tenant_id=tenant.id, user_id=user.id, role="owner"))
        session.add(BranchMembership(tenant_id=tenant.id, branch_id=branch.id, user_id=user.id, role="manager"))
        session.commit()
        print(f"Created tenant {tenant.id} with branch {branch.id} and owner account {user.email}.")


if __name__ == "__main__":
    main()
