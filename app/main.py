from app.models.user import User
from app.models.member import Member
from app.database.database import Base, engine
from fastapi import FastAPI
from app.routers.auth import router as auth_router
from app.routers.members import router as member_router
from app.routers.dashboard import router as dashboard_router
from app.routers.roi import router as roi_router
from app.routers import predict

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Member Risk Stratification API",
    version="1.0.0"
)

app.include_router(auth_router)
app.include_router(member_router)
app.include_router(dashboard_router)
app.include_router(roi_router)
app.include_router(predict.router)

@app.get("/")
def root():
    return {"message": "Risk Stratification Backend Running 🚀"}