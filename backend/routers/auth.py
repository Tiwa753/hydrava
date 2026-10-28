import hashlib
import hmac
import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from database import get_db
from models import StaffAccount
from schemas import StaffAccountResponse, StaffLogin, StaffRegister

router = APIRouter(prefix="/auth", tags=["auth"])

PASSWORD_HASH_ITERATIONS = 310_000


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, PASSWORD_HASH_ITERATIONS
    )
    return f"pbkdf2_sha256${PASSWORD_HASH_ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
        algorithm, iterations_text, salt_hex, digest_hex = password_hash.split("$")
        if algorithm != "pbkdf2_sha256":
            return False
        iterations = int(iterations_text)
        salt = bytes.fromhex(salt_hex)
        expected_digest = bytes.fromhex(digest_hex)
    except (ValueError, TypeError):
        return False

    actual_digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, iterations
    )
    return hmac.compare_digest(actual_digest, expected_digest)


def account_response(staff_id: str, name: str, role: str) -> StaffAccountResponse:
    return StaffAccountResponse(staff_id=staff_id, name=name, role=role)


@router.post(
    "/register",
    response_model=StaffAccountResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_staff(
    details: StaffRegister, db: Session = Depends(get_db)
) -> StaffAccountResponse:
    staff_id = details.staff_id.strip().upper()
    full_name = details.full_name.strip()
    if not full_name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Full name is required.",
        )

    existing = db.scalars(
        select(StaffAccount).where(StaffAccount.staff_id == staff_id)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this Staff ID already exists.",
        )

    account = StaffAccount(
        staff_id=staff_id,
        full_name=full_name,
        password_hash=hash_password(details.password),
        role="supervisor",
    )
    db.add(account)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this Staff ID already exists.",
        ) from None
    db.refresh(account)
    return account_response(account.staff_id, account.full_name, account.role)


@router.post("/login", response_model=StaffAccountResponse)
def login_staff(
    credentials: StaffLogin, db: Session = Depends(get_db)
) -> StaffAccountResponse:
    staff_id = credentials.staff_id.strip().upper()
    account = db.scalars(
        select(StaffAccount).where(StaffAccount.staff_id == staff_id)
    ).first()
    if account and verify_password(credentials.password, account.password_hash):
        return account_response(account.staff_id, account.full_name, account.role)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid Staff ID or password.",
    )
