# auth.py
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os

from database import get_db
from models import User

load_dotenv()
router = APIRouter()
security = HTTPBearer()
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = os.getenv('ALGORITHM', 'HS256')
EXPIRE_DAYS = int(os.getenv('ACCESS_TOKEN_EXPIRE_DAYS', 1))

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post('/auth/register')
def register(user: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(
        (User.username == user.username) | (User.email == user.email)
    ).first()
    if existing:
        raise HTTPException(400, 'Пользователь уже существует')
    new_user = User(
        username=user.username,
        email=user.email,
        password_hash=pwd_context.hash(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {'message': 'Регистрация успешна', 'user_id': new_user.id}

@router.post('/auth/login')
def login(user: LoginRequest, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not pwd_context.verify(user.password, db_user.password_hash):
        raise HTTPException(401, 'Неверный логин или пароль')
    token = jwt.encode(
        {'sub': str(db_user.id), 'exp': datetime.utcnow() + timedelta(days=EXPIRE_DAYS)},
        SECRET_KEY, algorithm=ALGORITHM
    )
    return {'access_token': token, 'token_type': 'bearer', 'user_id': db_user.id}

def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security),
                     db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(creds.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return db.query(User).get(int(payload['sub']))
    except JWTError:
        raise HTTPException(403, 'Недействительный токен')
