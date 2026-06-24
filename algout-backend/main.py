# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models  # чтобы таблицы зарегистрировались
import auth

Base.metadata.create_all(bind=engine)  # создать таблицы если их нет

app = FastAPI(title='AlgOut API')

# Разрешаем запросы с фронтенда React (localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173', 'http://localhost:3000'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth.router)

@app.get('/')
def root():
    return {'message': 'AlgOut API работает'}
