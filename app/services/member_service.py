from sqlalchemy.orm import Session
from app.models.member import Member

def get_all_members(db: Session):
    return db.query(Member).all()