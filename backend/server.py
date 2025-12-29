from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, date
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

class Kid(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    birthday: str
    photo: Optional[str] = None
    interests: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class KidCreate(BaseModel):
    name: str
    birthday: str
    photo: Optional[str] = None
    interests: Optional[str] = None

class KidUpdate(BaseModel):
    name: Optional[str] = None
    birthday: Optional[str] = None
    photo: Optional[str] = None
    interests: Optional[str] = None

class Gift(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    kid_id: str
    occasion: str
    year: int
    gift_name: str
    photo: Optional[str] = None
    date_given: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GiftCreate(BaseModel):
    kid_id: str
    occasion: str
    year: int
    gift_name: str
    photo: Optional[str] = None
    date_given: Optional[str] = None

class GiftUpdate(BaseModel):
    occasion: Optional[str] = None
    year: Optional[int] = None
    gift_name: Optional[str] = None
    photo: Optional[str] = None
    date_given: Optional[str] = None

class Reminder(BaseModel):
    kid_id: str
    kid_name: str
    birthday: str
    days_until: int
    age: int

def calculate_age(birthday_str: str) -> int:
    try:
        birthday = datetime.strptime(birthday_str, "%Y-%m-%d").date()
        today = date.today()
        age = today.year - birthday.year - ((today.month, today.day) < (birthday.month, birthday.day))
        return age
    except:
        return 0

def calculate_days_until_birthday(birthday_str: str) -> int:
    try:
        birthday = datetime.strptime(birthday_str, "%Y-%m-%d").date()
        today = date.today()
        next_birthday = birthday.replace(year=today.year)
        if next_birthday < today:
            next_birthday = birthday.replace(year=today.year + 1)
        days_until = (next_birthday - today).days
        return days_until
    except:
        return 999

@api_router.post("/kids", response_model=Kid)
async def create_kid(kid: KidCreate):
    kid_obj = Kid(**kid.model_dump())
    doc = kid_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.kids.insert_one(doc)
    return kid_obj

@api_router.get("/kids", response_model=List[Kid])
async def get_kids():
    kids = await db.kids.find({}, {"_id": 0}).to_list(1000)
    for kid in kids:
        if isinstance(kid.get('created_at'), str):
            kid['created_at'] = datetime.fromisoformat(kid['created_at'])
    return kids

@api_router.get("/kids/{kid_id}", response_model=Kid)
async def get_kid(kid_id: str):
    kid = await db.kids.find_one({"id": kid_id}, {"_id": 0})
    if not kid:
        raise HTTPException(status_code=404, detail="Kid not found")
    if isinstance(kid.get('created_at'), str):
        kid['created_at'] = datetime.fromisoformat(kid['created_at'])
    return kid

@api_router.put("/kids/{kid_id}", response_model=Kid)
async def update_kid(kid_id: str, kid_update: KidUpdate):
    update_data = {k: v for k, v in kid_update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.kids.update_one({"id": kid_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Kid not found")
    
    updated_kid = await db.kids.find_one({"id": kid_id}, {"_id": 0})
    if isinstance(updated_kid.get('created_at'), str):
        updated_kid['created_at'] = datetime.fromisoformat(updated_kid['created_at'])
    return updated_kid

@api_router.delete("/kids/{kid_id}")
async def delete_kid(kid_id: str):
    result = await db.kids.delete_one({"id": kid_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Kid not found")
    await db.gifts.delete_many({"kid_id": kid_id})
    return {"message": "Kid deleted successfully"}

@api_router.post("/gifts", response_model=Gift)
async def create_gift(gift: GiftCreate):
    gift_obj = Gift(**gift.model_dump())
    doc = gift_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.gifts.insert_one(doc)
    return gift_obj

@api_router.get("/gifts/kid/{kid_id}", response_model=List[Gift])
async def get_gifts_by_kid(kid_id: str):
    gifts = await db.gifts.find({"kid_id": kid_id}, {"_id": 0}).to_list(1000)
    for gift in gifts:
        if isinstance(gift.get('created_at'), str):
            gift['created_at'] = datetime.fromisoformat(gift['created_at'])
    return sorted(gifts, key=lambda x: x.get('year', 0), reverse=True)

@api_router.get("/gifts", response_model=List[Gift])
async def get_all_gifts():
    gifts = await db.gifts.find({}, {"_id": 0}).to_list(1000)
    for gift in gifts:
        if isinstance(gift.get('created_at'), str):
            gift['created_at'] = datetime.fromisoformat(gift['created_at'])
    return gifts

@api_router.put("/gifts/{gift_id}", response_model=Gift)
async def update_gift(gift_id: str, gift_update: GiftUpdate):
    update_data = {k: v for k, v in gift_update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.gifts.update_one({"id": gift_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Gift not found")
    
    updated_gift = await db.gifts.find_one({"id": gift_id}, {"_id": 0})
    if isinstance(updated_gift.get('created_at'), str):
        updated_gift['created_at'] = datetime.fromisoformat(updated_gift['created_at'])
    return updated_gift

@api_router.delete("/gifts/{gift_id}")
async def delete_gift(gift_id: str):
    result = await db.gifts.delete_one({"id": gift_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Gift not found")
    return {"message": "Gift deleted successfully"}

@api_router.get("/reminders", response_model=List[Reminder])
async def get_reminders():
    kids = await db.kids.find({}, {"_id": 0}).to_list(1000)
    reminders = []
    for kid in kids:
        days_until = calculate_days_until_birthday(kid['birthday'])
        age = calculate_age(kid['birthday'])
        reminders.append(Reminder(
            kid_id=kid['id'],
            kid_name=kid['name'],
            birthday=kid['birthday'],
            days_until=days_until,
            age=age
        ))
    return sorted(reminders, key=lambda x: x.days_until)

@api_router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        base64_image = base64.b64encode(contents).decode('utf-8')
        mime_type = file.content_type or 'image/jpeg'
        return {"data": f"data:{mime_type};base64,{base64_image}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()