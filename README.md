# Ayurveda Now!

## Описание
Веб-приложение для анализа пульса и определения доши. Стек: Flask (backend), React (frontend), Docker.

## Быстрый старт

### 1. Backend
```sh
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export FLASK_APP=app.py
flask run
```

### 2. Frontend
```sh
cd frontend
npm install
npm start
```

### 3. Docker
```sh
docker-compose up --build
```

### 4. Тесты
```sh
cd backend
pytest ../tests/test_dosha_scoring.py
```

## Переменные окружения
- backend/.env — секреты и настройки Flask

## Контакты
Автор: [ваше имя] 