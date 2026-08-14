from fastapi import APIRouter,Depends
from app.services.auth_service import register_user,login_user
from app.schemas.user_schema import UserCreate,UserLogin
from app.database.database import get_db
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register")
def register(user: UserCreate,db: Session = Depends(get_db)):
    return register_user(user,db)

@router.post("/login")
def login(user:UserLogin,db:Session=Depends(get_db)):
    return login_user(user,db)