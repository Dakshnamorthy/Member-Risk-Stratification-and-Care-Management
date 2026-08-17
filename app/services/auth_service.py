from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.user import User
from app.schemas.user_schema import UserCreate,UserLogin
from app.core.security import hash_password,verify_password


def register_user(user: UserCreate, db: Session):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    hashed_password = hash_password(user.password)

    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully"
    }


def login_user(user:UserLogin,db:Session):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid password and email"
        )
    hash_pass=existing_user.hashed_password
    
    if not verify_password(user.password,hash_pass):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    return{
        "message":"Login Successful"
    }
    
