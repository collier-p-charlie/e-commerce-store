from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Body, HTTPException, status
from jose import jwt
from passlib.context import CryptContext

from app.config import settings
from app.dependencies import DbSession, CurrentUser
from app.models.user import User
from app.schemas.auth import TokenResponse, UserLogin, UserRegister, UserResponse

router = APIRouter()

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)
# passlib hashing engine; use the bcrypt algorithm which is specifically designed to be slow and expensive to brute force
# deprecated = "auto" means if you ever switch to a stronger algorithm in the future, old hashes get upgraded automatically on next login


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: int) -> str:
    """Builds a JWT JSON Web Token; payload contains `sub` for subject, the users ID as a string.
    This is a JWT standard field; and also exp for expiry time.
    It is signed with SECRET_KEY so it cannot be tampered with."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register(
    body: Annotated[UserRegister, Body(description="New user details")],
    db: DbSession,
):
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        email=body.email,
        name=body.name,
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    body: Annotated[UserLogin, Body(description="Login credentials")],
    db: DbSession,
):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    token = create_access_token(user.id)
    return TokenResponse(access_token=token)


@router.get(
    "/me",
    response_model=UserResponse
)
def get_me(
    current_user: CurrentUser
):
    # no DB call needed as handled in Depends()
    return current_user


@router.put(
    "/me",
    response_model=UserResponse
)
def update_me(
    body: Annotated[UserRegister, Body(description="Updated user details")],
    current_user: CurrentUser,  # injected from JWT
    db: DbSession,
):
    if body.email != current_user.email:
        existing = db.query(User).filter(User.email == body.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists",
            )

    current_user.email = body.email
    current_user.name = body.name
    if body.password:
        current_user.hashed_password = hash_password(body.password)

    db.commit()
    db.refresh(current_user)
    return current_user


"""
AUTH flow e2e

1. User registers → password hashed → stored in DB
2. User logs in → password verified → JWT created and returned
3. User makes a request → sends JWT in header:
   Authorization: Bearer eyJhbGci...
4. FastAPI receives request → get_current_user dependency runs:
   - extracts token from header
   - decodes and verifies signature
   - checks expiry
   - looks up user in DB
   - returns User object to the route handler
5. If token is invalid or expired → 401 Unauthorized automatically

The server never stores the token anywhere — it just verifies the signature on each request. 
This is what makes JWTs "stateless" — you can have a thousand servers and any of them can verify any 
token without talking to a central session store.

The one thing to be aware of is that JWTs can't be invalidated before they expire. 
If a user logs out or changes their password, their old token technically still works until it expires. 
The standard solutions are short expiry times (15 minutes) with a separate refresh token, 
or maintaining a small blocklist of revoked tokens. 
"""

"""
JWT

The security comes from the signature — a JWT can be read by anyone but can only be created by someone with the secret key. 
So the contents are visible but the token can't be faked.

A JWT is just three base64-encoded chunks of text joined by dots:
header.payload.signature

A real one looks like this:
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0MiIsImV4cCI6MTcwMDAwMH0.x7jB9Q2kP_abc123

The HEADER is like:
{
  "alg": "HS256",
  "typ": "JWT"
}
and is just metadata; which signing algorithm is being used. HS256 means HMAC with SHA-256.

The PAYLOAD is like:
{
  "sub": "42",
  "exp": 1700000000
}
This is the actual data; sub is the subject — who this token represents (our user ID). 
exp is the expiry timestamp in Unix time. You can put anything here — name, email, roles. 
But keep it small since it's sent on every request.

The SIGNATURE is like:

HMAC_SHA256(
  base64(header) + "." + base64(payload),
  SECRET_KEY
)

The header and payload are combined and cryptographically signed using your secret key. 
This is what makes the token tamper-proof — if anyone changes even one character in the payload, 
the signature no longer matches and the token is rejected.
"""
